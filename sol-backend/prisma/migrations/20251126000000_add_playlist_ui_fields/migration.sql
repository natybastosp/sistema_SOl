-- AlterTable
ALTER TABLE "playlists" ADD COLUMN "likes" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "playlists" ADD COLUMN "cover" TEXT;
ALTER TABLE "playlists" ADD COLUMN "spotifyPlaylistId" TEXT;
