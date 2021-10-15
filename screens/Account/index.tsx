import { MaterialIcons } from '@expo/vector-icons';
import { StackActions, useFocusEffect, useTheme } from '@react-navigation/native';
import { StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useContext, useEffect } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
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

  const BottomHalfModal = React.useContext(BottomHalfModalContext)

  const rootNavigation = useRootNavigation()

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      headerTitleAlign: 'left',
      headerRight: ({ tintColor }) => 
        <View style={{ flexDirection: 'row', paddingHorizontal: 10 }}>
          <TextButton 
            label={'Editar'} 
            fontSize={16} 
            color={colors.primary} 
            onPress={() => rootNavigation.navigate('EditAccount', { id: user?._id })} 
          />
        </View>
      ,
      headerTitle: ({ tintColor, ...props }) => (
        <View style={{ display: 'flex', flexDirection: 'row', }}>
          <IconButton style={{ padding: 0 }}
            label={user?._id ? user?.name ? user?.name : user?.email : 'Visitante'} 
            name="expand-more" color={colors.text} size={24}
            onPress={() => BottomHalfModal.show(modalize =>
              <FlatList 
                data={users?.map(user => ({
                  key: user?._id,
                  title: user?._id ? user?.name ? user?.name : user?.email : 'Visitante',
                  onPress: () => {
                    signIn(user?.email, user?.password)
                    rootNavigation.dispatch({
                      ...StackActions.replace('Root', { screen: 'TabStoreMain' }),
                      source: route.key,
                    })
                  }
                })) || []}
                keyExtractor={item => `${item?.key}`}
                renderItem={({ item, index }) => 
                  <CardLink
                    title={item?.title}
                    color={colors.text}
                    border={(users?.length-1) !== index}
                    onPress={item?.onPress}
                    onPressed={modalize?.current?.close}
                    left={
                      <MaterialIcons style={{ padding: 10 }}
                        name={'account-circle'}
                        size={24+10}
                        color={colors.text}
                      />
                    }
                    right={
                      <MaterialIcons style={{ padding: 10 }}
                        name={item?.key === user?._id  ? "check-circle" : "circle"}
                        size={24}
                        color={item?.key === user?._id ? colors.primary : colors.border}
                      />
                    }
                  />
                }
                ListFooterComponent={
                  <View style={{ 
                    marginTop: 10,
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' 
                  }}>
                    <View style={{ flex: 1, padding: 10 }}>
                      <ContainerButton transparent border
                        title={'Conta existente'}
                        loading={false}
                        onSubimit={() => rootNavigation.navigate('SignIn')}
                        onSubimiting={modalize?.current?.close}
                      />
                    </View>
                    <View style={{ flex: 1, padding: 10 }}>
                      <ContainerButton transparent border
                        title={'Nova conta'}
                        loading={false}
                        onSubimit={() => rootNavigation.navigate('SignUp')}
                        onSubimiting={modalize?.current?.close}
                      />
                    </View>
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
        refreshing={refresh}
        onRefresh={() => { if(!!user) signIn(user?.email, user?.password, true) }}
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
                          data={user?.stores?.map(item => (
                            { key: item?._id, icon: 'store', color: colors.text, title: item?.name, onPress: () => navigation.navigate('Store', { store: item?.name }) }
                          ))}
                          contentContainerStyle={{ flexGrow: 1 }}
                          keyExtractor={item => `${item?.key}`}
                          renderItem={({ item, index }) => 
                            <CardLink style={{
                                backgroundColor: colors.card,
                                borderTopLeftRadius: index === 0 ? 10 : 0, borderTopRightRadius: index === 0 ? 10 : 0,
                                borderBottomLeftRadius: index === (user?.stores?.length-1) ? 10 : 0, borderBottomRightRadius: index === (user?.stores?.length-1) ? 10 : 0,
                                marginTop: index === 0 ? 10 : 0, marginBottom: index === (user?.stores?.length-1) ? 10 : 0,
                                marginHorizontal: 10,
                              }}
                              border={index !== (user?.stores?.length-1)}
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
                {section?.map((item, index) => <CardLink key={item?.title}
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
