import { useHeaderHeight } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { FlatList, useWindowDimensions, View, Text, Image, TouchableOpacity } from 'react-native';
import { RootStackParamList } from '../../types';
import IconButton from '../../components/IconButton';
import { useTheme } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import ContainerButton from '../../components/ContainerButton';
import TextButton from '../../components/TextButton';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import useProductPrice from '../../hooks/useProductPrice';
import ProductCard from '../../components/ProductCard';
import useMediaQuery from '../../hooks/useMediaQuery';
import BottomHalfModalBoard from '../../components/BottomHalfModalBoard';
import { formatedMoney } from '../../utils';
import BottomHalfModalContext from '../../contexts/BottomHalfModal';
import { bundleData } from '../../services/bundle';
import { bagData } from '../../services/bag';

interface BagTemplateProps {
    store: string
    data: any
    totalPrice?: number
    handleStore?: (params: any) => any
    handleProduct?: (params: any) => any
    selecteds?: String[]
    onSelecteds?: (selecteds: String[]) => any
    editMode?: boolean
    onEditMode?: (editMode: boolean) => any
    extraBottom?: number
    onUpdate: any
    onClear: any
}

const BagTemplate = React.forwardRef<FlatList, BagTemplateProps>(({ 
    data,
    store,
    totalPrice=0,
    selecteds=[],
    onSelecteds=()=>{},
    editMode=false,
    onEditMode=()=>{},
    extraBottom=0,
    handleStore=()=>{},
    handleProduct=()=>{},
    onUpdate=()=>{},
    onClear=()=>{},
    ...props
}, forwardRef) => {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0

  const ref = React.useRef<FlatList>(null)

  React.useImperativeHandle(forwardRef, () => ref?.current, [ref]);

  const BottomHalfModal = React.useContext(BottomHalfModalContext)
  
  const { colors, dark } = useTheme()

  const { isDesktop } = useMediaQuery()

  function onChangeSelect (select: string) {
      onSelecteds(selecteds?.find(id => select === id) 
      ? selecteds?.filter(id => select !== id) 
      : [ ...selecteds, select ])
  }

  return (
    <View style={{ flex: 1, paddingBottom: bottom }}>
          <FlatList ref={ref} {...props} style={{ flex: 1 }}
            contentContainerStyle={[
              { flexGrow: 1 },
              { marginTop: top, paddingBottom: bottom+extraBottom },
            ]}
            scrollIndicatorInsets={{ top, bottom: bottom+extraBottom }}
            ListEmptyComponent={
              <View style={{ padding: 10,flex: 1, width: '100%'  }}>
                  <ContainerButton border transparent
                    title={'Adicionar items'}
                    loading={false}
                    onSubimit={() => handleStore({ store })}
                  />
              </View>
            }
            ListHeaderComponentStyle={{ width: '100%' }}
            ListHeaderComponent={
              <View style={{ 
                padding: 10, minHeight: 82,
                // marginVertical: 10,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                // borderWidth: 1, borderColor: colors.border,
                // borderRadius: 10, margin: 10, 
                // backgroundColor: colors.border
              }}>

                <View style={{ flex: 1, alignItems: 'flex-start', justifyContent: 'center' }}>
                  {editMode && <IconButton
                      name={'close'}
                      size={24}
                      color={colors.text}
                      onPress={() => {
                        onEditMode(false)
                        onSelecteds([])
                      }}
                    />}
                </View>

               <Text style={{
                  fontSize: 16, color: colors.text, fontWeight: 'bold',
                  padding: 10, textAlign: 'center', flex: 2, textAlignVertical: 'center',
                }}>{ 
                  (editMode && selecteds?.length > 0) ?
                    selecteds?.length === 1 ? `${selecteds?.length} item selecionado` 
                    : `${selecteds?.length} items selecionados` 
                  : `Total: ${formatedMoney(totalPrice)}`
                }</Text>


                <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
                  {data?.bundles?.length > 0 &&
                    <TextButton
                      label={editMode ? (selecteds.length > 0)? 'Fazer' : 'Tudo' : 'Editar'}
                      fontSize={18}
                      color={colors.text}
                      onPress={() => (editMode && selecteds.length === 0) ? 
                        onSelecteds(data?.bundles?.map(item => item?._id))
                        : onEditMode(true)
                      }
                      onPressed={() => (editMode && selecteds.length > 0) &&  BottomHalfModal.show(modalize => 
                        <BottomHalfModalBoard onClose={modalize?.current?.close}
                          data={[
                            { icon: 'delete', title: 'Remover', hover: colors.notification, onPress: () => onClear(selecteds) }
                          ]}
                        />
                      )}  
                    />
                    }
                </View>

              </View>
            }            
            ListFooterComponentStyle={{ flex: 1 }}
            ListFooterComponent={
              <TouchableOpacity disabled={!editMode} 
                onPress={() => onEditMode(false)} 
                style={{ flex: 1 }}
              />
            }
            data={data?.bundles}
            keyExtractor={(item, index) => `${item?._id}-${index}`}
            renderItem={({ item }) => (
                  <View style={[isDesktop && { alignItems: 'center' }]}>
                    <TouchableOpacity disabled={!editMode} onPress={() => onChangeSelect(item?._id)}>
                      <View style={[
                        { flexDirection: 'row', alignItems: 'center' },
                        { backgroundColor: (selecteds?.find(id => id === item?._id) && editMode) ? colors?.border : 'transparent'}
                      ]}>
                        {editMode && 
                        <View style={{ paddingLeft: 10 }}>
                          <IconButton
                            name={!!selecteds?.find(id => id === item?._id) ? 'check-circle-outline' : 'circle'}
                            size={24}
                            color={!!selecteds?.find(id => id === item?._id) ? colors.text : colors.border}
                            onPress={() => onChangeSelect(item?._id)}
                          />
                        </View>
                        }

                        <ProductCard style={{ paddingLeft: 10 }}
                          disabled={editMode}
                          uri={item?.product?.uri}
                          name={item?.product?.name}
                          about={item?.comment}
                          price={useProductPrice(item)}
                          subPrice={useProductPrice(item, true)}
                          count={item?.quantity}
                          onChangeCount={quantity => onUpdate(item, quantity)}
                          onContentPress={() => handleProduct({ store, slug: item?.product?.slug })}
                          onImagePress={() => handleProduct({ store, slug: item?.product?.slug })}
                        /> 

                      </View>
                    </TouchableOpacity>
                    {item?.quantity > 0 &&
                    <View style={{ paddingLeft: 30 }}>
                      {item?.components.map(byItem => (
                        <View style={{ paddingLeft: 20 }}>
                          <MaterialIcons style={{ position: 'absolute', padding: 10 }}
                            name={'subdirectory-arrow-right'} 
                            size={24} color={colors.text} 
                          />
                          <ProductCard minimize disabled={editMode}
                            maxCount={byItem?.product?.spinOff ? 1 : 99}
                            name={byItem?.product?.name}
                            about={byItem?.components?.map((subItem,index) => 
                              `+ (${subItem?.quantity}) ${subItem?.product?.name} ${(index !== byItem?.components?.length-1) ? '\n' : ''}`
                            )?.reduce((acc, cur) => acc + cur, '')}
                            price={useProductPrice(byItem)}
                            subPrice={useProductPrice(byItem, true)}
                            onContentPress={() => handleProduct({ store, slug: item?.product?.slug })}
                            onChangeCount={quantity => onUpdate({...item, 
                              components: item?.components?.map(_item => 
                                (_item?.product?._id !== byItem?.product?._id) ? _item 
                                : { ..._item, quantity }
                              ),
                            }, item?.quantity)}
                            count={byItem?.quantity}
                          />
                        </View> 
                      ))}
                    </View>}
                  </View>
            )}
          />
    </View>
  )
})

export default BagTemplate;