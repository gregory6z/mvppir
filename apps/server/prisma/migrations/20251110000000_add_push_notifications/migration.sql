-- AlterEnum: Add new notification types for push notifications
ALTER TYPE "NotificationType" ADD VALUE 'DEPOSIT_CONFIRMED';
ALTER TYPE "NotificationType" ADD VALUE 'DAILY_COMMISSION';
ALTER TYPE "NotificationType" ADD VALUE 'ACCOUNT_ACTIVATED';
ALTER TYPE "NotificationType" ADD VALUE 'RANK_UPGRADED';
ALTER TYPE "NotificationType" ADD VALUE 'RANK_DOWNGRADED';
ALTER TYPE "NotificationType" ADD VALUE 'RANK_WARNING';

-- CreateTable: push_tokens
CREATE TABLE "push_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expoPushToken" TEXT NOT NULL,
    "deviceInfo" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable: notifications
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "pushSent" BOOLEAN NOT NULL DEFAULT false,
    "pushError" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "push_tokens_userId_idx" ON "push_tokens"("userId");

-- CreateIndex
CREATE INDEX "push_tokens_isActive_idx" ON "push_tokens"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "push_tokens_userId_expoPushToken_key" ON "push_tokens"("userId", "expoPushToken");

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE INDEX "notifications_userId_type_idx" ON "notifications"("userId", "type");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- AddForeignKey
ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
