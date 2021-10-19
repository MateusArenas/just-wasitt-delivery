import { MaterialIcons } from '@expo/vector-icons';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { StackActions, useFocusEffect, useTheme } from '@react-navigation/native';
import { HeaderTitle, StackNavigationOptions, StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useContext } from 'react';
import { Text, TouchableOpacity, Image, useWindowDimensions, View, FlatList, TouchableWithoutFeedback } from 'react-native';
import { useCollapsibleHeader, UseCollapsibleOptions } from 'react-navigation-collapsible';
import IconButton from '../../components/IconButton';
import { PullToRefreshView } from '../../components/PullToRefreshView';
import Colors from '../../constants/Colors';
import useColorScheme from '../../hooks/useColorScheme';
import useRootNavigation from '../../hooks/useRootNavigation';
import { RootStackParamList, TabExploreParamList } from '../../types';
import { BlurView } from 'expo-blur'
import api from '../../services/api';
import { AxiosResponse, AxiosError } from 'axios';
import useService from '../../hooks/useService';
import { CategoryData } from '../../services/category';
import { useDebounce } from '../../hooks/useDebounce';
import Loading from '../../components/Loading';
import { Pagination, SwiperFlatList } from 'react-native-swiper-flatlist';
// import { Container } from './styles';

export default function Explore ({ 
  navigation,
} : StackScreenProps<TabExploreParamList, 'Main'>) {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  const rootNavigation = useRootNavigation()
  const { width } = useWindowDimensions()
  
  const [loading, setLoading] = React.useState(false)
  const [refreshing, setRefreshing] = React.useState(false)
  const [network, setNetwork] = React.useState(true)
  const [notFound, setNotFound] = React.useState(false)
  const [categories, setCategories] = React.useState<Array<CategoryData>>([])
  const [page, setPage] = React.useState(1)
  const [total, setTotal] = React.useState(0)

  const loadPage = React.useCallback(async (pageNumber = page, shouldRefresh=false) => {
    if (total && pageNumber > total) return;
    setLoading(true)
    try {
      setNetwork(true)
      const params = { skip: (pageNumber-1)*5, limit: 5 }
      const response = await api.get(`/city/${'undefined'}/top/categories`, { params })
  
      const totalCount = Number(response.headers['x-total-count'])
  
      setTotal(Math.ceil(totalCount / 5))
      
      setCategories(state => 
        shouldRefresh ? response?.data
        : [...state, ...response?.data]
      )
      setNotFound(response?.data?.length > 0 ? false : true)
  
      setPage(pageNumber + 1)
    } catch ({ response }) {
      if (response?.status === 404) {
        setNotFound(true)
        setCategories([])
      }
      if (!response) setNetwork(false)
    } finally {
      setLoading(false)
    }
  }, [page, total, setPage, setCategories, setTotal, setNetwork, setNotFound, setLoading])

  async function onRefresh () {
    setRefreshing(true)

    await loadPage(1, true)

    setRefreshing(false)
  }
  
  React.useEffect(() => {
    loadPage(1, true)
  }, [])

  const { colors, dark } = useTheme();

    const options: UseCollapsibleOptions = {
    navigationOptions: {
      headerTitleAlign: 'left',
      headerTitleStyle: {  margin: 0 },
      headerTitle: props => (
        <TouchableWithoutFeedback onPress={() => navigation.navigate('Search')}>
          <View style={{ 
            backgroundColor: colors.border, borderRadius: 10, 
            alignItems: 'center', flexDirection: 'row', 
          }}>
            <MaterialIcons style={{ padding: 5, opacity: .8 }} name="search" size={24} color={colors.text} />
            <HeaderTitle {...props} style={[props.style, { opacity: .8 }]} />
          </View>
        </TouchableWithoutFeedback>
      ),
      headerRight: () => null,
      headerLeft: () => null,
    } as Partial<StackNavigationOptions>,
    config: {
      collapsedColor: colors.card /* Optional */,
      useNativeDriver: false /* Optional, default: true */,
      // elevation: 4 /* Optional */,
      // disableOpacity: true /* Optional, default: false */,
      // createHeaderBackground: ({ headerBackground }) => (
      //   // <BlurView style={[{ flex: 1 }]} intensity={100} tint={dark ? 'dark' : 'light'} />
      // ),
    },
  };
  const {
    onScroll /* Event handler */,
    onScrollWithListener /* Event handler creator */,
    containerPaddingTop /* number */,
    scrollIndicatorInsetTop /* number */,
    /* Animated.AnimatedValue contentOffset from scrolling */
    positionY /* 0.0 ~ length of scrollable component (contentOffset)
    /* Animated.AnimatedInterpolation by scrolling */,
    translateY /* 0.0 ~ -headerHeight */,
    progress /* 0.0 ~ 1.0 */,
    opacity /* 1.0 ~ 0.0 */,
  } = useCollapsibleHeader(options);

  return (
    <PullToRefreshView
      offset={containerPaddingTop}
      disabled={refreshing}
      refreshing={refreshing}
      onRefresh={onRefresh}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <FlatList style={{ flex: 1, padding: 2 }}
        ListEmptyComponent={
          loading ? <Loading /> :
          notFound && <View style={{ 
            flex: 1, alignItems: 'center', justifyContent: 'center'
          }}>
            <Text style={{ 
              textAlign: 'center', textAlignVertical: 'center',
              fontSize: 18, 
              color: colors.text, opacity: .5,
            }}>{'Nenhum resultado'}</Text>
          </View>
        }
        ListFooterComponentStyle={{ padding: 20 }}
        ListFooterComponent={(loading && categories?.length > 0) && <Loading />}
        onEndReached={() => loadPage()}
        onEndReachedThreshold={0.1}
        onScroll={onScroll}
        contentContainerStyle={{ flexGrow: 1, paddingTop: containerPaddingTop, paddingBottom: bottom }}
        scrollIndicatorInsets={{ top: scrollIndicatorInsetTop, bottom }}
        numColumns={2}
        data={categories}
        keyExtractor={(item, index) => `${item?._id}-${index}`}
        renderItem={({ item: category } : { item: CategoryData }) => (
          <TouchableWithoutFeedback onPress={() => navigation.navigate('Categories', { category: category?.name })}>
            <View style={{ padding: 4, width: (width/2) }}>
                <BlurView intensity={100/1.25} tint="dark"
                  style={{ 
                    zIndex: 9,
                    position: 'absolute', right: 10, bottom: 10,
                    padding: 5, borderRadius: 10, overflow: 'hidden' 
                  }} 
                >
                  <Text style={{ 
                    color: 'white', 
                    fontWeight: '500', 
                    fontSize: 16, 
                  }}>{`#${category?.name}`}</Text>
                </BlurView>
                <SwiperFlatList horizontal
                  style={{ borderRadius: 4 , overflow: 'hidden' }}
                  contentContainerStyle={{ flexGrow: 1 }}
                  index={0}
                  autoplay 
                  autoplayLoop
                  autoplayDelay={1}
                  pagingEnabled={false}
                  showPagination={false}
                  data={category?.products}
                  renderItem={({ item }) => 
                    <Image source={item?.uri ? { uri: item?.uri } : require('../../assets/images/default-product.jpg')}
                      style={{ width: (width/2), height: 140 }}
                    />
                  }
                />
              {/* <ImageBackground
                source={require('../../assets/images/default-product.jpg')}
                style={{ width: (width/2) - 10, height: 140 }}
              >
                <View style={{ 
                  flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end', 
                  backgroundColor: 'rgba(0,0,0,.2)',
                  padding: 10
                }}>
                  <BlurView intensity={100/1.25} tint="dark"
                    style={{ padding: 5, borderRadius: 10, overflow: 'hidden' }} 
                  >
                    <Text style={{ 
                      color: 'white', 
                      fontWeight: '500', 
                      fontSize: 16, 
                    }}>{'#'+item?.name}</Text>
                  </BlurView>
                </View>
              </ImageBackground> */}
            </View>
          </TouchableWithoutFeedback>
        )}
      />
    </PullToRefreshView>
  )
}
