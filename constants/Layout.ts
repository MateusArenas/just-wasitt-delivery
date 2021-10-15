import { Dimensions } from 'react-native';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

export default {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  isDevice: width < 767,
  isTablet: width > 767 && width < 991,
  isDesktop: width > 992,
};
