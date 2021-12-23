import { useEffect, useState } from "react"
import { Image, ImageSourcePropType, Platform } from 'react-native'

if (Platform.OS === "web" ) {
    Image.resolveAssetSource =  source => ({ uri: source.toString() }) as any
}

interface useUriProps {
  defaultSource?: ImageSourcePropType
  defaultUri?: string
  uri: string
}
function useUri ({ defaultSource, defaultUri , uri }: useUriProps) {
  const [currentUri, setCurrentUri] = useState(defaultUri || Image.resolveAssetSource(defaultSource)?.uri)

  useEffect(() => {
    if (!uri) return
    (async () => {
      try {
        const response = await fetch(uri)
        if (response.status !== 404) setCurrentUri(uri)
      } catch {
      }
    })()
  }, [setCurrentUri])

  return currentUri
}

export default useUri