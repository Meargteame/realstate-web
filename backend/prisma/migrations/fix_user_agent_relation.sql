-- Add unique constraint to User.agentId if not exists
-- This allows the one-to-one relation between User and Agent

-- First, check if there are any duplicate agentId values
-- If there are, we need to clean them up first

-- Add unique constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'User_agentId_key'
    ) THEN
        ALTER TABLE "User" ADD CONSTRAINT "User_agentId_key" UNIQUE ("agentId");
    END IF;
END $$;
