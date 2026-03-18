-- ============================================
-- My Wishlist App - Supabase Database Migration
-- ============================================
-- Run this SQL in your Supabase Dashboard:
-- 1. Go to https://supabase.com/dashboard
-- 2. Select your project
-- 3. Go to SQL Editor
-- 4. Paste this entire script and click "Run"
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  country TEXT NOT NULL DEFAULT 'United States',
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. WISHLISTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS wishlists (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  emoji TEXT NOT NULL DEFAULT '🎁',
  color TEXT NOT NULL DEFAULT '#8032ee',
  is_shared BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlists"
  ON wishlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared wishlists they collaborate on"
  ON wishlists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collaborators
      WHERE collaborators.wishlist_id = wishlists.id
      AND collaborators.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own wishlists"
  ON wishlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wishlists"
  ON wishlists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Collaborators can update shared wishlists"
  ON wishlists FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM collaborators
      WHERE collaborators.wishlist_id = wishlists.id
      AND collaborators.user_id = auth.uid()
      AND collaborators.role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Users can delete own wishlists"
  ON wishlists FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. WISHLIST ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id TEXT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  store TEXT NOT NULL DEFAULT '',
  store_url TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Other',
  is_purchased BOOLEAN NOT NULL DEFAULT FALSE,
  added_at TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT 'US',
  rating NUMERIC(3, 1),
  alternatives JSONB,
  UNIQUE(wishlist_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist_id ON wishlist_items(wishlist_id);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items in their wishlists"
  ON wishlist_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND (
        wishlists.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM collaborators
          WHERE collaborators.wishlist_id = wishlists.id
          AND collaborators.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can insert items in their wishlists"
  ON wishlist_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND (
        wishlists.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM collaborators
          WHERE collaborators.wishlist_id = wishlists.id
          AND collaborators.user_id = auth.uid()
          AND collaborators.role IN ('owner', 'editor')
        )
      )
    )
  );

CREATE POLICY "Users can update items in their wishlists"
  ON wishlist_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND (
        wishlists.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM collaborators
          WHERE collaborators.wishlist_id = wishlists.id
          AND collaborators.user_id = auth.uid()
          AND collaborators.role IN ('owner', 'editor')
        )
      )
    )
  );

CREATE POLICY "Users can delete items in their wishlists"
  ON wishlist_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND (
        wishlists.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM collaborators
          WHERE collaborators.wishlist_id = wishlists.id
          AND collaborators.user_id = auth.uid()
          AND collaborators.role IN ('owner', 'editor')
        )
      )
    )
  );

-- ============================================
-- 4. COLLABORATORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id TEXT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(wishlist_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_collaborators_wishlist_id ON collaborators(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_user_id ON collaborators(user_id);

ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view collaborators of their wishlists"
  ON collaborators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = collaborators.wishlist_id
      AND (
        wishlists.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM collaborators c2
          WHERE c2.wishlist_id = collaborators.wishlist_id
          AND c2.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Wishlist owners can insert collaborators"
  ON collaborators FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = collaborators.wishlist_id
      AND wishlists.user_id = auth.uid()
    )
    OR auth.uid() = user_id
  );

CREATE POLICY "Wishlist owners can delete collaborators"
  ON collaborators FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = collaborators.wishlist_id
      AND wishlists.user_id = auth.uid()
    )
    OR auth.uid() = user_id
  );

-- ============================================
-- 5. CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id TEXT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL DEFAULT '',
  sender_avatar TEXT NOT NULL DEFAULT '',
  text TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'message' CHECK (type IN ('message', 'assignment', 'system')),
  assigned_item_id TEXT,
  assigned_to TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_wishlist_id ON chat_messages(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in shared wishlists"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collaborators
      WHERE collaborators.wishlist_id = chat_messages.wishlist_id
      AND collaborators.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = chat_messages.wishlist_id
      AND wishlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can send messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete own messages"
  ON chat_messages FOR DELETE
  USING (auth.uid() = sender_id);

-- ============================================
-- 6. ITEM ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS item_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id TEXT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to_name TEXT NOT NULL DEFAULT '',
  assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(wishlist_id, product_id, assigned_to)
);

CREATE INDEX IF NOT EXISTS idx_item_assignments_wishlist_id ON item_assignments(wishlist_id);

ALTER TABLE item_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assignments in their wishlists"
  ON item_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collaborators
      WHERE collaborators.wishlist_id = item_assignments.wishlist_id
      AND collaborators.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = item_assignments.wishlist_id
      AND wishlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create assignments"
  ON item_assignments FOR INSERT
  WITH CHECK (auth.uid() = assigned_by OR auth.uid() = assigned_to);

CREATE POLICY "Users can delete own assignments"
  ON item_assignments FOR DELETE
  USING (auth.uid() = assigned_to OR auth.uid() = assigned_by);

-- ============================================
-- DONE! All tables created successfully.
-- ============================================
