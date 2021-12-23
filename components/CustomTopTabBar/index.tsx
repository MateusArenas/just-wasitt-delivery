import React from 'react';
import { useTheme } from '@react-navigation/native';
import { View, Text, StyleProp, ViewStyle, LayoutChangeEvent, TextStyle } from 'react-native';
import { NavigationState, SceneRendererProps, TabBar } from 'react-native-tab-view';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

export interface TabViewRouteProps {
  key: string;
  title?: string;
  icon?: React.ComponentProps<typeof MaterialIcons>['name']
  important?: boolean
  focused?: boolean
}

interface CustomTopTabBarPorps {
  style?: StyleProp<ViewStyle>
  tabStyle?: StyleProp<ViewStyle>
  labelStyle?: StyleProp<TextStyle>
}

export default function CustomTopTabBar ({onLayout, ...props}: SceneRendererProps & {
  navigationState: NavigationState<TabViewRouteProps>
  onLayout?: (event: LayoutChangeEvent) => void
} & CustomTopTabBarPorps) {
  const { colors } = useTheme()

  return (
      <View onLayout={onLayout} style={[{ padding: 10 }, props.style]} >
          <TabBar {...props}
            style={[{ 
              elevation: 0, shadowColor: 'transparent', 
              backgroundColor: 'transparent'
            }]}
            contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}
            inactiveColor={colors.text}
            pressColor={colors.border}
            activeColor={colors.text}
            tabStyle={[{ 
              flexDirection: 'row', maxWidth: (props.layout.width/2)-10, 
              justifyContent: 'flex-start', alignItems: 'center',
              paddingHorizontal: 10
            }, props?.tabStyle]}
            indicatorStyle={[
              { backgroundColor: colors.border }, 
              { height: '100%', borderRadius: 4, maxWidth: (props.layout.width/2)-10, alignSelf: 'center' }
            ]}
            renderIcon={({ route, color=colors.text, focused }) => 
              route?.icon ? 
                <MaterialIcons style={{ opacity: focused ? 1 : .5, paddingHorizontal: 5 }} 
                  name={route?.icon} 
                  size={24} 
                  color={color} 
                /> 
              : null
            }
            renderBadge={({ route }) => route?.important ? 
            <Text numberOfLines={1} style={[{ 
              color: colors.text, padding: 5, paddingHorizontal: 10, 
              fontSize: 24, fontWeight: '500',
              textTransform: 'capitalize',
              opacity: .5, 
            }]}>
              {'*'}
            </Text> 
          : null}
            renderLabel={({ route, focused, color=colors.text }) => 
              !!route.title ? 
                <Text numberOfLines={1} style={[{ 
                  color,
                  fontSize: 16, fontWeight: '500',
                  textTransform: 'capitalize',
                  opacity: focused ? .8 : .5
                }, props?.labelStyle, { 
                 //important for numberOfLines
                  maxWidth: (props.layout.width/(props?.navigationState?.routes?.length))
                  -(20+(15*props?.navigationState?.routes?.length))
                } ]}>
                {route.title}
                </Text> 
             : null
            }
          />
      </View>
  )
}
