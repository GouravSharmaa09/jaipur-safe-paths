-- Create enum for safety types
CREATE TYPE public.safety_type AS ENUM ('safe', 'caution', 'avoid');

-- Create enum for cluster status
CREATE TYPE public.cluster_status AS ENUM ('safe', 'caution', 'avoid', 'unverified');

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  type safety_type NOT NULL,
  place_name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create location_clusters table
CREATE TABLE public.location_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_key TEXT NOT NULL UNIQUE,
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  status cluster_status NOT NULL DEFAULT 'unverified',
  report_count INTEGER NOT NULL DEFAULT 0,
  safe_count INTEGER NOT NULL DEFAULT 0,
  caution_count INTEGER NOT NULL DEFAULT 0,
  avoid_count INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_clusters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports
CREATE POLICY "Anyone can view reports"
  ON public.reports
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reports"
  ON public.reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for location_clusters
CREATE POLICY "Anyone can view location clusters"
  ON public.location_clusters
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage clusters"
  ON public.location_clusters
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_reports_cluster ON public.reports (
  ROUND(lat::numeric, 3), 
  ROUND(lng::numeric, 3)
);
CREATE INDEX idx_reports_created_at ON public.reports (created_at DESC);
CREATE INDEX idx_clusters_key ON public.location_clusters (cluster_key);

-- Function to generate cluster key
CREATE OR REPLACE FUNCTION public.get_cluster_key(lat_val DECIMAL, lng_val DECIMAL)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CONCAT(ROUND(lat_val::numeric, 3), ',', ROUND(lng_val::numeric, 3));
$$;

-- Function to update cluster status
CREATE OR REPLACE FUNCTION public.update_cluster_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cluster_key TEXT;
  v_safe_count INTEGER;
  v_caution_count INTEGER;
  v_avoid_count INTEGER;
  v_total_count INTEGER;
  v_new_status cluster_status;
  v_avg_lat DECIMAL(10, 7);
  v_avg_lng DECIMAL(10, 7);
BEGIN
  -- Generate cluster key
  v_cluster_key := public.get_cluster_key(NEW.lat, NEW.lng);
  
  -- Count reports in this cluster from last 30 days
  SELECT 
    COUNT(*) FILTER (WHERE type = 'safe'),
    COUNT(*) FILTER (WHERE type = 'caution'),
    COUNT(*) FILTER (WHERE type = 'avoid'),
    COUNT(*),
    AVG(lat),
    AVG(lng)
  INTO 
    v_safe_count,
    v_caution_count,
    v_avoid_count,
    v_total_count,
    v_avg_lat,
    v_avg_lng
  FROM public.reports
  WHERE public.get_cluster_key(lat, lng) = v_cluster_key
    AND created_at > now() - interval '30 days';
  
  -- Determine status based on counts
  IF v_avoid_count >= 4 THEN
    v_new_status := 'avoid';
  ELSIF v_caution_count >= 3 THEN
    v_new_status := 'caution';
  ELSIF v_safe_count >= 3 THEN
    v_new_status := 'safe';
  ELSE
    v_new_status := 'unverified';
  END IF;
  
  -- Insert or update cluster
  INSERT INTO public.location_clusters (
    cluster_key,
    lat,
    lng,
    status,
    report_count,
    safe_count,
    caution_count,
    avoid_count,
    last_updated
  ) VALUES (
    v_cluster_key,
    v_avg_lat,
    v_avg_lng,
    v_new_status,
    v_total_count,
    v_safe_count,
    v_caution_count,
    v_avoid_count,
    now()
  )
  ON CONFLICT (cluster_key)
  DO UPDATE SET
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    status = EXCLUDED.status,
    report_count = EXCLUDED.report_count,
    safe_count = EXCLUDED.safe_count,
    caution_count = EXCLUDED.caution_count,
    avoid_count = EXCLUDED.avoid_count,
    last_updated = now();
  
  RETURN NEW;
END;
$$;

-- Trigger to update clusters when reports are added
CREATE TRIGGER trigger_update_cluster
  AFTER INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cluster_status();

-- Enable realtime for location_clusters
ALTER PUBLICATION supabase_realtime ADD TABLE public.location_clusters;