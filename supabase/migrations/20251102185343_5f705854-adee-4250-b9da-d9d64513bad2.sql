-- Fix PUBLIC_DATA_EXPOSURE: Create public view without user_id to protect user privacy
-- This prevents tracking individual users' location patterns and reports

-- Create public view that excludes user_id
CREATE VIEW public.reports_public AS
SELECT id, lat, lng, type, place_name, description, created_at
FROM public.reports;

-- Grant SELECT permission on the view to anonymous and authenticated users
GRANT SELECT ON public.reports_public TO anon, authenticated;

-- Update RLS: Remove the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view reports" ON public.reports;

-- Add policy that only allows users to view their own reports in the base table
CREATE POLICY "Users can view own reports"
ON public.reports FOR SELECT
USING (auth.uid() = user_id);

-- Keep the public view accessible (no RLS needed on views, controlled by base table)
COMMENT ON VIEW public.reports_public IS 'Public view of reports without user_id to protect privacy';