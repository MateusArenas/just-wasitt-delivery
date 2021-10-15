import { useTheme } from '@react-navigation/native';
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
    FlatList
} from 'react-native';
import { ViewProps } from '../Themed';

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


interface ScrollableTabStringProps extends ScrollViewProps {
    headerComponent?: any
    dataTabs: Array<any>
    dataSections: Array<any>
    isParent?: boolean
    headerTransitionWhenScroll?: boolean
    tabPosition?: 'top' | 'bottom'
    renderSection: any
    renderTabName: any
    
    customTabNamesProps?: FlatListProps<any> & any

    tabNamesContainerStyle?: StyleProp<ViewStyle> 
    tabNamesContentContainerStyle?: StyleProp<ViewStyle>
    sectionContainerStyle?: StyleProp<ViewStyle> 
    
    onPressTab?: (item: any, index: number) => any
    
    onScrollSection?: (e: any) => any
    indexValue?: number
    scrollToIndexValue?: number

    scrollIndexEffect?: (index: number) => any
    selectedTabStyle?: StyleProp<ViewStyle> 
    unselectedTabStyle?: StyleProp<ViewStyle>
    tabTopComponent?: React.ReactNode
    TabContainerComponet?: React.FC<ViewProps>
}
const ScrollableTabString: React.FC<ScrollableTabStringProps> = React.forwardRef(({
    headerComponent,
    renderSection,
    renderTabName,
    tabTopComponent,
    customTabNamesProps,
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
    },
    tabNamesContentContainerStyle={
        flexGrow: 1,
    },
    sectionContainerStyle={
        flexGrow: 1,
    },
    TabContainerComponet=props => <View {...props}/>,
    scrollIndexEffect,
    indexValue,
    scrollToIndexValue,
    ...customSectionProps
}: ScrollableTabStringProps, ref : React.ForwardedRef<ScrollView>) => {
    const tabNamesRef = useRef<FlatList<any>>(null)
    const tabScrollMainRef = useRef<FlatList<any>>(ref)
    const TAB_POSITION_TOP = 'top'
    const TAB_POSITION_BOTTOM = 'bottom'

    const [heightTabNames, setHeightTabNames] = useState(0)

    const [{ selectedScrollIndex, isPressToScroll }, setState] = useState({
        selectedScrollIndex: 0,
        isPressToScroll: false,
    })

    const [listViews, setListViews] = useState([])

    const goToIndex = (item) => {

        setState(state => ({ ...state, isPressToScroll: true }))
        const all = [...listViews.filter((i) => i.item?.index === item?.index).map((ii) => ii.y)]
        const findMinYAxis = Math.min(...listViews.filter((i) => i.item?.index === item?.index).map((ii) => ii.y));
        const res = findMinYAxis && listViews.find((i) => i.y === findMinYAxis);
        
        tabScrollMainRef?.current?.scrollToOffset({ animated: true, offset: res?.y || 0 });
        // tabScrollMainRef?.current?.scrollToIndex({ index: item?.index })
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
                key: `${item?._id}-${index}`,
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

    const onScroll = React.useCallback((e) => {
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
    }, [listViews, setState, tabNamesRef, isPressToScroll, headerTransitionWhenScroll])

    // const data = Object.values(Object.assign(
    //     tabPosition === 'top' && { 0: { key: 'tab-top' } },
    //     ...dataSections?.map((item, index) => ({ [index+1]: {...item, index } })),
    //     tabPosition === 'bottom' && { [dataSections?.length+1]: { key: 'tab-bottom' } },
    // ))

    return (
                <FlatList
                    {...customSectionProps}
                    ref={tabScrollMainRef}
                    onScrollBeginDrag={() => setState(state => ({ ...state, isPressToScroll: false }))}
                    nestedScrollEnabled
                    onScroll={e => { onScroll(e); customSectionProps.onScroll(e); }}
                    stickyHeaderIndices={tabPosition === 'top' ? [1] : null}
                    ListHeaderComponent={headerComponent()}
                    data={Object.values(Object.assign(
                        tabPosition === 'top' && { 0: { key: 'tab-top' } },
                        { 1: dataSections },
                        tabPosition === 'bottom' && { 2: { key: 'tab-bottom' } },
                    ))}
                    keyExtractor={(item, index) => `${item?._id}-${index}`}
                    renderItem={({ item, index: i }) => {
                        if (item?.key === 'tab-top') {
                            return (
                                <View style={[tabNamesContainerStyle]}>
                                    {tabTopComponent}
                                    <TabContainerComponet>
                                        <Animated.FlatList 
                                            data={dataTabs.map((i, index) => ({ ...i, index }))}
                                            nestedScrollEnabled
                                            keyboardShouldPersistTaps="always"
                                            contentContainerStyle={[
                                                { flexGrow: 1 },
                                                tabNamesContentContainerStyle, 
                                            ]}
                                            {...customTabNamesProps}
                                            ref={tabNamesRef}
                                            keyExtractor={(item, index) => `${item?._id}-${index}`}
                                            showsHorizontalScrollIndicator={false}
                                            bounces={false}
                                            horizontal
                                            renderItem={dataTabNameChildren}
                                        />
                                    </TabContainerComponet>
                                </View>
                            )
                        } else if (item?.key === 'tab-bottom') {
                            return (
                                <View style={[tabNamesContainerStyle]}>
                                    {tabTopComponent}
                                    <TabContainerComponet>
                                        <Animated.FlatList
                                            style={{ position: 'absolute', bottom: 0 }}
                                            keyboardShouldPersistTaps="always"
                                            nestedScrollEnabled
                                            data={dataTabs.map((i, index) => ({ ...i, index }))}
                                            contentContainerStyle={[
                                                { flexGrow: 1 },
                                                tabNamesContentContainerStyle,
                                            ]}
                                            {...customTabNamesProps}
                                            ref={tabNamesRef}
                                            keyExtractor={(item, index) => `${item?._id}-${index}`}
                                            showsHorizontalScrollIndicator={false}
                                            bounces={false}
                                            horizontal
                                            renderItem={dataTabNameChildren}
                                        />
                                    </TabContainerComponet>
                                </View>
                            )
                        }
                        // return dataSectionsChildren(item, item?.index)
                        return (
                            <View>
                                { (isParent ? dataSections : dataSections.map((i, index) => ({ ...i, index }))).map(dataSectionsChildren) }
                            </View>
                        )
                    }}
                />
                    
                //     {/* {headerComponent()} */}
                //     {
                //         // headerComponent
                //         (tabPosition === 'top' ? (
                //                 <Animated.FlatList 
                //                     data={dataTabs.map((i, index) => ({ ...i, index }))}
                //                     nestedScrollEnabled
                //                     keyboardShouldPersistTaps="always"
                //                     contentContainerStyle={[
                //                         { flexGrow: 1 },
                //                         tabNamesContainerStyle, 
                //                     ]}
                //                     {...customTabNamesProps}
                //                     ref={tabNamesRef}
                //                     keyExtractor={(item) => String(item.index)}
                //                     showsHorizontalScrollIndicator={false}
                //                     bounces={false}
                //                     horizontal
                //                     renderItem={dataTabNameChildren}
                //                 />
                //         ) : null)
                //     }
                //     <View>
                //         { (isParent ? dataSections : dataSections.map((i, index) => ({ ...i, index }))).map(dataSectionsChildren) }
                //     </View>
                //     {
                //         (tabPosition === 'bottom' ? (
                //             <View>
                //                 <Animated.FlatList
                //                     style={{ position: 'absolute', bottom: 0 }}
                //                     keyboardShouldPersistTaps="always"
                //                     nestedScrollEnabled
                //                     data={dataTabs.map((i, index) => ({ ...i, index }))}
                //                     contentContainerStyle={[
                //                         { flexGrow: 1 },
                //                         tabNamesContainerStyle,
                //                     ]}
                //                     {...customTabNamesProps}
                //                     ref={tabNamesRef}
                //                     keyExtractor={(item) => item.index.toString()}
                //                     showsHorizontalScrollIndicator={false}
                //                     bounces={false}
                //                     horizontal
                //                     renderItem={dataTabNameChildren}
                //                 />
                //             </View>

                //         ) : null)
                //     }
                // </Animated.FlatList>
        );
    })

export default ScrollableTabString;
