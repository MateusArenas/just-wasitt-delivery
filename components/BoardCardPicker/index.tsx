import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { 
  FlatList, 
  ImageBackground, 
  StyleProp, 
  TouchableOpacity, 
  View, 
  ViewStyle, 
  Text, 
  useWindowDimensions,
  StyleSheet,
  TextStyle
} from 'react-native';
import { TabView } from 'react-native-tab-view';
import SearchBar from '../SearchBar';


interface BoardCardPickerFlatListProps {
  data?: Array<{ _id: string, title: string, describe?: string, uri?: string }>
  style?: StyleProp<ViewStyle>
  itemContainerStyle?: StyleProp<ViewStyle>
  itemInnerStyle?: StyleProp<ViewStyle>
  itemTitleStyle?: StyleProp<TextStyle>
  itemDescribeStyle?: StyleProp<TextStyle>
  onEndReached?: (info: { distanceFromEnd: number }) => void
  selecteds?: Array<string>
  onChangeSelect?: (id: string) => any
  onChangeDeselect?: (id: string) => any
}

const BoardCardPickerFlatList: React.FC<BoardCardPickerFlatListProps> = ({
  data,
  style,
  itemContainerStyle,
  itemInnerStyle,
  itemTitleStyle,
  itemDescribeStyle,
  onEndReached=()=>{},
  selecteds=[],
  onChangeSelect=()=>{},
  onChangeDeselect=()=>{},
}) => {
  const { width } = useWindowDimensions()
  const { colors } = useTheme()

  const onChangeItem = React.useCallback((id) => {
    if (selecteds?.find(_s => _s === id)) onChangeDeselect(id)
    else onChangeSelect(id)
  }, [selecteds])

  const findSelected = React.useCallback((id) => {
    return selecteds?.find(s => s === id)
  }, [selecteds])

  return (
    <FlatList 
      style={[{ flex: 1 }, style]}
      numColumns={3}
      data={data}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.1}
      contentContainerStyle={{ flexGrow: 1, padding: 10 }}
      columnWrapperStyle={{ flex: 1 }}
      keyExtractor={item => `${item?._id}` }
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onChangeItem(item?._id)}>
          <ImageBackground imageStyle={{ opacity: .8 }}
            source={{ uri: item?.uri }}
            style={{ width: (width/3)-(2.5*3)-2, height: 160, margin: 1, borderRadius: 2, overflow: 'hidden' }}
          >
            <View style={[styles.itemContainerStyle, { borderColor: colors.border }, itemContainerStyle]}>
              <View style={[styles.itemInnerStyle, itemInnerStyle]}>
                <View style={{ flexShrink: 1 }}>
                  <Text numberOfLines={1} style={[styles.itemTitleStyle, itemTitleStyle]} >{item?.title}</Text>
                  {!!item?.describe && <Text numberOfLines={1} style={[styles.itemDescribeStyle, itemDescribeStyle]} >{item?.describe}</Text>}
                </View>
                <View style={[styles.itemCheckContainer, findSelected(item?._id) ? 
                  { backgroundColor: colors.primary } : {}
                ]}>
                  {findSelected(item?._id) && <MaterialIcons name="check" size={20} color={'white'} />}
                </View>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
    )}
  />
  )
}

const styles = StyleSheet.create({
  itemContainerStyle: {
    flex: 1, alignItems: 'flex-end', 
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,.1)', 
    padding: 5,
    borderWidth: 1, 
    borderColor: 'transparent', 
    borderRadius: 2,
  },
  itemInnerStyle: { 
    width: '100%', 
    alignItems: 'flex-end', 
    justifyContent: 'space-between', 
    flexDirection: 'row', 
    padding: 5,
  },
  itemTitleStyle: { 
    color: 'white', 
    fontSize: 14, 
    fontWeight: '500' 
  },
  itemDescribeStyle: { 
    color: 'white', 
    opacity: .8, 
    fontSize: 14, 
    fontWeight: '500' 
  },
  itemCheckContainer: {
    width: 24,
    height: 24, 
    borderRadius: 60,
    borderWidth: 2, borderColor: 'white',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent'
  },
});

const BoardCardPicker: React.FC<BoardCardPickerFlatListProps & { 
  search?: string
  onChangeSearch?: (value: string) => any
}> = ({ 
  data, 
  selecteds,
  onChangeSelect,
  onChangeDeselect, 
  onEndReached,
  search, 
  onChangeSearch,
}) => {
  const layout = useWindowDimensions()

  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState([
    { key: 'add', title: 'Adicionar' },
    { key: 'selected', title: 'Adicionados' },
  ])

  const selectedData = data?.filter(item => !!selecteds?.find(_id => item?._id === _id));

  React.useEffect(() => {
    if (selectedData?.length <= 0) setIndex(0)
  }, [selectedData])

  const renderScene = React.useCallback(({ route }) => {
    switch (route.key) {
      case 'add':
        return (
          <BoardCardPickerFlatList 
            data={data} 
            selecteds={selecteds} 
            onChangeSelect={onChangeSelect}
            onChangeDeselect={onChangeDeselect}
            onEndReached={onEndReached}
          />);
        // return <SecondRoute data={data} products={products} setProducts={setProducts} loadPagination={loadPagination}/>;
      case 'selected':
        return (  
          <BoardCardPickerFlatList 
            data={selectedData} 
            selecteds={selecteds} 
            onChangeSelect={onChangeSelect}
            onChangeDeselect={onChangeDeselect}
          />);
        // return <FirstRoute data={selecteds} products={products} setProducts={setProducts}/>;
      default:
        return null;
    }
  }, [selecteds, selectedData, data, onEndReached])
  const { colors } = useTheme()


  return (
    <View style={{ flex: 1 }}>
      <TabView swipeEnabled={false} tabBarPosition="top"
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        // sceneContainerStyle={{ marginTop: -70 }}
        renderTabBar={props => (
          <View style={{ zIndex: 999 }}>
            <View style={{ 
              padding: 10, paddingRight: 10,
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}>
              <SearchBar placeholder={'Buscar'}
                value={search}
                onChangeText={onChangeSearch}
                containerStyle={{ flexShrink: 1 }}
              />
              {selecteds?.length > 0 && <TouchableOpacity onPress={() => {
                setIndex(index === 0 ? 1 : 0)
              }}>
                <View style={{ 
                  paddingHorizontal: 5, 
                  backgroundColor: index === 1 ? colors.border : 'transparent',
                  marginHorizontal: 10, marginRight: 5,
                  borderRadius: 4,
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <MaterialIcons style={{ 
                    opacity: index === 1 ? 1 : .5,
                    padding: 10
                  }}
                    name="check-circle-outline" 
                    size={24} 
                    color={colors.text} 
                  />
                  <Text style={{ opacity: index === 1 ? 1 : .5,
                    color: colors.text, 
                    fontSize: 16, paddingRight: 10,
                    fontWeight: '500',
                  }}>
                    {selecteds?.length}
                  </Text>
                </View>
              </TouchableOpacity>}
            </View>
          </View>
        )}
      />
    </View>
  )
}

export default React.memo(BoardCardPicker);