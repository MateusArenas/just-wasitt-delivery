import { StackScreenProps } from '@react-navigation/stack';
import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import NotFound from '../components/NotFound';

import { RootStackParamList } from '../types';

export default function NotFoundScreen({
  navigation,
  route
}: StackScreenProps<RootStackParamList, 'NotFound'>) {
  return (
    <NotFound 
      title={`This screen doesn't exist.`}
      redirectText={`Go to home screen!`}
    />
  );
}