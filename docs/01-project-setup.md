# 01 — 프로젝트 생성 및 개발 환경

## 목적
비전공자가 설치·실행할 수 있는 가장 단순한 Vanilla JS + Vercel Serverless 구조를 만든다.

## 파일 구조
```text
sentiment-service/
├── AGENTS.md
├── PRD.md
├── README.md                 # 구현 시 생성
├── .gitignore               # 구현 시 생성
├── .env.example             # 구현 시 생성
├── package.json             # 구현 시 생성
├── index.html               # 구현 시 생성
├── api/
│   └── analyze.js           # 구현 시 생성
├── public/
│   ├── css/style.css        # 구현 시 생성
│   ├── js/app.js            # 구현 시 생성
│   └── images/              # 라이선스 확인된 자체 이미지/배경
├── supabase/
│   └── schema.sql           # 구현 시 생성
└── docs/
    ├── 01-project-setup.md
    ├── 02-ui-design.md
    ├── 03-frontend.md
    ├── 04-backend-ai.md
    ├── 05-database.md
    ├── 06-testing-deployment.md
    └── ui-reference.png
```

## 초기 생성 단계
1. Node.js 20 이상과 npm을 설치한다.
2. `npm init -y` 후 `npm install openai @supabase/supabase-js`를 실행한다.
3. Vercel CLI가 없다면 `npm install -D vercel`을 실행한다.
4. `package.json`에 `"type": "module"`, 스크립트 `"dev": "vercel dev"`, `"check": "node --check api/analyze.js && node --check public/js/app.js && node --test"`를 넣는다.
5. `index.html`, `public/`, `api/`, `supabase/`를 만든다.
6. `.gitignore`에 `node_modules/`, `.env`, `.env.*`, `!.env.example`, `.vercel/`을 포함한다.
7. `.env.example`에 **값 없이** `OPENAI_API_KEY=`, `OPENAI_MODEL=`, `SUPABASE_URL=`, `SUPABASE_SERVICE_ROLE_KEY=`를 적는다.
8. 개발자는 `.env.example`을 `.env.local`로 복사하고 실제 값을 입력한다. `.env.local`은 절대 커밋하지 않는다.

## 로컬 실행
- `npm install`
- `npx vercel login` (처음 한 번)
- `npx vercel link` (처음 한 번)
- `npx vercel env pull .env.local` 또는 직접 `.env.local` 설정
- `npm run dev` 후 CLI가 안내하는 주소로 접속한다(일반적으로 `http://localhost:3000`).
- 정적 파일만 더블클릭하면 `/api/analyze`가 작동하지 않는다. 반드시 개발 서버를 사용한다.

## 경로 규칙
- HTML은 루트 `index.html`에서 서비스한다.
- 정적 자산은 `/public/css/style.css`, `/public/js/app.js`처럼 절대 경로로 참조한다. Vercel에서 실제 배포 경로를 확인한다.
- API는 `/api/analyze`로 노출한다. 정적 리라이트를 추가하더라도 `/api/*` 경로를 가로채지 않는다.

## 완료·검증
- `npm run dev`가 실행되고 첫 화면이 표시된다.
- `npm run check`가 문법 오류 없이 종료된다(테스트 파일이 생성되면 자동 실행).
- `.env.local`이 Git 추적 대상이 아니다.
- 브라우저 개발자 도구의 소스에 비밀키가 없다.
