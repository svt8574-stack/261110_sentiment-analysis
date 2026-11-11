import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// 테스트 대상: 라벨 매핑 및 유효성 검사 로직
const VALID_SENTIMENTS = ['positive', 'negative', 'neutral'];
const SENTIMENT_LABELS = {
  positive: '긍정',
  negative: '부정',
  neutral: '중립'
};

function validateInput(text) {
  if (typeof text !== 'string') {
    return { valid: false, code: 'INVALID_INPUT', message: '분석할 문장을 확인해 주세요.' };
  }
  const trimmed = text.trim();
  if (trimmed.length < 1) {
    return { valid: false, code: 'INVALID_INPUT', message: '분석할 문장을 입력해 주세요.' };
  }
  if (text.length > 1000) {
    return { valid: false, code: 'INVALID_INPUT', message: '1,000자 이하로 입력해 주세요.' };
  }
  return { valid: true };
}

function validateAiResponse(data) {
  if (!data || typeof data !== 'object') return false;
  const { sentiment, confidence, reason } = data;
  const validSentiment = VALID_SENTIMENTS.includes(sentiment);
  const validConfidence = typeof confidence === 'number' && confidence >= 0 && confidence <= 100;
  const validReason = typeof reason === 'string' && reason.trim().length >= 1 && reason.length <= 300;
  return validSentiment && validConfidence && validReason;
}

describe('[T04~T07] 입력값 검증 테스트', () => {
  it('T04: 빈 문자열 또는 공백만 있는 경우 실패해야 함', () => {
    assert.equal(validateInput('').valid, false);
    assert.equal(validateInput('   ').valid, false);
    assert.equal(validateInput('\n\t').valid, false);
  });

  it('T05: 1,001자 초과인 경우 실패해야 함', () => {
    const longText = '가'.repeat(1001);
    assert.equal(validateInput(longText).valid, false);
  });

  it('T06: 1,000자 이하인 경우 정상 통과해야 함', () => {
    const boundaryText = '가'.repeat(1000);
    assert.equal(validateInput(boundaryText).valid, true);
  });

  it('T07: 문자열이 아닌 타입(null, undefined, number)은 실패해야 함', () => {
    assert.equal(validateInput(null).valid, false);
    assert.equal(validateInput(undefined).valid, false);
    assert.equal(validateInput(12345).valid, false);
    assert.equal(validateInput({ text: '객체' }).valid, false);
  });
});

describe('[T09, T17] AI 응답 스키마 및 감정 매핑 테스트', () => {
  it('정상적인 3분류(positive, negative, neutral) 응답 검증', () => {
    assert.equal(validateAiResponse({ sentiment: 'positive', confidence: 95, reason: '기쁨이 드러납니다.' }), true);
    assert.equal(validateAiResponse({ sentiment: 'negative', confidence: 80, reason: '슬픔이 드러납니다.' }), true);
    assert.equal(validateAiResponse({ sentiment: 'neutral', confidence: 70, reason: '사실 설명입니다.' }), true);
  });

  it('T09: 허용되지 않은 감정값이나 잘못된 범위의 신뢰도는 실패해야 함', () => {
    assert.equal(validateAiResponse({ sentiment: 'happy', confidence: 90, reason: '잘못된 enum' }), false);
    assert.equal(validateAiResponse({ sentiment: 'positive', confidence: 150, reason: '신뢰도 100 초과' }), false);
    assert.equal(validateAiResponse({ sentiment: 'positive', confidence: -5, reason: '신뢰도 음수' }), false);
    assert.equal(validateAiResponse({ sentiment: 'positive', confidence: 80, reason: '' }), false);
  });

  it('T17: 감정 3종의 한글 라벨이 올바르게 매핑되어야 함', () => {
    assert.equal(SENTIMENT_LABELS['positive'], '긍정');
    assert.equal(SENTIMENT_LABELS['negative'], '부정');
    assert.equal(SENTIMENT_LABELS['neutral'], '중립');
  });
});

