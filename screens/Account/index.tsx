import { MaterialIcons } from '@expo/vector-icons';
import { StackActions, useFocusEffect, useTheme } from '@react-navigation/native';
import { StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useContext, useEffect } from 'react';
import { Image, View, Text, Button, FlatList } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
import ProfileCard from '../../components/ProfileCard';
import { PullToRefreshView } from '../../components/PullToRefreshView';
import Refresh from '../../components/Refresh';
import AuthContext from '../../contexts/auth';
import BottomHalfModalContext from '../../contexts/BottomHalfModal';
import useLoadScreen from '../../hooks/useLoadScreen';
import useRootNavigation from '../../hooks/useRootNavigation';
import useService from '../../hooks/useService';
import api from '../../services/api';
import { saveToken, useCanToken } from '../../services/auth';
import { StoreDate } from '../../services/store';
import { TabStoreMainParamList } from '../../types';
import * as ManageService from '../../services/manage'
import ContainerButton from '../../components/ContainerButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconButton from '../../components/IconButton';
import CardLink from '../../components/CardLink';
import TextButton from '../../components/TextButton';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';

export default function Account({
  navigation,
  route,
} : StackScreenProps<TabStoreMainParamList, 'Account'>) {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  
  const { colors } = useTheme()
  const { user, users, signed, refresh, signIn, signOut, removeSign } = React.useContext(AuthContext)

  const [loading, setLoading] = React.useState(false)
  const [resfreshing, setResfreshing] = React.useState(false)
  const [stores, setStores] = React.useState<Array<StoreDate>>([])
  async function onLoad (shouldRefresh?: boolean) {
    shouldRefresh ? setResfreshing(true) : setLoading(true)
    try {
      const response = await api.get(`/users/${user?._id}/stores`)
      setStores(response?.data)
    } catch (err) {

    } finally {
      shouldRefresh ? setResfreshing(false) : setLoading(false)
    }
  }

  useEffect(() => { onLoad() }, [signed, user, setLoading, setStores])

  const BottomHalfModal = React.useContext(BottomHalfModalContext)

  const rootNavigation = useRootNavigation()

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      headerTitleAlign: 'left',
      headerRight: ({ tintColor }) => 
        <View style={{ flexDirection: 'row', paddingHorizontal: 10 }}>
          {signed && <TextButton 
            label={'Editar'} 
            fontSize={16} 
            color={colors.primary} 
            onPress={() => rootNavigation.navigate('EditAccount', { id: user?._id })} 
          />}
        </View>
      ,
      headerTitle: ({ tintColor, ...props }) => (
        <View style={{ display: 'flex', flexDirection: 'row', }}>
          <IconButton style={{ padding: 0 }}
            label={user?._id ? user?.name ? user?.name : user?.email : 'Visitante'} 
            name="expand-more" color={colors.text} size={24}
            onPress={() => BottomHalfModal.show(modalize => 
              <FlatList 
              ListHeaderComponentStyle={{ padding: 5 }}
              ListHeaderComponent={
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  {[
                    { key: 0, icon: 'add', color: colors.primary, title: 'Nova', onPress: () => rootNavigation.navigate('SignUp') },
                    { key: 1, icon: 'login', color: colors.text, title: 'Entrar', onPress: () => rootNavigation.navigate('SignIn') },
                    { key: 2, icon: 'logout', color: 'red', title: 'Sair', onPress: () => signOut() },
                  ]?.map(item => (
                    <View key={item?.key} style={{ 
                      padding: 10, paddingTop: 0,
                      flexGrow: 1, borderRadius: 10, backgroundColor: colors?.card,
                      marginHorizontal: 5, alignItems: 'center', 
                    }}>
                      <IconButton style={{ padding: 20 }}
                        name={item?.icon as any}
                        size={24}
                        color={item?.color}
                        onPress={item?.onPress}
                        onPressed={modalize?.current?.close}
                      />
                      <Text style={{ color: item?.color, fontSize: 12, 
                        position: 'absolute', bottom: 10
                      }}>{item?.title}</Text>
                    </View>
                  ))}
                </View>
                // <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>{'Produto'}</Text>
              }
              data={users?.filter(item => item?._id)?.map(item => ({
                key: item?._id,
                icon: item?._id === user?._id  ? "check-circle" : "circle",
                color: item?._id === user?._id ? colors.primary : colors.text,
                uri: item?.uri,
                title: item?._id ? item?.name ? item?.name : item?.email : 'Visitante',
                onPress: () => {
                  signIn(item?.email, item?.password)
                  rootNavigation.dispatch({
                    ...StackActions.replace('Root', { screen: 'TabStoreMain' }),
                    source: route.key,
                  })
                }
              })) || []}
              contentContainerStyle={{ flexGrow: 1 }}
              keyExtractor={(item, index) => `${item?.key}-${index}`}
              renderItem={({ item, index }) => 
                <CardLink style={{
                    backgroundColor: colors.card,
                    borderTopLeftRadius: index === 0 ? 10 : 0, borderTopRightRadius: index === 0 ? 10 : 0,
                    borderBottomLeftRadius: index === users?.filter(item => item?._id)?.length-1 ? 10 : 0, borderBottomRightRadius: index === users?.filter(item => item?._id)?.length-1 ? 10 : 0,
                    marginTop: index === 0 ? 10 : 0, marginBottom: index === users?.filter(item => item?._id)?.length-1 ? 10 : 0,
                    marginHorizontal: 10,
                    borderColor: colors.border, borderBottomWidth: index !== users?.filter(item => item?._id)?.length-1 ? 1 : 0,
                  }}
                  border={false}
                  titleContainerStyle={{ padding: 10 }}
                  title={item?.title}
                  left={
                    item?.uri ? <Image source={{ uri: item?.uri, width: 24, height: 24 }} 
                      style={{ margin: 20, marginRight: 10, borderRadius: 40 }}
                    /> :
                    <MaterialIcons style={{ padding: 20, paddingRight: 10 }}
                      name={"account-circle"}
                      size={24}
                      color={item?.color}
                    />
                  }
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
                    title={'Visitante'}
                    left={
                      <MaterialIcons style={{ padding: 20, paddingRight: 10 }}
                        name={"account-circle"}
                        size={24}
                        color={!signed ? colors.primary : colors.text}
                      />
                    }
                    right={
                      <MaterialIcons style={{ padding: 20 }}
                        name={!signed  ? "check-circle" : "circle"}
                        size={24}
                        color={!signed ? colors.primary : colors.text}
                      />
                    }
                    color={signed ? colors.text : colors.primary}
                    onPress={() => {
                      signIn()
                      rootNavigation.dispatch({
                        ...StackActions.replace('Root', { screen: 'TabStoreMain' }),
                        source: route.key,
                      })
                    }}
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
          />
        </View>
      )
    })
  }, [user, users]))

  return (
      <PullToRefreshView
        offset={top}
        refreshing={refresh || resfreshing}
        onRefresh={() => { 
          if(signed) {
            signIn(user?.email, user?.password, true) 
            onLoad(true)
          }
          else { signIn(undefined, undefined, true) }
        }}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
          <FlatList style={{ flex: 1 }}
            contentContainerStyle={{ paddingTop: top, paddingBottom: bottom }}
            scrollIndicatorInsets={{ top, bottom }}
            ListHeaderComponent={
              <View style={{ 
                flex: 1
              }}>
                <ProfileCard style={{ 
                  paddingVertical: 10,
                  borderBottomWidth: 1, borderTopWidth: .5, borderColor: colors.border  
                }}
                  uri={user?.uri}
                  statusColor={colors.primary}
                  disabled={!signed}
                  onPress={() => rootNavigation.navigate('EditAccount', { id: user?._id })}
                  status={signed ? 'Conta Profissional' : 'Visitante'}
                  about={
                    signed ? [`Email: ${user?.email}`, 'Tel: 45781973', 'End: rua antonia de oliveira']
                    : 'Crie uma conta para acompanhar de perto tudo que há no app.'
                  }
                />

                <View style={{ 
                  marginTop: 20, marginBottom: -20,
                  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' 
                }}>
                  
                  {!!user?.stores?.length && <View style={{ flex: 1, padding: 10 }}>
                    <ContainerButton border transparent
                      title={'Visitar Loja'}
                      loading={false}
                      onSubimit={() => BottomHalfModal.show(modalize => 
                        <FlatList 
                          data={stores?.map(item => (
                            { key: item?._id, icon: 'store', color: colors.text, title: item?.name, onPress: () => navigation.navigate('Store', { store: item?.name }) }
                          ))}
                          contentContainerStyle={{ flexGrow: 1 }}
                          keyExtractor={(item, index) => `${item?.key}-${index}`}
                          renderItem={({ item, index }) => 
                            <CardLink style={{
                                backgroundColor: colors.card,
                                borderTopLeftRadius: index === 0 ? 10 : 0, borderTopRightRadius: index === 0 ? 10 : 0,
                                borderBottomLeftRadius: index === (stores?.length-1) ? 10 : 0, borderBottomRightRadius: index === (stores?.length-1) ? 10 : 0,
                                marginTop: index === 0 ? 10 : 0, marginBottom: index === (stores?.length-1) ? 10 : 0,
                                marginHorizontal: 10,
                              }}
                              border={index !== (stores?.length-1)}
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
                    />
                  </View>}
                  {signed ? <>
                  <View style={{ flex: 1, padding: 10 }}>
                    <ContainerButton border transparent
                      title={'Criar Loja'}
                      loading={false}
                      onSubimit={() => rootNavigation.navigate('MakeStore')}
                    />
                  </View>

                  </> : <>
                    <View style={{ flex: 1, padding: 10 }}>
                      <ContainerButton border transparent
                        title={'Conta Existente'}
                        loading={false}
                        onSubimit={() => rootNavigation.navigate('SignIn')}
                      />
                    </View>

                    <View style={{ flex: 1, padding: 10 }}>
                      <ContainerButton border transparent
                        title={'Nova Conta'}
                        loading={false}
                        onSubimit={() => rootNavigation.navigate('SignUp')}
                      />
                    </View>
                  </>}
                  
                </View>
              </View>
            }
            data={
              signed ? 
              [
                [
                  { icon: "favorite", color: '#ff345b', title: 'lista de desejos', onPress: () => navigation.navigate('Favorite') },
                  { icon: "bookmark", color: '#007bfe',title: 'lista de salvos', onPress: () => navigation.navigate('Saved') },
                  { icon: "help-outline", color: '#ffc601', title: 'ajuda', onPress: () => {} },
                  { icon: "lock-outline", color: '#09ada0', title: 'segurança', onPress: () => {} }
                ],
                [
                  { icon: "payment", color: '#35c759', title: 'plano', onPress: () => {} },
                  { icon: "loop", color: 'cornflowerblue', title: 'trocar de conta', onPress: () => rootNavigation.navigate('SignIn') },
                  { icon: "remove-circle-outline", color: '#59d970', title: 'remover conta', onPress: () => removeSign(user?._id) },
                  { icon: "exit-to-app", color: '#fd4337', title: 'sair da conta', onPress: () => signOut() },
                ]
              ]
                :
              [
                [
                  { icon: "favorite", color: '#ff345b', title: 'lista de desejos', onPress: () => navigation.navigate('Favorite') },
                  { icon: "bookmark", color: '#007bfe',title: 'lista de salvos', onPress: () => navigation.navigate('Saved') },
                  { icon: "help-outline", color: '#ffc601', title: 'ajuda', onPress: () => {} },
                  { icon: "lock-outline", color: '#09ada0', title: 'segurança', onPress: () => {} }
                ]
              ]
            }
            //  as  Array<{ icon: React.ComponentProps<typeof MaterialIcons>['name'], title: string, onPress: any }>}
             renderItem={({ item: section }) => (
              <View style={{ 
                backgroundColor: colors.card,
                borderTopWidth: 1, borderBottomWidth: 1, 
                borderColor: colors.border,
                marginTop: 40 
              }}>
                {section?.map((item, index) => <CardLink key={`${item?.title}-${index}`}
                  title={item?.title}
                  color={colors.text}
                  border={(section?.length-1) !== index}
                  onPress={item?.onPress}
                  tintColor={colors.border}
                  left={
                    <MaterialIcons 
                    style={{ 
                        backgroundColor: item?.color,
                        padding: 2, paddingTop: 3, 
                        margin: 10, marginRight: 20, 
                        borderRadius: 8, overflow: 'hidden', 
                        borderWidth: 1, borderColor: colors.border,
                      }} 
                      name={item?.icon as any} 
                      size={24} color={'white'} 
                    />}
                />)}
              </View>
              // <TouchableOpacity onPress={item?.onPress}>
              // <View style={{ padding: 5,backgroundColor: colors.card, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              //   <MaterialIcons style={{ padding: 10 }} name={item?.icon as any} size={24} color={colors.text} />
              //   <Text style={{ textTransform: 'capitalize', fontSize: 16, fontWeight: '500', color: colors.text, padding: 10, flex: 1, alignItems: 'flex-start', justifyContent: 'center', alignSelf: 'baseline', textAlign: 'left' }} >{item?.title}</Text>
              //   <MaterialIcons style={{ padding: 10 }} name="chevron-right" size={24} color={colors.text} />
              // </View>
              // </TouchableOpacity>
            )}
          />
    </PullToRefreshView>
  )
}
