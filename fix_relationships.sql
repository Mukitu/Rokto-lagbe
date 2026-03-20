-- ১. প্রয়োজনীয় কলাম যোগ করা (যদি না থাকে)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blood_requests' AND column_name='is_rated') THEN
        ALTER TABLE blood_requests ADD COLUMN is_rated BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blood_requests' AND column_name='is_donor_rated') THEN
        ALTER TABLE blood_requests ADD COLUMN is_donor_rated BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blood_requests' AND column_name='is_requester_rated') THEN
        ALTER TABLE blood_requests ADD COLUMN is_requester_rated BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ratings' AND column_name='request_id') THEN
        ALTER TABLE ratings ADD COLUMN request_id UUID;
    END IF;
END $$;

-- ২. ফরেন কী রিলেশনশিপ ঠিক করা
ALTER TABLE blood_requests 
  DROP CONSTRAINT IF EXISTS blood_requests_requester_id_fkey,
  ADD CONSTRAINT blood_requests_requester_id_fkey 
  FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE blood_requests 
  DROP CONSTRAINT IF EXISTS blood_requests_donor_id_fkey,
  ADD CONSTRAINT blood_requests_donor_id_fkey 
  FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE ratings 
  DROP CONSTRAINT IF EXISTS ratings_rater_id_fkey,
  ADD CONSTRAINT ratings_rater_id_fkey 
  FOREIGN KEY (rater_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE ratings 
  DROP CONSTRAINT IF EXISTS ratings_receiver_id_fkey,
  ADD CONSTRAINT ratings_receiver_id_fkey 
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE ratings 
  DROP CONSTRAINT IF EXISTS ratings_request_id_fkey,
  ADD CONSTRAINT ratings_request_id_fkey 
  FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE CASCADE;

-- ৩. RLS পলিসি সঠিক সিনট্যাক্সে আপডেট করা
-- Blood Requests
DROP POLICY IF EXISTS "Anyone can view blood requests" ON blood_requests;
CREATE POLICY "Anyone can view blood requests" ON blood_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert blood requests" ON blood_requests;
CREATE POLICY "Anyone can insert blood requests" ON blood_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update blood requests" ON blood_requests;
CREATE POLICY "Anyone can update blood requests" ON blood_requests FOR UPDATE USING (true);

-- Ratings
DROP POLICY IF EXISTS "Ratings are public" ON ratings;
CREATE POLICY "Ratings are public" ON ratings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert ratings" ON ratings;
CREATE POLICY "Anyone can insert ratings" ON ratings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update ratings" ON ratings;
CREATE POLICY "Anyone can update ratings" ON ratings FOR UPDATE USING (true);

-- Users
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;
CREATE POLICY "Public profiles are viewable by everyone" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (true);

-- ৪. ইউজার টেবিলে প্রয়োজনীয় কলাম নিশ্চিত করা
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='total_donations') THEN
        ALTER TABLE users ADD COLUMN total_donations INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='avg_rating') THEN
        ALTER TABLE users ADD COLUMN avg_rating DECIMAL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='total_ratings') THEN
        ALTER TABLE users ADD COLUMN total_ratings INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='hide_phone') THEN
        ALTER TABLE users ADD COLUMN hide_phone BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- ৫. রেটিং আপডেট হলে ইউজারের এভারেজ রেটিং আপডেট করার ফাংশন
CREATE OR REPLACE FUNCTION update_user_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET 
        total_ratings = (SELECT COUNT(*) FROM ratings WHERE receiver_id = NEW.receiver_id),
        avg_rating = (SELECT COALESCE(AVG(stars), 0) FROM ratings WHERE receiver_id = NEW.receiver_id)
    WHERE id = NEW.receiver_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_rating_added ON ratings;
CREATE TRIGGER on_rating_added
AFTER INSERT OR UPDATE ON ratings
FOR EACH ROW EXECUTE FUNCTION update_user_rating_stats();
