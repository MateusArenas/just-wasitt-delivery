import { HeaderTitle, StackScreenProps, useHeaderHeight } from "@react-navigation/stack";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Text, useWindowDimensions, Animated, ScrollView, Platform } from 'react-native';
import { TextInput, View, FlatList } from "react-native";
import { RootStackParamList } from "../../types";
import { ProductData } from '../../services/product'
import Loading from "../../components/Loading";
import Product from "../../models/Product";
import { useFocusEffect, useScrollToTop, useTheme } from "@react-navigation/native";
import AuthContext from "../../contexts/auth";
import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs";
import KeyboardSpacer from "../../components/KeyboardSpacer";
import SearchBar from "../../components/SearchBar";
import { NetworkStatus } from "@apollo/client";
import useMediaQuery from "../../hooks/useMediaQuery";

interface CatalogTemplateProps {
    store: string
    data: ProductData[]
    text?: string
    onChangeText?: (text: string) => any
    loading?: boolean
    networkStatus?: any
    loadPagination?: () => any
    handleProduct: (item: any) => any
}

const CatalogTemplate = React.forwardRef<FlatList, CatalogTemplateProps>(({
    text, onChangeText,
    loading, networkStatus,
    loadPagination, handleProduct=()=>{},
    store, data,
    ...props
}, forwardRef) => {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0

  const ref = React.useRef<FlatList>(null)
  
  React.useImperativeHandle(forwardRef, () => ref?.current, [ref]);

  useScrollToTop(ref)
  
  const { user } = useContext(AuthContext)
  const { colors } = useTheme()
  const { width } = useWindowDimensions()

  const web = Platform.OS === 'web';

  const { isDesktop } = useMediaQuery()

  return (
    <View style={{ flex: 1 }}>
          <FlatList ref={ref} {...props}
            style={[{ flex: 1, padding: 2 }, web && { paddingTop: top, paddingBottom: bottom  }]}
            contentContainerStyle={[
              { flexGrow: 1 },
              { marginTop: top, paddingBottom: bottom+top },
              web && { marginTop: 0, paddingBottom: 0 },
              isDesktop && { paddingHorizontal: '10%' }
            ]}
            ListHeaderComponent={
              <View style={{ padding: 20 }}>
                <SearchBar containerStyle={[
                  web && { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }
                ]}
                  placeholder={'Buscar'}
                  value={text}
                  onChangeText={onChangeText}
                />
              </View>
            }
            scrollIndicatorInsets={{ top: top, bottom }}
            stickyHeaderIndices={[0]}
            ListEmptyComponent={
              loading ? <Loading /> :
              <View style={{ 
                flex: 1, alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ 
                  textAlign: 'center', textAlignVertical: 'center',
                  fontSize: 24, fontWeight: 'bold',
                  color: colors.text
                }}>{'Nenhum resultado'}</Text>
                <Text style={{
                  textAlign: 'center', textAlignVertical: 'center',
                  fontSize: 16, 
                  color: colors.text, opacity: .8,
                }}>{`para: "${text}""`}</Text>
              </View>
            }
            ListFooterComponentStyle={{ padding: 20 }}
            ListFooterComponent={
              ((networkStatus === NetworkStatus.fetchMore && loading) 
              && data?.length > 0) && <Loading />
            }
            onEndReached={loadPagination}
            onEndReachedThreshold={0.1}
            data={data}
            numColumns={isDesktop ? 4 : 2}
            columnWrapperStyle={{ flex: 1 }}
            keyExtractor={(item, index) => `${item?._id}-${index}`}
            renderItem={({ item } : { item: ProductData }) => (
              <View style={[{ padding: 2, width: '50%' }, isDesktop && { width: '25%', padding: 10 }]}>
                <Product 
                  store={store}
                  data={{...item, about: null}}
                  height={isDesktop ? 200 : width/3} 
                  onPress={() => handleProduct({ slug: item?.slug, store })}
                  />
              </View>
            )}
            />
      <KeyboardSpacer topSpacing={-bottom} />
    </View>
  )
})

export default CatalogTemplate;