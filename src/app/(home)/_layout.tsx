import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="trip/[id]" options={{ title: 'Detalle del viaje', headerBackTitle: 'Viajes' }} />
      <Stack.Screen name="diary/[id]" options={{ title: 'Diario de viaje', headerBackTitle: 'Viaje' }} />
    </Stack>
  );
}
