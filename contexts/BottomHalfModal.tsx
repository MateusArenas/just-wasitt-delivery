import { useTheme } from "@react-navigation/native";
import React, { useMemo } from "react";
import { Animated, FlatListProps, Keyboard, Text, TouchableWithoutFeedback, View } from "react-native";
import { Modalize } from "react-native-modalize";
import { IHandles } from "react-native-modalize/lib/options";
import { BlurView } from "expo-blur";

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

  return (
    <BottomHalfModalContext.Provider value={{ show }} >
      {children}
      <Modalize 
        ref={modalizeRef}
        adjustToContentHeight
        overlayStyle={{ backgroundColor: 'rgba(0,0,0,.3)' }}
        modalStyle={{ 
          borderRadius: 4, 
          overflow: 'hidden', 
          borderBottomRightRadius: 0, 
          borderBottomLeftRadius: 0,
          backgroundColor: 'transparent',
        }}
        handlePosition='inside'
        handleStyle={{ backgroundColor: colors.border }}
        childrenStyle={{ }}
        scrollViewProps={{ horizontal: true, contentContainerStyle: { flex: 1 } }} 
        // tira o erro de ter uma flatlist dentro de uma scrollview
      > 
        <BlurView style={{ flex: 1, paddingTop: 20, paddingBottom: 10 }} intensity={100} tint={dark ? 'dark' : 'light'}>
          {content}
        </BlurView>
      </Modalize>
    </BottomHalfModalContext.Provider>
  )
}

export default BottomHalfModalContext
