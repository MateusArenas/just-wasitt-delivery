import * as React from 'react';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import SearchScreen from '../screens/Search';
import { SearchTabParamList, TabExploreParamList } from '../types';
import { StackHeaderTitleProps, StackScreenProps } from '@react-navigation/stack';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import IconButton from '../components/IconButton';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { TextInput } from 'react-native';
import { View } from '../components/Themed';
 
 const Tab = createMaterialTopTabNavigator<SearchTabParamList>();

 export default function SearchTabNavigator({ 
  navigation, 
  route
} : StackScreenProps<TabExploreParamList, 'Search'>) {
  const { colors } = useTheme();

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      headerTintColor: colors.text,
      headerStyle: { borderBottomColor: colors.primary },
      headerTitleAlign: 'left',
      headerTitle: SearchBar,
      headerLeft: ({ tintColor }: any) => 
      <IconButton 
        name="arrow-back" size={24} 
        color={tintColor} 
        onPress={() => navigation.navigate('Main')} 
      />,
    });
  }, [navigation]))
 
   return (
     <Tab.Navigator
       initialRouteName="Products"
       tabBarOptions={{ 
          activeTintColor: colors.primary, 
        }}>
        <Tab.Screen
          name="Products"
          component={SearchScreen}
          options={{
            title: SearchTitles['Products'],
          }}
        />
       <Tab.Screen
         name="Stores"
         component={SearchScreen}
         options={{
           title: SearchTitles['Stores'],
         }}
       />
     </Tab.Navigator>
   );
 }

export const SearchTitles = {
  Stores: 'Lojas',
  Products: 'Produtos'
} 

interface SearchBarProps extends StackHeaderTitleProps {}
const SearchBar: React.FC<SearchBarProps> = ({
  children, 
  onLayout, 
  allowFontScaling, 
  style, 
  tintColor
}) => {
  return (
    <View 
      style={{ borderRadius: 4, overflow: 'hidden' }}
      lightColor={'rgba(0,0,0,.2)'} 
      darkColor={'rgba(255,255,255,.2)'} 
    >
      <TextInput 
        onLayout={onLayout}
        allowFontScaling={allowFontScaling}
        autoFocus
        placeholderTextColor={tintColor}
        placeholder={children}
        style={[style as any, { 
          padding: 5, 
          color: tintColor, 
          fontSize: 18, 
        }]}
      />
     </View>
  )
}