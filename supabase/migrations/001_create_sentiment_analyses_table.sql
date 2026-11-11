-- ====================================================================
-- 마이그레이션 번호: 001
-- 설명: 감성 분석 결과 저장용 sentiment_analyses 테이블 생성
-- 규칙 준수: 
--   1) 원문(사용자 텍스트)은 절대 저장하지 않음 (개인정보 보호)
--   2) RLS(행 단위 보안) 활성화 및 서비스 역할(Service Role) 전용 접근
-- ====================================================================

-- 1. 감성 분석 이력 테이블 생성
create table if not exists public.sentiment_analyses (
  id uuid primary key default gen_random_uuid(),
  -- 감정 분류: 'positive'(긍정), 'negative'(부정), 'neutral'(중립) 3가지만 허용
  sentiment text not null check (sentiment in ('positive', 'negative', 'neutral')),
  -- AI 추정 신뢰도: 0 ~ 100 사이의 정수 값
  confidence smallint not null check (confidence between 0 and 100),
  -- 분석 이유: 최소 1자에서 최대 300자 이내의 한글 설명
  reason text not null check (char_length(reason) between 1 and 300),
  -- 사용자가 입력한 문장의 길이 (원문은 저장하지 않고 글자 수 메타데이터만 보관)
  input_length integer not null check (input_length between 1 and 1000),
  -- 분석 일시
  created_at timestamptz not null default now()
);

-- 2. 생성 일시 기준 내림차순 조회를 위한 인덱스 생성
create index if not exists idx_sentiment_analyses_created_at
  on public.sentiment_analyses (created_at desc);

-- 3. Row Level Security(RLS) 활성화
-- 일반 익명(anon) 및 로그인된 사용자(authenticated)의 직접 접근을 차단하고,
-- 오직 백엔드 서버의 서비스 역할 키(service_role key)를 통해서만 안전하게 쓰기 가능하도록 설정합니다.
alter table public.sentiment_analyses enable row level security;

