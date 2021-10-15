import * as React from 'react';

import { createStackNavigator, StackScreenProps } from "@react-navigation/stack"
import { BottomTabParamList, TabHomeParamList } from "../../types"

import HomeScreen from '../../screens/Home'
import IconButton from '../../components/IconButton';
import useRootNavigation from '../../hooks/useRootNavigation';
import { useFocusEffect, useTheme } from '@react-navigation/native';

const TabHomeStack = createStackNavigator<TabHomeParamList>()

function TabHomeNavigator({ 
  navigation 
} : StackScreenProps<BottomTabParamList, 'TabHome'>) {
  const { colors } = useTheme();

  const rootNavigation = useRootNavigation()

  useFocusEffect(React.useCallback(() => {
    rootNavigation.setOptions({
      headerShown: true,
    });
  }, [rootNavigation]))

  return (
    <TabHomeStack.Navigator headerMode="none"
      screenOptions={{ 
        headerStyle: { borderBottomColor: colors.primary },
        headerTintColor: colors.text 
      }}
    >
      <TabHomeStack.Screen
        name="Main"
        component={HomeScreen}
        options={{ 
          headerTitle: '',
          headerLeft: ({ tintColor }) => (
            <IconButton 
              name="expand-more" color={tintColor} size={24}
              onPress={() => rootNavigation.navigate('Andress')} 
              label="Estr. do Carneiro" 
            />
          ),
          headerRight: ({ tintColor }) => (
            <IconButton onPress={() => {}} name="account-circle" size={24} color={tintColor} />
          ),
        }}
      />
    </TabHomeStack.Navigator>
  );
}

export default TabHomeNavigator