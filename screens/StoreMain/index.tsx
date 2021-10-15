import React, { useEffect, useState } from 'react';
import { View, Text } from '../../components/Themed';
import IconButton from '../../components/IconButton';
import Colors from '../../constants/Colors';
import { TabStoreMainParamList } from '../../types';
import useRootNavigation from '../../hooks/useRootNavigation';
import ScrollableTabNavigator from '../../navigation/Navigators/ScrollableTabNavigator';
import Category from '../Category';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '../../components/Slider';
import StoreAbout from '../../components/StoreAbout';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerActions, useTheme } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import api from '../../services/api';

function StoreMain({ 
  navigation,
  route
} : DrawerScreenProps<TabStoreMainParamList, 'Main'>) {
  const { store } = route?.params
  const { colors } = useTheme();

  // const [{ data, loading }, setState] = React.useState<any>({})

  // React.useEffect(() => {
  //   (async () => {
  //     try {
  //       setState({ loading: true })
  //       const { data: [apiData] } = await api.get(`/store/${store}`)
  //       setState({ data: apiData })
  //     } catch (err) {
  //       setState({ loading: false })
  //       rootNavigation.navigate('NotFound')
  //     } finally {
  //       setState(state => ({...state, loading: false }))
  //     }
  //   })()
  // }, [setState])
  
  // if (loading) return (<View style={{ flex: 1, backgroundColor: Colors.light.colors.primary }}/>)

  const textProps = {
    lightColor: Colors.light.colors.text,
    darkColor:  Colors.dark.colors.text
  }

  return (
    <View style={{ flex: 1 }} >
      {/* <Text style={{ color: 'red' }}>{JSON.stringify(data)}</Text> */}
      <View style={{//Body
        flex: 1,
      }}>

        <ScrollableTabNavigator 
          ListHeaderComponent={Main}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <IconButton name="add" size={24} color={colors.text} onPress={() => {}} />
            </View>
          }
          tintColor={ colors.primary }
          tabBarLabelStyle={{ color: colors.text }}
          tabBarContentStyle={{ backgroundColor: colors.background }}
          floatButtonIcon={<MaterialIcons name={'expand-less'} size={24} color={'white'}/>}
          data={[
            { name: 'um', component: Category },
            { name: 'dois', component: Category },
          ]}
        />
        
      </View>
      
    </View>
  )
}


const Main: React.FC = () => {
  return (
  <View style={{ flex: 1, marginTop: 10 }}>
    <Slider 
      data={[{ id: 0, uri: '' }]}
      height={120}
      onPressChange={item => {
        console.log(item);
      }}  
    />

    <StoreAbout />
  </View>
  )
}


export default StoreMain;