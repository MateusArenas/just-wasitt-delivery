import { BlurView } from 'expo-blur';
import { ReactNode } from 'hoist-non-react-statics/node_modules/@types/react';
import React, { useMemo,useCallback, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { FlexStyle, View, StyleSheet, ViewStyle, TouchableNativeFeedback, TouchableOpacity, Text, LayoutChangeEvent, useWindowDimensions, ColorValue } from 'react-native';
import { Platform } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, Easing, cancelAnimation, useAnimatedGestureHandler, interpolate, withTiming } from 'react-native-reanimated'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import Badge from '../Badge';
import { useTheme } from '@react-navigation/native';

const IS_ANDROID = Platform.OS === 'android';
const IS_LT_LOLLIPOP = Platform.Version < 21;
export interface SnackbarComponentProps {
    ref?: any
    numberOfLines?: number;
    accentColor?: string;
    actionText?: string | number;
    actionIcon?: React.ComponentProps<typeof MaterialIcons>['name'];
    messageColor?: string;
    backgroundColor?: string;
    distanceCallback?: (v: any) => void;
    actionHandler?: () => any;
    onPress?: () => any;
    actionHide?: boolean
    left?: number;
    right?: number;
    bottom?: number;
    top?: number;
    position?: 'top' | 'bottom' | 'right' | 'left';
    textMessage?: string;
    textSubMessage?: string | number;
    autoHidingTime?: number;
    visible?: boolean;
    containerStyle?: ViewStyle
    messageStyle?: ViewStyle
    actionStyle?: ViewStyle
    dark?: boolean
    icon?: React.ComponentProps<typeof MaterialIcons>['name']
    badge?: number
    badgeColor?: ColorValue
    badgeBackgroundColor?: ColorValue
    badgeFontSize?: number
    indicatorIcon?: boolean
    iconColor?: ColorValue
    textDirection?: FlexStyle['flexDirection'],
    onClose?: () => any
    onOpen?: () => any
    onLayout?: (event: LayoutChangeEvent) => void
}

/* Values are from https://material.io/guidelines/motion/duration-easing.html#duration-easing-dynamic-durations */
const easingValues = {
  entry: Easing.bezier(0.0, 0.0, 0.2, 1),
  exit: Easing.bezier(0.4, 0.0, 1, 1),
};

const durationValues = {
  entry: 225,
  exit: 195,
};

const SnackBar: React.FC<SnackbarComponentProps & {  }> = forwardRef(({
  numberOfLines=1,
  accentColor= 'orange',
  messageColor= '#FFFFFF',
  backgroundColor= 'transparent',
  distanceCallback= null,
  actionHandler= null,
  onPress=null,
  actionHide=false,
  onClose= null,
  onOpen=null,
  left= 0,
  right= 0,
  top= 0,
  bottom=0,
  visible= false,
  position= 'bottom',
  actionText= '',
  actionIcon=null,
  textMessage= '',
  textSubMessage= '',
  autoHidingTime= 0, // Default value will not auto hide the snack bar as the old version.
  containerStyle= {},
  messageStyle= {},
  actionStyle= {},
  icon=undefined,
  badge=undefined,
  badgeFontSize=12,
  badgeBackgroundColor='blue',
  badgeColor='white',
  iconColor='white',
  indicatorIcon=false,
  textDirection='column',
  dark=false,
  onLayout,
}, ref) => {
  const { colors } = useTheme()
  // const pos = { top, bottom, right, left }
  const timerRef = useRef(null);

  const translateValue = useSharedValue(0);

  const [hideDistance, setHideDistance] = useState(999)

  useImperativeHandle(ref, () => ({
    open: openSnackbar,
    close: hideSnackbar
  }));

  function openSnackbar () {
    onOpen && onOpen()
    translateValue.value = withTiming(1, {
      duration: durationValues.entry,
      easing: easingValues.entry,
    });

    if (autoHidingTime) {
      if (timerRef.current) clearTimeout(timerRef.current)
      const hideFunc = hideSnackbar.bind(this);
      timerRef.current = setTimeout(hideFunc, autoHidingTime);
    }
  }

  React.useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      timerRef.current = null
    };
  }, [hideDistance]);

  React.useEffect( () => {
    if (visible) {
      openSnackbar()
    } else {
      hideSnackbar()
    }
  }, [visible])

  function hideSnackbar ()  {
    if (translateValue.value !== 0 ) {
      onClose && onClose()
      translateValue.value = Animated.withTiming(0, {
        duration: durationValues.exit,
        easing: easingValues.exit,
      })
    } else {
      // cancelAnimation(translateValue)
    }
  }



  // useEffect( () => {
  //   if (distanceCallback !== null) {
  //     if (visible) {
  //       distanceCallback(hideDistance + pos[position]);
  //     } else {
  //       distanceCallback(pos[position]);
  //     }
  //   }
  // }, [distanceCallback, visible, hideDistance])

  // useEffect(() => {
  //   if (fadeAnimBottom.value  !== bottom) {
  //     fadeAnimBottom.value = Animated.withTiming(bottom, 
  //       { duration: durationValues.entry/2 }
  //     )
  //   } else {
  //     cancelAnimation(fadeAnimBottom)
      
  //   }
  //   return function cleanup() {
  //     fadeAnimBottom.value = 0
  //     timerRef.current = null;
  //     translateValue.value = 0
  //   }
  // }, [fadeAnimBottom, bottom])


  const stylesValue = { 
    container: {
      height: interpolate(translateValue?.value, 
        [0, 1],
        [0, hideDistance],
      ),
      bottom: withTiming(bottom, 
        { duration: durationValues.entry/2 }
      )
    },
    component: {
      bottom: interpolate(translateValue?.value,
        [0, 1],
        [hideDistance * -1, 0],
      )
    }
  }

  const containerAnimStyle = useAnimatedStyle(() => ({
    height: interpolate(translateValue?.value, 
      [0, 1],
      [0, hideDistance],
    ),
    bottom: withTiming(bottom, 
      { duration: durationValues.entry/2 }
    )
  }))
  const componentAnimStyle = useAnimatedStyle(() => ({
    bottom: interpolate(translateValue?.value,
      [0, 1],
      [hideDistance * -1, 0],
    )
  }))

return (
      <Animated.View 
        style={[
          styles.limitContainer,
          containerAnimStyle,
          position === 'top'
            ? { top }
            : {},
            Platform.select({ web: true }) ? stylesValue.container : {}
        ]}
      >
          <Animated.View
            style={[
              containerStyle, 
              styles.container,
              componentAnimStyle,
              {
                backgroundColor,
                left,
                right,
              },
              Platform.select({ web: true }) ? stylesValue.component : {}
            ]}
            onLayout={e => {
              const height = e?.nativeEvent?.layout?.height
              setHideDistance(height ? (height): bottom)
              onLayout && onLayout(e)
            }}
          >
            <BlurView style={[
              { borderRadius: 4, overflow: 'hidden', width: '100%' },
              { borderWidth: 1, borderColor: colors.border }
            ]} 
              intensity={100} tint={dark ? 'dark' : 'light'}
            >
        <TouchableOpacity disabled={!onPress} onPress={() => {
          onPress && onPress()
          actionHide && hideSnackbar()
        }}>
              <View style={[styles.innerContainer]}>
                
              {(!!icon && !badge) && <MaterialIcons style={{ padding: 10, paddingRight: 0 }} 
                name={icon} 
                color={iconColor} 
                size={24} 
              />}
                              
              {(badge) && <Badge style={{ padding: 10, paddingRight: 0 }} 
                value={badge} 
                color={badgeColor} 
                backgroundColor={badgeBackgroundColor} 
                fontSize={badgeFontSize}
              />}

                {(
                  <View style={[
                    { flex: 1, padding: 10 },
                    { flexDirection: textDirection }
                  ]}>
                   {!!textMessage && <Text
                      numberOfLines={numberOfLines}
                      style={[
                        messageStyle,
                        styles.textMessage,
                        { color: messageColor},
                      ]}
                    >
                      {textMessage}
                    </Text>}
                    {!!textSubMessage && <Text
                      numberOfLines={numberOfLines}
                      style={[
                        messageStyle,
                        styles.textMessage,
                        { color: messageColor, opacity: .8 },
                      ]}
                    >
                      {textSubMessage}
                    </Text>}
                  </View>
                  )
                }
                {(
                    <Touchable disabled={!actionHandler} onPress={() => {
                      actionHandler && actionHandler()
                      actionHide && hideSnackbar()
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Text
                          style={[
                            actionStyle,
                            styles.actionText,
                            { color: accentColor },
                            indicatorIcon ? { paddingEnd: 0 } : {},
                            actionIcon ? { paddingEnd: 0 } : {},
                          ]}
                        >
                          {actionText}
                        </Text>
                        { indicatorIcon ? 
                          <MaterialIcons style={{ padding: 10, paddingLeft: 0 }} 
                            name={'chevron-right'} 
                            color={accentColor} 
                            size={24} 
                          />
                          : !!actionIcon && 
                          <MaterialIcons style={{ padding: 10, paddingLeft: 0 }} 
                            name={actionIcon} 
                            color={accentColor} 
                            size={24} 
                          />
                        }
                      </View>
                    </Touchable>
                  )
                }
              </View>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
      </Animated.View>
    );
})

export default SnackBar


const styles = StyleSheet.create({
  limitContainer: {
    position: 'absolute',
    overflow: 'hidden',
    left: 0,
    right: 0,
    zIndex: 555,
    // backgroundColor: 'red',
    // width: '100%',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    padding: 10,
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 49,
  },
  textMessage: {
    fontWeight: '500',
    fontSize: 16,
    // flex: 1,
    // textAlign: 'left',
    // alignSelf: 'center',
    // paddingStart: 20,
    // paddingEnd: 20,
    // paddingTop: 14,
    // paddingBottom: 14,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    paddingEnd: 20,
    paddingTop: 14,
    paddingBottom: 14,
  },
});


const Touchable = ({ disabled, onPress, style={}, children }) => {
  // if (IS_ANDROID && !IS_LT_LOLLIPOP) {
  //   return (
  //     <TouchableNativeFeedback
  //       disabled={disabled}
  //       background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
  //       onPress={onPress}
  //     >
  //       <View
  //         style={style}
  //       >
  //         {children}
  //       </View>
  //     </TouchableNativeFeedback>
  //   );
  // }

  return (
    <TouchableOpacity
    disabled={disabled}
      onPress={onPress}
      style={style}
    >
      {children}
    </TouchableOpacity>
  );
};