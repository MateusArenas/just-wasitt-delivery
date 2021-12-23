import { useFocusEffect, useTheme } from '@react-navigation/native';
import { HeaderTitle, StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { SafeAreaView, View, Text, FlatList } from 'react-native';
import FormAndress from '../../components/FormAndress';
import IconButton from '../../components/IconButton';
import AuthContext from '../../contexts/auth';
import * as UserService from '../../services/user';
import useService from '../../hooks/useService';
import { AndressData } from '../../services/andress';
import { userAndressData, userData } from '../../services/auth';
import { RootStackParamList } from '../../types';
import Loading from '../../components/Loading';
import Refresh from '../../components/Refresh';
import NotFound from '../../components/NotFound';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import ContainerButton from '../../components/ContainerButton';
import BottomHalfModalContext from '../../contexts/BottomHalfModal';
import { writeAndress } from '../../utils';
import { PullToRefreshView } from '../../components/PullToRefreshView';
import usePersistedState from '../../hooks/usePersistedState';
import { BagState } from '../Bag';
import CardLink from '../../components/CardLink';
import AndressContext from '../../contexts/andress';
import KeyboardSpacer from '../../components/KeyboardSpacer';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import useLoadScreen from '../../hooks/useLoadScreen';

export default function Andress ({ 
  navigation,
  route
} : StackScreenProps<RootStackParamList, 'Andress'>) {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  
  const id = route.params?.id

  const BottomHalfModal = useContext(BottomHalfModalContext)
  const { colors } = useTheme()
  const { user, signed } = useContext(AuthContext)
  const { selected, andress, andresses, selectIn, selectUp, refresh } = useContext(AndressContext)
  const [state, setState] = useState<AndressData>(null)
  
  // const { 
  //   response, 
  //   loading,
  //   refreshing, 
  //   onRefresh,
  //   onLoading,
  //   disabled
  // } = useLoadScreen<userData>(async () => await UserService.search())

  // useEffect(() => { if(signed) onLoading(); }, [signed])

  useEffect(() => {
    if(id) {
      setState(andresses?.find(item => item?._id === id))
    }
  } ,[setState, andresses])

  const onSubmit = useCallback(() => {
    if (id) {
      selectIn(state?._id)
      // UserService.update({ body: state })
    } else {
      selectUp(state)
    }

    if(navigation.canGoBack()) navigation.goBack()
  }, [state, selectUp, selectIn])

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
      title: 'Endereço',
      headerTitleAlign: 'center',
      headerTitle: ({ tintColor, ...props }) => (
        <View style={{ display: 'flex', flexDirection: 'row', }}>
          <IconButton
            label={id ? writeAndress(state) : 'Novo endereço'} 
            name="expand-more" color={colors.text} size={24}
            onPress={() => BottomHalfModal.show(modalize => 
              <FlatList 
                data={andresses?.map(item => ({
                  _id: item?._id,
                  title: writeAndress(item),
                  onPress: () => {
                    item?._id === user?._id ? signed && navigation.replace('EditAccount', { id: user?._id })
                    : navigation.replace('Andress', { id: item?._id })
                  }
                })) || []}
                keyExtractor={(item, index) => `${item?._id}-${index}`}
                renderItem={({ item, index }) => 
                  <CardLink border={(andresses?.length-1) !== index}
                    title={item?.title}
                    color={colors.text}
                    onPress={item?.onPress}
                    onPressed={modalize?.current?.close}
                    right={
                      <MaterialIcons style={{ padding: 10 }}
                        name={item?._id === andress?._id  ? "check-circle" : "circle"}
                        size={24}
                        color={item?._id === andress?._id ? colors.primary : colors.border}
                      />
                    }
                  />
                }
                ListFooterComponent={
                  <View style={{ 
                    marginTop: 10,
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' 
                  }}>
                    {selected && <View style={{ flex: 1, padding: 10 }}>
                      <ContainerButton transparent border
                        title={'Localização'}
                        loading={false}
                        onSubimit={() => navigation.replace('Andress', { id: andress?._id })}
                        onSubimiting={modalize?.current?.close}
                      />
                    </View>}
                    <View style={{ flex: 1, padding: 10 }}>
                      <ContainerButton transparent border
                        title={'Novo endereço'}
                        loading={false}
                        onSubimit={() => navigation.push('Andress')}
                        onSubimiting={modalize?.current?.close}
                      />
                    </View>
                  </View>
                }
              />
            )} 
          />
        </View>
      ),
      headerRight: ({ tintColor }) => (
        <View style={{ flexDirection: 'row', paddingHorizontal: 10 }}>
          <IconButton style={{ padding: 10 }}
            name={'check'}
            size={24}
            color={colors.primary}
            disabled={
              !state
              || !state?.ceep
              || !state?.houseNumber
              || !state?.state
              || !state?.street
            }
            onPress={onSubmit}
          />
        </View>
      ),
    });
  }, [selected, andresses, andress, onSubmit, selectUp, state, user, signed]))

  return (
    <View style={{ flex: 1 }}>
      <PullToRefreshView
        offset={top}
        refreshing={refresh}
        onRefresh={() => { if(!!andress) selectIn(andress?._id, true) }}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <FormAndress 
          contentContainerStyle={{ paddingTop: top, paddingBottom: bottom }}
          scrollIndicatorInsets={{ top, bottom }}
          state={state} 
          onChangeState={setState} 
        />
      </PullToRefreshView>
      <KeyboardSpacer topSpacing={-(bottom)} />
    </View>
  );
};
