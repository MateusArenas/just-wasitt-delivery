import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useTheme } from '@react-navigation/native';
import React from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { TabView } from 'react-native-tab-view';
import { CategoryData } from '../../services/category';
import CustomBottomTabBar from '../CustomBottomTabBar';
import Loading from '../Loading';

const CategoryPiker: React.FC<{
  data: Array<CategoryData>
  value: Array<string>
  onChangeValue: (_id: string) => any
}> = ({
  data, value, onChangeValue
}) => {
  const layout = useWindowDimensions()

  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState([
    { key: 'add', title: 'Adicionar' },
    { key: 'selected', title: 'Selecionados' },
  ])

  const renderScene = React.useCallback(({ route }) => {
    switch (route.key) {
      case 'add': 
        return (
          <CategoryMoreRoute 
            data={data} 
            value={value} 
            onChangeValue={onChangeValue} 
          />
        )
      case 'selected':
        return (
          <CategoryMoreRoute 
            data={data?.filter(c => value?.find(_id => _id === c._id))} 
            value={value} 
            onChangeValue={onChangeValue} 
          />
        )
      default:
        return <Loading />;
    }
  }, [value, onChangeValue, data])

  return (
    <TabView swipeEnabled={false} tabBarPosition="bottom"
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={props => <CustomBottomTabBar {...props} />}
    />
  )
}


const CategoryMoreRoute: React.FC<{
  data: Array<CategoryData>
  value: Array<string>
  onChangeValue: (_id: string) => any
}> = ({
  data, value, onChangeValue
}) => {
  const { colors } = useTheme()
  return (
    <FlatList 
      style={{ padding: 10, flex: 1 }}
      data={data}
      keyExtractor={(item, index) => `${item?._id}-${item?.key}-${index}`}
      renderItem={({ item } : { item: CategoryData }) => (
        <TouchableOpacity onPress={() => onChangeValue(item?._id)}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 16, textTransform: 'capitalize', color: colors.text, fontWeight: '500', padding: 10 }}>{item?.name}</Text>
            <MaterialIcons 
              style={{ paddingHorizontal: 10 }}
              name={value?.find(s => s === item?._id) ? "check-circle" : "circle"}
              size={24}
              color={value?.find(s => s === item?._id) ? colors.primary : colors.border}
            />
          </View>
        </TouchableOpacity>
      )}
    />  
  )
}

export default CategoryPiker;