-- Normalize trips.itinerary to a strict JSONB array of objects.
-- Safe to run multiple times.

BEGIN;

-- 1) Helper: parse text to jsonb safely.
CREATE OR REPLACE FUNCTION public.try_parse_jsonb(input_text text)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  parsed jsonb;
BEGIN
  IF input_text IS NULL OR btrim(input_text) = '' THEN
    RETURN NULL;
  END IF;

  BEGIN
    parsed := input_text::jsonb;
    RETURN parsed;
  EXCEPTION WHEN others THEN
    RETURN NULL;
  END;
END;
$$;

-- 2) Helper: normalize a jsonb payload to array-of-objects.
CREATE OR REPLACE FUNCTION public.normalize_itinerary_jsonb(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  payload_type text;
  text_payload text;
  parsed jsonb;
  fixed_text text;
  chunk text;
  merged jsonb := '[]'::jsonb;
BEGIN
  IF payload IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;

  payload_type := jsonb_typeof(payload);

  -- Already array: keep only object elements.
  IF payload_type = 'array' THEN
    RETURN COALESCE(
      (
        SELECT jsonb_agg(elem)
        FROM jsonb_array_elements(payload) AS elem
        WHERE jsonb_typeof(elem) = 'object'
      ),
      '[]'::jsonb
    );
  END IF;

  -- Wrapper objects: {items:[...]}, {itinerary:[...]}.
  IF payload_type = 'object' THEN
    IF jsonb_typeof(payload->'items') = 'array' THEN
      RETURN COALESCE(
        (
          SELECT jsonb_agg(elem)
          FROM jsonb_array_elements(payload->'items') AS elem
          WHERE jsonb_typeof(elem) = 'object'
        ),
        '[]'::jsonb
      );
    END IF;

    IF jsonb_typeof(payload->'itinerary') = 'array' THEN
      RETURN COALESCE(
        (
          SELECT jsonb_agg(elem)
          FROM jsonb_array_elements(payload->'itinerary') AS elem
          WHERE jsonb_typeof(elem) = 'object'
        ),
        '[]'::jsonb
      );
    END IF;

    RETURN '[]'::jsonb;
  END IF;

  -- String payload: try to parse legacy formats.
  IF payload_type = 'string' THEN
    text_payload := payload #>> '{}';

    -- Try direct parse.
    parsed := public.try_parse_jsonb(text_payload);
    IF parsed IS NOT NULL THEN
      RETURN public.normalize_itinerary_jsonb(parsed);
    END IF;

    -- Try with duplicated quotes fixed.
    fixed_text := replace(text_payload, '""', '"');
    parsed := public.try_parse_jsonb(fixed_text);
    IF parsed IS NOT NULL THEN
      RETURN public.normalize_itinerary_jsonb(parsed);
    END IF;

    -- Fallback: merge all array chunks found in text.
    FOR chunk IN
      SELECT (regexp_matches(fixed_text, '(\[[^\]]*\])', 'g'))[1]
    LOOP
      parsed := public.try_parse_jsonb(chunk);
      IF parsed IS NOT NULL AND jsonb_typeof(parsed) = 'array' THEN
        merged := merged || (
          SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
          FROM jsonb_array_elements(parsed) AS elem
          WHERE jsonb_typeof(elem) = 'object'
        );
      END IF;
    END LOOP;

    RETURN merged;
  END IF;

  RETURN '[]'::jsonb;
END;
$$;

-- 3) Normalize existing rows.
UPDATE trips
SET itinerary = public.normalize_itinerary_jsonb(itinerary)
WHERE itinerary IS DISTINCT FROM public.normalize_itinerary_jsonb(itinerary);

-- 4) Helper predicates for CHECK constraints.
CREATE OR REPLACE FUNCTION public.is_itinerary_array_of_objects(payload jsonb)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT
    jsonb_typeof(payload) = 'array'
    AND NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements(payload) AS elem
      WHERE jsonb_typeof(elem) <> 'object'
    );
$$;

CREATE OR REPLACE FUNCTION public.itinerary_has_required_keys(payload jsonb)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT
    NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements(payload) AS elem
      WHERE NOT (
        elem ? 'day'
        AND elem ? 'time'
        AND elem ? 'name'
        AND elem ? 'duration'
        AND elem ? 'category'
      )
    );
$$;

-- 5) Enforce structure: itinerary must be array of objects.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'trips_itinerary_array_of_objects_chk'
  ) THEN
    ALTER TABLE trips
      ADD CONSTRAINT trips_itinerary_array_of_objects_chk
      CHECK (public.is_itinerary_array_of_objects(itinerary));
  END IF;
END;
$$;

-- 6) Optional quality check: required keys in each itinerary object.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'trips_itinerary_required_keys_chk'
  ) THEN
    ALTER TABLE trips
      ADD CONSTRAINT trips_itinerary_required_keys_chk
      CHECK (public.itinerary_has_required_keys(itinerary));
  END IF;
END;
$$;

-- 7) JSONB GIN index for containment/path queries.
CREATE INDEX IF NOT EXISTS idx_trips_itinerary_gin
  ON trips USING GIN (itinerary jsonb_path_ops);

COMMIT;

-- Verification queries:
-- SELECT id, jsonb_typeof(itinerary) AS itinerary_type FROM trips;
-- SELECT id, jsonb_array_length(itinerary) AS item_count FROM trips;
-- SELECT t.id, item->>'name' AS name
-- FROM trips t
-- CROSS JOIN LATERAL jsonb_array_elements(t.itinerary) AS item
-- WHERE lower(item->>'name') LIKE '%salvador%';
