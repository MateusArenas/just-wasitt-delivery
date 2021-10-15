import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    Animated,
    FlatListProps,
    ListRenderItem,
    Platform,
    ScrollViewProps,
    StyleProp,
    View,
    ViewStyle,
} from 'react-native';
import { FlatList, ScrollView } from 'react-native-gesture-handler';

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


interface ScrollableTabStringProps {
    headerComponent?: any
    dataTabs: Array<any>
    dataSections: Array<any>
    isParent?: boolean
    headerTransitionWhenScroll?: boolean
    tabPosition?: 'top' | 'bottom'
    renderSection: any
    renderTabName: any
    
    customTabNamesProps?: FlatListProps<any> & any
    customSectionProps?: ScrollViewProps & any

    tabNamesContainerStyle?: StyleProp<ViewStyle> 
    sectionContainerStyle?: StyleProp<ViewStyle> 
    
    onPressTab?: (item: any, index: number) => any
    
    onScrollSection?: (e: any) => any
    indexValue?: number
    scrollToIndexValue?: number

    scrollIndexEffect?: (index: number) => any
    selectedTabStyle?: StyleProp<ViewStyle> 
    unselectedTabStyle?: StyleProp<ViewStyle>
}
const ScrollableTabString: React.FC<ScrollableTabStringProps> = ({
    headerComponent,
    renderSection,
    renderTabName,
    customTabNamesProps,
    customSectionProps,
    onScrollSection,
    onPressTab,
    dataSections=[],
    dataTabs=[],
    isParent=false,
    headerTransitionWhenScroll=true,
    tabPosition='top',
    selectedTabStyle={
        borderBottomColor: 'black',
        borderBottomWidth: 1,
    },
    unselectedTabStyle={
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabNamesContainerStyle={
        flexGrow: 1,
    },
    sectionContainerStyle={
        flexGrow: 1,
    },
    scrollIndexEffect,
    indexValue,
    scrollToIndexValue
}: ScrollableTabStringProps) => {
    const tabNamesRef = useRef<FlatList<any>>(null)
    const tabScrollMainRef = useRef<ScrollView>(null)
    const TAB_POSITION_TOP = 'top'
    const TAB_POSITION_BOTTOM = 'bottom'

    const [heightTabNames, setHeightTabNames] = useState(0)

    const [{ selectedScrollIndex, isPressToScroll }, setState] = useState({
        selectedScrollIndex: 0,
        isPressToScroll: false,
    })

    const [listViews, setListViews] = useState([])

    useEffect(() => {
        scrollIndexEffect && scrollIndexEffect(selectedScrollIndex)
     }, [selectedScrollIndex])

     useEffect(() => {
        setState(state => ({...state, selectedScrollIndex: indexValue }))
        // goToIndex(listViews[indexValue]?.item)
     }, [indexValue, setState])

     useEffect(() => {
        goToIndex(listViews[scrollToIndexValue]?.item)
     } ,[scrollToIndexValue, listViews])

    // useEffect(() => {
    //     const { dataSections, dataTabs, isParent, tabPosition } = this.props;

    //     if (dataSections.length !== dataTabs.length && !isParent) {
    //         console.warn('The \'dataSections\' and \'dataTabs\''
    //         + ' length are not equal. This will cause some issues, especially when the section list is scrolling.'
    //         + ' Consider number of items of those lists to be equal, or add \'isParent\''
    //         + ' param if you are supporting parent tab - children sections');
    //     }
        
    //     if (tabPosition &&  (tabPosition !== ScrollableTabString.TAB_POSITION_BOTTOM)  &&  (tabPosition !== ScrollableTabString.TAB_POSITION_TOP))  {
    //         console.warn('The tabPosition only accept \'top\' or \'bottom\' only !')
    //     } 
    // })

    // componentDidUpdate(prevProps) {
    //     const { dataSections } = this.props;

    //     if (dataSections.length > prevProps.dataSections.length) {
    //         console.warn('Are you loading more items on the dataSections ? This component does not support on load more yet !');
    //     }
    // }

    const goToIndex = (item) => {

        setState(state => ({ ...state, isPressToScroll: true }))
        const all = [...listViews.filter((i) => i.item.index === item.index).map((ii) => ii.y)]
        const findMinYAxis = Math.min(...listViews.filter((i) => i.item.index === item.index).map((ii) => ii.y));
        const res = findMinYAxis && listViews.find((i) => i.y === findMinYAxis);
        
        console.log('gk-> ', 'list view> ', listViews, 'item: ', item, ' res-> ', res, ' findMinYAxis> ', findMinYAxis, ' all> ', all);
        
        tabScrollMainRef?.current?.scrollTo({ animated: true, y: res?.y || 0 });
        setState(state => ({...state,
            selectedScrollIndex: res?.item?.index || 0
        }))

        // onPressTab && onPressTab(item);
    }

    // map tab item
    const dataTabNameChildren = ({ item, index }) : any => {
        return React.Children.map(
            React.Children.toArray(renderTabName(item, index)),
            (children) => React.cloneElement(children as any, {
                style: { ...(index === selectedScrollIndex) ? selectedTabStyle : unselectedTabStyle as any },
                onPress: () => {
                    goToIndex({ ...item, index })
                    onPressTab && onPressTab(item, index)
                },
                onLayout: ({
                    nativeEvent: {
                      layout: { height },
                    },
                  }) => {
                    if (heightTabNames === 0) {
                        setHeightTabNames(height)
                    }
                }
            })
        );
    }

    // map section item
    const dataSectionsChildren = (item, index) => {
        return React.Children.map(
            React.Children.toArray(renderSection(item, index)),
            (children) => React.cloneElement(children as any, {
                onLayout: ({
                    nativeEvent: {
                      layout: { y },
                    },
                  }) => {
                    setListViews(listViews => [...listViews, {//push
                        item: { ...item, index },
                        y,
                    }]);
                    if (listViews.length >= dataSections?.length) {
                        setListViews(listViews => listViews.sort((a, b) => a.y - b.y))
                    }
                }
            })
        );
    }

    const onScroll = (e) => {
        onScrollSection && onScrollSection(e);

        if (!isPressToScroll && headerTransitionWhenScroll) {
            try {
                if (e.nativeEvent.contentOffset.y === 0) {
                    tabNamesRef?.current?.scrollToOffset({
                        offset: 0,
                        animated: Platform.OS === 'ios',
                        // viewPosition: 0.5,
                    });

                    setState(state => ({...state,
                        selectedScrollIndex: 0,
                    }));
                } else if (isCloseToBottom(e.nativeEvent)) {
                    const lastIndex = dataTabs.length - 1;

                    tabNamesRef?.current?.scrollToIndex({
                        animated: Platform.OS === 'ios',
                        index: lastIndex,
                        viewPosition: 0.5,
                    });

                    setState(state => ({...state,
                        selectedScrollIndex: lastIndex
                    }))
                } else {
                    const res = binarySearch(listViews, e.nativeEvent.contentOffset.y);

                    const indexToScrollTo = res.includes(-1)
                        ? listViews[Math.max(...res)]?.item?.index
                        : Math.max(
                            listViews[res[0]]?.item?.index,
                            listViews[res[1]]?.item?.index
                        );

                    if (
                        indexToScrollTo
                        && indexToScrollTo !== -1
                        && indexToScrollTo !== selectedScrollIndex) {
                        tabNamesRef?.current?.scrollToIndex({
                            animated: Platform.OS === 'ios',
                            index: indexToScrollTo,
                            viewPosition: 0.5,
                        });

                        setState(state => ({...state,
                            selectedScrollIndex: indexToScrollTo
                        }))
                    }
                }
            } catch (err) {
                console.warn('err: ', err);
            }
        }
    }

    return (
            <>
                <Animated.ScrollView
                    {...customSectionProps}
                    scrollEventThrottle={16}
                    ref={tabScrollMainRef as any}
                    bounces={false}
                    onScrollBeginDrag={() => setState(state => ({ ...state, isPressToScroll: false }))}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                    scrollEnabled
                    onScroll={onScroll}
                    
                    stickyHeaderIndices={tabPosition === 'top' ? [1] : null}
                >
                    
                    {headerComponent()}
                    {
                        // headerComponent
                        (tabPosition === 'top' ? (
                            <View>
                                <Animated.FlatList
                                    data={dataTabs.map((i, index) => ({ ...i, index }))}
                                    nestedScrollEnabled
                                    keyboardShouldPersistTaps="always"
                                    contentContainerStyle={tabNamesContainerStyle}
                                    {...customTabNamesProps}
                                    ref={tabNamesRef}
                                    keyExtractor={(item) => String(item.index)}
                                    showsHorizontalScrollIndicator={false}
                                    bounces={false}
                                    horizontal
                                    renderItem={dataTabNameChildren}
                                />
                            </View>
                        ) : null)
                    }
                    <View>
                        { (isParent ? dataSections : dataSections.map((i, index) => ({ ...i, index }))).map(dataSectionsChildren) }
                    </View>
                </Animated.ScrollView>
                {
                    (tabPosition === 'bottom' ? (
                        <View>
                            <Animated.FlatList
                                style={{ position: 'absolute', bottom: 0 }}
                                keyboardShouldPersistTaps="always"
                                nestedScrollEnabled
                                data={dataTabs.map((i, index) => ({ ...i, index }))}
                                contentContainerStyle={tabNamesContainerStyle}
                                {...customTabNamesProps}
                                ref={tabNamesRef}
                                keyExtractor={(item) => item.index.toString()}
                                showsHorizontalScrollIndicator={false}
                                bounces={false}
                                horizontal
                                renderItem={dataTabNameChildren}
                            />
                        </View>

                    ) : null)
                }
            </>
        );
    }

export default ScrollableTabString;
