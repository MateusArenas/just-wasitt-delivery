import { 
  getPathFromState, 
} from "@react-navigation/native"
import { getInitialURL } from "expo-linking"
import React from "react"
import { useEffect } from "react"
import LinkingConfiguration from "../navigation/LinkingConfiguration"
import useRootNavigation from "./useRootNavigation"

function useUrl () {
  const [url, setUrl] = React.useState('')

  useEffect(() => {
    (async () => {
      const initial = await getInitialURL()
      setUrl(initial)
    })()
  }, [setUrl])

  const rootNavigation = useRootNavigation()

  if(url)
      return url+getPathFromState(rootNavigation.dangerouslyGetState(), LinkingConfiguration?.config)
}

export default useUrl