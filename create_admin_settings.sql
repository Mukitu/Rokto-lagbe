-- Create admin_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_settings
-- Allow anyone to read settings
DROP POLICY IF EXISTS "Anyone can read admin settings" ON admin_settings;
CREATE POLICY "Anyone can read admin settings"
ON admin_settings FOR SELECT
USING (true);

-- Allow anyone to update/insert settings (for now, in this dev environment)
DROP POLICY IF EXISTS "Anyone can update admin settings" ON admin_settings;
CREATE POLICY "Anyone can update admin settings"
ON admin_settings FOR ALL
USING (true)
WITH CHECK (true);

-- Insert some default settings if they don't exist
INSERT INTO admin_settings (key, value)
VALUES 
    ('adsense_enabled', 'false'),
    ('adsense_publisher_id', ''),
    ('adsense_slot_header', ''),
    ('adsense_slot_infeed', ''),
    ('adsense_slot_profile', ''),
    ('adsterra_enabled', 'false'),
    ('adsterra_header', ''),
    ('adsterra_infeed', ''),
    ('adsterra_footer', ''),
    ('adsterra_popunder', ''),
    ('banner1_image', ''), ('banner1_link', ''), ('banner1_alt', ''), ('banner1_enabled', 'false'),
    ('banner2_image', ''), ('banner2_link', ''), ('banner2_alt', ''), ('banner2_enabled', 'false'),
    ('banner3_image', ''), ('banner3_link', ''), ('banner3_alt', ''), ('banner3_enabled', 'false'),
    ('site_name', 'রক্ত লাগবে'),
    ('site_tagline', 'রক্তের বন্ধনে গড়ি সুন্দর পৃথিবী'),
    ('contact_email', ''),
    ('contact_phone', ''),
    ('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING;
