import { BlurView } from 'expo-blur';
import { ReactNode } from 'hoist-non-react-statics/node_modules/@types/react';
import React, { useCallback, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { FlexStyle, View, StyleSheet, ViewStyle, TouchableNativeFeedback, TouchableOpacity, Text, LayoutChangeEvent, useWindowDimensions, ColorValue } from 'react-native';
import { Platform } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, Easing, cancelAnimation } from 'react-native-reanimated'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';

const IS_ANDROID = Platform.OS === 'android';
const IS_LT_LOLLIPOP = Platform.Version < 21;
export interface SnackbarComponentProps {
    ref?: any
    numberOfLines?: number;
    accentColor?: string;
    actionText?: string;
    messageColor?: string;
    backgroundColor?: string;
    distanceCallback?: (v: any) => void;
    actionHandler?: () => any;
    onPress?: () => any;
    actionHide?: boolean
    left?: number;
    right?: number;
    bottom?: number | ((height: number) => number);
    top?: number;
    position?: 'top' | 'bottom' | 'right' | 'left';
    textMessage?: string;
    textSubMessage?: string;
    autoHidingTime?: number;
    visible?: boolean;
    containerStyle?: ViewStyle
    messageStyle?: ViewStyle
    actionStyle?: ViewStyle
    dark?: boolean
    icon?: React.ComponentProps<typeof MaterialIcons>['name']
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
  actionHide=true,
  onClose= null,
  onOpen=null,
  left= 0,
  right= 0,
  top= 0,
  bottom: customBottom= 0,
  visible= false,
  position= 'bottom',
  actionText= '',
  textMessage= '',
  textSubMessage= '',
  autoHidingTime= 0, // Default value will not auto hide the snack bar as the old version.
  containerStyle= {},
  messageStyle= {},
  actionStyle= {},
  icon=undefined,
  iconColor='white',
  indicatorIcon=false,
  textDirection='column',
  dark=false,
  onLayout,
}, ref) => {
  const [height, setHeight] = React.useState(0)
  const bottom = typeof customBottom === 'function' ? customBottom(height) : customBottom
  
  const pos = { top, bottom, right, left }
  const timerRef = useRef(null);


  const fadeAnimBottom = useSharedValue(bottom);
  const translateValue = useSharedValue(0);

  const [hideDistance, setHideDistance] = useState(999)

  useImperativeHandle(ref, () => ({
    open: openSnackbar,
    close: hideSnackbar
  }));

  const openSnackbar = useCallback(() => {
    cancelAnimation(translateValue)
    translateValue.value = Animated.withTiming(1, {
      duration: durationValues.entry,
      easing: easingValues.entry,
    });
    if (autoHidingTime) {
      if (timerRef.current) clearTimeout(timerRef.current)
      const hideFunc = hideSnackbar.bind(this);
      timerRef.current = setTimeout(hideFunc, autoHidingTime);
    }
    onOpen && onOpen()
  }, [timerRef])

  useEffect( () => {
    if (visible) {
      openSnackbar()
    } else {
      hideSnackbar();
    }
  }, [visible, autoHidingTime])

  const hideSnackbar = useCallback(() => {
    cancelAnimation(translateValue)
    translateValue.value = Animated.withTiming(0, {
      duration: durationValues.exit,
      easing: easingValues.exit,
    })
    onClose && onClose()
  }, [])

  useEffect( () => {
    if (distanceCallback !== null) {
      if (visible) {
        distanceCallback(hideDistance + pos[position]);
      } else {
        distanceCallback(pos[position]);
      }
    }
  }, [distanceCallback, visible, hideDistance])

  useEffect(() => {
    fadeAnimBottom.value = Animated.withTiming(bottom,{
        duration: durationValues.entry,
        easing: easingValues.entry,
      }
    )
  }, [bottom])


  const containerAnimStyle = useAnimatedStyle(() => {
    return { 
      height: Animated.interpolate(translateValue?.value, 
        [0, 1],
        [0, hideDistance],
      ),
      bottom: fadeAnimBottom?.value,
    }
  })

  const componentAnimStyle = useAnimatedStyle(() => {
    switch (position) {
      case 'bottom':
        return { 
          bottom: Animated.interpolate(translateValue?.value,
            [0, 1],
            [hideDistance * -1, 0],
          )
         }
      case 'top':
        return { 
          top: Animated.interpolate(translateValue?.value,
            [0, 1],
            [hideDistance * -1, 0],
          )
        }
      default:
        return {}
    }
  })

return (
      <Animated.View onLayout={e => {
        onLayout && onLayout(e);
        setHeight(e?.nativeEvent?.layout?.height)
      }}
        style={[
          styles.limitContainer,
          containerAnimStyle,
          position === 'top'
            ? { top }
            : {  }, /// bottom
        ]}
      >
          <Animated.View
            style={[
              containerStyle,
              styles.container,
              {
                backgroundColor,
                left,
                right,
              },
              componentAnimStyle,
            ]}
            onLayout={({ nativeEvent: { layout: { height } } }) => 
              setHideDistance(height ? (height): bottom)
            }
          >
            <BlurView style={[{ borderRadius: 4, overflow: 'hidden', width: '100%' }]} 
              intensity={100} tint={dark ? 'dark' : 'light'}
            >
        <TouchableOpacity disabled={!onPress} onPress={onPress}>
              <View style={[styles.innerContainer]}>
                
              {!!icon && <MaterialIcons style={{ padding: 10, paddingRight: 0 }} 
                name={icon} 
                color={iconColor} 
                size={24} 
              />}
                {(
                  <View style={[
                    { flex: 1, padding: 10 },
                    { flexDirection: textDirection }
                  ]}>
                    <Text
                      numberOfLines={numberOfLines}
                      style={[
                        messageStyle,
                        styles.textMessage,
                        { color: messageColor},
                      ]}
                    >
                      {textMessage}
                    </Text>
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
                {!!actionText ? (
                    <Touchable onPress={() => {
                      actionHandler && actionHandler()
                      actionHide && hideSnackbar()
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Text
                          style={[
                            actionStyle,
                            styles.actionText,
                            { color: accentColor },
                            indicatorIcon ? { paddingEnd: 0 } : {}
                          ]}
                        >
                          {actionText.toUpperCase()}
                        </Text>
                        { indicatorIcon &&
                          <MaterialIcons style={{ padding: 10, paddingLeft: 0 }} 
                            name={'chevron-right'} 
                            color={accentColor} 
                            size={24} 
                          />
                        }
                      </View>
                    </Touchable>
                  )
                  : null
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
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    padding: '5%',
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


const Touchable = ({ onPress, style={}, children }) => {
  if (IS_ANDROID && !IS_LT_LOLLIPOP) {
    return (
      <TouchableNativeFeedback
        background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
        onPress={onPress}
      >
        <View
          style={style}
        >
          {children}
        </View>
      </TouchableNativeFeedback>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={style}
    >
      {children}
    </TouchableOpacity>
  );
};