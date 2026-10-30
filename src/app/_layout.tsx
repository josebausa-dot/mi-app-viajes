import { DarkTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { Accent, Colors } from '@/constants/theme';
import { ActivitiesProvider } from '@/context/activities-context';
import { ExpensesProvider } from '@/context/expenses-context';
import { JournalProvider } from '@/context/journal-context';
import { PackingProvider } from '@/context/packing-context';
import { PlacesProvider } from '@/context/places-context';
import { TripsProvider } from '@/context/trips-context';

SplashScreen.preventAutoHideAsync();

const AppTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Accent,
    background: Colors.dark.background,
    card: Colors.dark.backgroundElement,
    text: Colors.dark.text,
    border: Colors.dark.backgroundSelected,
  },
};

export default function TabLayout() {
  return (
    <ThemeProvider value={AppTheme}>
      <TripsProvider>
        <ExpensesProvider>
          <ActivitiesProvider>
            <PackingProvider>
              <PlacesProvider>
                <JournalProvider>
                  <AnimatedSplashOverlay />
                  <AppTabs />
                </JournalProvider>
              </PlacesProvider>
            </PackingProvider>
          </ActivitiesProvider>
        </ExpensesProvider>
      </TripsProvider>
    </ThemeProvider>
  );
}
