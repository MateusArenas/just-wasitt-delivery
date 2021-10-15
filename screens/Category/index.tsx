import { StackScreenProps } from "@react-navigation/stack";
import React, { useContext } from "react";
import { Text } from 'react-native';
import { View } from "react-native";
import Card from "../../components/Card";
import IconButton from "../../components/IconButton";
import { RootStackParamList } from "../../types";

interface CategoryProps extends StackScreenProps<RootStackParamList, 'Store'> {
  name: string
}
const Category: React.FC<CategoryProps> = ({
  name: category,
  navigation,
  route
}) => {
  const { store } = route.params

  const products = [
    { name: 'Arroz', about: '...', price: 12, uri: '' },
    { name: 'Feijão', about: '...', price: 12, uri: '' },
    { name: 'Caldo', about: '...', price: 12, uri: '' },
  ]
  
  return (
    <>
      <View style={{//row
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 10, 
        paddingVertical: 20, 
      }}>
        <Text style={{ 
          fontWeight: 'bold', 
          color: 'black',
          textTransform: 'capitalize'
        }}>{category}</Text>

          {/* <IconButton
            name="more-horiz" size={24} color="black"
            onPress={() => {}}
          /> */}
      </View>
        { products?.map((item, index) => <Card 
        
          key={index} 
          onPress={() => navigation.navigate('Product', { category, name: item.name, store })} 
          {...item}
        />) }
    </>
  )
}

export default Category;