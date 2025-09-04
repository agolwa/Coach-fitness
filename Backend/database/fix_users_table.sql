-- Fix Users Table Foreign Key Constraint
-- This script removes the foreign key constraint to auth.users table
-- to allow custom JWT authentication system to work independently

-- Drop the foreign key constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Make id a regular UUID primary key (not referencing auth.users)
-- The constraint is already dropped, so this is just for clarity
-- ALTER TABLE users ALTER COLUMN id TYPE UUID;

-- Verify the change
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'users' AND tc.constraint_type = 'FOREIGN KEY';