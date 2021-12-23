import React, { useCallback, useContext, useEffect } from 'react';
import { Clipboard, Image, TextInput, View, Text, TouchableWithoutFeedback, useWindowDimensions, TextInputProps, Keyboard, TouchableOpacity, ImageBackground, FlatList, ScrollView } from 'react-native';
import { CommonActions, NavigationProp, RouteProp, StackActions, useFocusEffect, useNavigation, useRoute, useTheme } from '@react-navigation/native';
import { HeaderTitle, StackHeaderTitleProps, StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import * as ProductService from '../../services/product';
import * as CategoryService from '../../services/category';
import * as PromotionService from '../../services/promotion';
import useService from '../../hooks/useService';
import { SceneRendererProps, TabView } from 'react-native-tab-view';
import { MaterialIcons } from '@expo/vector-icons';
import Loading from '../../components/Loading';
import Refresh from '../../components/Refresh';
import NotFound from '../../components/NotFound';
import TextInputCentered from '../../components/TextInputCentered';
import CustomTopTabBar, { TabViewRouteProps } from '../../components/CustomTopTabBar';
import CategoryPiker from '../../components/CategoryPiker';
import AuthContext from '../../contexts/auth';
import useLoadScreen from '../../hooks/useLoadScreen';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import KeyboardSpacer from '../../components/KeyboardSpacer';
import TextButton from '../../components/TextButton';
import useRootNavigation from '../../hooks/useRootNavigation';
import { MaskService } from 'react-native-masked-text';
import { BlurView } from 'expo-blur';
import ContainerButton from '../../components/ContainerButton';
import BoardCardPicker from '../../components/BoardCardPicker';
import { useProductValue } from '../../hooks/useProductPrice';
import { CREATE_PRODUCT, EDIT_PRODUCT, MAKE_ADD_PRODUCT, MAKE_EDIT_PRODUCT } from './graphql';
import { NetworkStatus, useMutation, useQuery } from '@apollo/client';
import { PullToRefreshView } from '../../components/PullToRefreshView';
import HeaderSubTitle from '../../components/HeaderSubTitle';
import InputTextArea from '../../components/InputTextArea';
import ImagePicker from '../../components/ImagePicker';
import RadioButton from '../../components/RadioButton';

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

export default function MakeProduct ({
  navigation,
  route,
} : StackScreenProps<RootStackParamList, 'MakeProduct'>) {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  const [extraBottom, setExtraBottom] = React.useState(70)
  
  const { signed } = React.useContext(AuthContext)
  const { colors, dark } = useTheme()
  const layout = useWindowDimensions()
  const { store, slug } = route.params
  const rootNavigation = useRootNavigation()

  const { called, loading, error, data, refetch, fetchMore, networkStatus } = useQuery(
    slug ? MAKE_EDIT_PRODUCT : MAKE_ADD_PRODUCT, 
    { 
      variables: {
        storeName: store,
        slug,
        search: "", regex: ["name"],
        offset: 0, 
        limit: NUM_ITEMS_PER_PAGE, 
      },
      notifyOnNetworkStatusChange: true,
    }
  )

  const [state, setState] = React.useState<any>({ 
    price: 0,
    categories: [],
    products: [],
    promotions: [],
    single: true,
  } as ProductService.ProductData)

  useEffect(() => {
    if (slug) {
      setState({ 
        uri: data?.product?.uri,
        name: data?.product?.name,
        about: data?.product?.about,
        price: data?.product?.price,
        single: data?.product?.single,
        offset: data?.product?.offset,
        spinOff: data?.product?.spinOff,
        products: data?.product?.products?.map(item => item?._id),
        categories: data?.product?.categories?.map(item => item?._id),
        promotions: data?.product?.promotions?.map(item => item?._id) 
      })
    }
  }, [data])

  React.useEffect(() => {
    console.log(data?.promotions);
  }, [data?.promotions])

  const [newPromotion, { loading: loadingForNew }] = useMutation(CREATE_PRODUCT, {});

  const [editPromotion, { loading: loadingForEdit }] = useMutation(EDIT_PRODUCT, {});

  const onSubmit = React.useCallback(async () => {
    if (!signed) return null
    Keyboard.dismiss()
    try {
      console.log({ slug, input: { ...state, store: data?.store?._id } });
      if(slug) {
        await editPromotion({ 
          variables: { id: data?.product?._id, input: { ...state, store: data?.store?._id } },
          refetchQueries: [
            'CurrentCategory', 
            'CurrentProduct', 
            'CurrentStore',
            'MakeAddProduct', 
            'MakeEditProduct',
            'MakeAddPromotion', 
            'MakeEditPromotion',
            'MakeAddCategory', 
            'MakeEditCategory',
          ],
          awaitRefetchQueries: true,
        })
      } else {
        await newPromotion({ 
          variables: { input: { ...state, store: data?.store?._id } }, 
          refetchQueries: [
            'CurrentCategory', 
            'CurrentProduct', 
            'CurrentStore',
            'MakeAddProduct', 
            'MakeEditProduct',
            'MakeAddPromotion', 
            'MakeEditPromotion',
            'MakeAddCategory', 
            'MakeEditCategory',
          ],
          awaitRefetchQueries: true,
        })
      }
      navigation.goBack()
    } catch (err) {
      console.log({ err, input: { ...state, store: data?.store?._id } });
    }
  }, [data, signed, slug, state])
  
  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      title: slug ? 'Editar Produto' : 'Novo Produto',
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
            disabled={!state?.name || !state?.price}
            onPress={onSubmit} 
          /> : <Loading style={{ paddingHorizontal: 20 }} size={'tiny'}/>}
        </View>
      ),
    });
  }, [state, loadingForEdit, loadingForNew]))

  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState<Array<TabViewRouteProps>>([
    { key: 'info', title: 'Principais', icon: 'menu', important: true  }, //loyalty // receipt = pedido
    { key: 'value', title: 'Definições', icon: 'settings', important: true  },
    { key: 'items', title: 'Inclusos', icon: 'style' },
  ])


  const renderScene = React.useCallback(({ route,  }: SceneRendererProps & {
    route: TabViewRouteProps;
  }) => {
    switch (route.key) {
      case 'info':
        return (
          <InfoStackRoute 
            values={{ name: state?.name, uri: state?.uri, about: state?.about }}
            onChangeValues={values => setState(state => ({ ...state, ...values }))}
          />
        );
      case 'value':
        return <ValueStackRoute 
          values={{ price: state?.price, offset: state?.offset, single: state?.single, spinOff: state?.spinOff }}
          onChangeValues={values => setState(state => ({ ...state, ...values }))}
        />
      case 'items':
        return <ProductsRoute
        data={{ products: data?.products, categories: data?.categories, promotions: data?.promotions }}
        values={{ products: state?.products, categories: state?.categories, promotions: state?.promotions }}
        onChangeValues={values => setState(state => ({ ...state, ...values }))}
        />;
      default:
        return null;
    }
  }, [data, state])

  if (networkStatus === NetworkStatus.loading && loading) return <Loading />
  if ((error || (slug && !data?.product)) && networkStatus !== NetworkStatus.loading) return (
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
    <View style={{ flex: 1, paddingTop: top }}>
      <TabView swipeEnabled={false} tabBarPosition="bottom"
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={props => <CustomTopTabBar {...props} 
          onLayout={e => setExtraBottom(e?.nativeEvent?.layout?.height)} 
          style={{ backgroundColor: colors.border }}
        />}
      />
      <KeyboardSpacer topSpacing={-(bottom+extraBottom)}  />
    </View>
  )
}


interface ProductsRouteProps {
  data: { products: Array<any>, categories: Array<any>, promotions: Array<any> }
  values: { products: Array<string>, categories: Array<string>, promotions: Array<string> }
  onChangeValues: (values: { products: Array<string>, categories: Array<string>, promotions: Array<string> }) => any
}
const ProductsRoute: React.FC<ProductsRouteProps> = ({ 
  data:{ products=[], categories=[], promotions=[] },
  values={ products: [], categories: [], promotions: [] },
  onChangeValues,
}) => {
  const layout = useWindowDimensions()

  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState<Array<TabViewRouteProps>>([
    { key: 'products', icon: 'local-offer', title: 'Produtos' },
    { key: 'categories', icon: 'tag', title: 'Categorias' },
    { key: 'promotions', icon: 'anchor', title: 'Promoções' },
  ])

  const renderScene = useCallback(({ route }) => {
    switch (route.key) {
      case 'products':
        return (
          <BoardCardPicker 
            data={products?.map(item => ({ 
              _id: item?._id, 
              uri: item?.uri || "https://www.leonardusa.com/assets/corals/images/default_product_image.png", 
              title: item?.name, 
              describe: formatedMoney(useProductValue(item)),
            }))} 
            selecteds={values?.products} 
            onChangeSelect={id => onChangeValues({ ...values, products: [...values?.products, id] })}
            onChangeDeselect={id => onChangeValues({ 
              ...values, 
              products: values?.products?.filter(item => item !== id)
            })}
            // onEndReached={loadPagination}
            // search={value}
            // onChangeSearch={onChangeValue}
          />);
      case 'categories': 
        return (
          <BoardCardPicker 
            data={categories?.map(item => ({ 
              _id: item?._id, 
              uri: item?.uri || "https://www.leonardusa.com/assets/corals/images/default_product_image.png", 
              title: item?.name, 
              describe: item?.about,
            }))} 
            selecteds={values?.categories} 
            onChangeSelect={id => onChangeValues({ ...values, categories: [...values?.categories, id] })}
            onChangeDeselect={id => onChangeValues({ 
              ...values, 
              categories: values?.categories?.filter(item => item !== id)
            })}
          />
        );
      case 'promotions': 
        return (
          <BoardCardPicker 
            data={promotions?.map(item => ({ 
              _id: item?._id, 
              uri: item?.uri || "https://www.leonardusa.com/assets/corals/images/default_product_image.png", 
              title: item?.name, 
              describe: item?.about,
            }))} 
            selecteds={values?.promotions} 
            onChangeSelect={id => onChangeValues({ ...values, promotions: [...values?.promotions, id] })}
            onChangeDeselect={id => onChangeValues({ 
              ...values, 
              promotions: values?.promotions?.filter(item => item !== id)
            })}
          />
        );
      default:
        return null;
    }
  }, [products, categories, promotions, values])

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


interface InfoStackProps {
  values: { name: string, uri: string, about: string }
  onChangeValues: (values: { name: string, uri: string, about: string }) => any
}
const InfoStackRoute: React.FC<InfoStackProps> = ({ 
  values:{ name='', uri="", about='' },
  onChangeValues,
}) => {
  const { colors } = useTheme()
  const layout = useWindowDimensions()

  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState<Array<TabViewRouteProps>>([
    { key: 'name', icon: 'drive-file-rename-outline', title: 'Nome', important: true  },
    { key: 'image', title: 'Imagem', icon: 'wallpaper' }, //storefrot // style = produtos
    { key: 'about', title: 'Sobre', icon: 'short-text' }
  ])

  const renderScene = useCallback(({ route }) => {
    switch (route.key) {
      case 'name':
        return (
          <TextInputCentered style={{ color: colors.text }}
            placeholderTextColor={colors.text}
            placeholder={'Produto'}
            maxLength={20}
            value={name}
            onChangeText={name => onChangeValues({ uri, about, name })}
          />
        );
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
            placeholder={"Escreva algo sobre o produto..."}
            maxLength={66}
            value={about}  
            onChangeText={about => onChangeValues({ name, uri, about })}
          />
        )
      case 'image':
        return (
          <ImagePicker value={uri} onChangeValue={uri => onChangeValues({ name, about, uri })}/>
        )
      default:
        return null;
    }
  }, [name, uri, about])

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

interface ValueStackProps {
  values: { price: number, offset: number, spinOff: boolean, single: boolean }
  onChangeValues: (values: { price: number, offset: number, spinOff: boolean, single: boolean }) => any
}
const ValueStackRoute: React.FC<ValueStackProps> = ({ 
  values:{ price=0, offset=0, spinOff=false, single=true },
  onChangeValues,
}) => {
  const { colors, dark } = useTheme()
  const layout = useWindowDimensions()

  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState<Array<TabViewRouteProps>>([
    { key: 'price', title: 'Preço', icon: 'attach-money', important: true  },
    { key: 'offset', title: 'Teto', icon: 'arrow-circle-up' },
    { key: 'type', title: 'Tipo', icon: 'category' },
  ])

  const renderScene = useCallback(({ route }) => {
    switch (route.key) {
      case 'price':
        return (
            <TextInputCentered style={{ color: colors.text }}
              showToMaxLength={false}
              type={'money'} includeRawValueInChangeText
              options={{
                precision: 2,
                separator: ',',
                delimiter: '.',
                unit: 'R$ ',
                suffixUnit: ''
              }}
              placeholderTextColor={colors.text}
              placeholder={MaskService.toMask('money', price as unknown as string, {
                precision: 2,
                separator: ',',
                delimiter: '.',
                unit: 'R$ ',
                suffixUnit: ''
              })}
              value={MaskService.toMask('money', price as unknown as string, {
                precision: 2,
                separator: ',',
                delimiter: '.',
                unit: 'R$ ',
                suffixUnit: ''
              })}
              onChangeText={(text, raw) => onChangeValues({ offset, spinOff, single, price: Number(raw) })}
            />
        );
      case 'offset':
        return (
          <TextInputCentered style={{ color: colors.text }}
            type={'only-numbers'} includeRawValueInChangeText
            checkText={(previus, next) => {
              const rawValue = MaskService.toRawValue('only-numbers', next)
              const enabled = Number(rawValue) <= 100
              if (!enabled) onChangeValues({ offset: 100, price, spinOff, single })
              return enabled
            }}
            placeholder={'Teto'}
            placeholderTextColor={colors.text}
            maxLength={3}
            showToMaxLength={false}
            value={offset === 0 ? '' : `${offset}`}
            onChangeText={(text, raw) => onChangeValues({ price, spinOff, single, offset: Number(raw) })}
            right={
              <Text style={{ 
                fontSize: 16*2, color: colors.text, marginLeft: -6,
                fontWeight: '500', textTransform: 'capitalize'
              }}>{'%'}</Text>
            }
          />
      );
      case 'type':
        return (
          <ScrollView style={{ flex: 1 }} nestedScrollEnabled
          >
              <RadioButton tintColor={colors.primary} borderColor={colors.text}
                radioStyle={{ borderRadius: 4, margin: 10, opacity: .5 }}
                radioSelectedStyle={{ backgroundColor: colors.border, opacity: 1 }}
                radioLabelStyle={{ fontSize: 18 }}
                radioAboutStyle={{ fontSize: 16 }}
                data={[
                  { key: 0, label: "Unico", about: 'Séra um produto simples, contendo o proprio valor e poderá ter adicionais, simples e do tipo extra.' }, 
                  { key: 1, label: "Grupo", about: 'Será um produto que dependerá de outros, posuindo um valor base e com um teto de valor, assim o usuario poderá adicionar os produtos até o valor desse tipo de produto.' }, 
                  { key: 2, label: "Extra", about: 'Será um produto não vendido livremente, será somente um produto a ser adicionado há outro.' }
                ]}
                index={spinOff ? 2 : single ? 0 : 1}
                onChangeIndex={index => {
                  onChangeValues({ price, offset, spinOff: (index === 2), single: (index === 0) })
                }}
              />
          </ScrollView>
        )
      default:
        return null;
    }
  }, [price, offset, spinOff, single])

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