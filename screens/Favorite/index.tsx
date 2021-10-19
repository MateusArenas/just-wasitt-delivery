import { HeaderBackButton, HeaderTitle, StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useContext, useEffect } from 'react';
import { SafeAreaView, useWindowDimensions, View, Text, Image, FlatList, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
import { PullToRefreshView } from '../../components/PullToRefreshView';
import Refresh from '../../components/Refresh';
import useService from '../../hooks/useService';
import { RootStackParamList, TabExploreParamList } from '../../types';
import * as FavoriteService from '../../services/favorite';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import AuthContext from '../../contexts/auth';
import { MaterialIcons } from '@expo/vector-icons';
import TextButton from '../../components/TextButton';
import CardLink from '../../components/CardLink';
import IconButton from '../../components/IconButton';
import BottomHalfModalContext from '../../contexts/BottomHalfModal';
import useLoadScreen from '../../hooks/useLoadScreen';
import { writePrice } from '../../utils';
import useRootNavigation from '../../hooks/useRootNavigation';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';

export default function Favorite({
  navigation,
  route,
} : StackScreenProps<RootStackParamList, 'Favorite'>) {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  
  const rootNavigation = useRootNavigation()
  const [selecteds, setSelecteds] = React.useState<Array<string>>([])
  const [editMode, setEditMode] = React.useState(false)
  const { user } = useContext(AuthContext)
  const { colors } = useTheme()

  const { 
    disabled,
    response, 
    loading, 
    onLoading,
    refreshing,
    onService, 
    onRefresh 
  } = useLoadScreen<FavoriteService.FavoriteData>(async () => await FavoriteService.all({ userId: user?._id }))
  useEffect(() => { if(user) onLoading() }, [user])

  const data: Array<FavoriteService.FavoriteData> = response?.data.flat() as any

  const BottomHalfModal = React.useContext(BottomHalfModalContext)

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      headerTitle: props => 
        <HeaderTitle {...props}
          children={
            (editMode && selecteds?.length) ?  
              selecteds?.length === 1 ? `${selecteds?.length} favorito selecionado` 
              : `${selecteds?.length} favoritos selecionados` 
            : props.children
          }
        />
      ,
      headerRight: ({ tintColor }) => (
        <View style={{ flexDirection: 'row', paddingHorizontal: 10 }}>
          {data?.length > 0 &&
          <TextButton 
            label={editMode ? selecteds.length > 0 ? 'Fazer' : 'Tudo' : 'Editar'}
            fontSize={18}
            color={colors.primary}
            onPress={() => (editMode && selecteds.length === 0) ? 
              setSelecteds(data?.map(item => item?._id))
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
  }, [setEditMode, editMode, setSelecteds, selecteds, data]))


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

  async function onRemove (_id :string ) {
    const store = data?.find(item => item?._id === _id)?.store 
    try {
      await onService(async () => {
        try {
          await FavoriteService.remove({ store, _id, userId: user?._id })
          return response.data?.map(items => items?.filter(item => item?._id !== _id))
        } catch (err) {}
      })
      rootNavigation.refresh('Root')
    } catch (err) {}
  }

  if (loading) return <Loading />
  if (!response?.network) return <Refresh onPress={() => navigation.replace('Favorite')}/>
  if (!response?.ok) return <NotFound title={`This Category doesn't exist.`} redirectText={`Go to home screen!`}/>

  return (
      <PullToRefreshView
        offset={top}
        disabled={disabled}
        refreshing={refreshing}
        onRefresh={onRefresh}
        style={{ flex: 1, backgroundColor: colors.background }}
        > 
          <FlatList 
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingTop: top, paddingBottom: bottom }}
            scrollIndicatorInsets={{ top, bottom }}
            data={data}
            keyExtractor={(item, index) => `${item?._id}-${index}`}
            ItemSeparatorComponent={() => <View style={{ height: 1, width: '100%', backgroundColor: colors.border }}/>}
            renderItem={({ item } : { item: FavoriteService.FavoriteData }) => (
              <CartBag 
                editMode={editMode}
                selected={(!!selecteds?.find(id => id === item?._id) && editMode)}
                onPress={() => editMode ? onSelected(item?._id) 
                  : navigation.navigate('Product', { store: item?.store, id: item?.product?._id })
                }
                uri={item?.product?.uri}
                name={item?.product?.name}
                about={item?.product?.about}
                price={item?.product?.price}
              /> 
            )}
          />
      </PullToRefreshView>
  )
}

interface CartProductProps {
  onPress?: () => any
  selected?: boolean
  editMode?: boolean
  uri: string
  name: string
  about: string
  price: number
}
const CartBag: React.FC<CartProductProps> = ({
  uri,
  name,
  about,
  price,
  onPress,
  editMode,
  selected,
}) => {
  const { width } = useWindowDimensions()
  const { colors } = useTheme()
  
  return (
      <View style={{ 
        width, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        backgroundColor: selected ? colors.border : colors.card,
        borderBottomWidth: 1, borderColor: colors.border,
      }}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity onPress={onPress}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
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
                <View style={{ flex: 1, padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                  <Image style={{ height: 75, width: 75, backgroundColor: colors.border, borderRadius: 60, borderWidth: 1, borderColor: colors.border }} source={{ uri }} />
                  <View style={{ flex: 1, padding: 10 }}>
                    <Text numberOfLines={1} style={{ color: colors.text, fontSize: 16, fontWeight: '500' }}>{name}</Text>
                    <Text numberOfLines={1} style={{ color: colors.text, fontSize: 14, fontWeight: '500', opacity: .5 }}>{about}</Text>
                    <Text numberOfLines={1} style={{ color: colors.text, fontSize: 14, fontWeight: '500', opacity: .8 }}>{writePrice(price)}</Text>
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