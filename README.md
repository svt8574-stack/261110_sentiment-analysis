# 온도 (ONDO) — 한국어 감성 분석 웹 서비스 MVP

> **"지금 마음의 결을 문장으로 읽어보세요."**  
> 사용자가 작성한 한국어 문장 속 정서를 조심스럽게 살펴보고 긍정, 부정, 중립 3가지 온도로 읽어주는 웹 서비스입니다.

---

## 1. 주요 기능
- **문장 감정 분석**: 1~1,000자의 한국어 문장을 입력하면 AI가 `긍정`, `부정`, `중립` 3분류로 분석합니다.
- **AI 추정 신뢰도 및 이유 제공**: 0~100% 사이의 추정 신뢰도와 함께 자연스러운 한국어 설명(1~3문장)을 제공합니다.
- **안전한 데이터 보관**: 사용자의 개인정보 보호를 위해 **원문 문장은 절대 데이터베이스에 저장하지 않으며**, 글자 수와 분석 결과 메타데이터만 Supabase에 안전하게 보관합니다.
- **반응형 웹 디자인**: 모바일(360px)부터 데스크톱(1440px 이상)까지 최적화된 화면을 제공합니다.

---

## 2. 기술 스택
- **Frontend**: HTML5, Vanilla CSS, Vanilla JavaScript (외부 프레임워크 없는 순수 웹 표준)
- **Backend**: Node.js 20+, Vercel Serverless Function (`api/analyze.js`)
- **AI**: OpenAI Node SDK (`gpt-4o-mini`)
- **Database**: Supabase PostgreSQL (RLS 행 단위 보안 적용)
- **Deployment**: Vercel

---

## 3. 로컬 실행 방법

### 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 아래 키를 입력합니다 (예시는 `.env.example` 참조):
```ini
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 서버 실행
```powershell
node server.js
```
실행 후 브라우저에서 `http://localhost:3000` 으로 접속합니다.

### 정적 검증 및 단위 테스트
```powershell
node --test test/validation.test.js
```

---

## 4. 테스트 및 검증 결과 (PRD 기준)

| 테스트 ID | 검증 항목 | 결과 | 상세 내용 |
|---|---|:---:|---|
| **T01** | 정상 문장 분석 (긍정) | **통과** | `오늘 정말 기쁘고 행복한 하루였어!` -> `positive`, 신뢰도 95% |
| **T04** | 공백 및 빈 문자열 입력 | **통과** | 클라이언트 차단 및 400 에러 처리 |
| **T05** | 1,001자 초과 입력 | **통과** | 입력 차단 및 검증 통과 |
| **T06** | 1,000자 경계값 입력 | **통과** | 정상 검증 통과 |
| **T07** | 잘못된 데이터 타입 | **통과** | 유효성 검사 실패 처리 |
| **T09** | AI 비정상 스키마 응답 | **통과** | 502 에러 처리 및 기본값 차단 |
| **T14** | XSS 스크립트 방어 | **통과** | `textContent` 사용으로 태그 실행 방지 |
| **T15** | 모바일/데스크톱 반응형 | **통과** | 360px ~ 1440px 가로 스크롤 없음 |
| **T17** | 한글 라벨 매핑 | **통과** | positive->긍정, negative->부정, neutral->중립 |
| **T18** | DB 저장 (개인정보 보호) | **통과** | 원문 저장 없이 결과 및 글자수만 기록 |

