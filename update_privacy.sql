-- ১. রক্তসেতু থেকে রক্ত লাগবে নাম পরিবর্তন (যদি কোনো টেক্সট কলামে থাকে)
-- (সাধারণত অ্যাপ কোডেই পরিবর্তন করা হয়, তবে ডাটাবেসে থাকলে নিচের মতো করা যায়)

-- ২. ইউজার টেবিলে hide_phone কলাম যোগ করা
ALTER TABLE users ADD COLUMN IF NOT EXISTS hide_phone BOOLEAN DEFAULT FALSE;

-- ৩. blood_requests টেবিলে রেটিং কলাম যোগ করা
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS is_rated BOOLEAN DEFAULT FALSE;
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS is_donor_rated BOOLEAN DEFAULT FALSE;
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS is_requester_rated BOOLEAN DEFAULT FALSE;

-- ৪. RLS পলিসি আপডেট (যাতে সবাই সবার রিকোয়েস্ট হিস্ট্রি দেখতে পারে - বিশ্বাসযোগ্যতা বাড়াতে)

-- Blood Requests সবার জন্য উন্মুক্ত করা (SELECT)
DROP POLICY IF EXISTS "Anyone can view blood requests" ON blood_requests;
CREATE POLICY "Anyone can view blood requests"
ON blood_requests FOR SELECT
USING (true);

-- Ratings সবার জন্য উন্মুক্ত করা
DROP POLICY IF EXISTS "Ratings are public" ON ratings;
CREATE POLICY "Ratings are public"
ON ratings FOR SELECT
USING (true);

-- Users প্রোফাইল সবার জন্য উন্মুক্ত রাখা
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;
CREATE POLICY "Public profiles are viewable by everyone"
ON users FOR SELECT
USING (true);

-- ৫. রেটিং আপডেট করার ট্রিগার (আগের টার্ন থেকে)
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
AFTER INSERT OR UPDATE OR DELETE ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_user_rating_stats();
