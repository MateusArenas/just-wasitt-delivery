import { NavigationProp, useNavigation, useTheme } from '@react-navigation/native';
import React, { useContext } from 'react';
import { SafeAreaView, View, Text, Image, useWindowDimensions } from 'react-native';
import { TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import SwiperFlatList, { Pagination } from 'react-native-swiper-flatlist';
import BottomHalfModalContext from '../../contexts/BottomHalfModal';
import useRootNavigation from '../../hooks/useRootNavigation';
import { CategoryData } from '../../services/category';
// import Product2 from '../../components/Product';
import { StoreDate } from '../../services/store';
import IconButton from '../../components/IconButton';
import Product from '../Product';
import { RootStackParamList } from '../../types';

interface CategoryProps {
  data: CategoryData
}

const Category: React.FC<CategoryProps> = ({ data }) => {
  const { width } = useWindowDimensions()
  const { colors } = useTheme()
  const rootNavigation = useRootNavigation()
  const BottomHalfModal = useContext(BottomHalfModalContext)
  const navigation = useNavigation<NavigationProp<RootStackParamList, 'Category'>>()
  return (
      <View style={{ flex: 1 }}>
        <CategoryHeader store={data?.store}/>
        <View>        
          <SwiperFlatList horizontal
            style={{ paddingTop: 40 }}
            PaginationComponent={(props) => 
              <View style={{ 
                width: '100%',
                backgroundColor: colors.card,
                position: 'absolute',
                top: 0,
                padding: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <View style={{ flex: 1, alignItems: 'flex-start' }}>
                  <TouchableWithoutFeedback onPress={() => rootNavigation.navigate('Store', { screen: 'Category', store: data?.store?.name, category: data?.name })}>
                    <Text numberOfLines={1} style={{ minHeight: 20, textTransform: 'capitalize', fontWeight: '500', color: colors.text }}>{data.name}</Text>
                  </TouchableWithoutFeedback>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Pagination 
                    {...props} 
                    paginationStyle={{ position: 'relative', margin:0, alignItems: 'center' }} 
                    paginationStyleItem={{ width: 6, height: 6, marginHorizontal: 4, marginVertical: 0 }} 
                    paginationActiveColor={colors.primary}
                    paginationDefaultColor={colors.border}
                  />
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={{
                    color: colors.text,
                    fontSize: 12,
                    fontWeight: '500',
                    paddingRight: 10,
                  }}>{props.paginationIndex+1 + ' / ' + props.size}</Text>
                </View>
              </View>
            }
            index={0}
            showPagination
            data={data?.products}
            renderItem={({ item }) => 
              <SafeAreaView style={{ width }}>
                <TouchableOpacity onPress={() => navigation.navigate('Product', { id: item?.id, store: data?.store?.name })}>
                  <Product data={item}/>
                </TouchableOpacity>
                {/* <Product2
                  // onPressCategories={() => BottomHalfModal.show({
                  //   data: item?.categories?.map(_category => 
                  //     ({ title: _category?.name, onPress: () => rootNavigation.navigate('Store', { screen: 'Category', category: _category?.name, store: data?.store?.name })  })
                  //   ),
                  //   renderItem: ({ item }) => (
                  //     <TouchableOpacity onPress={item?.onPress}>
                  //       <View style={{ flex: 1, paddingHorizontal: 10 }}>
                  //         <Text style={{ fontSize: 16, textTransform: 'capitalize', color: colors.text, fontWeight: '500', padding: 10 }}>{item?.title}</Text>
                  //       </View>
                  //     </TouchableOpacity>
                  //   ) 
                  // })}
                  // categories={[data?.name]}
                  onPress={() => 
                    rootNavigation.navigate('Store', { screen: 'Product', category: data?.name, name: item?.name, store: data?.store?.name })
                  }
                  name={item?.name}
                  uri={item?.uri}
                  about={item?.about}
                  price={item?.price}
                  // onSubmit={async ({ quantity, comment }) => {
                  //   // try {
                  //   //   await Cart.save({ store: data?.store?.name, product: item._id, quantity, comment })
                  //   //   navigation.goBack()
                  //   // } catch (err) {
                
                  //   // }
                  // }}
                /> */}
              </SafeAreaView>
            }
          />
      </View>
    </View>
  )
}

export default Category;

const CategoryHeader: React.FC<{
  store: StoreDate,
}> = ({
  store
}) => { 
  const rootNavigation = useRootNavigation()
  const { colors } = useTheme()

  return (
    <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: 10,
        backgroundColor: colors.card,
      }}>
      <View style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>

        <Image style={{ marginRight: 10, height: 40, width: 40, borderRadius: 40, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background }} source={{ uri: store?.uri }}/>

        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>

            <TouchableWithoutFeedback onPress={() => rootNavigation.navigate('Store', { store: store?.name })}>
              <Text style={{ textTransform: 'capitalize', fontWeight: 'bold'}}>{store?.name}</Text>
            </TouchableWithoutFeedback>
            
            <Text style={{ textTransform: 'capitalize', fontWeight: '500' }}>{' • '}</Text>
            <TouchableWithoutFeedback onPress={() => {}}>
              <Text style={{ color: colors.primary, textTransform: 'capitalize', fontWeight: 'bold' }}>{'seguir'}</Text>
            </TouchableWithoutFeedback>
          </View>
          <TouchableWithoutFeedback onPress={() => { console.log('ir para cidade') }}>
            <Text style={{ textTransform: 'capitalize', opacity: .5, color: colors.text, fontWeight: 'bold', fontSize: 12 }}>{'mauá - SP'}</Text>
          </TouchableWithoutFeedback>
        </View>
      </View>
      <IconButton 
        name="more-horiz"
        size={24}
        color={colors.text}
        onPress={() => {}}
      />
    </View>
  )
}
