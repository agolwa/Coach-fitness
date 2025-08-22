import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="add-exercises"
        options={{
          title: 'Add Exercises',
          presentation: 'modal',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="exercise-detail/[id]"
        options={{
          title: 'Exercise Details',
          presentation: 'modal',
          headerShown: true,
        }}
      />
    </Stack>
  );
}