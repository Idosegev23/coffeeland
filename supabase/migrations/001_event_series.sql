-- ====================================================================
-- Event Series System - Migration
-- מערכת סדרות לחוגים וסדנאות
-- ====================================================================

-- 1. טבלת event_series - סדרה של מפגשים
CREATE TABLE IF NOT EXISTS public.event_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('class', 'workshop')),
  -- תמחור
  series_price NUMERIC,          -- מחיר לסדרה שלמה (תשלום חד-פעמי)
  per_session_price NUMERIC,     -- מחיר לדרופ-אין (מפגש בודד, אופציונלי)
  total_sessions INTEGER,        -- כמה מפגשים בסדרה
  -- פרטים
  instructor_id UUID,
  room_id UUID,
  capacity INTEGER,
  min_age INTEGER,
  max_age INTEGER,
  banner_image_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. עמודות חדשות ב-events לקישור לסדרה
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS series_id UUID REFERENCES public.event_series(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS series_order INTEGER;

-- 3. טבלת series_registrations - רישום לסדרה
CREATE TABLE IF NOT EXISTS public.series_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES public.event_series(id),
  user_id UUID NOT NULL REFERENCES public.users(id),
  child_id UUID,
  payment_type TEXT NOT NULL DEFAULT 'full_series' CHECK (payment_type IN ('full_series', 'drop_in')),
  payment_id UUID,
  amount_paid NUMERIC,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'completed')),
  valid_from DATE,
  valid_until DATE,
  qr_code TEXT UNIQUE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(series_id, user_id, COALESCE(child_id, '00000000-0000-0000-0000-000000000000'))
);

-- 4. טבלת session_attendance - נוכחות לכל מפגש
CREATE TABLE IF NOT EXISTS public.session_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_registration_id UUID NOT NULL REFERENCES public.series_registrations(id),
  event_id UUID NOT NULL REFERENCES public.events(id),
  status TEXT DEFAULT 'expected' CHECK (status IN ('expected', 'attended', 'absent', 'cancelled')),
  checked_in_at TIMESTAMPTZ,
  UNIQUE(series_registration_id, event_id)
);

-- 5. אינדקסים
CREATE INDEX IF NOT EXISTS idx_events_series_id ON public.events(series_id);
CREATE INDEX IF NOT EXISTS idx_events_series_order ON public.events(series_id, series_order);
CREATE INDEX IF NOT EXISTS idx_series_registrations_series_id ON public.series_registrations(series_id);
CREATE INDEX IF NOT EXISTS idx_series_registrations_user_id ON public.series_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_series_registrations_status ON public.series_registrations(status);
CREATE INDEX IF NOT EXISTS idx_session_attendance_registration ON public.session_attendance(series_registration_id);
CREATE INDEX IF NOT EXISTS idx_session_attendance_event ON public.session_attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_event_series_status ON public.event_series(status);
CREATE INDEX IF NOT EXISTS idx_event_series_type ON public.event_series(type);

-- 6. RLS Policies

-- event_series: כולם יכולים לקרוא סדרות פעילות
ALTER TABLE public.event_series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active series"
  ON public.event_series FOR SELECT
  USING (status = 'active' OR status = 'completed');

CREATE POLICY "Admins can manage series"
  ON public.event_series FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid() AND admins.is_active = true
    )
  );

-- series_registrations: משתמשים רואים את שלהם, אדמינים רואים הכל
ALTER TABLE public.series_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own series registrations"
  ON public.series_registrations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage series registrations"
  ON public.series_registrations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid() AND admins.is_active = true
    )
  );

-- session_attendance: משתמשים רואים נוכחות שלהם
ALTER TABLE public.session_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own attendance"
  ON public.session_attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.series_registrations sr
      WHERE sr.id = series_registration_id AND sr.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage attendance"
  ON public.session_attendance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid() AND admins.is_active = true
    )
  );

-- 7. Trigger לעדכון updated_at
CREATE OR REPLACE FUNCTION update_event_series_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_event_series_updated_at
  BEFORE UPDATE ON public.event_series
  FOR EACH ROW
  EXECUTE FUNCTION update_event_series_updated_at();
