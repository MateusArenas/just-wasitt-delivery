import { StackActions, useFocusEffect, useTheme } from '@react-navigation/native';
import { HeaderTitle, StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useContext, useEffect } from 'react';
import { Clipboard, View, KeyboardAvoidingView, StyleSheet, TouchableWithoutFeedback, Text, Platform, Button, Image, TextInputProps, ColorValue, useWindowDimensions, TouchableOpacity, FlatList, Keyboard, ImageBackground } from 'react-native';
import {  TextInput, ScrollView } from 'react-native-gesture-handler';
import AuthContext from '../../contexts/auth';
import { RootStackParamList } from '../../types';
import IconButton from '../../components/IconButton';
import * as StoreService from '../../services/store';
import * as ManageService from '../../services/manage';
import useRootNavigation from '../../hooks/useRootNavigation';
import Loading from '../../components/Loading';
import Refresh from '../../components/Refresh';
import NotFound from '../../components/NotFound';
import TextInputLabel from '../../components/TextInputLabel';
import { TabBar, TabView } from 'react-native-tab-view';
import CustomTopTabBar, { TabViewRouteProps } from '../../components/CustomTopTabBar';
import CustomBottomTabBar from '../../components/CustomBottomTabBar';
import FormAndress from '../../components/FormAndress';
import InputCheck from '../../components/InputCheck';
import { MaterialIcons } from '@expo/vector-icons';
import TextButton from '../../components/TextButton';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import KeyboardSpacer from '../../components/KeyboardSpacer';
import useLoadScreen from '../../hooks/useLoadScreen';
import CardLink from '../../components/CardLink';
import BottomHalfModalContext from '../../contexts/BottomHalfModal';
import { BlurView } from 'expo-blur';
import { StatusBar, setStatusBarHidden } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';


export default function Offers ({
  navigation,
  route
}: StackScreenProps<RootStackParamList, 'Offers'>) {
  const top = useHeaderHeight()

  const { colors, dark } = useTheme()
  const { store } = route?.params 

  const rootNavigation = useRootNavigation()
  const layout = useWindowDimensions()

  const [index, setIndex] = React.useState(0)

  const data: Array<TabViewRouteProps> = [
    { key: '0', title: 'Principais' },
    { key: '1', title: 'Foto' },
    { key: '2', title: 'Configurações' },
    { key: '3', title: 'Endereço' },
  ]

  const [routes] = React.useState<Array<TabViewRouteProps>>(data)
  

  const [pressIn, setPressIn] = React.useState(false)
  
  const renderScene = React.useCallback(({ route, jumpTo }) => 
    <OfferRoute 
        onPressIn={() => setPressIn(true)} 
        onPressOut={() => setPressIn(false)} 
        title={route?.title} 
        setIndex={setIndex} 
        length={data?.length} 
        index={index}
    />
  , [index, setIndex, data, setPressIn])


  React.useEffect(() => {
    const interval = setInterval(() => {
      if(index < data?.length && !pressIn) {
        setIndex(index => index+1)
      } else {
        navigation.goBack()
      }
    }, 3000);

    if (pressIn) {
        clearInterval(interval)
    }
    return () => clearInterval(interval);
  }, [setIndex, index, data, pressIn]);

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
                borderBottomWidth: 1, borderColor: colors.border,
                height: 8,
            }]}
            inactiveColor={colors.text}
            pressColor={colors.border}
            activeColor={colors.text}
            indicatorStyle={{ backgroundColor: colors.text, opacity: .5 }}
            labelStyle={{ height: 4, color: colors.text, textTransform: 'capitalize' }}
            renderLabel={({ route, focused, color }) => null}
        />
      )}
    />
  );
};

interface OfferProps {
    title?: string
    index?: number
    setIndex?: React.Dispatch<React.SetStateAction<number>>
    length?: number
    onPressIn?: () => any
    onPressOut?: () =>any
}

const OfferRoute: React.FC<OfferProps> = ({ title, index, setIndex, length, onPressIn, onPressOut }) => {
  const { colors } = useTheme()
  const { width } = useWindowDimensions()
  return (
    <ImageBackground style={{ flex: 1 }}
        source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAOb32U0uCmM_kGue0IXlgnwQmNmB_J5Ys3Q&usqp=CAU' }}
    >
        <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut}>
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <TouchableWithoutFeedback disabled={index===0} onPressIn={onPressIn} onPressOut={onPressOut} onPress={() => setIndex(index-1)}>
                        <View style={{ flex: 1 }}/>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback disabled={index===length-1} onPressIn={onPressIn} onPressOut={onPressOut} onPress={() => setIndex(index+1)}>
                        <View style={{ flex: 1 }}/>
                    </TouchableWithoutFeedback>
                </View>
            
                <TouchableOpacity onPress={() => {}}>
                    <LinearGradient style={{ padding: 20, alignItems: 'center' }} 
                        colors={['transparent', 'rgba(0, 0, 0, .2)']}
                    >
                        <MaterialIcons
                            name={'expand-less'}
                            size={24*2}
                            color={colors.text}
                        />
                        <Text style={{
                            color: colors.text, fontWeight: '500',
                            fontSize: 16, 
                        }}>{title}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </TouchableWithoutFeedback>
    </ImageBackground>
  )
}