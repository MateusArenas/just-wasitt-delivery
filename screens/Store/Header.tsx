import { MaterialIcons } from "@expo/vector-icons"
import { getPathFromState, useTheme } from "@react-navigation/native"
import { HeaderBackButton, HeaderTitle, StackScreenProps } from "@react-navigation/stack"
import { StackHeaderOptions, StackNavigationOptions } from "@react-navigation/stack/lib/typescript/src/types"
import React, { useContext } from "react"
import { SafeAreaView, Share, TouchableOpacity, View, Text } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import CardLink from "../../components/CardLink"
import IconButton from "../../components/IconButton"
import AuthContext from "../../contexts/auth"
import BottomHalfModalContext from "../../contexts/BottomHalfModal"
import useRootNavigation from "../../hooks/useRootNavigation"
import useUrl from "../../hooks/useUrl"
import LinkingConfiguration from "../../navigation/LinkingConfiguration"
import { RootStackParamList } from "../../types"

export const HeaderStore = ({ 
  navigation, 
  route 
} : StackScreenProps<RootStackParamList, 'Store'>) : Partial<StackNavigationOptions> => {
  const BottomHalfModal = React.useContext(BottomHalfModalContext)
  const { colors } = useTheme()
  return ({
    headerRight: ({ tintColor }) => (
      <SafeAreaView style={{ display: 'flex', flexDirection: 'row', }}>
        <IconButton 
          name="more-horiz" 
          size={24} 
          color={colors.text} 
          onPress={() => BottomHalfModal.show(modalize => 
            <FlatList 
              data={[
                { key: 0, title: `Compartilhar a loja ${route.params.store}`, onPress: () => Share.share({ title: route.params.store, url: '/', message: 'oi' }) },
              ]}
              keyExtractor={item => `${item?.key}`}
              renderItem={({ item }) => 
                <CardLink 
                  title={item?.title}
                  color={colors.text}
                  onPress={item?.onPress}
                  onPressed={modalize?.current?.close}
                />
              }
            />
          )} 
        />
        </SafeAreaView>
    ),
  })
}

export const HeaderStoreMain = ({ 
  navigation, 
  route,
} : StackScreenProps<RootStackParamList, 'Store'>) : Partial<StackNavigationOptions> => {
  const BottomHalfModal = React.useContext(BottomHalfModalContext)
  const { colors } = useTheme()
  const rootNavigation = useRootNavigation()
  const url = useUrl()
  return ({
    headerRight: ({ tintColor }) => (
      <SafeAreaView style={{ display: 'flex', flexDirection: 'row', }}>
        <IconButton 
          name={'add-circle-outline'}
          size={24} 
          color={colors.text} 
          onPress={() => BottomHalfModal.show(modalize => 
            <FlatList 
            ListHeaderComponent={
              <View>
                <View style={{ padding: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  {[
                    { key: 0, icon: 'local-offer', title: 'Produto', onPress: () => rootNavigation.navigate('MakeProduct', { store: route.params?.store })},
                    { key: 1, icon: 'tag', title: 'Categoria', onPress: () => rootNavigation.navigate('MakeCategory', { store: route.params?.store })},
                    { key: 2, icon: 'anchor', title: 'Promoção', onPress: () => rootNavigation.navigate('MakePromotion', { store: route.params?.store })},
                  ].map(item => (
                    <View style={{ 
                      padding: 10, paddingTop: 0,
                      flexGrow: 1, borderRadius: 10, backgroundColor: colors?.card,
                      marginHorizontal: 5, alignItems: 'center', 
                    }}>
                      <IconButton style={{ padding: 20 }}
                        name={item?.icon as any}
                        size={24}
                        color={colors.primary}
                        onPress={item?.onPress}
                        onPressed={modalize?.current?.close}
                      />
                      <Text style={{ color: colors.primary, fontSize: 12, 
                        position: 'absolute', bottom: 10
                      }}>{item?.title}</Text>
                    </View>
                  ))}
                </View>

                <View style={{ padding: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  {[
                    { key: 0, icon: 'work', title: 'Serviço', onPress: () => rootNavigation.navigate('MakeProduct', { store: route.params?.store })},
                    { key: 1, icon: 'local-attraction', title: 'Cupom', onPress: () => rootNavigation.navigate('MakeCategory', { store: route.params?.store })},
                    { key: 2, icon: 'local-fire-department', title: 'Liquidação', onPress: () => rootNavigation.navigate('MakePromotion', { store: route.params?.store })},
                  ].map(item => (
                    <View style={{ 
                      padding: 10, paddingTop: 0,
                      flexGrow: 1, borderRadius: 10, backgroundColor: colors?.card,
                      marginHorizontal: 5, alignItems: 'center', 
                    }}>
                      <IconButton style={{ padding: 20 }}
                        name={item?.icon as any}
                        size={24}
                        color={colors.primary}
                        onPress={item?.onPress}
                        onPressed={modalize?.current?.close}
                      />
                      <Text style={{ color: colors.primary, fontSize: 12, 
                        position: 'absolute', bottom: 10
                      }}>{item?.title}</Text>
                    </View>
                  ))}
                </View>
{/* 
                <Text style={{ 
                  padding: 10, textAlign: 'center', opacity: .5, 
                  fontSize: 12, color: colors.text 
                }}>{'Escolha uma das opções a cima a ser adicionada'}</Text> */}
              </View>
            }
            data={[]}
            contentContainerStyle={{ flexGrow: 1 }}
            keyExtractor={item => `${item?.key}`}
            renderItem={({ item, index }) => 
              <CardLink style={{
                  backgroundColor: colors.card,
                  borderTopLeftRadius: index === 0 ? 10 : 0, borderTopRightRadius: index === 0 ? 10 : 0,
                  borderBottomLeftRadius: index === 1 ? 10 : 0, borderBottomRightRadius: index === 1 ? 10 : 0,
                  marginTop: index === 0 ? 10 : 0, marginBottom: index === 1 ? 10 : 0,
                  marginHorizontal: 10,
                }}
                border={index !== 1}
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
            ListFooterComponentStyle={{ margin: 10, borderRadius: 10, backgroundColor: colors.card }}
            ListFooterComponent={
              <CardLink border={false}
                titleContainerStyle={{ alignItems: 'center' , padding: 10 }}
                title={'Cancelar'}
                right={null}
                color={colors.text}
                onPress={modalize?.current?.close}
              />
            }
          />
          )} 
        />
        <IconButton 
          name="menu" 
          size={24} 
          color={colors.text} 
          onPress={() => BottomHalfModal.show(modalize => 
            <FlatList
            ListHeaderComponentStyle={{ padding: 5 }}
            ListHeaderComponent={
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                {[
                  { key: 0, icon: 'share', color: colors.text, title: 'Compartilhar', onPress: () => navigation.navigate('MakeProduct', { store, id })},
                  { key: 1, icon: 'link', color: colors.text, title: 'Link', onPress: () => navigation.navigate('MakeProduct', { store, id })},
                  { key: 2, icon: 'sim-card-alert', color: 'red', title: 'Denunciar', onPress: () => {} },
                ].map(item => (
                  <View style={{ 
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
            data={
              [
                { key: 0, icon: 'account-circle', color: colors.text, title: 'Conta', onPress: () => navigation.navigate('Account')},
                { key: 1, icon: 'business', color: colors.text, title: 'Pedidos', onPress: () => navigation.navigate('Orders', { store: route.params?.store })},
                { key: 2, icon: 'delete', color: 'red', title: 'Remover', onPress: async function onRemove () {
                  try {
                    // await ProductService.remove({ store, id })
                    // navigation.replace('Store', { store })
                  } catch(err) {
              
                  }
                } },
              ]
            }
            contentContainerStyle={{ flexGrow: 1 }}
            keyExtractor={(item, index) => `${item?.key}-${index}`}
            renderItem={({ item, index }) => 
              <CardLink style={{
                  backgroundColor: colors.card,
                  borderTopLeftRadius: index === 0 ? 10 : 0, borderTopRightRadius: index === 0 ? 10 : 0,
                  borderBottomLeftRadius: index === 2 ? 10 : 0, borderBottomRightRadius: index === 2 ? 10 : 0,
                  marginTop: index === 0 ? 10 : 0, marginBottom: index === 2 ? 10 : 0,
                  marginHorizontal: 10,
                }}
                border={index !== 2}
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
                  title={'Sobre'}
                  right={
                    <MaterialIcons style={{ padding: 20 }}
                      name={'info-outline'}
                      size={24}
                      color={colors.text}
                    />
                  }
                  color={colors.text}
                  onPress={() => navigation.navigate('StoreInfo', { store: route?.params?.store })}
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
      </SafeAreaView>
    ),
  })
}