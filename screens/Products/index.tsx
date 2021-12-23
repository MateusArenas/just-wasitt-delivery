import { HeaderTitle, StackScreenProps, useHeaderHeight } from "@react-navigation/stack";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Text, useWindowDimensions, Animated, FlatList, StyleProp, ViewStyle } from 'react-native';
import { View } from "react-native";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import Card from "../../components/Card";
import IconButton from "../../components/IconButton";
import useService from "../../hooks/useService";
import { RootStackParamList } from "../../types";
import * as ProductService from '../../services/product';
import { ProductData } from '../../services/product'
import useRootNavigation from "../../hooks/useRootNavigation";
import Loading from "../../components/Loading";
import NotFound from "../../components/NotFound";
import Refresh from "../../components/Refresh";
import Product from "../../models/Product";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useScrollToTop, useTheme } from "@react-navigation/native";
import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import SearchBar from "../../components/SearchBar";
import KeyboardSpacer from '../../components/KeyboardSpacer';
import { useCollapsibleSubHeader, CollapsibleSubHeaderAnimator } from 'react-navigation-collapsible';
import { useDebounce } from "../../hooks/useDebounce";
import api from "../../services/api";
import { AxiosError } from "axios";
import { PullToRefreshView } from "../../components/PullToRefreshView";
import { gql, NetworkStatus, useQuery } from "@apollo/client";
import HeaderSubTitle from "../../components/HeaderSubTitle";
import CatalogTemplate from "../../templates/Catalog";
import BottomHalfModalBoard from "../../components/BottomHalfModalBoard";
import BottomHalfModalContext from "../../contexts/BottomHalfModal";

const NUM_ITEMS_PER_PAGE = 6;
const PRODUCTS = gql`
query CurrentProducts(
  $name: String,
  $storeName: ID!,
  $offset: Int!,
  $limit: Int!,
  $regex: [String],
) {
  totalCount(
    model: "product", 
    match: { store: { name: $storeName }, name: $name },
    options: { skip: $offset, limit: $limit, regex: $regex } 
  )

  products (
    match: { store: { name: $storeName }, name: $name }, 
    options: { skip: $offset, limit: $limit, regex: $regex } 
  ) { 
    _id, uri, name, about, price, offset, single, slug,
    promotions { _id, name, percent  }
  }
}
`;

export default function Products ({
  navigation,
  route
}: StackScreenProps<RootStackParamList, 'Products'>)  {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0

  const ref = React.useRef<FlatList>(null)
  
  useScrollToTop(ref)
  
  const { colors } = useTheme()
  const { width } = useWindowDimensions()
  const { store } = route.params

  const [name, setName] = useState('')

  const search = useDebounce(name, 250)

  const {
    onScroll,
    containerPaddingTop,
    scrollIndicatorInsetTop,
    translateY,
  } = useCollapsibleSubHeader()
  
  const { called, loading, error, data, refetch, fetchMore, networkStatus } = useQuery(
    PRODUCTS, 
    { 
      variables: {
        storeName: store,
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

  const BottomHalfModal = React.useContext(BottomHalfModalContext)

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      headerTitle: props => 
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <HeaderSubTitle onPress={() => navigation.navigate('Store', { store })}>{store}</HeaderSubTitle>
          <HeaderTitle {...props}>{'Catálogo'}</HeaderTitle>
        </View>
      ,
      headerRight: ({ tintColor }) => (
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
            onPress={() => BottomHalfModal.show(modalize => (
                <BottomHalfModalBoard 
                  boardData={[
                    { icon: 'share', color: colors.text, title: 'Compartilhar', onPress: () => navigation.navigate('Store', { store })},
                    { icon: 'link', color: colors.text, title: 'Link', onPress: () => navigation.navigate('Store', { store })},
                    { icon: 'store', color: colors.text, title: store, onPress: () => navigation.navigate('Store', { store }) },
                  ]}
                  onClose={modalize?.current?.close}
                />
              )
            )}
          />
        </View>
      ),
    });
  }, [navigation, colors]))

  // if (!network) return <Refresh onPress={() => navigation.replace('Products', { store })}/>

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

