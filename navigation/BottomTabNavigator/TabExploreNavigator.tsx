import * as React from 'react';

import { createStackNavigator, HeaderTitle, StackScreenProps } from "@react-navigation/stack"
import { BottomTabParamList, TabExploreParamList } from "../../types"

import ExploreScreen from '../../screens/Explore'
import { Button, TouchableWithoutFeedback } from 'react-native';
import IconButton from '../../components/IconButton';
import Colors from '../../constants/Colors';
import useColorScheme from '../../hooks/useColorScheme';
import useRootNavigation from '../../hooks/useRootNavigation';
import SearchTabNavigator from '../SearchTabNavigator';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { View } from '../../components/Themed';

const TabExploreStack = createStackNavigator<TabExploreParamList>()

function TabExploreNavigator({ 
  navigation 
} : StackScreenProps<BottomTabParamList, 'TabExplore'>) {
  const { colors } = useTheme();

  const rootNavigation = useRootNavigation()

  useFocusEffect(React.useCallback(() => {
    rootNavigation.setOptions({
      headerShown: true,
    });
  }, [rootNavigation]))

  return (
    <TabExploreStack.Navigator headerMode="screen"
      screenOptions={{ 
        headerStyle: { borderBottomColor: colors.primary },
        headerTintColor: colors.text 
      }}
    >
      <TabExploreStack.Screen
        name="Main"
        component={ExploreScreen}
        options={{ 
          title: 'Explorar',
          headerLeft: ({ tintColor }) => (
            <IconButton 
              name="expand-more" color={tintColor} size={24}
              onPress={() => rootNavigation.navigate('Andress')} 
              label="Estr. do Carneiro" 
            />
          ),
          headerRight: ({ tintColor }) => (
            <IconButton onPress={() => {}} name="search" size={24} color={tintColor} />
          ),
        }}
      />
      <TabExploreStack.Screen
        name="Search"
        component={SearchTabNavigator}
        options={{ title: 'Pesquisar' }}
      />
    </TabExploreStack.Navigator>
  );
}

export default TabExploreNavigator