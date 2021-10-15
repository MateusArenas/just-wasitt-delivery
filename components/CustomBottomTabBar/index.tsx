import { useTheme } from '@react-navigation/native';
import React from 'react';
import { View, Text, LayoutChangeEvent } from 'react-native';
import { NavigationState, SceneRendererProps, TabBar } from 'react-native-tab-view';

interface CustomBottomTabBarProps extends SceneRendererProps {
  onLayout?: (event: LayoutChangeEvent) => void
  navigationState: NavigationState<{
    key: string;
    title: string;
  }>
}

const CustomBottomTabBar: React.FC<CustomBottomTabBarProps> = ({ onLayout, ...props }) => {
  const { colors } = useTheme()
  return (
    <View onLayout={onLayout}>
      <TabBar {...props}
        style={{ 
          elevation: 0, shadowColor: 'transparent', backgroundColor: colors.card,
          borderTopWidth: 1, borderColor: colors.border,
        }}
        inactiveColor={colors.text}
        pressColor={colors.border}
        activeColor={colors.text}
        indicatorStyle={{ backgroundColor: colors.border }}
        labelStyle={{ color: colors.text, textTransform: 'capitalize' }}
        renderLabel={({ route, focused, color }) => (
          <Text style={{ 
            color, margin: 4, 
            fontSize: 16, fontWeight: '500',
            textTransform: 'capitalize',
            opacity: focused ? 1 : .5, 
          }}>
            {route.title}
          </Text>
        )}
      />
    </View>
  )
}

export default CustomBottomTabBar
