import { useWindowDimensions } from "react-native"

export default function useMediaQuery () {
  const { width } = useWindowDimensions()
  return {
    isSmallDevice: width < 375,
    isDevice: width < 767,
    isTablet: width > 767 && width < 991,
    isDesktop: width > 992,
  }
}