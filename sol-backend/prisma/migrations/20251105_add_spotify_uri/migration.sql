-- AddColumn spotifyUri to Music model if not exists
ALTER TABLE "musics" ADD COLUMN IF NOT EXISTS "spotifyUri" TEXT;
