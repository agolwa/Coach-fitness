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
    'fb00c744-28ec-4645-9cae-c9d94235ec38'::uuid,
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
WHERE id = 'fb00c744-28ec-4645-9cae-c9d94235ec38'::uuid;