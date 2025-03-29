// App.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

// If you're using React Native Paper, import the Paper provider:
// import { Provider as PaperProvider } from 'react-native-paper';

export default function App() {
  return (
    // <PaperProvider>  // <-- Uncomment if using React Native Paper
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    // </PaperProvider>
  );
}
