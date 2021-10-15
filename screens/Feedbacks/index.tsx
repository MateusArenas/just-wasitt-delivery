import { StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useContext } from 'react';
import { SafeAreaView, useWindowDimensions, View, Text } from 'react-native';
import { FlatList, TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
import { PullToRefreshView } from '../../components/PullToRefreshView';
import Refresh from '../../components/Refresh';
import useService from '../../hooks/useService';
import { RootStackParamList, TabExploreParamList } from '../../types';
import * as FeedbackService from '../../services/feedback';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import TextButton from '../../components/TextButton';
import IconButton from '../../components/IconButton';
import FeedbackCard from '../../components/FeedbackCard';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';

export default function Feedbacks({
  navigation,
  route,
} : StackScreenProps<RootStackParamList, 'Feedbacks'>) {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  
  const { store } = route.params
  const { colors } = useTheme()

  const { 
    response, 
    loading, 
    error, 
    onService, 
    onRefresh,
    refreshed
  } = useService<FeedbackService.FeedbackData>(FeedbackService, 'index', { store, params: {} })

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      headerRight: ({ tintColor }: any) => (
        <View style={{ display: 'flex', flexDirection: 'row', }}>
          <IconButton 
            name="store"
            size={24}
            color={colors.text}
            onPress={() => navigation.navigate('Store', { store })}
          />
          <IconButton 
            name="more-vert" 
            size={24} 
            color={colors.text} 
            onPress={() => {}} 
          />
        </View>
      ),
    });
  }, []))

  if (loading === 'LOADING') return <Loading />
  if (error === 'NETWORK') return <Refresh onPress={() => navigation.replace('Feedbacks')}/>
  if (error === 'NOT_FOUND') return <NotFound title={`This Category doesn't exist.`} redirectText={`Go to home screen!`}/>
  return (
      <PullToRefreshView
        offset={top}
        disabled={!refreshed}
        refreshing={loading === 'REFRESHING'}
        onRefresh={() => onRefresh('index', { store, params: {} })}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
          <FlatList 
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingTop: top, paddingBottom: bottom }}
            scrollIndicatorInsets={{ top, bottom }}
            data={response?.data}
            // ItemSeparatorComponent={() => <View style={{ height: 1, width: '100%', backgroundColor: colors.border }}/>}
            keyExtractor={(item, index) => `${item?._id}-${index}`}
            renderItem={({ item } : { item: FeedbackService.FeedbackData }) => (
              <View style={{ backgroundColor: colors.card, marginBottom: 10 }}>
                <FeedbackCard 
                  name={item?.user?.name ? item?.user?.name : 'Anonimo'}
                  message={item?.message}
                />
                <View style={{ flexGrow: 1, alignItems: 'flex-end', padding: 10, paddingTop: 0, paddingRight: 20 }}>
                  <TextButton style={{ padding: 0 }}
                    label="Responder"
                    color={colors.primary}
                    fontSize={12}
                    onPress={() => navigation.navigate('NewFeedback', { store, reply: item?._id })}
                  />
                </View>

                {!!item?.replies?.length && <View style={{ padding: 10 }}>
                  <Text style={{ padding: 10,
                    fontWeight: '500', fontSize: 12,
                    color: colors.text, 
                  }}>{'Ocultar resposta'}</Text>
                  {item?.replies?.map(reply => (
                    <View key={reply?._id}>
                      <FeedbackCard 
                        name={reply?.user?.name ? reply?.user?.name : 'Anonimo'}
                        message={reply?.message}
                      />
                      <View style={{ flexGrow: 1, alignItems: 'flex-end', padding: 10, paddingTop: 0, paddingRight: 20 }}>
                        <TextButton style={{ padding: 0 }}
                          label="Responder"
                          color={colors.primary}
                          fontSize={12}
                          onPress={() => navigation.navigate('NewFeedback', { store, reply: item?._id })}
                        />
                      </View>
                    </View>
                  ))}
                </View>}
              </View>
            )}
          />
      </PullToRefreshView>
  )
}

