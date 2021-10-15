import { useNavigation, useTheme } from '@react-navigation/native';
import React, { useContext } from 'react';
import { SafeAreaView, TouchableOpacity, TouchableWithoutFeedback, View, Text, Image, useWindowDimensions } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import SwiperFlatList, { Pagination } from 'react-native-swiper-flatlist';
import BottomHalfModalContext from '../../../contexts/BottomHalfModal';
import BottomHalfModal from '../../../contexts/BottomHalfModal';
import useRootNavigation from '../../../hooks/useRootNavigation';
import { CategoryData } from '../../../services/category';
import { StoreDate } from '../../../services/store';
import IconButton from '../../IconButton';
// import { Product2 } from '../../../Product';

interface ProductsProps {
  data: Array<CategoryData>
}

const Products: React.FC<ProductsProps> = ({ data }) => {
  const { width } = useWindowDimensions()
  const { colors } = useTheme()
  const rootNavigation = useRootNavigation()
  const BottomHalfModal = useContext(BottomHalfModalContext)
  const navigation = useNavigation()

  return (
    <FlatList 
      style={{ flex: 1 }}
      data={data}
      ItemSeparatorComponent={() => <View style={{ height: 1, width: '100%', backgroundColor: colors.border }}/>}
      renderItem={({ item: category }) => (
      //   <View style={{ flex: 1 }}>
      //     <ProductHeader store={category?.store}/>
      //     <View>        
      //       <SwiperFlatList horizontal
      //         style={{ paddingTop: 40 }}
      //         PaginationComponent={(props) => 
      //           <View style={{ 
      //             width: '100%',
      //             backgroundColor: colors.card,
      //             position: 'absolute',
      //             top: 0,
      //             padding: 10,
      //             flexDirection: 'row',
      //             justifyContent: 'space-between',
      //             alignItems: 'center',
      //           }}>
      //             <View style={{ flex: 1, alignItems: 'flex-start' }}>
      //               <TouchableWithoutFeedback onPress={() => rootNavigation.navigate('Store', { screen: 'Category', store: category?.store?.name, category: category?.name })}>
      //                 <Text numberOfLines={1} style={{ minHeight: 20, textTransform: 'capitalize', fontWeight: '500', color: colors.primary }}>{'#'+category.name}</Text>
      //               </TouchableWithoutFeedback>
      //             </View>
      //             <View style={{ flex: 1, alignItems: 'center' }}>
      //               <Pagination 
      //                 {...props} 
      //                 paginationStyle={{ position: 'relative', margin:0, alignItems: 'center' }} 
      //                 paginationStyleItem={{ width: 6, height: 6, marginHorizontal: 4, marginVertical: 0 }} 
      //                 paginationActiveColor={colors.primary}
      //                 paginationDefaultColor={colors.border}
      //               />
      //             </View>
      //             <View style={{ flex: 1, alignItems: 'flex-end' }}>
      //               <Text style={{
      //                 color: colors.text,
      //                 fontSize: 12,
      //                 fontWeight: '500',
      //                 paddingRight: 10,
      //               }}>{props.paginationIndex+1 + ' / ' + props.size}</Text>
      //             </View>
      //           </View>
      //         }
      //         index={0}
      //         showPagination
      //         data={category?.products}
      //         renderItem={({ item }) => 
      //           <SafeAreaView style={{ width }}>
      //             <Product2
      //               onPressCategories={() => BottomHalfModal.show({
      //                 data: item?.categories?.map(_category => 
      //                   ({ title: _category?.name, onPress: () => rootNavigation.navigate('Store', { screen: 'Category', category: _category?.name, store: category?.store?.name })  })
      //                 ),
      //                 renderItem: ({ item }) => (
      //                   <TouchableOpacity onPress={item?.onPress}>
      //                     <View style={{ flex: 1, paddingHorizontal: 10 }}>
      //                       <Text style={{ fontSize: 16, textTransform: 'capitalize', color: colors.text, fontWeight: '500', padding: 10 }}>{item?.title}</Text>
      //                     </View>
      //                   </TouchableOpacity>
      //                 ) 
      //               })}
      //               categories={[category?.name]}
      //               onPress={() => 
      //                 rootNavigation.navigate('Store', { screen: 'Product', category: category?.name, name: item?.name, store: category?.store?.name })
      //               }
      //               name={item?.name}
      //               uri={item?.uri}
      //               about={item?.about}
      //               price={item?.price}
      //               onSubmit={async ({ quantity, comment }) => {
      //                 try {
      //                   await Cart.save({ store: category?.store?.name, product: item._id, quantity, comment })
      //                   navigation.goBack()
      //                 } catch (err) {
                  
      //                 }
      //               }}
      //             />
      //           </SafeAreaView>
      //         }
      //       />
      //   </View>
      // </View>
      )}
    />
  )
}

export default Products;


