-- Password reset support: store a hashed reset token and its expiry on the user.
-- Apply with `npx prisma db push` (preferred, syncs the whole schema) or run this SQL directly.

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP(3);
