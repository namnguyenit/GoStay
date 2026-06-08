CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.recommendation_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    session_id text,
    event_type text NOT NULL,
    listing_id uuid,
    landmark_id uuid,
    query text,
    filters jsonb,
    context jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recommendation_events_user_created
    ON public.recommendation_events (user_id, created_at DESC)
    WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_recommendation_events_session_created
    ON public.recommendation_events (session_id, created_at DESC)
    WHERE session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_recommendation_events_listing_created
    ON public.recommendation_events (listing_id, created_at DESC)
    WHERE listing_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_recommendation_events_landmark_created
    ON public.recommendation_events (landmark_id, created_at DESC)
    WHERE landmark_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_recommendation_events_type_created
    ON public.recommendation_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recommendation_events_context_gin
    ON public.recommendation_events USING gin (context);
