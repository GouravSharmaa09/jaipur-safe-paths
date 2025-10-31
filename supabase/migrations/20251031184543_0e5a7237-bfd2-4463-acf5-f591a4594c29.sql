-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can create reports" ON public.reports;

-- Create a new policy that allows anyone to create reports
CREATE POLICY "Anyone can create reports"
ON public.reports
FOR INSERT
WITH CHECK (
  -- Either user is authenticated and user_id matches, or user_id is null (anonymous)
  (auth.uid() = user_id) OR (user_id IS NULL)
);