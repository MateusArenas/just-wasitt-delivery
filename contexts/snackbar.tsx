import { useTheme } from "@react-navigation/native";
import React, { useContext, useMemo, useRef } from "react";
import { Animated, FlatListProps, Text, TouchableWithoutFeedback, View } from "react-native";
import { Modalize } from "react-native-modalize";
import { IHandles } from "react-native-modalize/lib/options";
import { BlurView } from "expo-blur";
import SnackBar, { SnackbarComponentProps } from "../components/SnackBar";
import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs";

interface SnackBarData {
  show: (options: SnackbarComponentProps) => any
  hide: () => any
  push: (options: SnackbarComponentProps) => any
  snackbarHeight: number
}

const SnackBarContext = React.createContext<SnackBarData>({} as SnackBarData)

export const SnackBarProvider: React.FC = ({ children }) => {
  const bottom = useContext(BottomTabBarHeightContext) || 0

  const { dark } = useTheme();
  const SnackbarRef = useRef(null)

  const [visible, setVisible] = React.useState(false)
  const [options, setOptions] = React.useState<SnackbarComponentProps>({})

  const [snackbarHeight, setSnackbarHeight] = React.useState<number>(0)
//   const snackbarHeight = _snackbarHeight+bottom

  const [snackbars, setSnackbars] = React.useState<Array<any>>([])

  const show: SnackBarData['show'] = options => {
    setOptions(options)
    setVisible(true)
    SnackbarRef.current?.open()
  }

  const hide: SnackBarData['hide'] = () => {
    setVisible(false)
    SnackbarRef.current?.close()
  }

  const push: SnackBarData['push'] = options => {
    const _key = (snackbars?.length > 0) ? snackbars?.length-1 : 0 
    setSnackbars(snacks => [...snacks, { ...options, _key }])
  }

  function remove (key: string) {
    setSnackbars(snacks => snacks?.filter(_item => _item?._key !== key))
  }

  return (
    <SnackBarContext.Provider value={{ show, hide, push, snackbarHeight }} >
        {children}
        {snackbars?.map((item, index) => (
            <SnackBar key={`${item?._key}-${index}`} {...item} 
                dark={dark} 
                bottom={height => 
                    (snackbarHeight/2) + (visible ? 20 : 0) // adicionando margin no principal
                    + ( ( (height / 2) + 20 ) * index ) // adicionando o tamanho + margin
                    + (typeof item?.bottom === 'number' ? item?.bottom : 0)//offset
                    + (typeof options?.bottom === 'number' ? options?.bottom : 0 )
                }
                onClose={() => {
                    item?.onClose && item?.onClose()
                    remove(item?._key)
                }}
            />
        ))}
        <SnackBar ref={SnackbarRef}
        onLayout={e => setSnackbarHeight(e?.nativeEvent?.layout?.height)}
            {...options}
            dark={dark}
        />
    </SnackBarContext.Provider>
  )
}


export default SnackBarContext
