import { getPathFromState } from "@react-navigation/native"
import { StackScreenProps } from "@react-navigation/stack"
import React from "react"
import { Share } from "react-native"
import Options from "../../components/Options"
import useRootNavigation from "../../hooks/useRootNavigation"
import LinkingConfiguration from "../../navigation/LinkingConfiguration"
import { RootStackParamList } from "../../types"

const StoreOptions = ({ 
  navigation,
  route
} : StackScreenProps<RootStackParamList, 'StoreOptions'>) => {

  // const [current, ...paths] = getPathFromState(
  //   useRootNavigation().dangerouslyGetState(), 
  //   LinkingConfiguration.config
  // ).split('/').reverse()

  // const url = paths.reverse().join('/')

  return (
  <Options
    data={[
      { label: 'Compartilhar', action: () => Share.share({ title: 'oi', url: '/', message: 'oi' }) },
    ]}
  />
  )
}

export default StoreOptions