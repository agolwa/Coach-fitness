import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="add-exercises"
        options={{
          title: 'Add Exercises',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="exercise-detail"
        options={{
          title: 'Exercise Detail',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="workout-detail"
        options={{
          title: 'Workout Details',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="terms"
        options={{
          title: 'Terms & Conditions',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="privacy"
        options={{
          title: 'Privacy Policy',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="contact"
        options={{
          title: 'Contact Us',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="feedback"
        options={{
          title: 'Feedback & Requests',
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack>
  );
}