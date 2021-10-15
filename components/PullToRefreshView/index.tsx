import { useTheme } from '@react-navigation/native';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Animated, View, ViewStyle } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Loading from '../Loading';

/**
 * Container for ScrollView/FlatList, providing custom pull-to-refresh Header support
 */
 import { PanResponder, Platform, ScrollViewProps, StyleProp, ScrollView, StyleSheet } from 'react-native';
 const styles = StyleSheet.create({
    con: {
        flex: 1,
        // Android上，不设置这个背景色，貌似会触发  onPanResponderTerminate ！！！
        backgroundColor: '#fff',
    },
    header: {
        position: 'absolute',
        left: 0,
        width: '100%',
    }
})


export interface PullToRefreshViewProps {
    disabled?: boolean
    offset?: number
    headerHeight?: number
    refreshTriggerHeight?: number
    refreshingHoldHeight?: number
    style: StyleProp<ViewStyle>
    refreshing: boolean
    onRefresh: () => any
    onOpen?: () => any
    onClose?: () => any
    topPullThreshold?: number
    HeaderComponent?: (props: PullToRefreshHeaderProps) => any
}
export const PullToRefreshView: React.FC<PullToRefreshViewProps> = ({ 
    offset=0,
    disabled=false,
    HeaderComponent=PullToRefreshHeader,
    headerHeight=65,
    refreshTriggerHeight=100,
    refreshingHoldHeight=100,
    children,  
    style= styles.con,
    refreshing= false,
    onRefresh=()=>{},
    onOpen=()=>{},
    onClose=()=>{},
    topPullThreshold=2,
}) => {
    const innerScrollRef = React.useRef<ScrollView>(null)
    const containerTranslateY = React.useRef(0)
    const headerRef = React.useRef(null)
    const containerTop = React.useRef(new Animated.Value(0)).current
    const [innerScrollTop, setInnerScrollTop] = React.useState(0)
    const [scrollEnabled, setScrollEnabled] = React.useState(true)
    const [diferenceGy, setDiferenceGy] = React.useState(0)

    const containerTopChange = React.useCallback(({ value }) => {
        containerTranslateY.current = value
        if (headerRef) {
            headerRef.current?.setProgress({
                pullDistance: value,
                percent: value / (refreshTriggerHeight || headerHeight),
            });
        }
    }, [headerRef, containerTranslateY])

    React.useEffect(() => {
        containerTop.addListener(containerTopChange);

        return () => {
            containerTop.removeAllListeners();
        } 
    }, [containerTop])

    const checkScroll = React.useCallback(() => {
        if (refreshing) {
            if (scrollEnabled) {
                setScrollEnabled(false) 
            }
        }
        else {
            if (scrollEnabled) {
                setScrollEnabled(true) 
            }
        }
    }, [setScrollEnabled, refreshing])

    const innerScrollCallback = React.useCallback((event) => {
         setInnerScrollTop(event?.nativeEvent?.contentOffset?.y);
        //  checkScroll();
     }, [setInnerScrollTop])

     

    const panResponder = 
        PanResponder.create({
          // Ask to be the responder:
        //   onStartShouldSetPanResponder: (evt, gestureState) => true,
  
          onStartShouldSetPanResponderCapture: (evt, gestureState) => {
            if (disabled) {
              return false
            } else {
              const threshold = refreshTriggerHeight || headerHeight;
              if (containerTranslateY.current >= threshold) {
                  return false;
              }
  
              if (refreshing) {
                  return false;
              }
  
              if (innerScrollTop <= topPullThreshold && gestureState.dy >= 0) {
                  return true
               }
  
              return false
            }

          },
          onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
            if (disabled) {
              return false
            } else {
              const threshold = refreshTriggerHeight || headerHeight;
              if (containerTranslateY.current >= threshold) {
                  // 触发刷新
                  return false;
              }
  
              if (refreshing) {
                  // 正在刷新中，不接受再次下拉
                  return false;
              }
  
              if (innerScrollTop <= topPullThreshold && gestureState.dy >= 0) {
                  return true
               }
              
              //  if (0 < this.props.topPullThreshold) {
              //     //  console.log(`====== moveShouldSetResponder  true`);
              //      return true;
              //  } else {
              //      //  console.log(`====== moveShouldSetResponder  false`, this.innerScrollTop, gestureState.dy);
              //       return false;
              //  }
              //  return !this.state.scrollEnabled;
              return false;
            }

          },
        //   onMoveShouldSetPanResponder: (evt, gestureState) => true,
    
          onPanResponderGrant: (evt, gestureState) => {
            // The gesture has started. Show visual feedback so the user knows
            // what is happening!
            // gestureState.d{x,y} will be set to zero now
          },
          onPanResponderMove: (event, gestureState) => {
            if (!disabled && !refreshing) {
              // console.log('onPanResponderMove', this.state.dyDiference)
              // if (((innerScrollTop+gestureState.vy) - (gestureState.dy)) <= topPullThreshold ) {
              if (( innerScrollTop <= topPullThreshold ||
                  ((innerScrollTop+gestureState.vy)) <= topPullThreshold )
                  && gestureState.dy >= 0) {
                  // const dy = Math.max(0, gestureState.dy)-gestureState.vy;
                  const threshold = refreshTriggerHeight || headerHeight;
                    
                  const percent = Math.max(
                    .5, //min force
                    (( ( threshold - gestureState.dy )  / 100 ) * (threshold)) / 100// force
                  )
                  const dy = Math.max(0, gestureState.dy*percent);
                  const value =  Math.min(dy, threshold)
            
                  containerTop.setValue(value);
                  onOpen()
               }
               else {
                  containerTop.setValue(0);
                  setDiferenceGy(gestureState.dy)
                  onClose()
               }
            } 
            
          },
          onPanResponderTerminationRequest: (evt, gestureState) => false,
          onPanResponderRelease: (event, gestureState) => {
            // 判断是否达到了触发刷新的条件
            setDiferenceGy(0)
            const threshold = refreshTriggerHeight || headerHeight;
            if (containerTranslateY.current >= threshold && !disabled) {
                // 触发刷新
                onRefresh();
                onClose();
            }
            else {
                // 没到刷新的位置，回退到顶部
                resetContainerPosition();
            }
   
            checkScroll();
          },
          onPanResponderTerminate: (event, gestureState) => {
            // console.log(`====== terminate`, this.innerScrollTop, gestureState.dy, gestureState.dy);
            resetContainerPosition();
            checkScroll();
          },
          onShouldBlockNativeResponder: (evt, gestureState) => {
            // Returns whether this component should block native components from becoming the JS
            // responder. Returns true by default. Is currently only supported on android.
            return true;
          }
        })

    const resetContainerPosition = React.useCallback(() => {
        Animated.timing(containerTop, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start();
    }, [containerTop])

    const isInnerScrollTop = React.useCallback(() => {
        return innerScrollTop <= topPullThreshold;
    }, [innerScrollTop])

    React.useEffect(() => {
        if (!disabled) {
          if (refreshing) {
              const holdHeight = refreshingHoldHeight || headerHeight;
              Animated.timing(containerTop, {
                  toValue: holdHeight,
                  duration: 150,
                  useNativeDriver: true,
              }).start();
          } else {
              Animated.timing(containerTop, {
                  toValue: 0,
                  duration: 250,
                  useNativeDriver: true,
              }).start();
          }
        }
    }, [refreshing, containerTop, innerScrollRef, disabled])

    const renderHeader = React.useCallback(() => {
        const percent = Animated.divide(containerTop, refreshTriggerHeight || headerHeight);
        const Header = HeaderComponent;
        return (
            <Animated.View style={[styles.header, { top: -(headerHeight-offset), transform: [{ translateY: containerTop }] }]}>
                <Header ref={headerRef as any} percentAnimatedValue={percent} pullDistance={containerTranslateY.current} percent={containerTranslateY.current / headerHeight} refreshing={refreshing}/>
            </Animated.View>
        );
    }, [containerTranslateY, containerTop, headerRef, refreshing, disabled, HeaderComponent])

    const isMobile = Platform.select({ android: true, ios: true })

    const child = React.Children.map(children, React.useCallback((child : any) => {
            if (child?.ref) innerScrollRef.current = child?.ref
            return React.cloneElement(child, Object.assign({
                ...child.props,
                ref: child?.ref ? child?.ref : innerScrollRef,
                bounces: false,
                alwaysBounceVertical: false,
                onScroll: event => {
                  typeof child?.props?.onScroll === 'function' && child?.props?.onScroll(event);
                  innerScrollCallback(event);
                },
                onMomentumScrollBegin: event => {
                  typeof child?.props?.onMomentumScrollBegin === 'function' && child?.props?.onMomentumScrollBegin(event);
                  innerScrollCallback(event);
                },
                onMomentumScrollEnd: event => {
                  typeof child?.props?.onMomentumScrollEnd === 'function' && child?.props?.onMomentumScrollEnd(event);
                  innerScrollCallback(event);
                },
                onScrollEndDrag: event => {
                  typeof child?.props?.onScrollEndDrag === 'function' && child?.props?.onScrollEndDrag(event);
                  innerScrollCallback(event);
                },
                scrollEventThrottle: 16,
                scrollEnabled: !refreshing,
            } as ScrollViewProps, isMobile && { ...panResponder.panHandlers }))
        }, [innerScrollCallback, refreshing, panResponder, isMobile, innerScrollRef])
    );

    return (
        <View style={style} {...Object.assign({}, !isMobile && { ...panResponder.panHandlers })} >
            <Animated.View style={[{ flex: 1, transform: [{ translateY: containerTop }] }]}>
                {child}
            </Animated.View>
            {renderHeader()}
        </View>
   )
}

export interface PullToRefreshHeaderProps {
  ref?: any
  pullDistance: number;
  percentAnimatedValue: Animated.AnimatedDivision;
  percent: number;
  refreshing: boolean;
  indicator?: (props: PullToRefreshHeaderIndicatorProps) => any
}

export const PullToRefreshHeader: React.FC<PullToRefreshHeaderProps> = forwardRef(({
  indicator=PullToRefreshHeaderIndicator, 
  ...props
}, ref) => {
  const [state, setState] = useState({
    pullDistance: props.pullDistance,
    percent: props.percent,
  })

  useImperativeHandle(ref, () => ({
    setProgress({ pullDistance, percent }: { pullDistance: number; percent: number}) {
        setState({
            pullDistance,
            percent,
        });
    }
  }));

  const { percentAnimatedValue, percent, refreshing } = props;
  const { percent: statePercent, pullDistance } = state;
  
  return (
    <Animated.View style={[
      { flex: 1, justifyContent: 'center', alignItems: 'center' }, { 
      opacity: percentAnimatedValue.interpolate({
        inputRange: [0, .5, .75, 1],
        outputRange: [0, .6, .4, .8]
      }) 
    }]}>
      <Animated.View 
        style={{
          transform: [{ 
            rotate: percentAnimatedValue.interpolate({ 
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'] 
            }) ,
          }] 
        }}
      >  
        {indicator({ refreshing, statePercent })}
      </Animated.View>
    </Animated.View>
  )
})

interface PullToRefreshHeaderIndicatorProps {
  statePercent: number 
  refreshing?: boolean
}

const PullToRefreshHeaderIndicator: React.FC<PullToRefreshHeaderIndicatorProps> = ({ 
  statePercent, 
  refreshing=false,
}) => {
  const { colors } = useTheme()

  return (
    <View style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {statePercent >= 1 ?
        <Loading animating={refreshing} color={colors.text} size={'small'}/>
        : 
        <AnimatedCircularProgress
          duration={0}
          width={2}
          tintColor={colors.text}
          size={24}
          fill={statePercent*100}
          backgroundColor={colors.border}
          lineCap="round"
        />
      }
    </View>
  )
}




