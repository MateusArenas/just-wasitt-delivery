import { MaterialIcons } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute, NavigationProp, RouteProp, StackActions, useFocusEffect, useNavigation, useRoute, useTheme } from '@react-navigation/native';
import { HeaderTitle, StackHeaderTitleProps, StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useCallback, useContext } from 'react';
import { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { TabView } from 'react-native-tab-view';
import CardLink from '../../components/CardLink';
import CustomTopTabBar, { TabViewRouteProps } from '../../components/CustomTopTabBar';
import IconButton from '../../components/IconButton';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
import Refresh from '../../components/Refresh';
import TextButton from '../../components/TextButton';
import { RootStackParamList, TabExploreParamList } from '../../types';
import * as SearchService from '../../services/search';
import { ProductData } from '../../services/product';
import { useDebounce, useDebounceHandler } from '../../hooks/useDebounce';
import useLoadScreen from '../../hooks/useLoadScreen';
import { useState } from 'react';
import { AxiosResponse } from 'axios';
import api from '../../services/api';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import KeyboardSpacer from '../../components/KeyboardSpacer';
import SearchBar from '../../components/SearchBar';
import { PullToRefreshView } from '../../components/PullToRefreshView';

// import { Container } from './styles';

export default function Search ({ 
  navigation,
  route
} : StackScreenProps<TabExploreParamList, 'Search'>) {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  const { colors } = useTheme()
  const layout = useWindowDimensions()
  const topSpacing = React.useContext(BottomTabBarHeightContext) || 0
  const [name, setName] = React.useState('')

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      headerStyle: { elevation: 0, shadowColor: 'transparent', borderBottomWidth: null },
      headerTitleAlign: 'left',
      headerTitleContainerStyle: { marginRight: 30 },
      headerTitleStyle: {  margin: 0 },
      headerLeft: props => null,
      headerRightContainerStyle: { paddingHorizontal: 10 },
      headerRight: ({ tintColor }) => 
        <TextButton 
          label={'Cancelar'} 
          fontSize={16} 
          color={colors.primary} 
          onPress={() => navigation.navigate('Main')} 
        />
      ,
    });
  }, [navigation, name, setName]))

  useEffect(() => {
    navigation.setOptions({
      headerTitle: props => (
        <SearchBar autoFocus
          defaultValue={name}
          onChangeText={setName}
          onLayout={props.onLayout}
          allowFontScaling={props.allowFontScaling}
          style={props.style as any}
          placeholder={props.children}
        />
      ),
    });
  } ,[navigation, name, setName])

  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState<Array<TabViewRouteProps>>([
    { key: 'all', icon: 'menu' },
    { key: 'stores', icon: 'store' },
    { key: 'products', icon: 'local-offer' },
    { key: 'categories', icon: 'tag' },
    { key: 'promotions', icon: 'anchor' },
  ])

  const isFocused = React.useCallback((key: string) => {
    return index === routes?.findIndex(item => item?.key === key)
  }, [index, routes])

  const renderScene = React.useCallback(({ route }) => {
    switch (route.key) {
      case 'all':
        return <ProductsRoute focused={isFocused('all')} name={name} url={'/all'} type={'all'} />
      case 'products':
        return <ProductsRoute focused={isFocused('products')} name={name} url={'/products'} type={'product'} />
      case 'categories':
        return <ProductsRoute focused={isFocused('categories')} name={name} url={'/categories'} type={'category'} />
      case 'promotions':
        return <ProductsRoute focused={isFocused('promotions')} name={name} url={'/promotions'} type={'promotion'} />
      case 'stores':
        return <ProductsRoute focused={isFocused('stores')} name={name} url={'/stores'} type={'store'} />
      default:
        return null;
    }
  }, [name, isFocused])

  return (
    <View style={{ flex: 1, paddingTop: top, paddingBottom: bottom }}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={props => <CustomTopTabBar {...props}/>}
      />
      <KeyboardSpacer topSpacing={-topSpacing} />
    </View>
  )
}

interface ProductsRouteProps {
  name: string
  url: string
  type: 'product' | 'category' | 'promotion' | 'store' | 'all'
  focused: boolean
}

const ProductsRoute: React.FC<ProductsRouteProps> = ({
  name, url, type, focused
}) => {
  const navigation = useNavigation<NavigationProp<TabExploreParamList, 'Search'>>()
  const route = useRoute<RouteProp<TabExploreParamList, 'Search'>>()
  const { colors } = useTheme()

  const search = useDebounce(name, 250)

  const [loading, setLoading] = React.useState(false)
  const [refreshing, setRefreshing] = React.useState(false)
  const [network, setNetwork] = React.useState(true)
  const [notFound, setNotFound] = React.useState(false)
  const [items, setItems] = React.useState<Array<any>>([])
  const [page, setPage] = React.useState(1)
  const [total, setTotal] = React.useState(0)

  const loadPage = React.useCallback(async (pageNumber = page, shouldRefresh=false) => {
    if (total && pageNumber > total) return;
    setLoading(true)
    try {
      setNetwork(true)
      const params = { name: search, skip: (pageNumber-1)*5, limit: 5 }
      const response = await api.get(url, { params })
  
      const totalCount = Number(response.headers['x-total-count'])
  
      setTotal(Math.ceil(totalCount / 5))
      
      setItems(state => 
        shouldRefresh ? response?.data
        : [...state, ...response?.data]
      )
      setNotFound(response?.data?.length > 0 ? false : true)
  
      setPage(pageNumber + 1)
    } catch ({ response }) {
      if (response?.status === 404) {
        setNotFound(true)
        setItems([])
      }
      if (!response) setNetwork(false)
    } finally {
      setLoading(false)
    }
  }, [page, total, search, setPage, setItems, setTotal, setNetwork, setNotFound, setLoading])

  async function onRefresh () {
    setRefreshing(true)

    await loadPage(1, true)

    setRefreshing(false)
  }
  
  React.useEffect(() => {
    if (focused) {
      loadPage(1, true)
    }
  }, [search, focused])


  if (!network) return <Refresh onPress={() => navigation.dispatch(StackActions.replace('Search', route.params))}/>
  
  return (
    <View style={{ flex: 1 }}>
      <PullToRefreshView
        // offset={top}
        disabled={refreshing}
        refreshing={refreshing}
        onRefresh={onRefresh}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <FlatList 
          contentContainerStyle={{ flexGrow: 1 }}
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
          ListFooterComponent={(loading && items?.length > 0) && <Loading />}
          onEndReached={() => loadPage()}
          onEndReachedThreshold={0.1}
          data={items}
          keyExtractor={(item, index) => `${item?._id}-${index}`}
          renderItem={({ item }) => (
            <CardLink border={false}
              title={item?.name}
              subTitle={item?.about}
              color={colors.text}
              onPress={() => {
                switch (type !== 'all' ? type : item?.type) {
                  case 'product':
                    return navigation.navigate('Product', { id: item?._id, store: item?.store?.name })
                  case 'category':
                    return navigation.navigate('Category', { id: item?._id, store: item?.store?.name })
                  case 'promotion':
                    return navigation.navigate('Promotion', { id: item?._id, store: item?.store?.name })
                  case 'store':
                    return navigation.navigate('Store', { store: item?.name })
                  default:
                    return null
                }
              }}
              left={
                <ImageBackground source={{ uri: item?.uri }}
                  style={{ 
                    margin: 10,
                    width: 60, height: 60, 
                    borderRadius: 60, backgroundColor: colors.background,
                    borderWidth: 1, borderColor: colors.border,
                    alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {!item?.uri && 
                    <MaterialIcons 
                      name={(() => {
                        switch (type !== 'all' ? type : item?.type) {
                          case 'product':
                            return 'local-offer'
                          case 'category':
                            return 'tag' 
                          case 'promotion':
                            return 'anchor' 
                          case 'store':
                            return 'store'
                          default:
                            return 'account-circle'
                        }
                      })()} 
                      size={24} color={colors.text} 
                    />
                  }
                </ImageBackground>
              }
            />
          )}
        />
      </PullToRefreshView>
    </View>
  )
}



