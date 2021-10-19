import { HeaderTitle, StackHeaderTitleProps, StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Clipboard, Image, FlatList, ImageBackground, useWindowDimensions, View, Text, Keyboard, TouchableWithoutFeedback, TouchableOpacity, TextInput } from 'react-native';
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
import CustomBottomTabBar from '../../components/CustomBottomTabBar';
import CustomTopTabBar, { TabViewRouteProps } from '../../components/CustomTopTabBar';
import TextButton from '../../components/TextButton';
import { MaterialIcons } from '@expo/vector-icons';
import TextInputCentered from '../../components/TextInputCentered';
import KeyboardSpacer from '../../components/KeyboardSpacer'
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import IconButton from '../../components/IconButton';
import BottomHalfModalContext from '../../contexts/BottomHalfModal';
import CardLink from '../../components/CardLink';
import AuthContext from '../../contexts/auth';
import useLoadScreen from '../../hooks/useLoadScreen';
import useRootNavigation from '../../hooks/useRootNavigation';
import { MaskService } from 'react-native-masked-text';

export default function MakePromotion ({
  navigation,
  route
} : StackScreenProps<RootStackParamList, 'MakePromotion'>) {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  
  const { user, signed } = useContext(AuthContext)
  const { colors } = useTheme()
  const { store, id } = route.params
  const layout = useWindowDimensions()
  const [name, setName] = useState<string>('')
  const [uri, setUri] = useState<string>('')
  const [percent, setPercent] = useState<number>()
  const [products, setProducts] = useState<Array<string>>([])
  const [about, setAbout] = useState<string>('')
  const rootNavigation = useRootNavigation()

  const {
    disabled,
    response,
    loading,
    refreshing,
    onLoading,
    onService,
    onRefresh,
  } = useLoadScreen<PromotionService.PromotionData>(async () => await PromotionService.search({ store, id }))

  useEffect(() => { if(id) { onLoading() } }, [])
  const data = response?.data[0]

  useEffect(() => {
    if(data) {
      setUri(data?.uri)
      setName(data?.name)
      setPercent(data?.percent)
      setAbout(data?.about)
      setProducts(data?.products?.map(item => typeof item?._id === 'string' ? item?._id : item))
    }
  }, [data, setUri, setName, setProducts, setPercent, setAbout])

  const onSubmit = React.useCallback(async () => {
    if (!name && !signed) return null
    try {
      if(id) {
        await onService(async () => await PromotionService.update({ id, store, body: { uri, name, products, percent, about } }))
      } else {
        await onService(async () => await PromotionService.create({ store, body: { uri, name, products, percent, about } }))
      }
      Keyboard.dismiss()
      rootNavigation.refresh('Root')
      navigation.goBack()
    } catch (err) {}
  }, [signed, uri, name, id, products, percent, about])
  
  const BottomHalfModal = React.useContext(BottomHalfModalContext)

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      title: data?.name ? data?.name : 'Nova Promoção',
      headerTitle: ({ tintColor, children, ...props }) => !id ? 
        <HeaderTitle tintColor={tintColor} {...props}>
          {children}
        </HeaderTitle>
      :(
        <IconButton style={{ padding: 0 }}
          label={children} 
          name="expand-more" color={colors.text} size={24}
          onPress={() => BottomHalfModal.show(modalize => 
            <FlatList 
              data={data?.otherPromotions?.map(({ _id, name: promotion }) => ({
                key: _id,
                color: colors.text,
                title: promotion,
                onPress: () => navigation.replace('MakePromotion', { store, id: _id })
              })) || []}
              keyExtractor={item => `${item?.key}`}
              renderItem={({ item }) => 
                <CardLink 
                  title={item?.title}
                  color={item?.color}
                  onPress={item?.onPress}
                  onPressed={modalize?.current?.close}
                />
              }
              ListFooterComponent={
                <View>
                  {data?.self && 
                    <CardLink border={false}
                      title={'Criar promoção'}
                      color={colors.primary}
                      onPress={() => navigation.push('MakePromotion', { store })}
                      onPressed={modalize?.current?.close}
                    />
                  }
                </View>
              }
            />
          )} 
        />
      ),
      headerRight: ({ tintColor }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextButton style={{ paddingHorizontal: 20 }}
            label={'Concluir'}
            fontSize={16}
            color={colors.primary}
            disabled={
              !name || !percent
              || !!data?.otherPromotions?.find(item => (item?.name === name && item?._id !== id)) 
            }
            onPress={onSubmit}
          />
        </View>
      ),
    });
  }, [name, onSubmit, data]))

  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState<Array<TabViewRouteProps>>([
    { key: 'name', icon: 'anchor', title: 'Nome' },
    { key: 'image', icon: 'photo-camera', title: 'Foto' },
    { key: 'percent', icon: 'money-off', title: 'Valor' },
    { key: 'products', icon: 'local-offer', title: 'Items' },//local-mall
    { key: 'about', icon: 'short-text', title: 'Sobre' },//monry-off receipt
  ])

  const isFocused = React.useCallback((key: string) => {
    return index === routes?.findIndex(item => item?.key === key)
  }, [index, routes])

  const renderScene = useCallback(({ route }) => {
    const focused = isFocused(route.key)

    switch (route.key) {
      case 'name':
        return <NameRoute value={name} onChangeValue={name => setName(name)} />;
      case 'image':
        return <ImageRoute value={uri} onChangeValue={uri => setUri(uri)} />
      case 'percent':
        return <PercentRoute value={percent} onChangeValue={percent => setPercent(percent)} />;
      case 'products':
        return <ProductsRoute products={products} setProducts={setProducts}/>;
      case 'about':
        return <AboutRoute focused={focused} value={about} onChangeValue={about => setAbout(about)}/>
      default:
        return null;
    }
  }, [products, setProducts, setName, name, setPercent, percent, uri, setUri, about, setAbout])

  if (loading) return <Loading />
  if (!response?.network) return <Refresh onPress={() => navigation.replace('MakePromotion', { id, store })}/>
  if (!response?.ok) return <NotFound title={`This Product doesn't exist.`} redirectText={`Go to home screen!`}/>

  return (
    <TabView swipeEnabled style={{ paddingTop: top }}
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={props => <CustomTopTabBar {...props}/>}
    />
  )
}

const NameRoute: React.FC<{
  value: string
  onChangeValue: (value: string) => any
}> = ({
  value, onChangeValue
}) => {
  const { colors } = useTheme()
  const topSpacing = React.useContext(BottomTabBarHeightContext) || 0

  return (
    <View style={{ flex: 1 }}>
        <TouchableWithoutFeedback style={{ flex: 1}} onPress={Keyboard.dismiss} >
          <View style={{ flex: 1 }}/>
        </TouchableWithoutFeedback>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10 }} >
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <View>
                <TextInputCentered autoFocus
                  type={'default'}
                  placeholderTextColor={colors.text}
                  placeholder={'Nome'}
                  style={{ opacity: value?.length > 0 ? .8 : .5,
                    padding: 10,
                    paddingLeft: 0,
                    color: colors.text,
                    fontSize: 16*2, fontWeight: '500', textTransform: 'capitalize'
                  }}
                  maxLength={15}
                  value={value}
                  onChangeText={text => onChangeValue(text)}
                />
              </View>
              {/* {value?.length === 0 && <MaterialIcons 
                style={{ opacity: .5 }}
                name="anchor" 
                size={24*1.5} 
                color={colors.text}
              />} */}
            </View>
          </View>
        </View>
        <TouchableWithoutFeedback style={{ flex: 1}} onPress={Keyboard.dismiss} >
          <View style={{ flex: 1 }}/>
        </TouchableWithoutFeedback>
          <Text style={{
            alignSelf: 'flex-end',
            fontWeight: '500', fontSize: 16,
            color: colors.text, opacity: .5,
            padding: 10, 
          }}>{value?.length + ' / ' + 15}</Text>
          <KeyboardSpacer topSpacing={-topSpacing} />
      </View>
  )
}

const PercentRoute: React.FC<{
  value: number
  onChangeValue: (value: number) => any
}> = ({
  value=0, onChangeValue
}) => {
  const { colors } = useTheme()
  const topSpacing = React.useContext(BottomTabBarHeightContext) || 0

  return (
    <View style={{ flex: 1 }}>
        <TouchableWithoutFeedback style={{ flex: 1}} onPress={Keyboard.dismiss} >
          <View style={{ flex: 1 }}/>
        </TouchableWithoutFeedback>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10 }} >
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <View>
                <TextInputCentered type={'only-numbers'} autoFocus
                  includeRawValueInChangeText
                  checkText={(previus, next) => {
                    const rawValue = MaskService.toRawValue('only-numbers', next)

                    const enabled = Number(rawValue) <= 100

                    if (!enabled) onChangeValue(100)

                    return enabled
                  }}
                  placeholder={'Desconto'}
                  placeholderTextColor={colors.text}
                  style={{ opacity: value !== 0 ? .8 : .5,
                    padding: 10,
                    paddingLeft: 0,
                    color: colors.text,
                    fontSize: 16*2, fontWeight: '500', textTransform: 'capitalize'
                  }}
                  maxLength={3}
                  value={value === 0 ? '' : `${value}`}
                  onChangeText={(text, raw) => onChangeValue(Number(raw))}
                />
              </View>
              {value > 0 && <Text style={{ opacity: value === 0 ? .5 : .8,
                fontSize: 16*2, color: colors.text, marginLeft: -6,
                fontWeight: '500', textTransform: 'capitalize'
              }}>{'%'}</Text>}
            </View>
          </View>
        </View>
        <TouchableWithoutFeedback style={{ flex: 1}} onPress={Keyboard.dismiss} >
          <View style={{ flex: 1 }}/>
        </TouchableWithoutFeedback>
        <Text style={{
            alignSelf: 'flex-end',
            fontWeight: '500', fontSize: 16,
            color: colors.text, opacity: .5,
            padding: 10, 
          }}>{(value ? value : 0) + ' / ' + 100}</Text>
        <KeyboardSpacer topSpacing={-topSpacing} />
      </View>
  )
}

const ImageRoute: React.FC<{
  value: string
  onChangeValue: (uri: string) => any
}> = ({ value, onChangeValue }) => {
  const { colors } = useTheme()
  return (
    <View style={{ flex: 1, height: 250, alignItems: 'center', justifyContent: 'center' }}>
      <TouchableOpacity onPress={async () => {
        const uri = await Clipboard.getString()
        onChangeValue(uri)
      }}>
        {!value ? <MaterialIcons 
          style={{ padding: 20, borderColor: colors.border, borderWidth: 4, borderRadius: 200 }}
          name="photo-camera"
          size={24*4}
          color={colors.border}
        /> : 
        <View style={{ padding: 20, borderColor: colors.border, borderWidth: 4, borderRadius: 200, overflow: 'hidden' }}>
          <Image source={{ uri: value, width: 24*4, height: 24*4 }} style={{ borderRadius: 200 }}/>
        </View>
        }
      </TouchableOpacity>
      <TouchableOpacity onPress={async () => {
        const uri = await Clipboard.getString()
        onChangeValue(uri)
      }}>
        <Text style={{ 
          color: colors.primary, 
          fontWeight: '500', 
          fontSize: 16, padding: 10
        }}>{'Alterar Imagem'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const AboutRoute: React.FC<{
  focused: boolean
  value: string
  onChangeValue: (value: string) => any
}> = ({
  value, onChangeValue, focused
}) => {
  const ref = React.useRef<TextInput>(null)

  useEffect(() => {
    if(focused) ref?.current?.focus()
  }, [focused, ref])

  const { colors } = useTheme()
  const topSpacing = React.useContext(BottomTabBarHeightContext) || 0

  return (
    <View style={{ flex: 1 }} >
      <View style={{ flex: 1 }} >
        <TextInput multiline 
          ref={ref}
          placeholderTextColor={colors.text}
          placeholder="Escreva algo sobre a promoção..."
          style={{ opacity: value?.length > 0 ? .8 : .5,
            flex: 1, width: '100%',
            padding: 10, paddingTop: 15,
            color: colors.text,
            fontSize: 18, fontWeight: '500',
          }}
          value={value}
          onChangeText={onChangeValue}
          maxLength={60}
        />
        <Text style={{
          fontWeight: '500', fontSize: 16,
          color: colors.text, opacity: .5,
          position: 'absolute', bottom: 0, right: 0, padding: 10, 
        }}>{value?.length + ' / ' + 60}</Text>
      </View>
      <KeyboardSpacer topSpacing={-topSpacing} />
    </View>
  )
}

interface ProductsRouteProps {
  products: Array<string>
  setProducts: React.Dispatch<React.SetStateAction<string[]>>
}
const ProductsRoute: React.FC<ProductsRouteProps> = ({ products, setProducts }) => {
  const layout = useWindowDimensions()
  const route = useRoute<RouteProp<RootStackParamList, 'MakeCategory'>>()
  const navigation = useNavigation<NavigationProp<RootStackParamList, 'MakeCategory'>>()
  const { store, id } = route.params
  const { 
    response, 
    loading, 
    error, 
    onService, 
    onRefresh 
  } = useService<ProductService.ProductData>(ProductService, 'index', { store })
  const data = response?.data

  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState([
    { key: 'add', title: 'Adicionar' },
    { key: 'selected', title: 'Selecionados' },
  ])

  const renderScene = useCallback(({ route }) => {
    switch (route.key) {
      case 'add':
        return <SecondRoute data={data} products={products} setProducts={setProducts}/>;
      case 'selected':
        return <FirstRoute data={data?.filter(item => !!products?.find(_id => item?._id === _id))} products={products} setProducts={setProducts}/>;
      default:
        return null;
    }
  }, [products, setProducts, data])

  if (loading === 'LOADING') return <Loading />
  if (error === 'NETWORK') return <Refresh onPress={() => navigation.dispatch(StackActions.replace('MakeCategory', { id, store }))}/>
  if (error === 'NOT_FOUND') return <NotFound title={`This Product doesn't exist.`} redirectText={`Go to home screen!`}/>

  return (
    <TabView swipeEnabled={false} tabBarPosition="bottom"
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={props => <CustomBottomTabBar {...props} />}
    />
  )
}

const FirstRoute: React.FC<{
  data: Array<ProductService.ProductData>
  products: Array<string>
  setProducts: React.Dispatch<React.SetStateAction<string[]>>
}> = ({
  data, products, setProducts
}) => {
  const { colors } = useTheme()
  const { width } = useWindowDimensions()

  return (
    <FlatList 
      style={{ flex: 1 }}
      numColumns={3}
      data={data}
      contentContainerStyle={{ flex: 1 }}
      columnWrapperStyle={{ flex: 1 }}
      keyExtractor={item => `${item?._id}` }
      renderItem={({ item } : { item: ProductService.ProductData }) => (
        <TouchableOpacity onPress={() => {
          console.log('click')
          const s = products?.find(_s => _s === item?._id)
          if (s) setProducts(_ss => _ss.filter(_s => _s !== item?._id))
          else setProducts(_ss => [..._ss, item?._id])
        }}>
          <ImageBackground 
            defaultSource={require('../../assets/images/default-product.jpg')}
            source={{ uri: item?.uri }}
            style={{ width: width/3, height: 160 }}
          >
            <View style={{ 
              flex: 1, alignItems: 'flex-end', justifyContent: 'flex-end',
              backgroundColor: 'rgba(0,0,0,.1)', 
              padding: 5,
              borderWidth: 1, borderColor: colors.border, borderRadius: 2,
            }}>
              <View style={{ width: '100%', alignItems: 'flex-end', flexDirection: 'row', padding: 5 }}>
                <Text numberOfLines={2} style={{ color: 'white', fontSize: 14, fontWeight: '500' }} >{item?.name}</Text>
                <View style={{ 
                  width: 30,
                  height: 30, 
                  borderRadius: 60,
                  borderWidth: 2, borderColor: 'white',
                  alignItems: 'center', justifyContent: 'center',
                  backgroundColor: products?.find(s => s === item?._id) ? colors.primary : 'transparent'
                }}>
                  {products?.find(s => s === item?._id) && <MaterialIcons name="check" size={20} color={'white'} />}
                </View>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      )}
    />
  )
}

const SecondRoute: React.FC<{
  data: Array<ProductService.ProductData>
  products: Array<string>
  setProducts: React.Dispatch<React.SetStateAction<string[]>>
}> = ({
  data, products, setProducts
}) => {
  const { colors } = useTheme()
  const { width } = useWindowDimensions()

  return (
    <FlatList 
      style={{ flex: 1 }}
      numColumns={3}
      data={data}
      contentContainerStyle={{ flex: 1 }}
      columnWrapperStyle={{ flex: 1 }}
      keyExtractor={item => `${item?._id}` }
      renderItem={({ item } : { item: ProductService.ProductData }) => (
        <TouchableOpacity onPress={() => {
          console.log('click')
          const s = products?.find(_s => _s === item?._id)
          if (s) setProducts(_ss => _ss.filter(_s => _s !== item?._id))
          else setProducts(_ss => [..._ss, item?._id])
        }}>
          <ImageBackground 
            defaultSource={require('../../assets/images/default-product.jpg')}
            source={{ uri: item?.uri }}
            style={{ width: width/3, height: 160 }}
          >
            <View style={{ 
              flex: 1, alignItems: 'flex-end', justifyContent: 'flex-end',
              backgroundColor: 'rgba(0,0,0,.1)', 
              padding: 5,
              borderWidth: 1, borderColor: colors.border, borderRadius: 2,
            }}>
              <View style={{ width: '100%', alignItems: 'flex-end', flexDirection: 'row', padding: 5 }}>
                <Text numberOfLines={2} style={{ color: 'white', fontSize: 14, fontWeight: '500' }} >{item?.name}</Text>
                <View style={{ 
                  width: 30,
                  height: 30, 
                  borderRadius: 60,
                  borderWidth: 2, borderColor: 'white',
                  alignItems: 'center', justifyContent: 'center',
                  backgroundColor: products?.find(s => s === item?._id) ? colors.primary : 'transparent'
                }}>
                  {products?.find(s => s === item?._id) && <MaterialIcons name="check" size={20} color={'white'} />}
                </View>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
    )}
  />
  )
}

