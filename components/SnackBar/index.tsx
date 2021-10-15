import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, ViewStyle, TouchableNativeFeedback, TouchableOpacity, Text } from 'react-native';
import { Platform } from 'react-native';

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
    left?: number;
    right?: number;
    bottom?: number;
    top?: number;
    position?: 'top' | 'bottom' | 'right' | 'left';
    textMessage?: string;
    autoHidingTime?: number;
    visible?: boolean;
    containerStyle?: ViewStyle
    messageStyle?: ViewStyle
    actionStyle?: ViewStyle
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

const SnackBar: React.FC<SnackbarComponentProps & { onClose?: () => any }> = forwardRef(({
  numberOfLines=1,
  accentColor= 'orange',
  messageColor= '#FFFFFF',
  backgroundColor= '#484848',
  distanceCallback= null,
  actionHandler= null,
  onClose= null,
  left= 0,
  right= 0,
  top= 0,
  bottom= 0,
  visible= false,
  position= 'bottom',
  actionText= '',
  textMessage= '',
  autoHidingTime= 0, // Default value will not auto hide the snack bar as the old version.
  containerStyle= {},
  messageStyle= {},
  actionStyle= {},
}, ref) => {
  const pos = { top, bottom, right, left }
  const timerRef = useRef(null);

  const [state, setState] = useState({
    translateValue: new Animated.Value(0),
    hideDistance: 9999,
  })

  useImperativeHandle(ref, () => ({
    open: openSnackbar,
    close: hideSnackbar
  }));

  useEffect(() => {
    if (visible) {
      state.translateValue.setValue(1);
    } else {
      state.translateValue.setValue(0);
    }
  } ,[])

  function openSnackbar () {
    Animated.timing(state.translateValue, {
      duration: durationValues.entry,
      toValue: 1,
      easing: easingValues.entry,
      useNativeDriver: false
    }).start();
    if (autoHidingTime) {
      if (timerRef.current) clearTimeout(timerRef.current)
      const hideFunc = hideSnackbar.bind(this);
      timerRef.current = setTimeout(hideFunc, autoHidingTime);
    }
  }

  useEffect( () => {
    if (visible) {
      openSnackbar()
    } else if (!visible) {
      hideSnackbar();
    }
  }, [visible, autoHidingTime])

  useEffect( () => {
    if (distanceCallback !== null) {
      if (visible) {
        distanceCallback(state.hideDistance + pos[position]);
      } else {
        distanceCallback(pos[position]);
      }
    }
  }, [visible, state.hideDistance])


  function hideSnackbar() {
    if(onClose) onClose()
    Animated.timing(state.translateValue, {
      duration: durationValues.exit,
      toValue: 0,
      easing: easingValues.exit,
      useNativeDriver: false
    }).start();
  }

return (
      <Animated.View
        style={[
          styles.limitContainer,
          {
            height: state.translateValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, state.hideDistance],
            }),
          },
          position === 'top'
            ? { top: top }
            : { bottom: bottom },
        ]}
      >
        <Animated.View
          style={[
            containerStyle,
            styles.container,
            {
              backgroundColor: backgroundColor,
              left: left,
              right: right,
            },
            {
              [position]: state.translateValue.interpolate({
                inputRange: [0, 1],
                outputRange: [state.hideDistance * -1, 0],
              }),
            },
          ]}
          onLayout={event => setState(state => ({...state, hideDistance: event?.nativeEvent?.layout?.height }))}
        >
          {(
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
            )
          }
          {actionHandler !== null && !!actionText
            ? (
              <Touchable onPress={actionHandler}>
                <Text
                  style={[
                    actionStyle,
                    styles.actionText,
                    { color: accentColor },
                  ]}
                >
                  {actionText.toUpperCase()}
                </Text>
              </Touchable>
            )
            : null
          }
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
    zIndex: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
  },
  textMessage: {
    fontWeight: '500',
    fontSize: 14,
    flex: 1,
    textAlign: 'left',
    paddingStart: 20,
    paddingEnd: 20,
    paddingTop: 14,
    paddingBottom: 14,
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