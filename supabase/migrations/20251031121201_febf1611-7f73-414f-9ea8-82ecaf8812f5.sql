-- Fix search_path security warning for get_cluster_key function
CREATE OR REPLACE FUNCTION public.get_cluster_key(lat_val DECIMAL, lng_val DECIMAL)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CONCAT(ROUND(lat_val::numeric, 3), ',', ROUND(lng_val::numeric, 3));
$$;

-- Fix search_path security warning for update_cluster_status function
CREATE OR REPLACE FUNCTION public.update_cluster_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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