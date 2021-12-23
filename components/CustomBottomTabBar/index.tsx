import { useTheme } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
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
  const { colors, dark } = useTheme()
  return (
    <View onLayout={onLayout} style={[{ padding: 10 }, props?.style]}>
      <BlurView intensity={100} tint={dark ? 'dark' : 'light'} >
        <TabBar {...props}
          style={[{ 
            elevation: 0, shadowColor: 'transparent', 
            backgroundColor: 'transparent' 
          }]}
          inactiveColor={colors.text}
          pressColor={colors.border}
          activeColor={colors.text}
          tabStyle={[{ flexDirection: 'row' }]}
          indicatorStyle={[
            { backgroundColor: colors.border }, 
            { height: '100%', borderRadius: 4, }
          ]}
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
      </BlurView>
    </View>
  )
}

export default CustomBottomTabBar
