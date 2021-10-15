import { useTheme } from "@react-navigation/native"
import React from "react"
import { View, TouchableWithoutFeedback, Image, Text } from "react-native"
import useRootNavigation from "../../../hooks/useRootNavigation"
import { StoreDate } from "../../../services/store"
import IconButton from "../../IconButton"

const ProductHeader: React.FC<{
  store: StoreDate,
}> = ({
  store
}) => { 
  const rootNavigation = useRootNavigation()
  const { colors } = useTheme()

  return (
    <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: 10,
        backgroundColor: colors.card,
      }}>
      <View style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>

        <Image style={{ marginRight: 10, height: 40, width: 40, borderRadius: 40, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background }} source={{ uri: store?.uri }}/>

        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>

            <TouchableWithoutFeedback onPress={() => rootNavigation.navigate('Store', { store: store?.name })}>
              <Text style={{ textTransform: 'capitalize', fontWeight: 'bold'}}>{store?.name}</Text>
            </TouchableWithoutFeedback>
            
            <Text style={{ textTransform: 'capitalize', fontWeight: '500' }}>{' • '}</Text>
            <TouchableWithoutFeedback onPress={() => {}}>
              <Text style={{ color: colors.primary, textTransform: 'capitalize', fontWeight: 'bold' }}>{'seguir'}</Text>
            </TouchableWithoutFeedback>
          </View>
          <TouchableWithoutFeedback onPress={() => { console.log('ir para cidade') }}>
            <Text style={{ textTransform: 'capitalize', opacity: .5, color: colors.text, fontWeight: 'bold', fontSize: 12 }}>{'mauá - SP'}</Text>
          </TouchableWithoutFeedback>
        </View>
      </View>
      <IconButton 
        name="more-horiz"
        size={24}
        color={colors.text}
        onPress={() => {}}
      />
    </View>
  )
}

export default ProductHeader