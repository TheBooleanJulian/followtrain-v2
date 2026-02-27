-- Migration to add WeChat and LINE columns to participants table
-- This should be run against an existing database that doesn't have these columns

-- Add WeChat column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'participants' AND column_name = 'wechat_username') THEN
        ALTER TABLE public.participants ADD COLUMN wechat_username VARCHAR(50);
        RAISE NOTICE 'Column wechat_username added to participants table';
    ELSE
        RAISE NOTICE 'Column wechat_username already exists in participants table';
    END IF;
END $$;

-- Add LINE column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'participants' AND column_name = 'line_username') THEN
        ALTER TABLE public.participants ADD COLUMN line_username VARCHAR(50);
        RAISE NOTICE 'Column line_username added to participants table';
    ELSE
        RAISE NOTICE 'Column line_username already exists in participants table';
    END IF;
END $$;