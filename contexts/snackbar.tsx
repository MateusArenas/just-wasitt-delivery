import { useTheme } from "@react-navigation/native";
import React, { useContext, useMemo, useRef } from "react";
import SnackBar, { SnackbarComponentProps } from "../components/SnackBar";
import Animated, { cancelAnimation, useAnimatedStyle, useDerivedValue, useSharedValue,  } from "react-native-reanimated";
import { createContext, useContextSelector } from 'use-context-selector';
interface SnackBarData {
  setBottomOffset: React.Dispatch<React.SetStateAction<number>>
  setExtraBottomOffset: React.Dispatch<React.SetStateAction<number>>
  snackbarHeight: number
  open: (props: SnackbarComponentProps) => any
  close: () => any
}

const SnackBarContext = createContext<SnackBarData>({} as SnackBarData)

export const SnackBarProvider: React.FC = ({ children }) => {
  const { dark } = useTheme();

  const [snackbarHeight, setSnackbarHeight] = React.useState(0)
  const [snackbarProps, setSnackbarProps] = React.useState<SnackbarComponentProps>({})
  const snackbarRef = React.useRef(null)

  const [bottomOffset, setBottomOffset] = React.useState<number>(0)
  const [extraBottomOffset, setExtraBottomOffset] = React.useState<number>(0)
  
  const open = React.useCallback(props => {
    setSnackbarProps(props)
    snackbarRef?.current?.open()
  }, [setSnackbarProps, snackbarRef])

  const close = React.useCallback(() => {
    snackbarRef?.current?.close()
  }, [snackbarRef])

  const onLayout = React.useCallback(e => {
    const height = e?.nativeEvent?.layout?.height
    setSnackbarHeight(height)
    snackbarProps?.onLayout && snackbarProps?.onLayout(e)
  }, [setSnackbarHeight, snackbarProps])

  const translateValue = useSharedValue(bottomOffset+extraBottomOffset);

  React.useEffect(() => {
    if (translateValue.value  !== bottomOffset) {
      translateValue.value = Animated.withTiming(bottomOffset, 
        { duration: 250 }
      )
    } 
    return function () {
      translateValue.value = 0
    }
  }, [translateValue, bottomOffset])

  React.useEffect(() => {
    if (translateValue.value  !== (bottomOffset+extraBottomOffset)) {
      cancelAnimation(translateValue)
      translateValue.value = Animated.withTiming((bottomOffset+extraBottomOffset), 
        { duration: 250 }
      )
    } 
    return function () {
      translateValue.value = 0
    }
  }, [translateValue, bottomOffset, extraBottomOffset])

  const containerAnimStyle = useAnimatedStyle(() => {
    return { 
      bottom: translateValue?.value,
    }
  })

  return (
    <SnackBarContext.Provider value={{ open, close, snackbarHeight, setBottomOffset, setExtraBottomOffset }} >
        {children}
        <Animated.View style={[containerAnimStyle]}>
          <SnackBar ref={snackbarRef}
              dark={dark}
              {...snackbarProps}
              onLayout={onLayout}
          />
        </Animated.View>
    </SnackBarContext.Provider>
  )
}


export default SnackBarContext
