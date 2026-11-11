/**
 * 온도 (ONDO) — 프런트엔드 애플리케이션 로직
 * 
 * [주요 역할]
 * 1. 글자 수(0~1,000자) 실시간 계산
 * 2. 입력값 클라이언트 검증 (공백 차단, 최대 길이 검증)
 * 3. 상태 관리: idle(대기) -> loading(분석중) -> success(성공) / error(실패)
 * 4. 보안 원칙 준수: textContent 사용으로 XSS 방지
 */

// 1. 필요한 DOM 요소 참조 가져오기
const sentimentForm = document.getElementById('sentiment-form');
const sentimentText = document.getElementById('sentiment-text');
const charCount = document.getElementById('char-count');
const analyzeButton = document.getElementById('analyze-button');
const feedback = document.getElementById('feedback');

const resultCard = document.getElementById('result');
const resultLabel = document.getElementById('result-label');
const resultConfidence = document.getElementById('result-confidence');
const resultReason = document.getElementById('result-reason');
const resultBadge = document.getElementById('result-badge');

// 감정 라벨 매핑 테이블 (API 응답 영문 -> 화면 표시 한글)
const SENTIMENT_LABELS = {
  positive: '긍정',
  negative: '부정',
  neutral: '중립'
};

/**
 * 2. 글자 수 세기 이벤트 핸들러
 * 사용자가 키보드로 글자를 입력할 때마다 실시간으로 글자 수를 갱신합니다.
 */
function handleTextInput() {
  const currentLength = sentimentText.value.length;
  // textContent로 안전하게 문자열 삽입
  charCount.textContent = `${currentLength.toLocaleString()} / 1,000자`;

  // 입력 내용이 변경되면 기존의 에러 메시지는 깔끔하게 지워줍니다.
  if (!feedback.hidden) {
    hideFeedback();
  }
}

/**
 * 오류 메시지 표시 함수
 * @param {string} message - 사용자에게 보여줄 한국어 오류 메시지
 */
function showFeedback(message) {
  feedback.textContent = message;
  feedback.hidden = false;
}

/**
 * 오류 메시지 숨김 함수
 */
function hideFeedback() {
  feedback.textContent = '';
  feedback.hidden = true;
}

/**
 * 3. 클라이언트 화면 상태 전환 (idle, loading, success, error)
 * @param {'idle' | 'loading' | 'success' | 'error'} state 
 */
function setUIState(state) {
  if (state === 'loading') {
    // 로딩 상태: 중복 요청 방지 및 로딩 표시
    analyzeButton.disabled = true;
    analyzeButton.classList.add('is-loading');
    analyzeButton.querySelector('.btn-label').textContent = '분석 중...';
    hideFeedback();
    resultCard.hidden = true;
  } else {
    // 대기/완료/오류 상태: 버튼 원상복구
    analyzeButton.disabled = false;
    analyzeButton.classList.remove('is-loading');
    analyzeButton.querySelector('.btn-label').textContent = '감정 분석하기';
  }
}

/**
 * 4. 분석 결과 카드 렌더링
 * @param {{ sentiment: string, confidence: number, reason: string }} data 
 */
function renderResult(data) {
  const { sentiment, confidence, reason } = data;

  // 감정 한글 라벨 매핑 (예: positive -> 긍정)
  const koreanLabel = SENTIMENT_LABELS[sentiment] || '중립';
  resultLabel.textContent = koreanLabel;

  // 뱃지 색상 클래스 초기화 후 신규 클래스 적용
  resultBadge.className = 'sentiment-badge';
  resultBadge.classList.add(sentiment);

  // AI 추정 신뢰도 퍼센트 표시 (예: 88%)
  resultConfidence.textContent = `${Math.round(confidence)}%`;

  // 분석 이유 문장 표시 (XSS 방지를 위해 textContent 사용)
  resultReason.textContent = reason;

  // 결과 카드 표시
  resultCard.hidden = false;

  // 결과 카드 위치로 부드럽게 스크롤 이동
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * 5. 폼 제출(Submit) 이벤트 핸들러
 */
async function handleSubmit(event) {
  // 브라우저의 기본 페이지 새로고침 동작 방지
  event.preventDefault();

  const originalText = sentimentText.value;
  const trimmedText = originalText.trim();

  // [입력 검증 1] 공백만 있거나 비어있는 경우
  if (trimmedText.length === 0) {
    showFeedback('분석할 문장을 입력해 주세요.');
    sentimentText.focus();
    return;
  }

  // [입력 검증 2] 최대 글자 수(1,000자) 초과 검증
  if (originalText.length > 1000) {
    showFeedback('1,000자 이하로 입력해 주세요.');
    sentimentText.focus();
    return;
  }

  // 로딩 상태 시작
  setUIState('loading');

  try {
    // Vercel 서버리스 함수(/api/analyze)로 감성 분석 요청
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: originalText })
    });

    const data = await response.json().catch(() => null);

    // 서버가 정상(200 OK) 응답을 주지 않은 경우
    if (!response.ok) {
      const errorMessage = data?.error?.message || '분석 중 문제가 발생했습니다. 다시 시도해 주세요.';
      showFeedback(errorMessage);
      setUIState('error');
      return;
    }

    // AI 결과 규격 유효성 재확인
    if (!data || !['positive', 'negative', 'neutral'].includes(data.sentiment)) {
      showFeedback('결과를 읽는 중 문제가 발생했습니다. 다시 시도해 주세요.');
      setUIState('error');
      return;
    }

    // 성공 결과 렌더링
    renderResult(data);
    setUIState('success');

  } catch (error) {
    // 네트워크 단절 또는 요청 실패 예외 처리
    showFeedback('네트워크 연결을 확인한 뒤 다시 시도해 주세요.');
    setUIState('error');
  }
}

// 6. 이벤트 리스너 등록
sentimentText.addEventListener('input', handleTextInput);
sentimentForm.addEventListener('submit', handleSubmit);

