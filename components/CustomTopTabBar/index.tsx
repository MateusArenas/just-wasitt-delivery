import React from 'react';
import { useTheme } from '@react-navigation/native';
import { View, Text, StyleProp, ViewStyle, LayoutChangeEvent } from 'react-native';
import { NavigationState, SceneRendererProps, TabBar } from 'react-native-tab-view';
import { MaterialIcons } from '@expo/vector-icons';

export interface TabViewRouteProps {
  key: string;
  title?: string;
  icon?: React.ComponentProps<typeof MaterialIcons>['name']
  focused?: boolean
}

interface CustomTopTabBarPorps {
  style?: StyleProp<ViewStyle>
}

export default function CustomTopTabBar ({onLayout, ...props}: SceneRendererProps & {
  navigationState: NavigationState<TabViewRouteProps>
} & CustomTopTabBarPorps) {
  const { colors } = useTheme()

  return (
      <TabBar {...props}
        style={[{ 
          elevation: 0, shadowColor: 'transparent', 
          backgroundColor: colors.card, 
          borderBottomWidth: 1, borderColor: colors.border 
        }, props.style]}
        inactiveColor={colors.text}
        pressColor={colors.border}
        activeColor={colors.text}
        indicatorStyle={{ backgroundColor: colors.text, opacity: .5 }}
        labelStyle={{ color: colors.text, textTransform: 'capitalize' }}
        renderIcon={({ route, color, focused }) => 
          route?.icon ? 
            <MaterialIcons style={{ opacity: focused ? 1 : .5 }} name={route?.icon} size={24} color={color} /> 
          : null
        }
        renderLabel={({ route, focused, color }) => 
          route.title ? <Text numberOfLines={1} style={{ 
            color, margin: 4, 
            fontSize: 16, fontWeight: '500',
            textTransform: 'capitalize',
            opacity: focused ? 1 : .5, 
          }}>
            {route.title}
          </Text> : null
        }
      />
  )
}
