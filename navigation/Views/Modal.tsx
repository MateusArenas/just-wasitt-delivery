import { CommonActions, StackActions, useNavigation, useNavigationState, useRoute, useTheme } from "@react-navigation/native"
import React, { useEffect, useState } from "react"
import { Dimensions, ModalProps, View, Text } from "react-native"
import { Modalize, ModalizeProps } from "react-native-modalize"
import Colors from "../../constants/Colors"
import useColorScheme from "../../hooks/useColorScheme"
import useRootNavigation from "../../hooks/useRootNavigation"

function Modal(props: any) {
  const modalizeRef = React.useRef<Modalize>(null)
  useEffect(() => {
    modalizeRef.current?.open()
    return () => {
      modalizeRef.current?.close()
    }
  } ,[modalizeRef])

  const navigation = useNavigation()
  const route = useRoute()
  const state = useNavigationState(state => state)
  return (
    <BottomHalfModal
      modalizeRef={modalizeRef}
      onClosed={() => {
        navigation.dispatch({
          ...CommonActions.goBack(),
          source: route.key,
          target: state.key,
        });
      }}
      {...props}
    >
       {props.children}
    </BottomHalfModal>
  )
}

export default function CreateBottomHalfModal(Component: any, BottomHalfModalProps?: ModalizeProps ): any {
  return (props: JSX.IntrinsicAttributes) => (
    <Modal {...BottomHalfModalProps}>
      <Component {...props}/>
    </Modal>
  )
}

function BottomHalfModal (props: any) {
  const [{ width, height }, setState] = useState<any>({} as any)
  const { colors } = useTheme();
  return <Modalize 
    modalStyle={{ 
      borderRadius: 4, 
      overflow: 'hidden', 
      borderBottomRightRadius: 0, 
      borderBottomLeftRadius: 0,
      backgroundColor: colors.background
    }}
    handleStyle={{
      backgroundColor: colors.text,
      opacity: .4
    }}
    {...props}
    handlePosition='inside'
    childrenStyle={{ flex: 1 }}
    onLayout={({ layout: { width, height } }) => setState({ width, height })}
    modalTopOffset={Dimensions.get('window').height / 2}
    ref={props.modalizeRef}
  >
    <View style={{ width, height }}>
      {props.children}
    </View>
  </Modalize>
}