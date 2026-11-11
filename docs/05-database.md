# 05 — Supabase 데이터베이스 설계

## 목적
MVP에서 분석 성공 기록을 서버에 최소한으로 저장한다. **사용자가 입력한 원문은 저장하지 않는다.** 로그인 및 사용자별 이력 조회는 없다.

## 테이블
Supabase SQL Editor에서 다음 SQL을 실행하고, 구현 프로젝트의 `supabase/schema.sql`에도 같은 내용을 저장한다.
```sql
create table if not exists public.sentiment_analyses (
  id uuid primary key default gen_random_uuid(),
  sentiment text not null check (sentiment in ('positive','negative','neutral')),
  confidence smallint not null check (confidence between 0 and 100),
  reason text not null check (char_length(reason) between 1 and 300),
  input_length integer not null check (input_length between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists idx_sentiment_analyses_created_at
  on public.sentiment_analyses (created_at desc);

alter table public.sentiment_analyses enable row level security;
-- anon/authenticated 역할에 대한 SELECT/INSERT/UPDATE/DELETE 정책을 만들지 않는다.
-- 서비스 역할 키를 사용하는 서버만 데이터에 접근한다.
```

## 환경변수
- `SUPABASE_URL`: 프로젝트 URL.
- `SUPABASE_SERVICE_ROLE_KEY`: 서버 전용 비밀키. Supabase 프로젝트의 해당 서비스 역할 키 또는 동등한 서버 전용 secret key를 사용한다.
- 브라우저에서 `createClient`를 호출하지 않는다. `api/analyze.js` 서버 내부에서만 생성한다.

## 저장 시점과 값
AI가 정상 결과를 반환한 뒤 다음 필드만 저장한다.
```json
{
  "sentiment": "positive",
  "confidence": 88,
  "reason": "긍정적인 경험을 직접적으로 표현합니다.",
  "input_length": 19
}
```
위 길이 숫자는 예시일 뿐이며 실제 구현에서는 `text.length`를 계산해 저장한다.
- 저장 금지: 입력 원문, 이메일, 이름, IP 주소, 사용자 에이전트, OpenAI API 키.
- `id`와 `created_at`은 DB 기본값을 사용한다.
- 사용자에게 기록 목록을 제공하는 API는 만들지 않는다.

## 실패 처리
- Supabase가 일시 중단되거나 키가 없으면 분석 자체는 성공할 수 있다.
- DB 오류는 서버 내부에서만 간략하게 기록한다. 사용자에게 원시 DB 오류를 보여주지 않는다.
- 저장 실패는 운영 로그/배포 체크리스트에서 확인한다.

## 보관과 관리
- MVP에서는 자동 삭제 스케줄을 구현하지 않는다. 운영자는 Supabase에서 데이터 보관 정책을 별도로 결정해야 한다.
- 실제 서비스 공개 전에 개인정보 처리 안내, 보관 기간, 삭제 요청 처리 방식을 검토한다.

## 검증
1. Supabase에서 테이블과 RLS 활성화 상태를 확인한다.
2. 정상 분석 1회 후 행이 정확히 1개 증가하는지 확인한다.
3. 행에 `text` 또는 `raw_input` 열이 없는지 확인한다.
4. 브라우저 네트워크/소스에 서비스 역할 키가 없는지 확인한다.
5. DB 연결 실패를 모의해도 API의 성공 결과가 유지되는지 확인한다.
