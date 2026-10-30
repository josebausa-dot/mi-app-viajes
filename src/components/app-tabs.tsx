import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Accent, Colors } from '@/constants/theme';

export default function AppTabs() {
  const colors = Colors.dark;

  return (
    <NativeTabs
      backgroundColor={colors.backgroundElement}
      indicatorColor={colors.backgroundSelected}
      tintColor={Accent}
      iconColor={colors.textSecondary}
      labelStyle={{
        default: { color: colors.textSecondary },
        selected: { color: Accent },
      }}>
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house" md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="itinerario">
        <NativeTabs.Trigger.Label>Itinerario</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="gastos">
        <NativeTabs.Trigger.Label>Gastos</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="creditcard" md="payments" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="mapa">
        <NativeTabs.Trigger.Label>Mapa</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="map" md="map" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="equipaje">
        <NativeTabs.Trigger.Label>Equipaje</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="suitcase" md="luggage" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
