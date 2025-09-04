-- Create Test User for Development
-- This script creates a test user that matches the JWT token used in development mode

-- Insert test user if it doesn't exist
INSERT INTO users (
    id,
    email,
    display_name,
    preferences,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'test@example.com',
    'Test User',
    '{
        "weightUnit": "kg",
        "theme": "auto",
        "defaultRestTimer": 60,
        "hapticFeedback": true,
        "soundEnabled": true,
        "autoStartRestTimer": true
    }'::jsonb,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    updated_at = NOW();

-- Verify the user was created
SELECT id, email, display_name 
FROM users 
WHERE id = '550e8400-e29b-41d4-a716-446655440000'::uuid;