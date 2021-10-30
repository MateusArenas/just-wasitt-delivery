import { StackActions, useFocusEffect, useTheme } from '@react-navigation/native';
import { HeaderTitle, StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useContext, useEffect } from 'react';
import { Clipboard, View, KeyboardAvoidingView, StyleSheet, Text, Platform, Button, Image, TextInputProps, ColorValue, useWindowDimensions, TouchableOpacity, FlatList, Keyboard } from 'react-native';
import { TouchableWithoutFeedback, TextInput, ScrollView } from 'react-native-gesture-handler';
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
import { TabView } from 'react-native-tab-view';
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

export default function MakeStore ({
  navigation,
  route
}: StackScreenProps<RootStackParamList, 'MakeStore'>) {
  const top = useHeaderHeight()

  const rootNavigation = useRootNavigation()
  const layout = useWindowDimensions()
  const [state, setState] = React.useState<StoreService.StoreDate>({
    delivery: true,
    pickup: true,
    paymentMoney: true,
    deliveryTimeMin: '60:00',
    deliveryTimeMax: '90:00',
    deliveryPrice: 3,

  } as StoreService.StoreDate) 
  const { signed } = useContext(AuthContext)
  const { colors } = useTheme()

  const id = route.params?.id

  const {
    disabled,
    response,
    loading,
    refreshing,
    onLoading,
    onService,
    onRefresh,
  } = useLoadScreen<ManageService.ManageDate>(async () => await ManageService.search({ id }))

  useEffect(() => { if(id) { onLoading() } }, [])
  const data = response?.data[0]

  React.useEffect(() => {
    if (data) {
      setState(data)
    }
  }, [data, setState])

  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState<Array<TabViewRouteProps>>([
    { key: 'main', icon: 'menu', title: 'Principais' },
    { key: 'image', icon: 'photo-camera', title: 'Foto' },
    { key: 'config', icon: 'device-hub', title: 'Configurações' },
    { key: 'andress', icon: 'location-on', title: 'Endereço' },
  ])

  const renderScene = React.useCallback(({ route }) => {
    switch (route.key) {
      case 'main':
        return <MainRoute state={state} onChangeState={setState} />
      case 'image':
        return <ImageRoute value={state?.uri} onChangeValue={uri => setState({...state, uri })} />
      case 'andress':
        return <FormAndress state={state} onChangeState={andress => setState({...state, ...andress})} />
      case 'config': 
        return <ConfigRoute state={state} onChangeState={setState} />
      default:
        return null;
    }
  }, [state, setState])


  const onSubmit = React.useCallback(async () => {
    if (!signed) return null
    try {
      if(id) {
        await onService(async () => await ManageService.update({ id, body: state }))
      } else {
        await onService(async () => await ManageService.create({ body: state }))
      }
      Keyboard.dismiss()
      rootNavigation.refresh('Root')
      navigation.goBack()
    } catch (err) {}
  }, [onService, signed, state, id])


  const BottomHalfModal = React.useContext(BottomHalfModalContext)

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      title: data?.name ? data?.name : 'Nova Loja',
      headerRight: ({ tintColor }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextButton style={{ paddingHorizontal: 20 }}
            label={'Concluir'}
            fontSize={16}
            color={colors.primary}
            // disabled={
            //   !name || !percent
            //   || !!data?.otherPromotions?.find(item => (item?.name === name && item?._id !== id)) 
            // }
            onPress={onSubmit}
          />
        </View>
      ),
    });
  }, [onSubmit, data]))

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      headerRight: ({ tintColor }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextButton style={{ paddingHorizontal: 20 }}
            label={'Confirmar'}
            fontSize={14}
            color={colors.primary}
            onPress={onSubmit}
          />
        </View>
      ),
    });
  }, [onSubmit]))
  
  if (loading) return <Loading />
  if (!response?.network) return <Refresh onPress={() => navigation.dispatch(StackActions.replace('MakeStore', { id }))}/>
  if (!response?.ok) return <NotFound title={`This Product doesn't exist.`} redirectText={`Go to home screen!`}/>
  
  return (
    <TabView style={{ paddingTop: top }}
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={props => <CustomTopTabBar {...props}/>}
    />
  );
};

interface RouteProps {
  bottomTabBarHeight?: number
  state: StoreService.StoreDate
  onChangeState: (state: StoreService.StoreDate) => any
}

const MainRoute: React.FC<RouteProps> = ({ state, onChangeState }) => {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  const { colors } = useTheme()

  return (
    <View style={{ flex: 1 }}>
      <ScrollView focusable
        contentContainerStyle={{ paddingBottom: bottom }}
        scrollIndicatorInsets={{ top, bottom }}
        keyboardDismissMode={'none'}
        keyboardShouldPersistTaps={'handled'}
        style={{ flex: 1, padding: 10, backgroundColor: colors.card }}
      >
        <TextInputLabel 
          label={'Nome'}
          color={colors.text} 
          placeholder="Nome da loja..." 
          value={state?.name} 
          onChangeText={name => onChangeState(({ ...state, name }))}
        />
        <TextInputLabel 
          label={'Sobre'}
          color={colors.text} 
          placeholder="Sobre a loja..." 
          value={state?.about} 
          onChangeText={about => onChangeState(({ ...state, about }))}
        />
        <TextInputLabel 
          type={'cel-phone'}
          options={{
            maskType: 'BRL',
            withDDD: true,
            dddMask: '(99) '
          }}
          label={'Numero de telefone'}
          color={colors.text} 
          placeholder="Numero de telefone da loja..." 
          value={state?.phoneNumber} 
          onChangeText={phoneNumber => onChangeState({ ...state, phoneNumber })}
        />
        <TextInputLabel 
          type={'cel-phone'}
          options={{
            maskType: 'BRL',
            withDDD: true,
            dddMask: '(99) '
          }}
          label={'Numero do whatsapp'}
          color={colors.text} 
          placeholder="Numero do Whatsapp da loja..." 
          value={state?.whatsappNumber} 
          onChangeText={whatsappNumber => onChangeState({ ...state, whatsappNumber })}
        />
      </ScrollView>
      <KeyboardSpacer topSpacing={-bottom} />
    </View>
  )
}


const ImageRoute: React.FC<{
  value: string
  onChangeValue: (uri: string) => any
}> = ({ value, onChangeValue }) => {
  const { colors } = useTheme()
  return (
    <View style={{ flex: 1, height: 250, alignItems: 'center', justifyContent: 'center' }}>
      <TouchableOpacity onPress={async () => {
        const uri = await Clipboard.getString()
        onChangeValue(uri)
      }}>
        {!value ? <MaterialIcons 
          style={{ padding: 20, borderColor: colors.border, borderWidth: 4, borderRadius: 200 }}
          name="photo-camera"
          size={24*4}
          color={colors.border}
        /> : 
        <View style={{ padding: 20, borderColor: colors.border, borderWidth: 4, borderRadius: 200, overflow: 'hidden' }}>
          <Image source={{ uri: value, width: 24*4, height: 24*4 }} style={{ borderRadius: 200 }}/>
        </View>
        }
      </TouchableOpacity>
      <TouchableOpacity onPress={async () => {
        const uri = await Clipboard.getString()
        onChangeValue(uri)
      }}>
        <Text style={{ 
          color: colors.primary, 
          fontWeight: '500', 
          fontSize: 16, padding: 10
        }}>{'Alterar Imagem'}</Text>
      </TouchableOpacity>
    </View>
  )
}


const ConfigRoute: React.FC<RouteProps> = ({ state, onChangeState }) => {
  const [bottomTabBarHeight, setBottomTabBarHeight] = React.useState(0)
  const layout = useWindowDimensions()
  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState([
    { key: 'delivery', title: 'Entrega' },
    { key: 'horary', title: 'Horario' },
    { key: 'payment', title: 'Pagamento' },
  ])

  const renderScene = React.useCallback(({ route }) => {
    switch (route.key) {
      case 'delivery': 
        return <DeliveryRoute bottomTabBarHeight={bottomTabBarHeight} state={state} onChangeState={onChangeState} />
      case 'horary':
        return <HoraryRoute bottomTabBarHeight={bottomTabBarHeight} state={state} onChangeState={onChangeState} />
      case 'payment':
        return <PaymentRoute bottomTabBarHeight={bottomTabBarHeight} state={state} onChangeState={onChangeState} />
      default:
        return null;
    }
  }, [state, onChangeState, bottomTabBarHeight])

  return (
    <TabView tabBarPosition="bottom"
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={props => 
        <CustomBottomTabBar {...props}
          onLayout={e => setBottomTabBarHeight(e.nativeEvent?.layout?.height)}
        />
      }
    />
  )
}

const HoraryRoute: React.FC<RouteProps> = ({ state, onChangeState, bottomTabBarHeight=0 }) => {
  const { colors } = useTheme()
  const topSpacing = React.useContext(BottomTabBarHeightContext) || 0

  return (
    <View style={{ flex: 1 }}>
      <ScrollView focusable
        keyboardDismissMode={'none'}
        keyboardShouldPersistTaps={'handled'}
        style={{ flex: 1, padding: 10, backgroundColor: colors.card }}
      >
        <InputCheck
          label={`Domingo ${ state?.sunday ? '(aberto)' : '(fechado)'}`}
          check={state?.sunday}
          onPress={() => onChangeState({ ...state, sunday: !state?.sunday })}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TextInputLabel
            type={'datetime'}
            options={{ format: 'HH:mm' }}  
            label={'Abertura'}
            color={colors.text} 
            placeholder="Horário: 00:00" 
            value={state?.sundayStart} 
            onChangeText={sundayStart => onChangeState({ ...state, sundayStart: sundayStart })}
          />
          <TextInputLabel 
            type={'datetime'}
            options={{ format: 'HH:mm' }} 
            label={'Encerramento'}
            color={colors.text} 
            placeholder="Horário: 00:00" 
            value={state?.sundayEnd}
            onChangeText={sundayEnd => onChangeState({ ...state, sundayEnd: sundayEnd })}
          />
        </View>
        <InputCheck
          label={`Segunda-Feira ${ state?.monday ? '(aberto)' : '(fechado)'}`}
          check={state?.monday}
          onPress={() => onChangeState({ ...state, monday: !state?.monday })}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TextInputLabel
            type={'datetime'}
            options={{ format: 'HH:mm'  }} 
            label={'Abertura'}
            color={colors.text} 
            placeholder="Horário: 00:00" 
            value={state?.mondayStart} 
            onChangeText={mondayStart => onChangeState({ ...state, mondayStart: mondayStart })}
          />
          <TextInputLabel 
            type={'datetime'}
            options={{ format: 'HH:mm' }} 
            label={'Encerramento'}
            color={colors.text} 
            placeholder="Horário: 00:00" 
            value={state?.mondayEnd}
            onChangeText={mondayEnd => onChangeState({ ...state, mondayEnd: mondayEnd })}
          />
        </View>
        <InputCheck
          label={`Terça-Feira ${ state?.tuesday ? '(aberto)' : '(fechado)'}`}
          check={state?.tuesday}
          onPress={() => onChangeState({ ...state, tuesday: !state?.tuesday })}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TextInputLabel
            type={'datetime'}
            options={{ format: 'HH:mm' }}  
            label={'Abertura'}
            color={colors.text} 
            placeholder="Horário: 00:00" 
            value={state?.tuesdayStart} 
            onChangeText={tuesdayStart => onChangeState({ ...state, tuesdayStart: tuesdayStart })}
          />
          <TextInputLabel 
            type={'datetime'}
            options={{ format: 'HH:mm' }} 
            label={'Encerramento'}
            color={colors.text} 
            placeholder="Horário: 00:00" 
            value={state?.tuesdayEnd}
            onChangeText={tuesdayEnd => onChangeState({ ...state, tuesdayEnd: tuesdayEnd })}
          />
        </View>
        <InputCheck
          label={`Quarta-Feira ${ state?.wednesday ? '(aberto)' : '(fechado)' }`}
          check={state?.wednesday}
          onPress={() => onChangeState({ ...state, wednesday: !state?.wednesday })}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TextInputLabel
            type={'datetime'}
            options={{ format: 'HH:mm' }}  
            label={'Abertura'}
            color={colors.text} 
            placeholder="Horário: 00:00" 
            value={state?.wednesdayStart} 
            onChangeText={wednesdayStart => onChangeState({ ...state, wednesdayStart: wednesdayStart })}
          />
          <TextInputLabel 
            type={'datetime'}
            options={{ format: 'HH:mm' }} 
            label={'Encerramento'}
            color={colors.text} 
            placeholder="Horário: 00:00" 
            value={state?.wednesdayEnd}
            onChangeText={wednesdayEnd => onChangeState({ ...state, wednesdayEnd: wednesdayEnd })}
          />
        </View>
        <InputCheck
          label={`Quinta-Feira ${ state?.thursday ? '(aberto)' : '(fechado)' }`}
          check={state?.thursday}
          onPress={() => onChangeState({ ...state, thursday: !state?.thursday })}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TextInputLabel
            type={'datetime'}
            options={{ format: 'HH:mm' }}  
            label={'Abertura'}
            color={colors.text} 
            placeholder="Horário: 00:00" 
            value={state?.thursdayStart} 
            onChangeText={thursdayStart => onChangeState({ ...state, thursdayStart: thursdayStart })}
          />
          <TextInputLabel 
            type={'datetime'}
            options={{ format: 'HH:mm' }} 
            label={'Encerramento'}
            color={colors.text} 
            placeholder="Horário: 00:00" 
            value={state?.thursdayEnd}
            onChangeText={thursdayEnd => onChangeState({ ...state, thursdayEnd: thursdayEnd })}
          />
        </View>
        <InputCheck
          label={`Sexta-Feira ${ state?.friday ? '(aberto)' : '(fechado)' }`}
          check={state?.friday}
          onPress={() => onChangeState({ ...state, friday: !state?.friday })}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TextInputLabel
            type={'datetime'}
            options={{ format: 'HH:mm' }}  
            label={'Abertura'}
            color={colors.text} 
            placeholder="Horário: 00:00" 
            value={state?.fridayStart} 
            onChangeText={fridayStart => onChangeState({ ...state, fridayStart: fridayStart })}
          />
          <TextInputLabel 
            type={'datetime'}
            options={{ format: 'HH:mm' }} 
            label={'Encerramento'}
            color={colors.text} 
            placeholder="Horário: 00:00" 
            value={state?.fridayEnd}
            onChangeText={fridayEnd => onChangeState({ ...state, fridayEnd: fridayEnd })}
          />
        </View>
        <InputCheck
          label={`Sábado ${ state?.saturday ? '(aberto)' : '(fechado)' }`}
          check={state?.saturday}
          onPress={() => onChangeState({ ...state, saturday: !state?.saturday })}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TextInputLabel
            type={'datetime'}
            options={{ format: 'HH:mm' }}  
            label={'Abertura'}
            color={colors.text} 
            placeholder="Horário: 00:00" 
            value={state?.saturdayStart} 
            onChangeText={saturdayStart => onChangeState({ ...state, saturdayStart: saturdayStart })}
          />
          <TextInputLabel 
            type={'datetime'}
            options={{ format: 'HH:mm' }} 
            label={'Encerramento'}
            color={colors.text} 
            placeholder="Horário: 00:00" 
            value={state?.saturdayEnd}
            onChangeText={saturdayEnd => onChangeState({ ...state, saturdayEnd: saturdayEnd })}
          />
        </View>
      </ScrollView>
      <KeyboardSpacer topSpacing={-(topSpacing+bottomTabBarHeight)} />
    </View>
  )
}



const DeliveryRoute: React.FC<RouteProps> = ({ state, onChangeState, bottomTabBarHeight=0 }) => {
  const { colors } = useTheme()
  const topSpacing = React.useContext(BottomTabBarHeightContext) || 0

  return (
    <View style={{ flex: 1 }}>
      <ScrollView focusable
        keyboardDismissMode={'none'}
        keyboardShouldPersistTaps={'handled'}
        style={{ flex: 1, padding: 10, backgroundColor: colors.card }}
      >
        <InputCheck
          label="Retirada na loja"
          check={state?.pickup}
          onPress={() => onChangeState({ ...state, pickup: !state?.pickup })}
        />
        <InputCheck
          label="Entrega por delivery"
          check={state?.delivery}
          onPress={() => onChangeState({ ...state, delivery: !state?.delivery })}
        />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <TextInputLabel
                type={'datetime'}
                options={{ format: 'mm:ss' }}  
                label={'Tempo Minimo'}
                color={colors.text} 
                placeholder="Horário: 00:00" 
                value={state?.deliveryTimeMin} 
                onChangeText={deliveryTimeMin => onChangeState({ ...state, deliveryTimeMin })}
              />
              <TextInputLabel 
                type={'datetime'}
                options={{ format: 'mm:ss' }} 
                label={'Tempo Maximo'}
                color={colors.text} 
                placeholder="Horário: 00:00" 
                value={state?.deliveryTimeMax}
                onChangeText={deliveryTimeMax => onChangeState({ ...state, deliveryTimeMax })}
              />
            </View>
            <TextInputLabel 
              label={'Infomações sobre a entrega'}
              color={colors.text} 
              placeholder="Infomações sobre a entrega..." 
              value={state?.deliveryAbout} 
              onChangeText={deliveryAbout => onChangeState({ ...state, deliveryAbout })}
            />
            <TextInputLabel 
              type={'money'}
              includeRawValueInChangeText={true}
              options={{
                precision: 2,
                separator: ',',
                delimiter: '.',
                unit: 'R$ ',
                suffixUnit: ''
              }}
              label={'Preço da entrega'}
              color={colors.text} 
              placeholder="Preço da entrega..." 
              value={state?.deliveryPrice as any} 
              onChangeText={(_, rawText) => onChangeState({ ...state, deliveryPrice: Number(rawText) })}
            />
            <TextInputLabel 
              type={'money'}
              includeRawValueInChangeText={true}
              options={{
                precision: 2,
                separator: ',',
                delimiter: '.',
                unit: 'R$ ',
                suffixUnit: ''
              }}
              label={'Valor minimo de compra no delivery'}
              color={colors.text} 
              placeholder="Valor minimo de valor de compra..." 
              value={state?.minDeliveryBuyValue as any} 
              onChangeText={(_, rawText) => onChangeState({ ...state, minDeliveryBuyValue: Number(rawText) })}
            />
      </ScrollView>
      <KeyboardSpacer topSpacing={-(topSpacing+bottomTabBarHeight)} />
    </View>
  )
}

const PaymentRoute: React.FC<RouteProps> = ({ state, onChangeState, bottomTabBarHeight=0 }) => {

  const { colors } = useTheme()
  const topSpacing = React.useContext(BottomTabBarHeightContext) || 0

  return (
    <View style={{ flex: 1 }}>
      <ScrollView focusable
        keyboardDismissMode={'none'}
        keyboardShouldPersistTaps={'handled'}
        style={{ flex: 1, padding: 10, backgroundColor: colors.card }}
      >
        <InputCheck
          label="Pagamento em dinheiro"
          check={state?.paymentMoney}
          onPress={() => onChangeState({ ...state, paymentMoney: !state?.paymentMoney })}
        />
        <InputCheck
          label="Pagamento no débito"
          check={state?.paymentDebt}
          onPress={() => onChangeState({ ...state, paymentDebt: !state?.paymentDebt })}
        />
        <InputCheck
          label="Pagamento no crédito"
          check={state?.paymentCredit}
          onPress={() => onChangeState({ ...state, paymentCredit: !state?.paymentCredit })}
        />
        <TouchableOpacity onPress={() => {
            state?.creditPayments?.find(item => item === 'mastercard') ? onChangeState({ ...state, creditPayments: state?.creditPayments.filter(item => item !== 'mastercard') })
            : onChangeState({ ...state, creditPayments: [...state?.creditPayments.filter(item => item !== 'mastercard'), 'mastercard'] })
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ padding: 10 }}>
              <Image style={{ height: 20, width: 30, borderRadius: 5 }} source={require('../../assets/images/payments/mastercard.png')} />
            </View>
            <Text style={{ flex: 1, padding: 10, color: colors.text, fontWeight: '500' }}>{'Mastercard'}</Text>
            <MaterialIcons style={{ padding: 10 }}
              name={state?.creditPayments?.find(item => item === 'mastercard') ? 'check-box' : 'check-box-outline-blank'} 
              size={24} 
              color={state?.creditPayments?.find(item => item === 'mastercard') ? colors.primary : colors.text} 
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
            state?.creditPayments?.find(item => item === 'amex') ? onChangeState({ ...state, creditPayments: state?.creditPayments.filter(item => item !== 'amex') })
            : onChangeState({ ...state, creditPayments: [...state?.creditPayments.filter(item => item !== 'amex'), 'amex'] })
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ padding: 10 }}>
              <Image style={{ height: 20, width: 30, borderRadius: 5 }} source={require('../../assets/images/payments/amex.png')} />
            </View>
            <Text style={{ flex: 1, padding: 10, color: colors.text, fontWeight: '500' }}>{'Amex'}</Text>
            <MaterialIcons style={{ padding: 10 }}
              name={state?.creditPayments?.find(item => item === 'amex') ? 'check-box' : 'check-box-outline-blank'} 
              size={24} 
              color={state?.creditPayments?.find(item => item === 'amex') ? colors.primary : colors.text} 
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
            state?.creditPayments?.find(item => item === 'hipercard') ? onChangeState({ ...state, creditPayments: state?.creditPayments.filter(item => item !== 'hipercard') })
            : onChangeState({ ...state, creditPayments: [...state?.creditPayments.filter(item => item !== 'hipercard'), 'hipercard'] })
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ padding: 10 }}>
              <Image style={{ height: 20, width: 30, borderRadius: 5 }} source={require('../../assets/images/payments/hipercard.png')} />
            </View>
            <Text style={{ flex: 1, padding: 10, color: colors.text, fontWeight: '500' }}>{'Hipercard'}</Text>
            <MaterialIcons style={{ padding: 10 }}
              name={state?.creditPayments?.find(item => item === 'hipercard') ? 'check-box' : 'check-box-outline-blank'} 
              size={24} 
              color={state?.creditPayments?.find(item => item === 'hipercard') ? colors.primary : colors.text} 
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
            state?.creditPayments?.find(item => item === 'visa') ? onChangeState({ ...state, creditPayments: state?.creditPayments.filter(item => item !== 'visa') })
            : onChangeState({ ...state, creditPayments: [...state?.creditPayments.filter(item => item !== 'visa'), 'visa'] })
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ padding: 10 }}>
              <Image style={{ height: 20, width: 30, borderRadius: 5 }} source={require('../../assets/images/payments/visa.png')} />
            </View>
            <Text style={{ flex: 1, padding: 10, color: colors.text, fontWeight: '500' }}>{'Visa'}</Text>
            <MaterialIcons style={{ padding: 10 }}
              name={state?.creditPayments?.find(item => item === 'visa') ? 'check-box' : 'check-box-outline-blank'} 
              size={24} 
              color={state?.creditPayments?.find(item => item === 'visa') ? colors.primary : colors.text} 
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
            state?.creditPayments?.find(item => item === 'elo') ? onChangeState({ ...state, creditPayments: state?.creditPayments.filter(item => item !== 'elo') })
            : onChangeState({ ...state, creditPayments: [...state?.creditPayments.filter(item => item !== 'elo'), 'elo'] })
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ padding: 10 }}>
              <Image style={{ height: 20, width: 30, borderRadius: 5 }} source={require('../../assets/images/payments/elo.png')} />
            </View>
            <Text style={{ flex: 1, padding: 10, color: colors.text, fontWeight: '500' }}>{'Elo'}</Text>
            <MaterialIcons style={{ padding: 10 }}
              name={state?.creditPayments?.find(item => item === 'elo') ? 'check-box' : 'check-box-outline-blank'} 
              size={24} 
              color={state?.creditPayments?.find(item => item === 'elo') ? colors.primary : colors.text} 
            />
          </View>
        </TouchableOpacity>

        <InputCheck
          label="Pagamento em vale-refeição"
          check={state?.paymentMealTicket}
          onPress={() => onChangeState({ ...state, paymentMealTicket: !state?.paymentMealTicket })}
        />

        <TouchableOpacity onPress={() => {
            state?.creditPayments?.find(item => item === 'ben') ? onChangeState({ ...state, creditPayments: state?.creditPayments.filter(item => item !== 'ben') })
            : onChangeState({ ...state, creditPayments: [...state?.creditPayments.filter(item => item !== 'ben'), 'ben'] })
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ padding: 10 }}>
              <Image style={{ height: 20, width: 30, borderRadius: 5 }} source={require('../../assets/images/payments/ben.png')} />
            </View>
            <Text style={{ flex: 1, padding: 10, color: colors.text, fontWeight: '500' }}>{'Ben refeição'}</Text>
            <MaterialIcons style={{ padding: 10 }}
              name={state?.creditPayments?.find(item => item === 'ben') ? 'check-box' : 'check-box-outline-blank'} 
              size={24} 
              color={state?.creditPayments?.find(item => item === 'ben') ? colors.primary : colors.text} 
            />
          </View>
        </TouchableOpacity>
      </ScrollView>
      <KeyboardSpacer topSpacing={-(topSpacing+bottomTabBarHeight)} />
    </View>
  )
}