import { NavigationProp, useNavigation, useTheme } from '@react-navigation/native';
import React, { useContext } from 'react';
import { TouchableWithoutFeedback, View, Text, Image, useWindowDimensions } from 'react-native';
import SwiperFlatList, { Pagination } from 'react-native-swiper-flatlist';
import BottomHalfModalContext from '../../contexts/BottomHalfModal';
import useRootNavigation from '../../hooks/useRootNavigation';
import { CategoryData } from '../../services/category';
import Product2 from '../../components/Product';
import { StoreDate } from '../../services/store';
import IconButton from '../../components/IconButton';
import Product from '../Product';
import { RootStackParamList } from '../../types';

interface PostProps {
  data: CategoryData
}

const Post: React.FC<PostProps> = ({ data }) => {
  const { width } = useWindowDimensions()
  const { colors } = useTheme()
  const rootNavigation = useRootNavigation()
  const BottomHalfModal = useContext(BottomHalfModalContext)
  const navigation = useNavigation<NavigationProp<RootStackParamList, 'Category'>>()
  return (
      <View style={{ flex: 1 }}>
        <View style={{ borderRadius: 4, overflow: 'hidden', padding: 10 }}>
          <PostHeader store={data?.store}/>
        </View>
        <View>        
          <SwiperFlatList horizontal
            PaginationComponent={(props) =>
              <View style={{ 
                width: '100%', borderRadius: 4, overflow: 'hidden', padding: 10,
                
              }}>
                <View style={{ 
                  flex: 1,
                  backgroundColor: colors.card,
                  padding: 10,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <View style={{ flex: 1, alignItems: 'flex-start' }}>
                    <TouchableWithoutFeedback onPress={() => rootNavigation.navigate('Category', { store: data?.store?.name, id: data?._id })}>
                      <Text numberOfLines={1} style={{ fontWeight: '500', color: colors.primary, fontSize: 14 }}>{'ver categoria'}</Text>
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
                      // paddingRight: 10,
                    }}>{props.paginationIndex+1 + ' / ' + props.size}</Text>
                  </View>
                </View>
              </View> 
            }
            index={0}                
            showPagination
            data={data?.products}
            centerContent
            renderItem={({ item }) => 
              <View style={{ width: width-20, paddingHorizontal: 10, borderRadius: 4, overflow: 'hidden' }}>
                <Product store={data?.store?.name} data={item} onPress={() => navigation.navigate('Product', { id: item?._id, store: data?.store?.name })}/>
              </View>
            }
          />
      </View>
    </View>
  )
}

export default Post;

const PostHeader: React.FC<{
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
              <Text style={{ textTransform: 'capitalize', fontWeight: '500', color: colors.text}}>{store?.name}</Text>
            </TouchableWithoutFeedback>
            
            <Text style={{ textTransform: 'capitalize', fontWeight: '500', color: colors.text }}>{' • '}</Text>
            <TouchableWithoutFeedback onPress={() => {}}>
              <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{'seguir'}</Text>
            </TouchableWithoutFeedback>
          </View>
          <TouchableWithoutFeedback onPress={() => { console.log('ir para cidade') }}>
            <Text style={{ textTransform: 'capitalize', opacity: .5, color: colors.text, fontWeight: 'bold', fontSize: 12 }}>{'mauá - SP'}</Text>
          </TouchableWithoutFeedback>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* <IconButton 
          name="bookmark-outline"
          size={24}
          color={colors.text}
          onPress={() => {}}
        /> */}
        <IconButton style={{ paddingRight: 0}}
          name="more-horiz"
          size={24}
          color={colors.text}
          onPress={() => {}}
        />
      </View>
    </View>
  )
}
