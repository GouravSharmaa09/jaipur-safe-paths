-- Fix the SECURITY DEFINER issue by recreating the view as SECURITY INVOKER
-- This ensures the view uses the permissions of the querying user, not the view creator

DROP VIEW IF EXISTS public.reports_public;

CREATE VIEW public.reports_public 
WITH (security_invoker = true)
AS
SELECT id, lat, lng, type, place_name, description, created_at
FROM public.reports;

-- Grant SELECT permission on the view
GRANT SELECT ON public.reports_public TO anon, authenticated;

COMMENT ON VIEW public.reports_public IS 'Public view of reports without user_id to protect privacy. Uses security_invoker for proper permission checking.';