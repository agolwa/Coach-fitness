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
    </Stack>
  );
}