DROP POLICY IF EXISTS "Public rooms are viewable by everyone." ON rooms;
CREATE POLICY "Public rooms are viewable by everyone." ON rooms FOR SELECT USING (true);
