import { StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useContext, useState } from 'react';
import { TouchableWithoutFeedback, useWindowDimensions, View, Text, TextInput, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
import { PullToRefreshView } from '../../components/PullToRefreshView';
import Refresh from '../../components/Refresh';
import useService from '../../hooks/useService';
import { RootStackParamList, TabExploreParamList } from '../../types';
import * as FeedbackService from '../../services/feedback';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import IconButton from '../../components/IconButton';
import TextButton from '../../components/TextButton';
import AuthContext from '../../contexts/auth';
import FeedbackCard from '../../components/FeedbackCard';
import { BottomTabBarHeightContext, useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import KeyboardSpacer from '../../components/KeyboardSpacer'

export default function NewFeedback({
  navigation,
  route,
} : StackScreenProps<RootStackParamList, 'NewFeedback'>) {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0

  const { user } = useContext(AuthContext)
  const { store } = route.params
  const reply = route.params?.reply
  const { colors } = useTheme()
  const [message, setMessage] = useState<string>('')

  const { 
    response, 
    loading, 
    error, 
    onService, 
    onRefresh 
  } = useService<FeedbackService.FeedbackData>(FeedbackService)

  const data = response?.data[0]

  React.useEffect(() => { if (reply) onService('search', { store, id: reply }) }, [])

  const onSubimit = React.useCallback(async () => {
    try {
      await onService('create', { store, body: { message, user: user?._id, reply } })
      navigation.replace('Feedbacks', { store })
    } catch (err) {

    }
  }, [onService, message, user])

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      headerRight: ({ tintColor }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextButton style={{ paddingHorizontal: 20 }}
            label={'Enviar'}
            fontSize={16}
            color={colors.primary}
            disabled={!message}
            onPress={onSubimit}
          />
        </View>
      ),
    });
  }, [onSubimit, message]))

  if (loading === 'LOADING') return <Loading />
  if (error === 'NETWORK') return <Refresh onPress={() => navigation.replace('NewFeedback', { store })}/>
  // if (error === 'NOT_FOUND') return <NotFound title={`This Category doesn't exist.`} redirectText={`Go to home screen!`}/>

  return (
  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={{ flex: 1, paddingTop: top, paddingBottom: bottom }} >
      <View style={{ flex: 1, justifyContent: 'space-between', backgroundColor: colors.background }}>

        {(!!data && !!reply) && <View style={{ backgroundColor: colors.card }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Text style={{ padding: 10,
              fontWeight: '500', fontSize: 16,
              color: colors.text, 
            }}>{'Responder para'}</Text>
            <IconButton 
              name="close"
              size={24}
              color={colors.text}
              onPress={() => navigation.push('NewFeedback', { store })}
            />
          </View>
          <FeedbackCard 
            name={data?.user?.name ? data?.user?.name : 'Anonimo'}
            message={data?.message}
          />
        </View>}
            <View style={{ flex: 1 }}>
              <TextInput multiline autoFocus
                placeholderTextColor={colors.text}
                placeholder="Escreva algo sobre a loja..."
                style={{ opacity: .8,
                  flex: 1,
                  width: '100%',
                  padding: 10,
                  color: colors.text,
                  fontSize: 16,
                }}
                value={message}
                onChangeText={message => setMessage(message)}
                maxLength={60}
              />
            </View>
              <Text style={{
                padding: 10,
                fontWeight: '500', fontSize: 16,
                color: colors.text, opacity: .5,
                position: 'absolute', bottom: 0, right: 0, 
                alignSelf: 'flex-end'
              }}>{message?.length + ' / ' + 60}</Text>
            </View>
      <KeyboardSpacer topSpacing={-bottom} />

    </View>
    </TouchableWithoutFeedback>
  )
}

