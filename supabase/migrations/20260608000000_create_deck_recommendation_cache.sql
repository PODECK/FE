CREATE TABLE deck_recommendation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roster_hash TEXT NOT NULL,
  theme TEXT NOT NULL,
  result JSONB NOT NULL,
  model TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, roster_hash, theme)
);

ALTER TABLE deck_recommendation_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_cache"
  ON deck_recommendation_cache FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_cache"
  ON deck_recommendation_cache FOR INSERT
  WITH CHECK (auth.uid() = user_id);
