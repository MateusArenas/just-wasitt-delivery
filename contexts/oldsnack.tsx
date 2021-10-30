import { useTheme } from "@react-navigation/native";
import React, { useContext, useMemo, useRef } from "react";
import SnackBar, { SnackbarComponentProps } from "../components/SnackBar";
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue } from "react-native-reanimated";

interface SnackBarData {
  setBottomOffset: React.Dispatch<React.SetStateAction<number>>
  snackbarHeight: number
  open: (key: keyof snackbars, props: SnackbarComponentProps) => any
  close: (key: keyof snackbars) => any
}

const SnackBarContext = React.createContext<SnackBarData>({} as SnackBarData)

interface snackbars {
  Show: snackbarConfig,
  Push: snackbarConfig
  Info: snackbarConfig
}

interface snackbarConfig {
  fixed: boolean
  height: number, 
  props: SnackbarComponentProps
  visible: boolean
  ref: React.MutableRefObject<any>
}

const paddingTop = 20;

function reducer(state, action) {
  switch (action.type) {
    case 'update':
      return {
        ...state, 
        [action?.payload?.key]: { 
          ...state[action?.payload?.key], 
          ...action?.payload?.data 
        } 
      };
    default:
      throw new Error();
  }
}

export const SnackBarProvider: React.FC = ({ children }) => {
  const { dark } = useTheme();

  const initialState = { 
    Info: { height: 0, fixed: false, props: {}, visible: false, ref: useRef(null) },
    Show: { height: 0, fixed: false, props: {}, visible: false, ref: useRef(null) },
    Push: { height: 0, fixed: true, props: {}, visible: false, ref: useRef(null) },
  };

  const [snackbars, dispatch] = React.useReducer(reducer, initialState);
  
  const [bottomOffset, setBottomOffset] = React.useState<number>(0)
  
  const snackbarHeight = React.useMemo(() => 
    Object.values(snackbars)?.map(item => 
      !item?.fixed ? (item?.height + (paddingTop/2)) : 0
    )?.reduce((acc, val) => acc+val, 0)
  , [snackbars])
  
  const open = React.useCallback((key: keyof snackbars, props: SnackbarComponentProps) => {
    dispatch({type: 'update', payload: { key, data: { props } } })
    snackbars[key]?.ref?.current?.open()
  }, [snackbars])

  const close = React.useCallback((key: keyof snackbars) => {
    snackbars[key]?.ref?.current?.close()
  }, [snackbars])

  const bottom = React.useCallback((key: keyof snackbars) => {
    const index = Object.keys(snackbars)?.findIndex(item => item === key)
    const filter = Object.keys(snackbars)?.filter((_, i) => i < index)

    const height = filter?.map((item, i) => (
      snackbars[item]?.visible ?
        (
          ((snackbars[item]?.height /2) + paddingTop)
          + (snackbars[item]?.props?.bottom ? snackbars[item]?.props?.bottom : 0)
        )
      : 0
    ))?.reduce((acc, val) => acc+val, 0)

    const bottomOffset = (snackbars[key]?.props?.bottom ? snackbars[key]?.props?.bottom : 0)

    return (height + bottomOffset)
  }, [snackbars])
  
  const onClose = React.useCallback((key: keyof snackbars) => {
    setTimeout(() => {
      dispatch({type: 'update', payload: { key, data: { visible: false } } })
    }, 200);
    snackbars[key]?.props?.onClose && snackbars[key]?.props?.onClose()
  }, [snackbars])

  const onOpen = React.useCallback((key: keyof snackbars) => {
    dispatch({type: 'update', payload: { key, data: { visible: true } } })
    snackbars[key]?.props?.onOpen && snackbars[key]?.props?.onOpen()
  }, [snackbars])

  const onLayout = React.useCallback((key: keyof snackbars, e) => {
    const height = e?.nativeEvent?.layout?.height
    dispatch({type: 'update', payload: { key, data: { height } } })
    snackbars[key]?.props?.onLayout && snackbars[key]?.props?.onLayout(e)
  }, [snackbars])

  const translateValue = useSharedValue(bottomOffset);

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

  const containerAnimStyle = useAnimatedStyle(() => {
    return { 
      bottom: translateValue?.value,
    }
  })

  return (
    <SnackBarContext.Provider value={{ open, close, snackbarHeight, setBottomOffset }} >
        {children}
        <Animated.View style={[containerAnimStyle, { backgroundColor: 'blue' }]}>
          {/* { Object.keys(snackbars)?.map((key: any, index) => 
            (
              <SnackBar key={`${key}-${index}`} ref={snackbars[key]?.ref}
                  dark={dark}
                  {...snackbars[key]?.props}
                  onLayout={e => onLayout(key, e)}
                  bottom={
                    bottom(key)
                  }
                  onOpen={() => onOpen(key)}
                  onClose={() => onClose(key)}
              />
            )
          ) } */}

              {
              <SnackBar ref={snackbars['Info']?.ref}
                  dark={dark}
                  {...snackbars['Info']?.props}
                  onLayout={e => onLayout('Info', e)}
                  bottom={bottom('Info')}
                  onOpen={() => onOpen('Info')}
                  onClose={() => onClose('Info')}
              />}

              {
              <SnackBar ref={snackbars['Push']?.ref}
                  dark={dark}
                  {...snackbars['Push']?.props}
                  onLayout={e => onLayout('Push', e)}
                  bottom={bottom('Push')}
                  onOpen={() => onOpen('Push')}
                  onClose={() => onClose('Push')}
              />}

              { 
              <SnackBar ref={snackbars['Show']?.ref}
                  dark={dark}
                  {...snackbars['Show']?.props}
                  onLayout={e => onLayout('Show', e)}
                  bottom={bottom('Show')}
                  onOpen={() => onOpen('Show')}
                  onClose={() => onClose('Show')}
              />}

        </Animated.View>
    </SnackBarContext.Provider>
  )
}


export default SnackBarContext
