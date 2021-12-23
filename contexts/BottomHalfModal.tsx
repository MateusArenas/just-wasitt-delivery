import { useTheme } from "@react-navigation/native";
import React, { useMemo } from "react";
import { Animated, FlatListProps, Keyboard, Text, TouchableWithoutFeedback, View, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { Modalize } from "react-native-modalize";
import { IHandles } from "react-native-modalize/lib/options";
import { BlurView } from "expo-blur";
import { Easing } from "react-native-reanimated";
import useMediaQuery from "../hooks/useMediaQuery";

interface BottomHalfModalData {
  show: (children: React.ReactNode | ((modalizeRef: React.MutableRefObject<IHandles>) => React.ReactNode)) => any
}

const BottomHalfModalContext = React.createContext<BottomHalfModalData>({} as BottomHalfModalData)

export const BottomHalfModalProvider: React.FC = ({ children }) => {
  const { colors, dark } = useTheme();
  const [content, setContent] = React.useState<React.ReactNode>(null)
  const modalizeRef = React.useRef<Modalize>(null)

  const show: BottomHalfModalData['show']  = React.useCallback(children => {
    Keyboard.dismiss()
    const component = typeof children === 'function' ? children(modalizeRef) : children
    setContent(component)
    modalizeRef.current?.open()
  }, [modalizeRef, setContent])

  const { isDesktop } = useMediaQuery()
  
  return (
    <BottomHalfModalContext.Provider value={{ show }} >
      {children}
      <Modalize ref={modalizeRef}
        adjustToContentHeight={isDesktop ? false : true}
        openAnimationConfig={{ timing: { duration: 75 } }}
        closeAnimationConfig={{ timing: { duration: isDesktop ? 0 : 280 } }}
        overlayStyle={{ backgroundColor: 'rgba(0,0,0,.3)' }}
        modalStyle={{ 
          borderRadius: 4, 
          overflow: 'hidden', 
          borderBottomRightRadius: 0, 
          borderBottomLeftRadius: 0,
          backgroundColor: 'transparent',
          zIndex: 999
        }}
        handlePosition='inside'
        handleStyle={{ backgroundColor: colors.border }}
        childrenStyle={{ }}
        scrollViewProps={{ horizontal: true, contentContainerStyle: { flex: 1 } }} 
        // tira o erro de ter uma flatlist dentro de uma scrollview
      > 
      <Overley device={!isDesktop} style={{ flex: 1, width: '100%', height: '100%' }} onPress={() => modalizeRef.current?.close()}>
          <BlurView style={[
            { flex: 1, paddingTop: 20, paddingBottom: 10 },
            isDesktop && { alignItems: 'center', justifyContent: 'center' },
            isDesktop && { paddingTop: 0 }
          ]} 
          intensity={100} tint={dark ? 'dark' : 'light'}>
            <View style={[ 
              { flexShrink: 1 }, 
              isDesktop && { alignItems: 'center' },
              isDesktop && { 
                backgroundColor: colors.card, overflow: 'hidden',
                borderRadius: 10, 
                // borderWidth: 1, borderColor: colors.border
              }
            ]}>
              <View style={[
                { flexShrink: 1 }, 
                isDesktop && {  maxWidth: 679, minWidth: 420 },
                isDesktop && { 
                  // backgroundColor: colors.border, 
                  paddingTop: 5,
                }
              ]}>
                {content}
              </View>
            </View>
          </BlurView>
      </Overley>
        {/* <View style={[
          { position: 'absolute', width: '100%', height: '100%' }, 
          { backgroundColor: colors.background, opacity: .7 }
        ]} /> */}
      </Modalize>
    </BottomHalfModalContext.Provider>
  )
}

const Overley: React.FC<TouchableOpacityProps & { device?: boolean }> = ({ device=true, ...props }) => {
  if (device) return <TouchableWithoutFeedback {...props}/>;
  return <TouchableOpacity {...props} />;
}

export default BottomHalfModalContext
