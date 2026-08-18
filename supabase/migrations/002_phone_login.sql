-- Phone-based login: normalized phone lookup for the phone-login API.
-- The lookup function is service-role only (revoked from anon/authenticated)
-- so it cannot be used for public account enumeration via PostgREST RPC.

CREATE OR REPLACE FUNCTION public.normalize_phone(p text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN d LIKE '972%' THEN '0' || substring(d FROM 4)
    ELSE d
  END
  FROM (SELECT regexp_replace(coalesce(p, ''), '[^0-9]', '', 'g') AS d) t
$$;

CREATE INDEX IF NOT EXISTS idx_users_phone_normalized
  ON public.users (public.normalize_phone(phone));

CREATE OR REPLACE FUNCTION public.find_users_by_phone(p text)
RETURNS TABLE (id uuid, email text, full_name text, phone text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id, u.email, u.full_name, u.phone
  FROM public.users u
  WHERE public.normalize_phone(u.phone) <> ''
    AND public.normalize_phone(u.phone) = public.normalize_phone(p)
$$;

REVOKE EXECUTE ON FUNCTION public.normalize_phone(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.find_users_by_phone(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.normalize_phone(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.find_users_by_phone(text) TO service_role;
