-- FM-SetLogger Exercise Library Seed Data
-- Phase 5.1: Pre-populate exercises table with 48+ fitness exercises

-- Clear existing exercise data (for development/testing)
TRUNCATE TABLE exercises RESTART IDENTITY CASCADE;

-- Strength Training Exercises
INSERT INTO exercises (name, category, body_part, equipment, description) VALUES
('Barbell Squat', 'strength', ARRAY['quadriceps', 'glutes', 'core'], ARRAY['barbell', 'squat rack'], 'Compound movement targeting lower body strength'),
('Deadlift', 'strength', ARRAY['hamstrings', 'glutes', 'back', 'core'], ARRAY['barbell'], 'Full-body compound exercise for posterior chain'),
('Bench Press', 'strength', ARRAY['chest', 'shoulders', 'triceps'], ARRAY['barbell', 'bench'], 'Upper body pressing movement'),
('Pull-ups', 'strength', ARRAY['lats', 'biceps', 'rear delts'], ARRAY['pull-up bar'], 'Bodyweight upper body pulling exercise'),
('Overhead Press', 'strength', ARRAY['shoulders', 'triceps', 'core'], ARRAY['barbell'], 'Vertical pressing movement'),
('Bent-Over Row', 'strength', ARRAY['lats', 'rhomboids', 'rear delts', 'biceps'], ARRAY['barbell'], 'Horizontal pulling movement'),
('Dumbbell Shoulder Press', 'strength', ARRAY['shoulders', 'triceps'], ARRAY['dumbbells'], 'Unilateral shoulder development'),
('Dumbbell Rows', 'strength', ARRAY['lats', 'rhomboids', 'biceps'], ARRAY['dumbbells', 'bench'], 'Single-arm pulling exercise'),
('Incline Dumbbell Press', 'strength', ARRAY['upper chest', 'shoulders', 'triceps'], ARRAY['dumbbells', 'incline bench'], 'Upper chest focused pressing'),
('Leg Press', 'strength', ARRAY['quadriceps', 'glutes'], ARRAY['leg press machine'], 'Machine-based leg exercise'),
('Lat Pulldown', 'strength', ARRAY['lats', 'biceps', 'rear delts'], ARRAY['cable machine'], 'Vertical pulling alternative to pull-ups'),
('Chest Dips', 'strength', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['dip bars'], 'Bodyweight chest and triceps exercise'),

-- Bodyweight Exercises
('Push-ups', 'bodyweight', ARRAY['chest', 'triceps', 'shoulders', 'core'], ARRAY['none'], 'Classic bodyweight upper body exercise'),
('Bodyweight Squats', 'bodyweight', ARRAY['quadriceps', 'glutes', 'calves'], ARRAY['none'], 'No equipment leg strengthening'),
('Lunges', 'bodyweight', ARRAY['quadriceps', 'glutes', 'hamstrings'], ARRAY['none'], 'Single leg bodyweight exercise'),
('Burpees', 'bodyweight', ARRAY['full body'], ARRAY['none'], 'High-intensity full-body movement'),
('Mountain Climbers', 'bodyweight', ARRAY['core', 'shoulders', 'legs'], ARRAY['none'], 'Dynamic core and cardio exercise'),
('Plank', 'bodyweight', ARRAY['core', 'shoulders'], ARRAY['none'], 'Isometric core strengthening'),
('Jump Squats', 'bodyweight', ARRAY['quadriceps', 'glutes', 'calves'], ARRAY['none'], 'Explosive bodyweight leg exercise'),
('Pike Push-ups', 'bodyweight', ARRAY['shoulders', 'triceps'], ARRAY['none'], 'Bodyweight shoulder exercise'),
('Single-Leg Glute Bridges', 'bodyweight', ARRAY['glutes', 'hamstrings', 'core'], ARRAY['none'], 'Unilateral glute activation'),
('Bear Crawl', 'bodyweight', ARRAY['core', 'shoulders', 'legs'], ARRAY['none'], 'Full-body stability movement'),

-- Cardio Exercises
('Running', 'cardio', ARRAY['legs', 'cardiovascular'], ARRAY['none'], 'Outdoor or treadmill cardiovascular exercise'),
('Cycling', 'cardio', ARRAY['legs', 'cardiovascular'], ARRAY['bicycle', 'stationary bike'], 'Low-impact cardiovascular exercise'),
('Rowing', 'cardio', ARRAY['full body', 'cardiovascular'], ARRAY['rowing machine'], 'Full-body cardio and strength'),
('Elliptical', 'cardio', ARRAY['legs', 'arms', 'cardiovascular'], ARRAY['elliptical machine'], 'Low-impact full-body cardio'),
('Jump Rope', 'cardio', ARRAY['calves', 'shoulders', 'cardiovascular'], ARRAY['jump rope'], 'High-intensity cardio with coordination'),
('Stair Climbing', 'cardio', ARRAY['legs', 'glutes', 'cardiovascular'], ARRAY['stairs', 'stair machine'], 'Functional cardio movement'),
('High Knees', 'cardio', ARRAY['legs', 'core', 'cardiovascular'], ARRAY['none'], 'In-place cardio exercise'),
('Swimming', 'cardio', ARRAY['full body', 'cardiovascular'], ARRAY['pool'], 'Low-impact full-body cardiovascular'),

-- Flexibility Exercises
('Hamstring Stretch', 'flexibility', ARRAY['hamstrings'], ARRAY['none'], 'Seated or standing hamstring flexibility'),
('Hip Flexor Stretch', 'flexibility', ARRAY['hip flexors'], ARRAY['none'], 'Lunge position hip opener'),
('Shoulder Stretch', 'flexibility', ARRAY['shoulders', 'chest'], ARRAY['none'], 'Cross-body shoulder mobility'),
('Cat-Cow Stretch', 'flexibility', ARRAY['spine', 'core'], ARRAY['none'], 'Spinal mobility and flexibility'),
('Pigeon Pose', 'flexibility', ARRAY['hips', 'glutes'], ARRAY['none'], 'Deep hip opener from yoga'),
('Child''s Pose', 'flexibility', ARRAY['back', 'shoulders', 'hips'], ARRAY['none'], 'Restorative full-body stretch'),
('Cobra Stretch', 'flexibility', ARRAY['chest', 'hip flexors', 'abs'], ARRAY['none'], 'Back extension stretch'),
('Seated Spinal Twist', 'flexibility', ARRAY['spine', 'obliques'], ARRAY['none'], 'Rotational spine mobility'),

-- Balance Exercises
('Single-Leg Stand', 'balance', ARRAY['legs', 'core'], ARRAY['none'], 'Basic unilateral balance training'),
('Tree Pose', 'balance', ARRAY['legs', 'core'], ARRAY['none'], 'Yoga balance posture'),
('Bosu Ball Squats', 'balance', ARRAY['legs', 'core'], ARRAY['bosu ball'], 'Unstable surface training'),
('Single-Leg Deadlift', 'balance', ARRAY['hamstrings', 'glutes', 'core'], ARRAY['none', 'dumbbells'], 'Balance and posterior chain'),
('Warrior III', 'balance', ARRAY['legs', 'core', 'back'], ARRAY['none'], 'Advanced yoga balance pose'),
('Balance Board Stand', 'balance', ARRAY['ankles', 'calves', 'core'], ARRAY['balance board'], 'Proprioception training'),

-- Core Exercises
('Russian Twists', 'bodyweight', ARRAY['obliques', 'core'], ARRAY['none', 'medicine ball'], 'Rotational core strengthening'),
('Dead Bug', 'bodyweight', ARRAY['core', 'hip flexors'], ARRAY['none'], 'Core stability exercise'),
('Bird Dog', 'bodyweight', ARRAY['core', 'glutes', 'back'], ARRAY['none'], 'Opposite arm/leg stability'),
('Bicycle Crunches', 'bodyweight', ARRAY['obliques', 'core'], ARRAY['none'], 'Dynamic core rotation'),
('Hollow Body Hold', 'bodyweight', ARRAY['core'], ARRAY['none'], 'Isometric core strengthening'),
('Side Plank', 'bodyweight', ARRAY['obliques', 'core'], ARRAY['none'], 'Lateral core stability'),

-- Additional Strength Exercises
('Romanian Deadlift', 'strength', ARRAY['hamstrings', 'glutes', 'lower back'], ARRAY['barbell', 'dumbbells'], 'Hip hinge movement pattern'),
('Bulgarian Split Squat', 'strength', ARRAY['quadriceps', 'glutes'], ARRAY['none', 'dumbbells'], 'Unilateral leg strengthening'),
('Face Pulls', 'strength', ARRAY['rear delts', 'rhomboids', 'traps'], ARRAY['cable machine'], 'Posterior shoulder strengthening'),
('Goblet Squat', 'strength', ARRAY['quadriceps', 'glutes', 'core'], ARRAY['dumbbell', 'kettlebell'], 'Front-loaded squat variation'),
('Farmer''s Walk', 'strength', ARRAY['core', 'traps', 'forearms'], ARRAY['dumbbells', 'kettlebells'], 'Loaded carry exercise'),
('Turkish Get-Up', 'strength', ARRAY['full body', 'core', 'shoulders'], ARRAY['kettlebell'], 'Complex full-body movement');

-- Verify the insert count
SELECT 
  category,
  COUNT(*) as exercise_count
FROM exercises 
GROUP BY category
ORDER BY category;