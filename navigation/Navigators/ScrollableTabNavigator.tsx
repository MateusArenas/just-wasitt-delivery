import * as React from 'react';
import { BackHandler, StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import {
  NavigationHelpersContext,
  useNavigationBuilder,
  TabRouter,
  TabActions,
  createNavigatorFactory,
  useFocusEffect,
  useBackButton,
  useNavigationState,
  useNavigation,
  useRoute,
  useLinkTo,
  CommonActions,
  useScrollToTop
} from '@react-navigation/native';

import { FlatList, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import IconButton from '../../components/IconButton';

interface ScrollableTabNavigatorProps {
  ListEmptyComponent?: any
  data: Array<{
    name: string
    component: any
  }>
  paramName?: string
  initialParamName?: string

  children?: any
  screenOptions?: any 
  tabBarStyle?: StyleProp<ViewStyle>
  contentStyle?: StyleProp<ViewStyle>
  tintColor?: string,
  tabBarLabelStyle?:  StyleProp<TextStyle>

  tabBarContentStyle?:  StyleProp<ViewStyle>
  floatButtonIcon?: JSX.Element
  ListHeaderComponent: any

  tabBarRight?: any
  tabBarLeft?: any
}
const ScrollableTabNavigator: React.FC<ScrollableTabNavigatorProps> = ({
    data,
    paramName='section',
    initialParamName,
    children,
    screenOptions,
    tintColor='blue',
    tabBarStyle,
    tabBarLabelStyle,
    contentStyle,
    tabBarContentStyle,
    ListHeaderComponent,
    floatButtonIcon,
    tabBarRight,
    tabBarLeft,
    ListEmptyComponent
} : ScrollableTabNavigatorProps) => {
  const ScrollableListRef = React.useRef<any>(null)

  const { params }: any = useRoute()
  const { [paramName]: sectionName } = params || { [paramName]: null }

  const initialIndex = data.findIndex(section => section.name === sectionName) || 0

  const [index, setIndex] = React.useState(initialIndex > 0 ? initialIndex : 0 )

  const navigation = useNavigation()

  const state = useNavigationState(state => state)
  const route = useRoute()

  return (
      <View style={{ flex: 1 }}>
          <ScrollableList 
          ListEmptyComponent={ListEmptyComponent}
            tabBarRight={tabBarRight}
            tabBarLeft={tabBarLeft}
            tintColor={tintColor}
            tabBarContentStyle={tabBarContentStyle}
            tabBarStyle={tabBarStyle}
            tabBarLabelStyle={tabBarLabelStyle}
            ref={ScrollableListRef}
            renderItem={({ item }: any) => item.component({ 
              name: item?.name,
              navigation,
              route
            })}
            index={index}
            onChangeIndex={React.useCallback(_index => {
              const navActions = {
                ...CommonActions.setParams({
                  [paramName]: data[_index]?.name
                })
              }
                navigation.dispatch({
                  // ...tabActions,
                  ...navActions,
                });

              setIndex(_index)
            }, [navigation, setIndex])}
            data={data}
            ListHeaderComponent={ListHeaderComponent}
            floatButtonIcon={floatButtonIcon}
          />
      </View>
  );
}

const binarySearch = (arr, element) => {
  let right = arr.length - 1;
  let left = 0;
  let mid;
  while (left <= right) {
      mid = Math.floor((left + right) / 2);
      if (arr[mid].y <= element) {
          left = mid + 1;
      } else {
          right = mid - 1;
      }
  }
  return [left, right];
};

const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
  const paddingToBottom = 20;
  return layoutMeasurement.height + contentOffset.y
    >= contentSize.height - paddingToBottom;
};


const ScrollableList: React.FC<any> = React.forwardRef(({
  data,
  index,
  onChangeIndex,
  ListHeaderComponent,
  renderItem,
  tintColor,
  tabBarContentStyle,
  tabBarStyle,
  tabBarLabelStyle,
  floatButtonIcon,
  tabBarRight,
  tabBarLeft,
  ListEmptyComponent
}, ref) => {

  React.useImperativeHandle(ref, () => ({
    goToIndex,
    scrollToTop
  }));

  const sectionFlatListRef = React.useRef<FlatList<any>>(null)
  const navFlatListRef = React.useRef<FlatList<any>>(null)

  const dataIncludesNav = data.length ? [{ nav: true }, ...data] : []

  React.useEffect(() => {//go to initialIndex
    goToIndex(index)
  } ,[])

  function goToIndex (_index=0 as number) {
    if (!data.length) return
    onChangeIndex(_index)
    sectionFlatListRef?.current?.scrollToIndex({ index: _index, animated: true, viewOffset: -127 })
  }

  function scrollToTop () { 
    if (!data.length) return
    sectionFlatListRef?.current?.scrollToOffset({ animated: true, offset: 0 })
  }

  const NavComponent: React.FC = () => {
    return (
      <FlatList 
        ListHeaderComponent={tabBarRight}
        ListFooterComponent={tabBarLeft}
        showsHorizontalScrollIndicator={false}
        ref={navFlatListRef as any}
        horizontal
        data={data}
        renderItem={({ item, index: _index }) => (
          <TouchableOpacity
            key={_index}
            onPress={() => goToIndex(_index)}
            style={[{ flex: 1 }, tabBarStyle]}
          >
            <Text style={[{ 
                paddingVertical: 10, 
                paddingHorizontal: 20, 
                fontWeight: 'bold',
                textTransform: 'capitalize'
              }, tabBarLabelStyle,
              _index === index && { color: tintColor }, 
            ]}>{item?.name}</Text>
            { _index === index && <View style={{ width: '100%', height: 2, backgroundColor: tintColor, borderRadius: 4 }}/> }
          </TouchableOpacity>
        )}
        keyExtractor={(item, _index) => String(_index)}
        onScrollToIndexFailed={info => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            navFlatListRef?.current?.scrollToIndex({ index: info.index, animated: true });
          });
        }}
        contentContainerStyle={[{ flexGrow: 1 }, tabBarContentStyle]}
      />
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList 
        ListEmptyComponent={ListEmptyComponent}
        ref={sectionFlatListRef as any}
        ListHeaderComponent={ListHeaderComponent}
        initialNumToRender={2}
        data={dataIncludesNav}
        renderItem={({ item, index: _index }) => !item?.nav ? 
        renderItem({ item, index: _index}) 
          : <NavComponent />
        }
        keyExtractor={(item, _index) => String(_index)}
        stickyHeaderIndices={[1]}
        scrollEventThrottle={1} // não sei (!important)
        viewabilityConfig={{ 
          minimumViewTime: 500, // tempo de vizulizar
          itemVisiblePercentThreshold: 5, // quando aparece 5% na tela
        }}
        onViewableItemsChanged={
          React.useRef(
            React.useCallback(({ viewableItems, changed }) => {
              if (changed?.length) {
                // se há 3 pega o 2°, se há dois pega o ultimo, se há 1 pega o 1°
                const viewableItemsNotNav = [...viewableItems].filter(_item => !_item.item?.nav)
                const viewableItem = viewableItemsNotNav[Math.floor(viewableItemsNotNav.length / 2)] 
                
                if(!viewableItem) return 
              
                const _index = viewableItem?.index-1

                onChangeIndex(_index);
                navFlatListRef?.current?.scrollToIndex({ index: _index })
              }
            },[onChangeIndex])
        ).current
        }
        onScrollToIndexFailed={info => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            sectionFlatListRef?.current?.scrollToIndex({ index: info.index, animated: true });
          });
        }}
        contentContainerStyle={{ flex: 1 }}
      />

      <View style={{//Float Button
       position: 'absolute',
       right: 10,
       bottom: 10,
       backgroundColor: tintColor,
       overflow: 'hidden',
       borderRadius: 200
      }}>
        <TouchableWithoutFeedback
          style={{ padding: 10 }}
          onPress={scrollToTop}
        >
          {!floatButtonIcon ? <Text style={[{ }, ]}>To Top</Text> : floatButtonIcon}
        </TouchableWithoutFeedback>
        
      </View>
    </View>
  )
})

export default ScrollableTabNavigator
