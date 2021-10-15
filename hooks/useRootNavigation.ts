import { NavigationContext, NavigationProp, CommonActions } from "@react-navigation/native"
import { useContext } from "react"
import { RootStackParamList } from "../types"

interface useRootNavigationType extends NavigationProp<RootStackParamList> {
  refresh: (name: keyof RootStackParamList, params?: RootStackParamList[keyof RootStackParamList] ) => any
}

function useRootNavigation () : useRootNavigationType {
  const navigation = useContext(NavigationContext)

  function getRootNavigation (currentNavigation: NavigationProp<any>) : any {
    const currentNavigationParent = currentNavigation.dangerouslyGetParent()
    
    if (currentNavigationParent) return getRootNavigation(currentNavigationParent)
    else return currentNavigation
  }

  const rootNavigation = getRootNavigation(navigation)

  return ({
    ...rootNavigation,
    refresh: (name, params) => refresh(rootNavigation, name, params)
  })
}

function refresh ( navigation: NavigationProp<RootStackParamList>, name: string, params?: any ) {
  navigation.dispatch(state => {
    let index = 0 
    const routes = state.routes.map((item, i) => {
      if (item?.name === name) {
          index = i
          return ({ ...item, key: null, params })
        } 
        return item
      } 
    ) as any
    return ({
      ...CommonActions.reset({ index, routes })
    })
  });
}


export default useRootNavigation