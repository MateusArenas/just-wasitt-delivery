import { StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useContext } from 'react';
import { useWindowDimensions, View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView } from 'react-native-tab-view';
import CustomTopTabBar from '../../components/CustomTopTabBar';
import { RootStackParamList } from '../../types';
import * as UserService from '../../services/user';
import AuthContext from '../../contexts/auth';
import useService from '../../hooks/useService';
import FormAndress from '../../components/FormAndress';
import { ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import TextInputLabel from '../../components/TextInputLabel';
import { StackActions, useFocusEffect, useTheme } from '@react-navigation/native';
import Loading from '../../components/Loading';
import Refresh from '../../components/Refresh';
import NotFound from '../../components/NotFound';
import IconButton from '../../components/IconButton';
import { userData } from '../../services/auth';
import { writeAndress } from '../../utils';
import useRootNavigation from '../../hooks/useRootNavigation';

export default function EditAccount({
  navigation,
  route,
} : StackScreenProps<RootStackParamList, 'EditAccount'>) {
  const top = useHeaderHeight()

  const { colors } = useTheme()
  const rootNavigation = useRootNavigation()
  const layout = useWindowDimensions()
  const { signed } = useContext(AuthContext)
  const [state, setState] = React.useState<userData>({} as userData) 

  const { id } = route.params

  const { 
    response, 
    loading, 
    error, 
    onService, 
    onRefresh 
  } = useService<userData>(UserService)

  React.useEffect(() => { if(signed) onService('search', { id }) }, [signed])

  React.useEffect(() => {
    if(response?.data) setState(response?.data[0])
  }, [response])

  const onSubimit = React.useCallback(async () => { 
    try {
      onService('update', state)
      // const signed = await signIn(email, password) 
      // if (signed) navigation.replace('Root')
    } catch (err) {}
  }, [state, onService])

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      headerRight: ({ tintColor }) => (
        <SafeAreaView style={{ flexDirection: 'row' }}>
          <IconButton style={{ padding: 20 }}
            name={'check'}
            size={24}
            color={colors.primary}
            onPress={onSubimit}
          />
        </SafeAreaView>
      ),
    });
  }, [onSubimit]))

  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState([
    { key: 'main', title: 'Principais' },
    { key: 'image', title: 'Foto' },
    { key: 'andress', title: 'Endereço' },
  ])

  const renderScene = React.useCallback(({ route }) => {
    switch (route.key) {
      case 'main':
        return <MainRoute state={state} onChangeState={setState} />
      case 'image':
        return <ImageRoute value={state?.uri} onChangeValue={uri => setState({...state, uri })} />
      case 'andress':
        return <FormAndress state={state} onChangeState={andress => setState({...state, ...andress})} />
      default:
        return null;
    }
  }, [state, setState])

  if (loading === 'LOADING') return <Loading />
  if (error === 'NETWORK') return <Refresh onPress={() => navigation.dispatch(StackActions.replace('EditAccount', { id }))}/>
  if (error === 'NOT_FOUND') return <NotFound title={`This Product doesn't exist.`} redirectText={`Go to home screen!`}/>

  return (
    <TabView style={{ paddingTop: top }}
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={props => <CustomTopTabBar {...props}/>}
    />
  )
}


const MainRoute: React.FC<{
  state: any,
  onChangeState: any
}> = ({ state, onChangeState }) => {
  const { colors } = useTheme()
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.card, padding: 10 }}>
      <TextInputLabel 
        label={'Nome'}
        color={colors.text} 
        placeholder="Nome" 
        value={state?.name} 
        onChangeText={name => onChangeState({ ...state, name })}
      />
      <TextInputLabel 
        label={'Email'}
        color={colors.text} 
        placeholder="Email" 
        value={state?.email} 
        onChangeText={email => onChangeState({ ...state, email })}
      />
      <TextInputLabel secureTextEntry
        label={'Telefone'}
        color={colors.text} 
        placeholder="Telefone" 
        value={state?.phoneNumber} 
        onChangeText={phoneNumber => onChangeState({ ...state, phoneNumber })}
      />
    </ScrollView>
  )
}

const ImageRoute: React.FC<{
  value: string
  onChangeValue: (uri: string) => any
}> = () => {
  const { colors } = useTheme()
  return (
    <View style={{ flex: 1, height: 250, alignItems: 'center', justifyContent: 'center' }}>
      <IconButton 
        style={{ opacity: .5, 
          padding: 20, 
          borderColor: colors.text, borderWidth: 4, 
          borderRadius: 200 
        }}
        name="photo-camera"
        size={24*4}
        color={colors.text}
        onPress={() => {}}
      />
    </View>
  )
}

