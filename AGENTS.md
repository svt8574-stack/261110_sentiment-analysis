# AGENTS.md — Antigravity AI 에이전트 작업 규칙

## 1. 목적과 우선순위
이 저장소는 한국어 중심의 감성 분석 웹 서비스 **온도 (ONDO)** 의 MVP이다. 비전공자도 유지보수할 수 있도록 간결한 HTML/CSS/Vanilla JavaScript, Node.js 서버리스 API, OpenAI API, Supabase, Vercel로 구현한다.

**문서 읽기 순서:** `AGENTS.md` → `PRD.md` → `docs/01-project-setup.md` → `docs/02-ui-design.md` → `docs/03-frontend.md` → `docs/04-backend-ai.md` → `docs/05-database.md` → `docs/06-testing-deployment.md`.

충돌 시 우선순위는 사용자 최신 지시 > AGENTS.md > PRD.md > docs 순이다. 모호하면 임의 기능을 추가하지 말고 가장 단순하고 안전한 MVP 구현을 택하고 가정을 기록한다.

## 2. 에이전트 실행 순서
1. 기존 파일을 확인하고 사용자 작성물을 무단 삭제·덮어쓰기하지 않는다.
2. 파일 트리와 구현 계획을 짧게 제시한다.
3. 환경변수 예시와 프로젝트 골격을 만든다.
4. 화면을 구현하고 API·DB를 연결한다.
5. 자동 검증과 수동 검증을 실행한다.
6. 실행 방법, 테스트 결과, 남은 문제를 README에 정리한다.

## 3. 고정 기술 스택
- 프런트엔드: 정적 `index.html`, `public/css/style.css`, `public/js/app.js` (Vanilla JS, ES Modules 허용).
- 백엔드: Node.js 20 이상, Vercel Serverless Function `api/analyze.js`.
- AI: OpenAI 공식 Node SDK, 서버에서만 호출, 모델명은 `OPENAI_MODEL` 환경변수로 지정.
- DB: Supabase PostgreSQL, 서버 전용 서비스 역할 키로 기록.
- 배포: Vercel. `npm run dev`는 `vercel dev`, `npm run check`는 정적 검증/테스트.
- 의존성은 `openai`, `@supabase/supabase-js` 및 개발에 꼭 필요한 최소 도구만 사용한다. React/Next.js, Tailwind, TypeScript, 인증, 대시보드, 관리자 기능은 도입하지 않는다.

## 4. 반드시 지킬 규칙
- OpenAI 키와 Supabase 서비스 역할 키는 브라우저 코드·HTML·로그·Git에 넣지 않는다.
- 클라이언트는 **반드시** `/api/analyze`만 호출한다. AI/DB 직접 호출 금지.
- 감정 분류값은 `positive`, `negative`, `neutral` 세 가지뿐이다. 화면 라벨은 `긍정`, `부정`, `중립`이다.
- 신뢰도는 모델이 보고한 **추정 점수**이며 실제 정답 확률 또는 검증된 정확도처럼 표현하지 않는다.
- 입력 길이는 공백 제거 후 1자 이상, 원문 최대 1,000자이다. 공백만 입력하면 오류를 표시한다.
- 출력은 `textContent`로 삽입한다. `innerHTML`에 사용자·AI 응답을 넣지 않는다.
- 요청 중 중복 제출을 막고 로딩·성공·실패 상태를 구분한다.
- 분석 원문은 기본적으로 DB에 저장하지 않는다. 분석 결과와 최소 메타데이터만 저장한다.
- 외부 서비스 실패 시 성공으로 꾸미지 않는다. 비밀 정보가 없는 친절한 한국어 오류를 보여준다.
- 모든 화면은 모바일 360px부터 데스크톱 1440px 이상까지 대응한다.
- 제공된 공차 스크린샷은 **레이아웃/무드 참고용**이다. 브랜드명·로고·사진·문구·아이콘을 그대로 복제하지 않는다.

## 5. 구현 범위 제한
**포함:** 랜딩/입력/결과 한 페이지, 감정 3분류, 추정 신뢰도 %, 분석 이유, 입력 검증, 오류 안내, Supabase 분석 기록, 반응형 UI, 접근성, Vercel 배포.

**제외:** 로그인, 사용자별 분석 이력 UI, 실시간 스트리밍, 다국어 UI, 차트/통계, 결제, 소셜 공유, 감정 상담·의료 진단, 자동 번역, 이미지 분석.

## 6. 변경 및 완료 보고
- 기능마다 관련 문서를 확인한 후 구현한다.
- 실패 테스트는 삭제하지 말고 원인을 수정한다.
- 실키가 없는 경우 모의 응답으로 프런트 테스트를 하되, 실제 API/DB 연동이 검증되었다고 주장하지 않는다.
- 완료 시 체크리스트: `npm install`, `npm run check`, 유효/무효 입력, API 실패, 모바일/데스크톱, 키 노출 여부, DB 저장 여부, Vercel 배포 상태.
- 최종 보고는 **완료한 작업 / 검증 결과 / 설정이 필요한 값 / 미완료 항목**으로 구분한다.
