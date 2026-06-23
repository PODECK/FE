-- Update pull_gacha: exclude legendary, pseudo-legendary lines and ultra beasts by dex_id
-- Uses pack_inventory table (id = user_id)

CREATE OR REPLACE FUNCTION pull_gacha()
RETURNS TABLE (dex_id integer, is_new boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_pack_count integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED';
  END IF;

  SELECT pack_count INTO v_pack_count
  FROM pack_inventory
  WHERE id = v_user_id;

  IF v_pack_count IS NULL OR v_pack_count <= 0 THEN
    RAISE EXCEPTION 'NO_PACKS';
  END IF;

  UPDATE pack_inventory
  SET pack_count = pack_count - 1
  WHERE id = v_user_id;

  -- Draw 5 cards into temp table so INSERT and RETURN use the same set
  CREATE TEMP TABLE _gacha_draw ON COMMIT DROP AS
  WITH eligible AS (
    SELECT ps.dex_id
    FROM pokemon_species ps
    WHERE ps.is_legendary = false
      AND ps.evolution_stage = 1
      AND ps.dex_id NOT IN (
        -- 준전설 계열 (Gen1~7)
        147, 148, 149,       -- 미뇽, 신뇽, 망나뇽
        246, 247, 248,       -- 애버라스, 데기라스, 마기라스
        371, 372, 373,       -- 아공이, 쉘곤, 보만다
        374, 375, 376,       -- 메탕, 메탕구, 메타그로스
        443, 444, 445,       -- 딥상어동, 한바이트, 한카리아스
        633, 634, 635,       -- 모노두, 디헤드, 삼삼드래
        704, 705, 706,       -- 미끄메라, 미끄네일, 미끄래곤
        782, 783, 784,       -- 짜랑꼬, 짜랑고우, 짜랑고우거
        -- 울트라비스트 (11종)
        793, 794, 795, 796, 797, 798, 799,  -- 텅비드~악식킹
        803, 804, 805, 806                   -- 베베놈, 아고용, 차곡차곡, 두파팡
      )
  ),
  drawn AS (
    SELECT ep.dex_id
    FROM eligible ep, generate_series(1, 5)
    ORDER BY random()
    LIMIT 5
  )
  SELECT
    d.dex_id,
    NOT EXISTS (
      SELECT 1 FROM owned_pokemon op
      WHERE op.user_id = v_user_id AND op.dex_id = d.dex_id
    ) AS is_new
  FROM drawn d;

  INSERT INTO owned_pokemon (user_id, dex_id)
  SELECT v_user_id, g.dex_id
  FROM _gacha_draw g
  WHERE g.is_new = true
  ON CONFLICT DO NOTHING;

  RETURN QUERY SELECT g.dex_id, g.is_new FROM _gacha_draw g;
END;
$$;
