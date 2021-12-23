import { StackActions, useTheme } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/stack';
import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import useRootNavigation from '../../hooks/useRootNavigation';

interface NotFoundProps {
  title: string 
  redirectText: string
  onPress?: () => any
}

export default function NotFound({
  title,
  redirectText,
  onPress,
}: NotFoundProps) {
  const rootNavigation = useRootNavigation()
  const { colors } = useTheme()
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <TouchableOpacity onPress={onPress ? onPress : () => rootNavigation.dispatch(StackActions.replace('Root'))} style={styles.link}>
        <Text style={[styles.linkText, { color: colors.primary }]}>{redirectText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center'
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2e78b7',
    textAlign: 'center'
  },
});
