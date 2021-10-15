import React, { useCallback, useContext, useEffect } from 'react';
import { TextInput, View, Text, TouchableWithoutFeedback, useWindowDimensions, TextInputProps, Keyboard } from 'react-native';
import { CommonActions, NavigationProp, RouteProp, StackActions, useFocusEffect, useNavigation, useRoute, useTheme } from '@react-navigation/native';
import { StackHeaderTitleProps, StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import * as ProductService from '../../services/product';
import * as CategoryService from '../../services/category';
import * as PromotionService from '../../services/promotion';
import useService from '../../hooks/useService';
import IconButton from '../../components/IconButton';
import { SceneRendererProps, TabView } from 'react-native-tab-view';
import { MaterialIcons } from '@expo/vector-icons';
import Loading from '../../components/Loading';
import Refresh from '../../components/Refresh';
import NotFound from '../../components/NotFound';
import HeaderInputSubmit from '../../components/HeaderInputSubmit';
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

export default function MakeProduct ({
  navigation,
  route,
} : StackScreenProps<RootStackParamList, 'MakeProduct'>) {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  
  const { signed } = React.useContext(AuthContext)
  const { colors } = useTheme()
  const layout = useWindowDimensions()
  const { store, id } = route.params
  const rootNavigation = useRootNavigation()

  const {
    disabled,
    response,
    loading,
    refreshing,
    onLoading,
    onService,
    onRefresh,
  } = useLoadScreen<ProductService.ProductData>(async () => await ProductService.search({ store, id }))

  useEffect(() => { if(id) { onLoading() } }, [])
  const data = response?.data[0]

  const [state, setState] = React.useState<ProductService.ProductData>({} as ProductService.ProductData)

  useEffect(() => {
    if (id) {
      setState({ 
        ...data, 
        categories: data?.categories?.map(item => typeof item === 'string' ? item : item?._id),
        promotions: data?.promotions?.map(item => typeof item === 'string' ? item : item?._id) 
      })
    }
  }, [data, setState])

  const onSubmit = React.useCallback(async () => {
    try {
      if (signed) {
        if(id) {
          await onService(async (_response: any) => {
            try {
              const res = await ProductService.update({ store, id, body: state })
              const data = _response?.data?.map(item => item?._id === id ? res.data[0] : item )
              res.data = data
              return res
            } catch (err) {
              return _response
            }
          })
        } else {
          await onService(async (_response: any) => {
            try {
              const res = await ProductService.create({ store, body: state })
              const data = _response?.data?.push(res.data[0])
              res.data = data
              return res
            } catch (err) {
              return _response
            }
          })
        }
      }
      if (response?.ok && response?.network) {
        Keyboard.dismiss()
        rootNavigation.refresh('Root')
        navigation.goBack()
      }
    } catch (err) { }
  }, [signed, state, response])
  
  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      title: id ? 'Editar Produto' : 'Novo Produto',
      // headerTitle: props => 
      //   <HeaderInputSubmit {...props} 
      //     disabled={!state?.name && !state?.price}
      //     value={state?.name} 
      //     onChangeValue={name => setState(state => ({ ...state, name }))} 
      //     onSubmit={onSubmit}
      //     loading={loading}
      //     submitText={'Concluir'}
      //   />,
      headerRight: ({ tintColor }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextButton style={{ paddingHorizontal: 20 }}
            label={'Concluir'}
            fontSize={16}
            color={colors.primary}
            disabled={!state?.name}
            onPress={onSubmit}
          />
        </View>
      ),
    });
  }, [state]))

  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState<Array<TabViewRouteProps>>([
    { key: 'name', title: 'Nome', icon: 'local-offer', focused: index === 0 }, //loyalty // receipt = pedido
    { key: 'image', title: 'Foto', icon: 'photo-camera', focused: index === 1 }, //storefrot // style = produtos
    { key: 'price', title: 'Preço', icon: 'attach-money', focused: index === 2 },
    { key: 'categories', title: 'Tags', icon: 'tag', focused: index === 3 },
    { key: 'promotions', title: 'Offs', icon: 'anchor', focused: index === 4 },
    { key: 'about', title: 'Sobre', icon: 'short-text', focused: index === 5 },
  ])

  const isFocused = React.useCallback((key: string) => {
    return index === routes?.findIndex(item => item?.key === key)
  }, [index, routes])

  const renderScene = React.useCallback(({ route,  }: SceneRendererProps & {
    route: TabViewRouteProps;
  }) => {
    const focused = isFocused(route.key)

    switch (route.key) {
      case 'name':
        return <NameRoute focused={focused} value={state?.name} onChangeValue={name => setState(state => ({ ...state, name }))} />;
      case 'image':
        return <ImageRoute value={state?.uri} onChangeValue={uri => setState(state => ({ ...state, uri }))} />
      case 'price':
        return <PriceRoute focused={focused} value={state?.price} onChangeValue={price => setState(state => ({ ...state, price }))} />
      case 'categories': 
        return <CategoryRoute value={state?.categories} onChangeValue={_id => {
          const s = state?.categories?.find(_s => _s === _id)
          if (s) setState(state => ({ ...state, categories: state?.categories?.filter(_s => _s !== _id) }))
          else setState(state => ({ ...state, categories: !!state?.categories ? [...state?.categories, _id] : [_id] }))
        }} />
      case 'promotions': 
        return <PromotionRoute value={state?.promotions} onChangeValue={_id => {
          const s = state?.promotions?.find(_s => _s === _id)
          if (s) setState(state => ({ ...state, promotions: state?.promotions?.filter(_s => _s !== _id) }))
          else setState(state => ({ ...state, promotions: !!state?.promotions ? [...state?.promotions, _id] : [_id] }))
        }} />
      case 'about':
        return <AboutRoute focused={focused} value={state?.about} onChangeValue={about => setState(state => ({ ...state, about }))}/>
      default:
        return null;
    }
  }, [state, setState, isFocused])

  if (loading) return <Loading />
  if (!response?.network) return <Refresh onPress={() => navigation.replace('MakeProduct', route?.params)}/>
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
  focused?: boolean
  value: string
  onChangeValue: (value: string) => any
}> = ({
  value, onChangeValue, focused
}) => {
  const { colors } = useTheme()
  const topSpacing = React.useContext(BottomTabBarHeightContext) || 0

  const ref = React.useRef<TextInput>(null)

  useEffect(() => {
    if(focused) ref?.current?.focus()
  }, [focused, ref])

  return (
    <View style={{ flex: 1 }}>
        <TouchableWithoutFeedback style={{ flex: 1}} onPress={Keyboard.dismiss} >
          <View style={{ flex: 1 }}/>
        </TouchableWithoutFeedback>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10 }} >
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <View>
                <TextInputCentered ref={ref}
                  type={'default'}
                  placeholderTextColor={colors.text}
                  placeholder={'Nome'}
                  style={{ opacity: value?.length > 0 ? .8 : .5,
                    padding: 10,
                    paddingLeft: 0,
                    color: colors.text,
                    fontSize: 16*2, fontWeight: '500', textTransform: 'capitalize'
                  }}
                  maxLength={20}
                  value={value}
                  onChangeText={text => onChangeValue(text)}
                />
              </View>
              {value?.length === 0 && <MaterialIcons 
                style={{ opacity: .5 }}
                name="local-offer" 
                size={24*1.5} 
                color={colors.text}
              />}
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
          }}>{value?.length + ' / ' + 20}</Text>
          <KeyboardSpacer topSpacing={-topSpacing} />
      </View>
  )
}

const CategoryRoute: React.FC<{
  value: Array<string>
  onChangeValue: (value: string) => any
}> = ({ value, onChangeValue }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList, 'MakeProduct'>>()
  const route = useRoute<RouteProp<RootStackParamList, 'MakeProduct'>>()
  const { store } = route.params
  const { 
    response, 
    loading, 
    error, 
    onService, 
    onRefresh 
  } = useService<CategoryService.CategoryData>(CategoryService, 'index', { store })

  if (loading === 'LOADING') return <Loading />
  if (error === 'NETWORK') return <Refresh onPress={() => onRefresh('index', { store })} />
  if (error === 'NOT_FOUND') return <NotFound title={`This Product doesn't exist.`} redirectText={`Go to home screen!`}/>

  return <CategoryPiker data={response?.data} value={value} onChangeValue={onChangeValue} />
}

const PromotionRoute: React.FC<{
  value: Array<string>
  onChangeValue: (value: string) => any
}> = ({ value, onChangeValue }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList, 'MakeProduct'>>()
  const route = useRoute<RouteProp<RootStackParamList, 'MakeProduct'>>()
  const { store } = route.params
  const { 
    response, 
    loading, 
    error, 
    onService, 
    onRefresh 
  } = useService<PromotionService.PromotionData>(PromotionService, 'index', { store })

  if (loading === 'LOADING') return <Loading />
  if (error === 'NETWORK') return <Refresh onPress={() => onRefresh('index', { store })} />
  if (error === 'NOT_FOUND') return <NotFound title={`This Product doesn't exist.`} redirectText={`Go to home screen!`}/>

  return <CategoryPiker data={response?.data} value={value} onChangeValue={onChangeValue} />
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
          placeholder="Escreva algo sobre o produto..."
          style={{ opacity: .8,
            flex: 1,
            width: '100%',
            padding: 10,
            color: colors.text,
            fontSize: 16,
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




const PriceRoute: React.FC<{
  focused?: boolean
  value: number
  onChangeValue: (value: number) => any
}> = ({
  value=0, onChangeValue, focused
}) => {
  const { colors } = useTheme()
  const topSpacing = React.useContext(BottomTabBarHeightContext) || 0

  const ref = React.useRef<TextInput>(null)

  useEffect(() => {
    if(focused) ref?.current?.focus()
  }, [focused, ref])

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10 }} >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <View>
          <TextInputCentered ref={ref}
            includeRawValueInChangeText
            type={'money'}
            options={{
              precision: 2,
              separator: ',',
              delimiter: '.',
              unit: 'R$ ',
              suffixUnit: ''
            }}
            textAlign={'center'}
            placeholderTextColor={colors.text}
            placeholder={MaskService.toMask('money', value as unknown as string, {
              precision: 2,
              separator: ',',
              delimiter: '.',
              unit: 'R$ ',
              suffixUnit: ''
            })}
            style={{ opacity: value > 0 ? .8 : .5,
              padding: 10,
              color: colors.text,
              fontSize: 16*2, fontWeight: '500', textTransform: 'capitalize'
            }}
            value={value as unknown as string}
            onChangeText={(text, raw) => onChangeValue(raw)}
          />
        </View>
      </View>
      <KeyboardSpacer topSpacing={-topSpacing} />
    </View>
  )
}

const ImageRoute: React.FC<{
  value: string
  onChangeValue: (uri: string) => any
}> = () => {
  const { colors } = useTheme()
  return (
    <View style={{ flex: 1, height: 250, alignItems: 'center', justifyContent: 'center' }}>
      <IconButton 
        style={{ padding: 20, borderColor: colors.border, borderWidth: 4, borderRadius: 200 }}
        name="photo-camera"
        size={24*4}
        color={colors.border}
        onPress={() => {}}
      />
    </View>
  )
}
