import { NavigationProp, RouteProp, StackActions, useFocusEffect, useNavigation, useRoute, useTheme } from '@react-navigation/native';
import { HeaderTitle, StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useContext, useEffect } from 'react';
import { Clipboard, View, KeyboardAvoidingView, StyleSheet, TouchableWithoutFeedback, Text, Platform, Button, Image, TextInputProps, ColorValue, useWindowDimensions, TouchableOpacity, FlatList, Keyboard, ImageBackground } from 'react-native';
import { RootStackParamList } from '../../types';
import IconButton from '../../components/IconButton';
import * as PromotionService from '../../services/promotion';
import useRootNavigation from '../../hooks/useRootNavigation';
import Loading from '../../components/Loading';
import Refresh from '../../components/Refresh';
import NotFound from '../../components/NotFound';
import TextInputLabel from '../../components/TextInputLabel';
import { TabBar, TabView, TabBarIndicator } from 'react-native-tab-view';
import CustomTopTabBar, { TabViewRouteProps } from '../../components/CustomTopTabBar';
import useLoadScreen from '../../hooks/useLoadScreen';
import BottomHalfModalContext from '../../contexts/BottomHalfModal';
import { StatusBar, setStatusBarHidden } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import SnackBar from '../../components/SnackBar';
import useUri from '../../hooks/useUri';
import Animated, { cancelAnimation, Extrapolate, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const timer = 5000;

export default function Offers ({
  navigation,
  route
}: StackScreenProps<RootStackParamList, 'Offers'>) {
  const top = useHeaderHeight()

  const { colors, dark } = useTheme()
  const { store } = route?.params 

  const rootNavigation = useRootNavigation()
  const layout = useWindowDimensions()

  const { 
    response, 
    loading,
    refreshing, 
    onRefresh,
    onLoading,
    disabled
  } = useLoadScreen<PromotionService.PromotionData>(async () => await PromotionService.index({ store }))
  useEffect(() => { onLoading(); }, [])

  const [index, setIndex] = React.useState(0)
  
  const [routes, setRoutes] = React.useState<Array<TabViewRouteProps>>([])
  
  React.useEffect(() => {
    setRoutes(response?.data?.map(item => ({
      key: item?._id, 
      id: item?._id, 
      slug: item?.slug,
      title: item?.name,
      uri: item?.uri,
      subTitle: item?.about,
      quantity: item?.products?.length,
    })))
  }, [response?.data])

  const [pressIn, setPressIn] = React.useState(false)
  
  const renderScene = React.useCallback(({ route, jumpTo }) => 
    <OfferRoute 
        onPressIn={() => setPressIn(true)} 
        onPressOut={() => setPressIn(false)} 
        slug={route?.slug}
        id={route?.id} 
        uri={route?.uri} 
        title={route?.title} 
        subTitle={route?.subTitle} 
        quantity={route?.quantity}
        setIndex={setIndex} 
        length={routes?.length} 
        index={index}
    />
  , [index, setIndex, routes, setPressIn])

  const timerAnim = useSharedValue(0)

  React.useEffect(() => {
    timerAnim.value = withTiming(1, {
      duration: timer
    })
    const interval = setInterval(() => {
      timerAnim.value = 0;
      if(index < (routes?.length-1) && !pressIn) {
        setIndex(index => index+1)
      } else {
        navigation.goBack()
      }
    }, timer);

    if (pressIn) { 
      cleanup();
    }
    
    function cleanup () {
      clearInterval(interval);
      cancelAnimation(timerAnim) 
      timerAnim.value = 0;
    }

    return cleanup
  }, [setIndex, index, routes, pressIn]);

  const BottomHalfModal = React.useContext(BottomHalfModalContext)

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      headerBackground: ({ style }) => <LinearGradient style={[style, { flex: 1 }]}  colors={['rgba(0, 0, 0, .2)', 'transparent']}/>,
      headerTitleAlign: 'left',
      headerRight: ({ tintColor }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton 
            name={'more-horiz'}
            size={24}
            color={colors.text}
            onPress={() => {}}
          />
        </View>
      ),
    });
  }, []))

  useEffect(() => {
    setStatusBarHidden(true, 'fade')

    return () => setStatusBarHidden(false, 'fade')
  }, [setStatusBarHidden])

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      width: interpolate(timerAnim.value, 
        [0, 1],
        [0, (100/routes?.length)-2.5],
      ) + '%',
    }
  })
  

  return (
      <TabView style={{ }}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={props => (
          <TabBar {...props}
              style={[{ 
                  elevation: 0, shadowColor: 'transparent', 
                  backgroundColor: 'transparent', 
                  height: 8,
              }]}
              inactiveColor={colors.text}
              pressColor={colors.border}
              activeColor={colors.text}
              indicatorStyle={[
                { 
                  backgroundColor: colors.text, borderRadius: 4,
                  zIndex: 2, height: 4,
                },
                indicatorStyle
              ]}
              renderIndicator={props => 
                <>
                  <TabBarIndicator {...props} 
                    style={[props?.style, { 
                    left: props.navigationState.index === 0 ? '1.5%' : 0,
                    right: props.navigationState.index === (routes?.length-1) ? '1.5%' : 0,
                   }]}/>
                  <View style={{ 
                    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
                    position: 'absolute', bottom: 0, zIndex: 1,
                  }}>
                    {routes.map((item, index) => (
                      <View key={item?.key} style={{ 
                        width: `${(100/routes?.length)-2}%`, 
                        marginLeft: index === 0 ? '1%' : '.5%',
                        marginRight: index === (routes?.length-1) ? '1%' : '.5%',
                        height: 4, borderRadius: 4, 
                        backgroundColor: colors.text, 
                        opacity: index < props.navigationState?.index ? 1 : .5,
                      }}/>
                    ))}
                  </View>
                </>
              }
              labelStyle={{ height: 4, color: colors.text, textTransform: 'capitalize' }}
              renderLabel={({ route, focused, color }) => null}
          />
        )}
      />
  );
};

interface OfferProps {
    slug: string
    id: string  
    uri?: string
    title?: string
    subTitle?: string
    quantity?: number
    index?: number
    setIndex?: React.Dispatch<React.SetStateAction<number>>
    length?: number
    onPressIn?: () => any
    onPressOut?: () =>any
}

const OfferRoute: React.FC<OfferProps> = ({ 
  title, subTitle, id, quantity, slug,
  uri:initialUri, 
  index, setIndex, length, onPressIn, onPressOut 
}) => {
  const { colors, dark } = useTheme()
  const { width } = useWindowDimensions()
  const navigation = useNavigation<NavigationProp<RootStackParamList, 'Offers'>>()
  const route = useRoute<RouteProp<RootStackParamList, 'Offers'>>()
  const { store } = route.params

  const [backgroundColor, setBackgroundColor] = React.useState('transparent')
  const uri = useUri({ 
    defaultSource: require('../../assets/images/default-product.jpg'),
    // defaultUri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAOb32U0uCmM_kGue0IXlgnwQmNmB_J5Ys3Q&usqp=CAU',
    uri: initialUri
  })

  return (
    <ImageBackground style={{ flex: 1 }}
        source={{ uri }}
        resizeMode={'contain'}
        imageStyle={{ backgroundColor }}
    >
        <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut}>
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <TouchableWithoutFeedback disabled={index===0} onPressIn={onPressIn} onPressOut={onPressOut} onPress={() => setIndex(index-1)}>
                        <View style={{ flex: 1 }}/>
                    </TouchableWithoutFeedback>
                    <View style={{ flex: 1 }}/>
                    <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut} onPress={() => {
                      if (index < (length-1)) {
                        setIndex(index+1)
                      } else {
                        navigation.goBack()
                      }
                    }}>
                        <View style={{ flex: 1 }}/>
                    </TouchableWithoutFeedback>
                </View>
                <SnackBar visible
                  messageColor={colors.text}
                  dark={dark}
                  position={"bottom"}
                  // icon={'tag'}
                  iconColor={colors.text}
                  textMessage={'% '+title}
                  textSubMessage={subTitle}
                  indicatorIcon
                  onPress={() => navigation.navigate('Promotion', { store, slug })}
                  actionText={quantity}
                  accentColor={colors.text}
                />
            
            </View>
        </TouchableWithoutFeedback>
    </ImageBackground>
  )
}