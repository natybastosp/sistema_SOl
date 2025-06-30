-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emotional_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "anger" DOUBLE PRECISION NOT NULL,
    "fear" DOUBLE PRECISION NOT NULL,
    "joy" DOUBLE PRECISION NOT NULL,
    "sadness" DOUBLE PRECISION NOT NULL,
    "surprise" DOUBLE PRECISION NOT NULL,
    "context" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emotional_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "musics" (
    "id" TEXT NOT NULL,
    "spotifyId" TEXT,
    "name" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "album" TEXT,
    "duration" INTEGER,
    "genre" TEXT NOT NULL,
    "anger" DOUBLE PRECISION NOT NULL,
    "fear" DOUBLE PRECISION NOT NULL,
    "joy" DOUBLE PRECISION NOT NULL,
    "sadness" DOUBLE PRECISION NOT NULL,
    "surprise" DOUBLE PRECISION NOT NULL,
    "danceability" DOUBLE PRECISION,
    "energy" DOUBLE PRECISION,
    "valence" DOUBLE PRECISION,
    "acousticness" DOUBLE PRECISION,
    "instrumentalness" DOUBLE PRECISION,
    "speechiness" DOUBLE PRECISION,
    "tempo" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "musics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playlists" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetAnger" DOUBLE PRECISION NOT NULL,
    "targetFear" DOUBLE PRECISION NOT NULL,
    "targetJoy" DOUBLE PRECISION NOT NULL,
    "targetSadness" DOUBLE PRECISION NOT NULL,
    "targetSurprise" DOUBLE PRECISION NOT NULL,
    "algorithm" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,

    CONSTRAINT "playlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playlist_musics" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "musicId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "emotionalScore" DOUBLE PRECISION,

    CONSTRAINT "playlist_musics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedbacks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "helpful" BOOLEAN,
    "emotionalChange" TEXT,
    "comments" TEXT,
    "postAnger" DOUBLE PRECISION,
    "postFear" DOUBLE PRECISION,
    "postJoy" DOUBLE PRECISION,
    "postSadness" DOUBLE PRECISION,
    "postSurprise" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "preference" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "musics_spotifyId_key" ON "musics"("spotifyId");

-- CreateIndex
CREATE UNIQUE INDEX "playlist_musics_playlistId_musicId_key" ON "playlist_musics"("playlistId", "musicId");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_genre_key" ON "user_preferences"("userId", "genre");

-- AddForeignKey
ALTER TABLE "emotional_profiles" ADD CONSTRAINT "emotional_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_musics" ADD CONSTRAINT "playlist_musics_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_musics" ADD CONSTRAINT "playlist_musics_musicId_fkey" FOREIGN KEY ("musicId") REFERENCES "musics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
