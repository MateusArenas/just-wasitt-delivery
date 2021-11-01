import { useFocusEffect } from '@react-navigation/core';
import { HeaderBackButton, HeaderTitle, StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { FlatList, TouchableWithoutFeedback, useWindowDimensions, Image, Text, View, TouchableOpacity } from 'react-native';
import Colors from '../../constants/Colors';

import useRootNavigation from '../../hooks/useRootNavigation';
import * as BagService from '../../services/bag'
import { BottomTabParamList } from '../../types';
import useService from '../../hooks/useService'
import Loading from '../../components/Loading';
import Refresh from '../../components/Refresh';
import NotFound from '../../components/NotFound';
import Card from '../../components/Card';
import IconButton from '../../components/IconButton';
import { useScrollToTop, useTheme } from '@react-navigation/native';
import AuthContext from '../../contexts/auth';
import { writePrice } from '../../utils';
import { MaterialIcons } from '@expo/vector-icons';
import TextButton from '../../components/TextButton';
import { PullToRefreshView } from '../../components/PullToRefreshView';
import useLoadScreen from '../../hooks/useLoadScreen';
import BottomHalfModalContext from '../../contexts/BottomHalfModal';
import CardLink from '../../components/CardLink';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { MaskService } from 'react-native-masked-text';
import useProductPrice from '../../hooks/useProductPrice';
// import { Container } from './styles';

export default function Cart({ 
  navigation,
  route
} : StackScreenProps<BottomTabParamList, 'TabCart'>) {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  
  const rootNavigation = useRootNavigation()
  const ref = React.useRef<FlatList>(null)
  const [innerScrollTop, setInnerScrollTop] = React.useState(0)

  const [selecteds, setSelecteds] = React.useState<Array<string>>([])
  const [editMode, setEditMode] = React.useState(false)
  const { colors } = useTheme()
  const { user } = React.useContext(AuthContext)
  const { 
    response, 
    loading, 
    disabled,
    refreshing,
    onLoading,
    onService, 
    onRefresh 
  } = useLoadScreen<BagService.bagData>(React.useCallback(async () => await BagService.index({ userId: user?._id }), [user]))
  useFocusEffect(useCallback(() => { onLoading() }, [user]))

  useScrollToTop(ref)

  React.useEffect(() => {
    const unsubscribe = navigation.dangerouslyGetParent()?.addListener('tabPress', (e) => {
      if (innerScrollTop <= 2 && !refreshing) {
        ref.current?.scrollToOffset({ offset: 0, animated: true })
        onRefresh()
      }
    });
    return unsubscribe;
  }, [navigation, innerScrollTop, onRefresh, refreshing]);

  const onScroll = React.useCallback(event => {
    setInnerScrollTop(event?.nativeEvent?.contentOffset?.y);
  }, [setInnerScrollTop])

  const BottomHalfModal = React.useContext(BottomHalfModalContext)

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      headerTitle: props => 
        <HeaderTitle {...props}
          children={
            (editMode && selecteds?.length) ?  
              selecteds?.length === 1 ? `${selecteds?.length} pedido selecionado` 
              : `${selecteds?.length} pedidos selecionados` 
            : props.children
          }
        />
      ,
      headerRight: ({ tintColor }) => (
        <View style={{ flexDirection: 'row', paddingHorizontal: 10 }}>
          {response?.data?.length > 0 &&
          <TextButton 
            label={editMode ? selecteds.length > 0 ? 'Fazer' : 'Tudo' : 'Editar'}
            fontSize={18}
            color={colors.primary}
            onPress={() => (editMode && selecteds.length === 0) ? 
              setSelecteds(response?.data?.map(item => item?.store?.name))
              : setEditMode(true)
            }
            onPressed={() => (editMode && selecteds.length > 0) &&  BottomHalfModal.show(modalize => 
              <FlatList 
              data={[]}
              contentContainerStyle={{ flexGrow: 1 }}
              keyExtractor={(item, index) => `${item?.key}-${index}`}
              renderItem={({ item, index }) => 
                <CardLink style={{
                    backgroundColor: colors.card,
                    borderTopLeftRadius: index === 0 ? 10 : 0, borderTopRightRadius: index === 0 ? 10 : 0,
                    borderBottomLeftRadius: index === 0 ? 10 : 0, borderBottomRightRadius: index === 0 ? 10 : 0,
                    marginTop: index === 0 ? 10 : 0, marginBottom: index === 0 ? 10 : 0,
                    marginHorizontal: 10,
                  }}
                  border={index !== 0}
                  titleContainerStyle={{ padding: 10 }}
                  title={item?.title}
                  right={
                    <MaterialIcons style={{ padding: 20 }}
                      name={item?.icon as any}
                      size={24}
                      color={item?.color}
                    />
                  }
                  color={item?.color}
                  onPress={item?.onPress}
                  onPressed={modalize?.current?.close}
                />
              }
              ListFooterComponent={
                <View>
                  <CardLink border={false}
                    style={{ margin: 10, borderRadius: 10, backgroundColor: colors.card  }}
                    titleContainerStyle={{ padding: 10 }}
                    title={'Remover'}
                    right={
                      <MaterialIcons style={{ padding: 20 }}
                        name={'delete'}
                        size={24}
                        color={'red'}
                      />
                    }
                    color={'red'}
                    onPress={() => onClear(selecteds)}
                    onPressed={modalize?.current?.close}
                  />
                  <CardLink border={false}
                    style={{ margin: 10, borderRadius: 10, backgroundColor: colors.card  }}
                    titleContainerStyle={{ alignItems: 'center' , padding: 10 }}
                    title={'Cancelar'}
                    right={null}
                    color={colors.text}
                    onPress={modalize?.current?.close}
                  />
                </View>
              }
            />
            )}  
            // onPressed={() => (editMode && selecteds.length > 0) && 
            //   BottomHalfModal.show(modalize =>
            //   <FlatList 
            //     data={[
            //       { title: 'Excluir', icon: 'close', onPress: () => onClear(selecteds) },
            //       { title: 'Arquivar', icon: 'arrow-circle-down', onPress: () => {} },
            //     ]}
            //     keyExtractor={(item, index) => `${item?.title}-${index}`}
            //     renderItem={({ item, index }) => 
            //       <CardLink border={index !== 1}
            //         title={item?.title}
            //         // subTitle={`${selecteds?.length} ${selecteds?.length === 1 ? 'item' : 'items'}`}
            //         color={colors.primary}
            //         onPress={item?.onPress}
            //         onPressed={modalize?.current?.close}
            //         rightLabel={`${selecteds?.length} ${selecteds?.length === 1 ? 'item' : 'items'}`}
            //         left={
            //           <MaterialIcons style={{ padding: 10 }}
            //             name={item?.icon as any}
            //             size={24}
            //             color={colors.border}
            //           />
            //         }
            //       />
            //     }
            //   />
            // )}
          />}
        </View>
      ),
      headerLeft: props => editMode 
      ? <HeaderBackButton {...props} label={'Sair'} onPress={() => {
          setEditMode(false)
          setSelecteds([])
        }}/> 
      : props.canGoBack && <HeaderBackButton {...props} />,
    });
  }, [setEditMode, editMode, setSelecteds, selecteds, response]))

  function onSelected (id: string) {
    if (selecteds?.find(item => item === id)) {
      setSelecteds(selecteds => selecteds?.filter(item => item !== id))
    } else {
      setSelecteds(selecteds => [...selecteds, id])
    }
  }

  async function onClear (selecteds: Array<string>) {
    try {
      selecteds.map(onRemove)
      setSelecteds([])
      setEditMode(false)
    } catch (err) {}
  }

  async function onRemove (store: string) {
    try {
      await onService(async () => {
        try {
          await BagService.remove({ id: store, userId: user?._id })
          return response.data?.filter(item => item?.store?.name !== store)
        } catch (err) {}
      })
      rootNavigation.refresh('Root')
    } catch (err) {}
  }

  if (loading) return <Loading />
  if (!response.network) return <Refresh onPress={() => navigation.replace('TabCart')}/>
  if (!response.ok) return <NotFound title={`Não há nenhum pedido.`} redirectText={`Vá para tela de inicio!`}/>

  return (
    <View style={{ flex: 1 }}>
        <PullToRefreshView
          offset={top}
          disabled={editMode || disabled}
          refreshing={refreshing}
          onRefresh={onRefresh}
          style={{ flex: 1, backgroundColor: colors.background }}
        >
          <FlatList style={{ flex: 1 }} ref={ref}
            ListEmptyComponent={
              loading ? <Loading /> :
              response?.data?.length === 0 && <View style={{ 
                flex: 1, alignItems: 'center', justifyContent: 'center'
              }}>
                <Text style={{ 
                  textAlign: 'center', textAlignVertical: 'center',
                  fontSize: 18, 
                  color: colors.text, opacity: .5,
                }}>{'Nenhum resultado'}</Text>
              </View>
            }
            contentContainerStyle={[
              { flexGrow: 1, backgroundColor: colors.card }, 
              { marginTop: top, paddingBottom: bottom }
            ]}
            scrollIndicatorInsets={{ top, bottom }}
            ListHeaderComponentStyle={{ width: '100%' }}
            ListHeaderComponent={
              <View style={{ 
                padding: 10,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <TextButton 
                  label={'Lista de salvos'}
                  color={colors.text}
                  fontSize={16}
                  onPress={() => navigation.navigate('Saved')}
                />
                <TextButton 
                  label={'Lista de favoritos'}
                  color={colors.text}
                  fontSize={16}
                  onPress={() => navigation.navigate('Favorite')}
                />
              </View>
            } 
            onScroll={onScroll}
            // contentContainerStyle={{ borderTopWidth: 1, borderColor: colors.border }}
            ListFooterComponentStyle={{ flex: 1 }}
            ListFooterComponent={
              <TouchableOpacity disabled={!editMode} 
                onPress={() => setEditMode(false)} 
                style={{ flex: 1 }}
              />
            }
            data={response?.data}
            keyExtractor={(item, index) => `${item?._id}-${index}`}
            renderItem={({ item } : { item: BagService.bagData }) => (
              <CartBag 
                  editMode={editMode}
                  selected={(!!selecteds?.find(id => id === item?.store?.name) && editMode)}
                  onPress={() => editMode ? onSelected(item?.store?.name) 
                    : navigation.navigate('Bag', { store: item?.store?.name })
                  }
                  uri={item?.store?.uri}
                  name={item?.store?.name}
                  items={item?.bundles?.map(i => ({ uri: i?.product?.uri, quantity: i?.quantity }))}
                  price={item?.bundles?.map(item => useProductPrice(item) * item?.quantity)?.reduce((accum, curr) => accum + curr, 0)}
                  subPrice={item?.bundles?.map(item => useProductPrice(item, true) * item?.quantity)?.reduce((accum, curr) => accum + curr, 0)}
                /> 
            )}
          />
        </PullToRefreshView>      
    </View>
  )
}

interface CartProductProps {
  onPress?: () => any
  onLongPress?: () => any
  items?: Array<{ uri: string, quantity: number }>
  numberOfItems?: number
  selected?: boolean
  editMode?: boolean
  uri: string
  name: string
  about?: string
  price: number
  promotions: Array<number>
}
const CartBag: React.FC<CartProductProps> = ({
  uri,
  name,
  about,
  price,
  promotions,
  onPress,
  onLongPress,
  editMode,
  selected,
  items,
  numberOfItems=4
}) => {
  const { width } = useWindowDimensions()
  const { colors } = useTheme()
  
  return (
      <View style={{ 
        width, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        backgroundColor: selected ? colors.border : 'transparent',
      }}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
              <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              {editMode && 
                  <View style={{ padding: 10 }}>
                    {
                      selected ? 
                        <MaterialIcons 
                          name='check-circle-outline'
                          size={24}
                          color={colors.primary}
                        />
                      : <MaterialIcons 
                          name="circle"
                          size={24}
                          color={colors.border}
                        />
                    }
                  </View>
                }
                <View style={{ flex: 1, padding: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Image style={{ height: 75, width: 75, backgroundColor: colors.border, borderRadius: 60 }} source={{ uri }} />
                  <View style={{ flex: 1, paddingHorizontal: 10 }}>
                    <Text numberOfLines={1} style={{ color: colors.text, fontSize: 16, fontWeight: '500' }}>{name}</Text>
                    {about && <Text numberOfLines={1} style={{ color: colors.text, fontSize: 14, fontWeight: '500', opacity: .5 }}>{about}</Text>}
                    <Text numberOfLines={1} style={{ color: colors.text, fontSize: 14, fontWeight: '500', opacity: .8 }}>{
                      MaskService.toMask('money', price as unknown as string, 
                      {
                        precision: 2,
                        separator: ',',
                        delimiter: '.',
                        unit: 'R$ ',
                        suffixUnit: ''
                      })
                    }</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {items.slice(0, numberOfItems).map((item, index) => (
                        <View key={index} style={{ position: 'relative' }}>
                          <Image 
                            style={{ margin: 2, height: 38, width: 38, backgroundColor: colors.border, borderRadius: 4 }} 
                            source={{ uri: item?.uri }} 
                          />
                          <View style={{ 
                            position: 'absolute', left: -2, bottom: -2, 
                            width: 20, height: 20, 
                            borderRadius: 20, 
                          }}>
                            <View style={{ 
                              flex: 1,
                              borderRadius: 20, 
                              backgroundColor: colors.notification, 
                              alignItems: 'center', justifyContent: 'center', 
                             }}>
                              <Text numberOfLines={1} style={{ 
                                alignSelf: 'center', textAlign: 'center',
                                color: 'white', fontSize: 12, fontWeight: '500' 
                              }}>{item?.quantity}</Text>
                            </View>
                          </View>
                        </View>
                      ))}
                      {items.length > numberOfItems && <View style={{ margin: 2, height: 38, width: 38, backgroundColor: colors.border, borderRadius: 80, alignItems: 'center', justifyContent: 'center' }} >
                        <Text numberOfLines={1} style={{ color: colors.primary, fontSize: 12, fontWeight: 'bold' }}>{`+${items.length}`}</Text>
                      </View>}
                    </View>
                  </View>
                </View>
                {!editMode && <MaterialIcons style={{ padding: 10 }}
                  name="chevron-right"
                  size={24}
                  color={colors.border}
                />}
              </View>
            </TouchableOpacity>
          </View>

      </View>
  )
}