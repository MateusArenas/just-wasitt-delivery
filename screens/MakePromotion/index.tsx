import { HeaderTitle, StackHeaderTitleProps, StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Clipboard, Image, FlatList, ImageBackground, useWindowDimensions, View, Text, Keyboard, TouchableWithoutFeedback, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { RootStackParamList } from '../../types';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import {  } from '@react-navigation/material-top-tabs'
import * as PromotionService from '../../services/promotion'
import * as ProductService from '../../services/product';
import useService from '../../hooks/useService';
import { NavigationProp, RouteProp, StackActions, useFocusEffect, useNavigation, useRoute, useTheme } from '@react-navigation/native';
import Loading from '../../components/Loading';
import Refresh from '../../components/Refresh';
import NotFound from '../../components/NotFound';
import CustomTopTabBar, { TabViewRouteProps } from '../../components/CustomTopTabBar';
import TextButton from '../../components/TextButton';
import { MaterialIcons } from '@expo/vector-icons';
import TextInputCentered from '../../components/TextInputCentered';
import KeyboardSpacer from '../../components/KeyboardSpacer'
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import AuthContext from '../../contexts/auth';
import useLoadScreen from '../../hooks/useLoadScreen';
import useRootNavigation from '../../hooks/useRootNavigation';
import { MaskService } from 'react-native-masked-text';
import BoardCardPicker from '../../components/BoardCardPicker';
import { useProductValue } from '../../hooks/useProductPrice';
import HeaderSubTitle from '../../components/HeaderSubTitle';
import { NetworkStatus, useMutation, useQuery } from '@apollo/client';
import { CREATE_PROMOTION, EDIT_PROMOTION, MAKE_ADD_PROMOTION, MAKE_EDIT_PROMOTION } from './graphql';
import { useDebounce } from '../../hooks/useDebounce';
import { PullToRefreshView } from '../../components/PullToRefreshView';
import InputTextArea from '../../components/InputTextArea';
import ImagePicker from '../../components/ImagePicker';

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

export default function MakePromotion ({
  navigation,
  route
} : StackScreenProps<RootStackParamList, 'MakePromotion'>) {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  const [extraBottom, setExtraBottom] = React.useState(70)
  
  const { user, signed } = useContext(AuthContext)
  const { colors } = useTheme()
  const { store, slug } = route.params
  const layout = useWindowDimensions()
  const [name, setName] = useState<string>('')
  const [uri, setUri] = useState<string>('')
  const [percent, setPercent] = useState<number>()
  const [products, setProducts] = useState<Array<string>>([])
  const [about, setAbout] = useState<string>('')
  const rootNavigation = useRootNavigation()

  const [productName, setProductName] = useState("")

  const search = useDebounce(productName, 250)

  const { called, loading, error, data, refetch, fetchMore, networkStatus } = useQuery(
    slug ? MAKE_EDIT_PROMOTION : MAKE_ADD_PROMOTION, 
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

  useEffect(() => {
    if(data?.promotion) {
      setUri(data?.promotion?.uri)
      setName(data?.promotion?.name)
      setPercent(data?.promotion?.percent)
      setAbout(data?.promotion?.about)
      setProducts(data?.promotion?.products?.map(item => item?._id))
    }
  }, [data, setUri, setName, setProducts, setPercent, setAbout])

  const [newPromotion, { loading: loadingForNew }] = useMutation(CREATE_PROMOTION, {});

  const [editPromotion, { loading: loadingForEdit }] = useMutation(EDIT_PROMOTION, {});

  const onSubmit = React.useCallback(async () => {
    if (!name && !signed) return null
    Keyboard.dismiss()
    try {
      console.log({ input: { name, percent, about, uri, products, store: data?.store?._id } });
      if(slug) {
        await editPromotion({ 
          variables: { id: data?.promotion?._id, input: { name, percent, about, uri, products, store: data?.store?._id } },
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
        await newPromotion({ 
          variables: { input: { name, percent, about, uri, products, store: data?.store?._id } }, 
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
    } catch (err) {
      console.log({ err, input: { name, percent, about, uri, products } });
      
    }
  }, [data, signed, name, slug, percent, about, uri, products])
  
  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      title: data?.name ? data?.name : 'Nova Promoção',
      headerTitle: props => (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <HeaderSubTitle children={store} />
          <HeaderTitle {...props} onPress={() => navigation.navigate('Store', { store })} />
        </View>
      ),
      headerRight: ({ tintColor }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {(!loadingForEdit && !loadingForNew) ? 
          <TextButton style={{ paddingHorizontal: 20 }}
            label={'Concluir'}
            fontSize={16}
            color={colors.text}
            disabled={
              !name || !percent
            }
            onPress={onSubmit}
          /> : <Loading style={{ paddingHorizontal: 20 }} size={'tiny'}/>}
        </View>
      ),
    });
  }, [name, onSubmit, data, loadingForEdit, loadingForNew]))

  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState<Array<TabViewRouteProps>>([
    { key: 'info', icon: 'menu', title: 'Principais', important: true },//local-mall
    { key: 'value', icon: 'settings', title: 'Definições', important: true  },
    { key: 'items', icon: 'style', title: 'Inclusos' },//local-mall
  ])


  const isFocused = React.useCallback((key: string) => {
    return index === routes?.findIndex(item => item?.key === key)
  }, [index, routes])

  const renderScene = useCallback(({ route }) => {
    const focused = isFocused(route.key)
    switch (route.key) {
      case 'info':
        return (
          <InfoRoute values={{ name, uri, about }} onChangeValues={({ name, uri, about }) => {
            setName(name);
            setUri(uri);
            setAbout(about);
          }} />
        );
      case 'value':
        return (
          <ValueRoute values={{ percent }}
            onChangeValues={({ percent }) => setPercent(percent)}
          />
        );
      case 'items':
        return <ProductsRoute data={data?.products} products={products} setProducts={setProducts}/>;
      default:
        return null;
    }
  }, [data, products, name, percent, uri, about])

  if (networkStatus === NetworkStatus.loading && loading) return <Loading />
  if ((error || (slug && !data?.promotion)) && networkStatus !== NetworkStatus.loading) return (
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
    <View style={{ flex: 1 }}>
      {/* {(loadingForEdit || loadingForNew) && 
      <BlurView intensity={25} tint={dark ? 'dark' : 'light'}
        style={{ position: 'absolute', zIndex: 2, height: '100%', width: '100%'}}
      />} */}
      <TabView swipeEnabled={false} style={{ paddingTop: top }} tabBarPosition={"bottom"}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={props => <CustomTopTabBar {...props}
          style={{ backgroundColor: colors.border }}
          onLayout={e => setExtraBottom(e?.nativeEvent?.layout?.height)} 
        />}
      />
      <KeyboardSpacer topSpacing={-(bottom+extraBottom)} />
    </View>
  )
}


interface ProductsRouteProps {
  data: Array<ProductService.ProductData>
  products: Array<string>
  setProducts: React.Dispatch<React.SetStateAction<string[]>>
}
const ProductsRoute: React.FC<ProductsRouteProps> = ({ data, products, setProducts }) => {
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
            selecteds={products} 
            onChangeSelect={id => setProducts(items => [...items, id])}
            onChangeDeselect={id => setProducts(products?.filter(item => item !== id))}
            // onEndReached={loadPagination}
            // search={value}
            // onChangeSearch={onChangeValue}
          />);
      default:
        return null;
    }
  }, [products, setProducts, data])

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

interface ValueRouteProps {
  values: { percent: number }
  onChangeValues: (values: { percent: number }) => any
}
const ValueRoute: React.FC<ValueRouteProps> = ({ 
  values:{ percent=0 }, 
  onChangeValues 
}) => {
  const { colors } = useTheme()
  const layout = useWindowDimensions()

  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState<Array<TabViewRouteProps>>([
    { key: 'percent', title: 'Desconto', icon: 'money-off', important: true  },
    // { key: 'services', title: 'Serviços', icon: "work" },
  ])

  React.useEffect(() => {
    console.log({ percent });
  }, [percent])

  const renderScene = useCallback(({ route }) => {
    switch (route.key) {
      case 'percent':
        return (
          <TextInputCentered style={{ color: colors.text }}
            type={'only-numbers'} 
            checkText={(previus, next) => {
              const rawValue = MaskService.toRawValue('only-numbers', next)
              const enabled = Number(rawValue) <= 100
              if (!enabled) onChangeValues({ percent: 100 })
              return enabled
            }}
            placeholder={'Desconto'}
            placeholderTextColor={colors.text}
            maxLength={3}
            showToMaxLength={false}
            includeRawValueInChangeText
            value={percent === 0 ? '' : `${percent}`}
            onChangeText={(text, raw) => onChangeValues({ percent: Number(raw) })}
            right={
              <Text style={{ 
                fontSize: 16*2, color: colors.text, marginLeft: -6,
                fontWeight: '500', textTransform: 'capitalize'
              }}>{'%'}</Text>
            }
          />
        );
      default:
        return null;
    }
  }, [percent])

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


const InfoRoute: React.FC<any> = ({ values: { name, uri, about }, onChangeValues }) => {
  const { colors } = useTheme()
  const layout = useWindowDimensions()

  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState<Array<TabViewRouteProps>>([
    { key: 'name', icon: 'drive-file-rename-outline', title: 'Nome', important: true },
    { key: 'image', icon: 'wallpaper', title: 'Imagem' },
    { key: 'about', icon: 'short-text', title: 'Sobre' },//monry-off receipt
  ])

  const renderScene = useCallback(({ route }) => {
    switch (route.key) {
      case 'name':
        return (
          <TextInputCentered style={{ color: colors.text }}
            placeholderTextColor={colors.text}
            placeholder={'Promoção'}
            maxLength={20}
            value={name}
            onChangeText={name => onChangeValues({ name, uri, about })}
          />
        )
      case 'image':
        return <ImagePicker value={uri} onChangeValue={uri => onChangeValues({ name, uri, about })} />
      case 'about':
        return (
          <InputTextArea containerStyle={{ flex: 1, alignItems: 'flex-start',  padding: 20, justifyContent: 'center' }}
            infoStyle={{ position: 'absolute', bottom: 0, right: 0, padding: 10 }}
            style={{ 
              width: '100%', height: '100%',
              padding: 10,
              color: colors.text,
              fontSize: 18, fontWeight: '500',
              maxHeight: null, minHeight: null
            }}
            placeholderTextColor={colors.text}
            placeholder={"Escreva algo sobre a promoção..."}
            maxLength={66}
            value={about}  
            onChangeText={about => onChangeValues({ name, uri, about })}
          />
        )
      default:
        return null;
    }
  }, [name, about, uri])

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


