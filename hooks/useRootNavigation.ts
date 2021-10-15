import { 
  NavigationContext,
  NavigationContainerProps,
  NavigationProp,
} from "@react-navigation/native"
import { StackScreenProps } from "@react-navigation/stack"
import { useContext } from "react"
import { RootStackParamList } from "../types"

function useRootNavigation () : NavigationProp<RootStackParamList> {
  const navigation = useContext(NavigationContext)
  
  function getRootNavigation (currentNavigation: any) : any {
    const currentNavigationParent = currentNavigation.dangerouslyGetParent()

    if (currentNavigationParent) return getRootNavigation(currentNavigationParent)
    else return currentNavigation
  }

  return getRootNavigation(navigation)
}



export default useRootNavigation