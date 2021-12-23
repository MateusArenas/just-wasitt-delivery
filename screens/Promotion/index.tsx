import { HeaderTitle, StackScreenProps, useHeaderHeight } from "@react-navigation/stack";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Animated, Text, TextInput, useWindowDimensions } from 'react-native';
import { View, FlatList } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Card from "../../components/Card";
import IconButton from "../../components/IconButton";
import useService from "../../hooks/useService";
import { RootStackParamList } from "../../types";
import * as PromotionService from '../../services/promotion';
import { ProductData } from '../../services/product'
import useRootNavigation from "../../hooks/useRootNavigation";
import Loading from "../../components/Loading";
import NotFound from "../../components/NotFound";
import Refresh from "../../components/Refresh";
import Product from "../../models/Product";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useScrollToTop, useTheme } from "@react-navigation/native";
import BottomHalfModalContext from '../../contexts/BottomHalfModal'
import AuthContext from "../../contexts/auth";
import CardLink from "../../components/CardLink";
import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs";
import KeyboardSpacer from "../../components/KeyboardSpacer";
import { CollapsibleSubHeaderAnimator, useCollapsibleSubHeader } from "react-navigation-collapsible";
import SearchBar from "../../components/SearchBar";
import { useDebounce } from "../../hooks/useDebounce";
import { PromotionData } from "../../services/promotion";
import api from "../../services/api";
import { PullToRefreshView } from "../../components/PullToRefreshView";
import { MaterialIcons } from "@expo/vector-icons";
import { gql, NetworkStatus, useQuery } from "@apollo/client";
import BottomHalfModalBoard from "../../components/BottomHalfModalBoard";
import HeaderSubTitle from "../../components/HeaderSubTitle";
import CatalogTemplate from "../../templates/Catalog";

const NUM_ITEMS_PER_PAGE = 6;
const PROMOTION = gql`
query CurrentProducts(
  $name: String,
  $slug: String!,
  $storeName: ID!,
  $offset: Int!,
  $limit: Int!,
  $regex: [String],
) {
  totalCount(
    model: "product", 
    match: { store: { name: $storeName }, promotions: { slug: $slug }, name: $name },
    options: { regex: $regex, model: { promotions: "Promotion" } } 
  )

  products (
    match: { store: { name: $storeName }, promotions: { slug: $slug }, name: $name }, 
    options: { 
      skip: $offset, 
      limit: $limit, 
      regex: $regex,
      model: { promotions: "Promotion" }
    } 
  ) { 
    _id, uri, name, about, price, offset, single, slug,
    promotions { _id, name, percent  }
  }

  promotion(match: { store: { name: $storeName }, slug: $slug } ) {
    _id, name, self, slug
    # store { _id, minDeliveryBuyValue, delivery, deliveryTimeMin, deliveryTimeMax, deliveryPrice }
  }
}
`;

export default function Promotion ({
  navigation,
  route
}: StackScreenProps<RootStackParamList, 'Promotion'>)  {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0

  const FlatListRef = React.useRef<FlatList>(null)
  const InputRef = React.useRef<TextInput>(null)
  
  useScrollToTop(FlatListRef)
  
  const { user } = useContext(AuthContext)
  const { colors } = useTheme()
  const rootNavigation = useRootNavigation()
  const { width } = useWindowDimensions()
  const { store, slug } = route.params
  const BottomHalfModal = React.useContext(BottomHalfModalContext)

  const [name, setName] = useState('')

  const search = useDebounce(name, 250)

  const {
    onScroll,
    containerPaddingTop,
    scrollIndicatorInsetTop,
    translateY,
  } = useCollapsibleSubHeader()

  const { called, loading, error, data, refetch, fetchMore, networkStatus } = useQuery(
    PROMOTION, 
    { 
      variables: {
        storeName: store,
        slug,
        name: search,
        regex: ["name"], 
        offset: 0, 
        limit: NUM_ITEMS_PER_PAGE, 
      },
      notifyOnNetworkStatusChange: true,
    }
  )

  useEffect(() => { refetch() }, [search])

  function loadPagination () {
    if (!loading && (data?.products?.length < data?.totalCount)) { 
      fetchMore({
        variables: { 
          offset: data?.products?.length,
        }
      })
    }
  }


  async function onRemove () {
    try {
      await PromotionService.remove({ store, id: data?.promotion?._id })
      navigation.replace('Store', { store })
    } catch(err) {

    }
  }

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      title: data?.promotion?.name,
      headerTitle: props => 
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <HeaderSubTitle onPress={() => navigation.navigate('Store', { store })}>{store}</HeaderSubTitle>
          <HeaderTitle {...props} />
        </View>
      ,
      headerRight: ({tintColor}) => (
        <View style={{ alignItems: 'center', flexDirection: 'row', paddingHorizontal: 10 }}>
          <IconButton 
            name="shopping-bag"
            size={24}
            color={colors.text}
            onPress={() => navigation.navigate('Bag', { store })}
          />
          <IconButton 
            name="more-horiz"
            size={24}
            color={colors.text}
            onPress={() => BottomHalfModal.show(modalize => 
              <BottomHalfModalBoard rendered={{ data: data?.promotion?.self }}
                onClose={modalize?.current?.close}
                boardData={[
                  { icon: 'share', color: colors.text, title: 'Compartilhar', onPress: () => {} },
                  { icon: 'link', color: colors.text, title: 'Link', onPress: () => {} },
                  { icon: 'store', color: colors.text, title: store, onPress: () => navigation.navigate('Store', { store }) },
                ]}
                data={[
                  { icon: 'add-circle-outline', color: colors.primary, hover: colors.primary, title: 'Criar', onPress: () => navigation.navigate('MakePromotion', { store })},
                  { icon: 'edit', color: colors.text, title: 'Editar', onPress: () => navigation.navigate('MakePromotion', { store, slug })},
                  { icon: 'delete', color: colors.notification, hover: colors.notification, title: 'Remover', onPress: onRemove },
                ]}
              />
            )} 
          />
        </View>
      ),
    });
  }, [navigation, data]))

  // if (!network) return <Refresh onPress={() => navigation.replace('Promotion', { store, slug })}/>
  
  return (
    <View style={{ flex: 1 }}>
      <PullToRefreshView
          offset={containerPaddingTop-10}
          disabled={(networkStatus === NetworkStatus.refetch && loading)}
          refreshing={(networkStatus === NetworkStatus.refetch && loading)}
          onRefresh={refetch}
          style={{ flex: 1, backgroundColor: colors.background }}
        >
            <CatalogTemplate store={store}
              data={data?.products}
              handleProduct={params => navigation.navigate('Product', params)}
              loading={loading} loadPagination={loadPagination}
              networkStatus={networkStatus}
              text={name}
              onChangeText={setName}
            />
        </PullToRefreshView>
    </View>
  )
}
