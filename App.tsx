import { ApolloProvider } from '@apollo/client';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import apollo from './services/apollo';

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <ApolloProvider client={apollo}>
        <View style={{ flex: 1 }}>
            <StatusBar />
              <Navigation colorScheme={colorScheme} />
        </View>
      </ApolloProvider>
    );
  }
}
