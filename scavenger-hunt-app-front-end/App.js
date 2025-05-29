import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { CustomTheme } from './src/theme/Customtheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
export default function App() {
  return (
    <PaperProvider theme={CustomTheme}>
      <NavigationContainer theme={CustomTheme}>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}
