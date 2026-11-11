-- ====================================================================
-- 온도 (ONDO) Supabase 데이터베이스 스키마 정의 파일
-- 상세 마이그레이션 쿼리는 supabase/migrations/001_create_sentiment_analyses_table.sql 을 참조합니다.
-- ====================================================================

-- 감성 분석 결과 저장 테이블
create table if not exists public.sentiment_analyses (
  id uuid primary key default gen_random_uuid(),
  sentiment text not null check (sentiment in ('positive', 'negative', 'neutral')),
  confidence smallint not null check (confidence between 0 and 100),
  reason text not null check (char_length(reason) between 1 and 300),
  input_length integer not null check (input_length between 1 and 1000),
  created_at timestamptz not null default now()
);

-- 인덱스 생성
create index if not exists idx_sentiment_analyses_created_at
  on public.sentiment_analyses (created_at desc);

-- RLS(행 단위 보안) 활성화
alter table public.sentiment_analyses enable row level security;

