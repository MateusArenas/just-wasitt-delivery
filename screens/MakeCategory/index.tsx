import { HeaderTitle, StackHeaderTitleProps, StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { FlatList, ImageBackground, useWindowDimensions, View, Text, Keyboard, TouchableWithoutFeedback, TouchableOpacity, ScrollView } from 'react-native';
import { RootStackParamList } from '../../types';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import {  } from '@react-navigation/material-top-tabs'
import * as ProductService from '../../services/product';
import { NavigationProp, RouteProp, StackActions, useFocusEffect, useNavigation, useRoute, useTheme } from '@react-navigation/native';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
import CustomTopTabBar, { TabViewRouteProps } from '../../components/CustomTopTabBar';
import TextButton from '../../components/TextButton';
import TextInputCentered from '../../components/TextInputCentered';
import KeyboardSpacer from '../../components/KeyboardSpacer'
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import BottomHalfModalContext from '../../contexts/BottomHalfModal';
import AuthContext from '../../contexts/auth';
import useRootNavigation from '../../hooks/useRootNavigation';
import { CREATE_CATEGORY, EDIT_CATEGORY, MAKE_ADD_CATEGORY, MAKE_EDIT_CATEGORY } from './graphql';
import { NetworkStatus, useMutation, useQuery } from '@apollo/client';
import { PullToRefreshView } from '../../components/PullToRefreshView';
import { BlurView } from 'expo-blur';
import HeaderSubTitle from '../../components/HeaderSubTitle';
import useProductPrice, { useProductValue } from '../../hooks/useProductPrice';
import { MaskService } from 'react-native-masked-text';
import { useDebounce } from '../../hooks/useDebounce';
import BoardCardPicker from '../../components/BoardCardPicker';

function formatedMoney (value: number = 0) : string {
  const moneyOptions = {
    precision: 2,
    separator: ',',
    delimiter: '.',
    unit: 'R$ ',
    suffixUnit: ''
  }
  return  MaskService.toMask('money', (value ? value : 0) as unknown as string, moneyOptions)
}

const NUM_ITEMS_PER_PAGE = 9;

export default function MakeCategory ({
  navigation,
  route
} : StackScreenProps<RootStackParamList, 'MakeCategory'>) {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  const [extraBottom, setExtraBottom] = React.useState(70)
  
  const { user, signed } = useContext(AuthContext)
  const { colors, dark } = useTheme()
  const { store, slug } = route.params
  const layout = useWindowDimensions()
  const [name, setName] = useState<string>('')
  const [products, setProducts] = useState<Array<string>>([])
  const rootNavigation = useRootNavigation()

  const [productName, setProductName] = useState("")

  const search = useDebounce(productName, 250)

  const { called, loading, error, data, refetch, fetchMore, networkStatus } = useQuery(
    slug ? MAKE_EDIT_CATEGORY : MAKE_ADD_CATEGORY, 
    { 
      variables: {
        storeName: store,
        slug,
        search, regex: ["name"],
        offset: 0, 
        limit: NUM_ITEMS_PER_PAGE, 
      },
      notifyOnNetworkStatusChange: true,
    }
  )

  useEffect(() => { refetch() }, [search])

  useEffect(() => {
    if(data?.category) {
      setName(data?.category?.name)
      setProducts(data?.category?.products?.map(item => item?._id))
    }
  }, [data])


  const [newCategory, { loading: loadingForNew }] = useMutation(CREATE_CATEGORY, {});

  const [editCategory, { loading: loadingForEdit }] = useMutation(EDIT_CATEGORY, {});

  const onSubmit = React.useCallback(async () => {
    if (!name && !signed) return null
    Keyboard.dismiss()
    try {
      console.log({ slug, input: { name, products } });
      if(slug) {
        await editCategory({ 
          variables: { id: data?.category?._id, input: { name, products, store: data?.store?._id } },
          refetchQueries: [
            'CurrentCategory', 
            'CurrentProduct', 
            'CurrentStore',
            'MakeAddProduct', 
            'MakeEditProduct',
          ],
          awaitRefetchQueries: true,
        })
      } else {
        await newCategory({ 
          variables: { input: { name, products, store: data?.store?._id } }, 
          refetchQueries: [
            'CurrentCategory', 
            'CurrentProduct', 
            'CurrentStore',
            'MakeAddProduct', 
            'MakeEditProduct',
          ],
          awaitRefetchQueries: true,
        })
      }
      navigation.goBack()
    } catch (err) {}
  }, [signed, data, name, slug, products])
  
  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      title: data?.category?.name ? data?.category?.name : 'Nova Categoria',
      headerTitle: props => 
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <HeaderSubTitle children={store} />
          <HeaderTitle {...props} onPress={() => navigation.navigate('Store', { store })} />
        </View>
      ,
      headerRight: ({ tintColor }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {(!loadingForEdit && !loadingForNew) ? 
          <TextButton style={{ paddingHorizontal: 20 }}
            label={'Concluir'}
            fontSize={16}
            color={colors.text}
            disabled={
              !name
            }
            onPress={onSubmit}
          /> : <Loading style={{ paddingHorizontal: 20 }} size={'tiny'}/>}
        </View>
      ),
    });
  }, [name, onSubmit, data, loadingForEdit, loadingForNew]))

  const loadPagination = React.useCallback(() => {
    if (!loading && (data?.products?.length < data?.totalCount)) { 
      fetchMore({
        variables: { 
          offset: data?.products?.length,
        }
      })
    }
  }, [loading, data, fetchMore])

  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState<Array<TabViewRouteProps>>([
    { key: 'info', icon: 'menu', title: 'Principais', important: true },
    { key: 'items', icon: 'style', title: 'Inclusos' },
  ])


  const renderScene = useCallback(({ route }) => {
    switch (route.key) {
      case 'info':
        return <InfoRoute value={name} onChangeValue={setName} />;
      case 'items':
        return <AddRoute loadPagination={loadPagination} 
          value={productName}
          onChangeValue={setProductName}
          data={data?.products} 
          selecteds={products} 
          setSelecteds={setProducts}
        />
      default:
        return null;
    }
  }, [products, name, data, productName, loadPagination])

  if (networkStatus === NetworkStatus.loading && loading) return <Loading />
  if ((error || (slug && !data?.category)) && networkStatus !== NetworkStatus.loading) return (
    <View style={{ flex: 1 }}>
      <PullToRefreshView
        offset={top}
        disabled={(networkStatus === NetworkStatus.refetch && loading)}
        refreshing={(networkStatus === NetworkStatus.refetch && loading)}
        onRefresh={refetch}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}>
          <NotFound 
            title={error?.message} 
            redirectText={`Go to home screen!`}
          />
        </ScrollView>
      </PullToRefreshView>
    </View>
  )

  return (
    <View style={{ flex: 1}}>
      {(loadingForEdit || loadingForNew) && 
      <BlurView intensity={25} tint={dark ? 'dark' : 'light'}
        style={{ position: 'absolute', zIndex: 2, height: '100%', width: '100%'}}
      />}
      <TabView swipeEnabled={false} style={{ paddingTop: top }} tabBarPosition={"bottom"}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={props => 
          <CustomTopTabBar {...props}
            style={{ backgroundColor: colors.border }}
            onLayout={e => setExtraBottom(e?.nativeEvent?.layout?.height)} 
          />
        }
      />
      <KeyboardSpacer topSpacing={-(bottom+extraBottom)} />
    </View>
  )
}

interface InfoRouteProps {
  value: string
  onChangeValue: (value: string) => any
}
const InfoRoute: React.FC<InfoRouteProps> = ({ value, onChangeValue }) => {
  const { colors } = useTheme()
  const layout = useWindowDimensions()

  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState<Array<TabViewRouteProps>>([
    { key: 'name', title: 'Nome', icon: 'drive-file-rename-outline', important: true },
  ])


  const renderScene = useCallback(({ route }) => {
    switch (route.key) {
      case 'name':
        return (
          <TextInputCentered style={{ color: colors.text }}
            placeholderTextColor={colors.text}
            selectionColor={colors.primary}
            showSoftInputOnFocus
            placeholder={'Categoria'}
            maxLength={20}
            value={value}
            onChangeText={text => onChangeValue(text)}
          />
        );
      default:
        return null;
    }
  }, [value])


  return (
      <TabView swipeEnabled tabBarPosition="top"
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={props => <CustomTopTabBar {...props} />}
      />
  )
}

interface AddRouteProps {
  data: Array<ProductService.ProductData>
  selecteds: Array<string>
  setSelecteds: React.Dispatch<React.SetStateAction<string[]>>
  loadPagination: () => any
  value?: string
  onChangeValue?: (value: string) => any
}
const AddRoute: React.FC<AddRouteProps> = ({ data, selecteds, setSelecteds, loadPagination, value, onChangeValue }) => {
  const layout = useWindowDimensions()

  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState<Array<TabViewRouteProps>>([
    { key: 'products', title: 'Produtos', icon: "local-offer" },
    // { key: 'services', title: 'Serviços', icon: "work" },
  ])

  const renderScene = useCallback(({ route }) => {
    switch (route.key) {
      case 'products':
        return (
          <BoardCardPicker 
            data={data?.map(item => ({ 
              _id: item?._id, 
              uri: item?.uri || "https://www.leonardusa.com/assets/corals/images/default_product_image.png", 
              title: item?.name, 
              describe: formatedMoney(useProductValue(item)),
            }))} 
            selecteds={selecteds} 
            onChangeSelect={id => setSelecteds(items => [...items, id])}
            onChangeDeselect={id => setSelecteds(selecteds?.filter(item => item !== id))}
            onEndReached={loadPagination}
            search={value}
            onChangeSearch={onChangeValue}
          />);
      default:
        return null;
    }
  }, [value, selecteds, data, loadPagination])


  return (
      <TabView swipeEnabled tabBarPosition="top"
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={props => <CustomTopTabBar {...props} />}
      />
  )
}

