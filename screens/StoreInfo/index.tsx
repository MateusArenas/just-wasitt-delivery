import { useFocusEffect, useTheme } from '@react-navigation/native';
import { HeaderBackButton, StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useContext, useState } from 'react';
import { View, StyleSheet, Button, TextInput, Text, useWindowDimensions, Image } from 'react-native';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { TabView, SceneMap } from 'react-native-tab-view';
import CustomTopTabBar from '../../components/CustomTopTabBar';
import { StoreDate } from '../../services/store';
import TextButton from '../../components/TextButton';
import { RootStackParamList } from '../../types';
import { getDay, parseISO, isAfter, setHours, setMinutes, compareDesc } from 'date-fns';
import useStoreStatus from '../../hooks/useStoreStatus';
import { writePrice } from '../../utils';
import AuthContext from '../../contexts/auth';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { gql, NetworkStatus, useQuery } from '@apollo/client';
import Loading from '../../components/Loading';

const STORE_INFO = gql`
query CurrentStore($matchName: String!) {
  store(match: { name: $matchName }) {
    _id, uri, name, about, self, city, state, 
    user { _id, email }, cnpj,
    delivery, deliveryTimeMin, 
    creditPayments, mealTicketPayments,
    minDeliveryBuyValue, 
    monday, mondayStart, mondayEnd, tuesday, tuesdayStart, tuesdayEnd 
    wednesday, wednesdayStart, wednesdayEnd, thursday, thursdayStart, thursdayEnd, 
    friday, fridayStart, fridayEnd, saturday, saturdayStart, saturdayEnd 
    sunday, sundayStart, sundayEnd
  }
}
`;

export default function StoreInfo({
  navigation,
  route
}: StackScreenProps<RootStackParamList, 'StoreInfo'>) {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  const [extraTop, setExtraTop] = React.useState(0)
  
  const { user } = React.useContext(AuthContext) 
  const layout = useWindowDimensions()
  const { colors, dark } = useTheme()
  const { store } = route.params

  const { loading, error, data: curentStore, refetch, networkStatus } = useQuery(
    STORE_INFO, 
    { 
      variables: { 
        matchName: store
      },
      fetchPolicy: "network-only",
      notifyOnNetworkStatusChange: true,
      // pollInterval: 500,
    }
  )

  const data = curentStore?.store

  // const { 
  //   response, 
  //   error, 
  //   loading, 
  //   onRefresh 
  // } = useService<StoreService.StoreDate>(StoreService, 'index', { name: store })
  // const data: StoreDate = response?.data[0]

  const days = [
    { day: 'Domingo', start: data?.sundayStart, end: data?.sundayEnd, open: data?.saturday },
    { day: 'Segunda-feira', start: data?.mondayStart, end: data?.mondayEnd, open: data?.monday },
    { day: 'Ter??a-feira', start: data?.tuesdayStart, end: data?.tuesdayEnd, open: data?.tuesday },
    { day: 'Quarta-feira', start: data?.wednesdayStart, end: data?.wednesdayEnd, open: data?.wednesday },
    { day: 'Quinta-feira', start: data?.thursdayStart, end: data?.thursdayEnd, open: data?.thursday },
    { day: 'Sexta-feira', start: data?.fridayStart, end: data?.fridayEnd, open: data?.friday },
    { day: 'S??bado', start: data?.saturdayStart, end: data?.saturdayEnd, open: data?.saturday },
  ]

  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState([
    { key: 'about', title: 'Sobre' },
    { key: 'hour', title: 'Horario' },
    { key: 'payment', title: 'Pagamento' },
  ])

  const renderScene = React.useCallback(({ route }) => {
    switch (route.key) {
      case 'about':
        return <FirstRoute extraTop={extraTop} data={data}/>
      case 'hour':
        return <SecondRoute extraTop={extraTop} data={days}/>
      case 'payment': 
        return <ThirdRoute extraTop={extraTop} data={data}/>
      default:
        return null;
    }
  }, [days, data, extraTop])

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      headerRight: ({ tintColor }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {data?.self && <TextButton style={{ paddingHorizontal: 20 }}
            label={'Editar'}
            fontSize={16}
            color={colors.primary}
            disabled={!data?._id}
            onPress={() => navigation.navigate('EditStore', { id: data?._id })}
          />}
        </View>
      ),
    });
  }, [data]))

  if (networkStatus === NetworkStatus.loading && loading) return <Loading />

  return (
    <TabView swipeEnabled
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={props => 
        <BlurView 
          onLayout={e => setExtraTop(e?.nativeEvent?.layout?.height)}
          style={{ position: 'absolute', top, width: '100%', zIndex: 1 }} 
          intensity={100} tint={dark ? 'dark' : 'light'}
        >
          <CustomTopTabBar {...props} style={{ backgroundColor: 'transparent' }} />
        </BlurView>
      }
    />
  )
}

const FirstRoute = ({ data, extraTop }: { data: StoreDate, extraTop: number }) => {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0

  const { colors } = useTheme()
  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: colors.card }} 
      contentContainerStyle={{ paddingTop: top+extraTop, paddingBottom: bottom }}
      scrollIndicatorInsets={{ top: top+extraTop, bottom }}
    >
      { data?.delivery && 
        <View style={{ padding: 10 }}>
          <Text style={[styles.title, { color: colors.text }]}>Delivery:</Text>
          <Text style={[styles.subTitle, { color: colors.text }]}>{`Tempo: ${data?.deliveryTimeMin} h?? ${data?.deliveryTimeMax} minutos`}</Text>
          <Text style={[styles.subTitle, { color: colors.text }]}>{`Valor: ${writePrice(data?.deliveryPrice)}`}</Text>
        </View>
      }

      <View style={{ padding: 10 }}>
        <Text style={[styles.title, { color: colors.text }]}>Endere??o:</Text>
        <Text style={[styles.subTitle, { color: colors.text }]}>{`${data?.street}, ${data?.houseNumber} - ${data?.district}`}</Text>
        <Text style={[styles.subTitle, { color: colors.text }]}>{`${data?.city} - ${data?.state}`}</Text>
        <Text style={[styles.subTitle, { color: colors.text }]}>{`CEP: ${data?.ceep}`}</Text>
      </View>

      <View style={{ padding: 10 }}>
        <Text style={[styles.title, { color: colors.text }]}>Outras informa????es:</Text>
        <Text style={[styles.subTitle, { color: colors.text }]}>{`CNPJ: ${data?.cnpj}`}</Text>
        <Text style={[styles.subTitle, { color: colors.text }]}>{`Email: ${data?.user?.email}`}</Text>
      </View>
    </ScrollView>
  )
}

const SecondRoute = ({ data, extraTop }: { data: Array<{ day: string, start: string, end: string, open: boolean }>, extraTop: number }) => {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0

  const current = data[getDay(Date.now())]
  const isOpen = useStoreStatus(current)
  return (
    <FlatList style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: top+extraTop, paddingBottom: bottom }}    
      scrollIndicatorInsets={{ top: top+extraTop, bottom }}  
      data={data}
      keyExtractor={(item, index) => `${item?.day}-${index}`}
      renderItem={({ item, index }) => 
        <DayHour 
          closed={!isOpen}
          active={getDay(Date.now()) === index} 
          data={{ day: item?.day, start: item?.start, end: item?.end }} 
        />
      }
    />
  )
}

const DayHour: React.FC<
{ active?: boolean, closed?: boolean, data: { day: string, start: string, end: string } }
> = ({ active, closed, data }) => {
  const { colors } = useTheme()
  return (
    <View style={{ padding: 5,
      backgroundColor: colors.card,
      display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' 
    }}>
      <Text style={{ 
        padding: 10,
        color: active ? closed ? 'red' : colors.primary : colors.text,
        fontSize: 16, fontWeight: '500', 
      }}>{data?.day}</Text>
      <Text style={{ 
        padding: 10,
        color: active ? closed ? 'red' : colors.primary : colors.text,
        fontSize: 16, fontWeight: '500',
      }}>{`${data?.start} ??s ${data?.end}`}</Text>
    </View>
  )
}


const ThirdRoute = ({ data, extraTop }: { data: StoreDate, extraTop: number }) => {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  const { colors } = useTheme()
  const creditPayments = data?.creditPayments.map(key => {
    switch (key) {
      case 'mastercard':
        return ({ key, title: 'Mastercard', source: require('../../assets/images/payments/mastercard.png') })    
      case 'amex':
        return ({ key, title: 'Amex', source: require('../../assets/images/payments/amex.png') })    
      case 'hipercard':
        return ({ key, title: 'Hipercard', source: require('../../assets/images/payments/hipercard.png') })  
      case 'visa':
        return ({ key, title: 'Visa', source: require('../../assets/images/payments/visa.png') })  
      case 'elo':
        return ({ key, title: 'Elo', source: require('../../assets/images/payments/elo.png') })        
      default:
        return null
    }
  })
  const mealTicketPayments = data?.mealTicketPayments.map(key => {
    switch (key) {
      case 'ben':
        return ({ key, title: 'Ben refei????o', source: require('../../assets/images/payments/ben.png') })          
      default:
        return null
    }
  })
  return (
  <ScrollView style={{ flex: 1 }}
    contentContainerStyle={{ paddingTop: top+extraTop, paddingBottom: bottom }}
    scrollIndicatorInsets={{ top: top+extraTop, bottom }}
  >
    <View style={{ flex: 1, padding: 10 }} >
      <View style={{ padding: 5 }}>
        {!!creditPayments?.length && <View>
          <Text>Cr??dito</Text>
          <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>  
            {creditPayments?.map(creditPayment => creditPayment ? (
              <View key={creditPayment?.key} style={{ 
                display: 'flex', 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
              }}>
                <Image style={{ height: 20, width: 30, borderRadius: 5 }} source={creditPayment?.source} />
                <Text style={{ padding: 10, fontWeight: '500', fontSize: 14, color: colors.text  }}>{creditPayment?.title}</Text>
              </View>
            ) : null)}
          </View>
        </View>}

        {!!mealTicketPayments?.length && <View>
          <Text>Vale-refei????o</Text>
          <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
            {mealTicketPayments?.map(mealTicketPayment => mealTicketPayment ? (
              <View key={mealTicketPayment?.key} style={{ 
                display: 'flex', 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
              }}>
                <Image style={{ height: 20, width: 30, borderRadius: 5 }} source={mealTicketPayment?.source} />
                <Text style={{ padding: 10, fontWeight: '500', fontSize: 12, color: colors.text  }}>{mealTicketPayment?.title}</Text>
              </View>
            ) : null)}
          </View>
        </View>}

      </View>
    </View>
  </ScrollView>
)};

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  subTitle: {
    opacity: .8,
    fontSize: 14,
    fontWeight: '500',
  }
})