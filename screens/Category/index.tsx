import { HeaderTitle, StackScreenProps, useHeaderHeight } from "@react-navigation/stack";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Text, useWindowDimensions, Animated, ScrollView, Platform } from 'react-native';
import { TextInput, View, FlatList } from "react-native";
import {  TouchableOpacity } from "react-native-gesture-handler";
import Card from "../../components/Card";
import IconButton from "../../components/IconButton";
import useService from "../../hooks/useService";
import { RootStackParamList } from "../../types";
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
import { CollapsibleSubHeaderAnimator, useCollapsibleSubHeader } from "react-navigation-collapsible";
import KeyboardSpacer from "../../components/KeyboardSpacer";
import SearchBar from "../../components/SearchBar";
import { useDebounce } from "../../hooks/useDebounce";
import api from "../../services/api";
import { CategoryData } from "../../services/category";
import * as CategoryService from '../../services/category';
import { PullToRefreshView } from "../../components/PullToRefreshView";
import { MaterialIcons } from "@expo/vector-icons";
import HeaderSubTitle from "../../components/HeaderSubTitle";
import BottomHalfModalBoard from "../../components/BottomHalfModalBoard";
import gql from "graphql-tag";
import { useQuery, useLazyQuery, NetworkStatus, useMutation } from "@apollo/client";
import { CATEGORY, REMOVE_CATEGORY } from "./graphql";
import { STORE_NAME } from "../Store/graphql";
import CatalogTemplate from "../../templates/Catalog";

const NUM_ITEMS_PER_PAGE = 6;

export default function Category ({
  navigation,
  route
}: StackScreenProps<RootStackParamList, 'Category'>)  {
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

  const [name, setName] = useState("")

  const search = useDebounce(name, 250)

  const { called, loading, error, data, refetch, fetchMore, networkStatus } = useQuery(
    CATEGORY, 
    { 
      variables: {
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

  const [mutateFunction, { loading: preparing, error: err  }] = useMutation(REMOVE_CATEGORY, {
    refetchQueries: [
      STORE_NAME, // DocumentNode object parsed with gql
      'CurrentStore' // Query name
    ],
  });

  async function onRemove () {
    try {
      await mutateFunction({ variables: { id: data?.category?._id } })
      navigation.goBack()
    } catch(err) {}
  }

  const BottomHalfModal = React.useContext(BottomHalfModalContext)
  
  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      headerTitle: props => 
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <HeaderSubTitle onPress={() => navigation.navigate('Store', { store })}>{store}</HeaderSubTitle>
          <HeaderTitle {...props} >{data?.category?.name}</HeaderTitle>
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
            onPress={() => BottomHalfModal.show(modalize =>
              <BottomHalfModalBoard rendered={{ data: data?.category?.self }}
                onClose={modalize?.current?.close}
                boardData={[
                  { icon: 'share', color: colors.text, title: 'Compartilhar', onPress: () => {} },
                  { icon: 'link', color: colors.text, title: 'Link', onPress: () => {} },
                  { icon: 'store', color: colors.text, title: store, onPress: () => navigation.navigate('Store', { store }) },
                ]}
                data={[
                  { icon: 'add-circle-outline', color: colors.primary, hover: colors.primary, title: 'Criar', onPress: () => navigation.navigate('MakeCategory', { store })},
                  { icon: 'edit', color: colors.text, title: 'Editar', onPress: () => navigation.navigate('MakeCategory', { store, slug })},
                  { icon: 'delete', color: colors.notification, hover: colors.notification, title: 'Remover', onPress: onRemove },
                ]}
              />
            )} 
          />
        </View>
      ),
    });
  }, [navigation, data]))

  const web = Platform.OS === 'web';

  if (preparing) return <Loading />

  return (
    <View style={{ flex: 1 }}>
      <PullToRefreshView
          offset={top}
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
