import { useTheme } from "@react-navigation/native";
import React, { useContext, useMemo, useRef } from "react";
import SnackBar, { SnackbarComponentProps } from "../components/SnackBar";
import Animated, { cancelAnimation, runOnJS, useAnimatedGestureHandler, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withDecay, withDelay, withSpring, withTiming,  } from "react-native-reanimated";
import { createContext, useContextSelector } from 'use-context-selector';
import { PanGestureHandler } from "react-native-gesture-handler";
import { Platform, StyleSheet } from "react-native";
interface SnackBarData {
  setBottomOffset: React.Dispatch<React.SetStateAction<number>>
  setExtraBottomOffset: React.Dispatch<React.SetStateAction<number>>
  snackbarHeight: number
  open: (props: SnackbarComponentProps) => any
  close: () => any
}

const duration = 250;

const SnackBarContext = createContext<SnackBarData>({} as SnackBarData)

export const SnackBarProvider: React.FC = ({ children }) => {
  const { dark } = useTheme();

  const [snackbarHeight, setSnackbarHeight] = React.useState(0)
  const [snackbarProps, setSnackbarProps] = React.useState<SnackbarComponentProps>({})
  const snackbarRef = React.useRef(null)

  const [bottomOffset, setBottomOffset] = React.useState<number>(0)
  const [extraBottomOffset, setExtraBottomOffset] = React.useState<number>(0)

  const translateValue = useSharedValue(bottomOffset+extraBottomOffset);

  const totalOffset = (bottomOffset+extraBottomOffset)
  
  const open = React.useCallback(props => {
    setSnackbarProps(props)
    snackbarRef?.current?.open()
    translateValue.value = withTiming(totalOffset, { duration })
  }, [translateValue, totalOffset])

  const close = React.useCallback(() => {
    snackbarRef?.current?.close()
    cancelAnimation(translateValue)
  }, [translateValue])

  const onLayout = React.useCallback(e => {
    const height = e?.nativeEvent?.layout?.height
    setSnackbarHeight(height)
    snackbarProps?.onLayout && snackbarProps?.onLayout(e)
  }, [snackbarProps])

  const stylesValue = { 
    container: {
      bottom: translateValue?.value
    }
  }

  const containerAnimStyle = useAnimatedStyle(() => ({
    bottom: translateValue?.value
  }))

  const onGestureEvent = useAnimatedGestureHandler({
    onStart(event, ctx: { posY: number }) {
      ctx.posY =  translateValue.value
    },
    onActive(event, ctx) {
      const value = Math.min(ctx.posY - event.translationY, totalOffset)
      translateValue.value = withSpring(value, { velocity: -event.velocityY })
    },
    onEnd(event, ctx) {
      const value =  Math.min(ctx.posY - event.translationY, totalOffset)
      translateValue.value = withSpring(value, { velocity: -event.velocityY })
    },
    onFinish(event, ctx) {
      translateValue.value = withDelay(500, withTiming(totalOffset))
    }
  }, [translateValue, totalOffset])

  useAnimatedReaction(() => {
    return translateValue.value;
  }, (result, previous) => {
    if (result <= -(snackbarHeight/2)) {
        runOnJS(close)()
    }
  }, [translateValue, snackbarHeight]);

  return (
    <SnackBarContext.Provider value={{ open, close, snackbarHeight, setBottomOffset, setExtraBottomOffset }} >
        {children}
        <PanGestureHandler onGestureEvent={onGestureEvent}>
            <Animated.View style={[
                containerAnimStyle, 
                Platform.select({ web: true }) ? 
                {...stylesValue.container, ...styles.container} : {}
              ]}>
              <SnackBar ref={snackbarRef}
                  dark={dark}
                  {...snackbarProps}
                  onLayout={onLayout}
              />
            </Animated.View>
        </PanGestureHandler>
    </SnackBarContext.Provider>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', 
    zIndex: 9999, 
    left: 0,
    right: 0,
    width: '100%'
  }
})


export default SnackBarContext
