import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { HeaderTitle, StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import IconButton from '../../components/IconButton';
import { View } from '../../components/Themed';
import Colors from '../../constants/Colors';
import useColorScheme from '../../hooks/useColorScheme';
import useRootNavigation from '../../hooks/useRootNavigation';
import { RootStackParamList, TabExploreParamList } from '../../types';

// import { Container } from './styles';

export default function Explore ({ 
  navigation,
} : StackScreenProps<TabExploreParamList, 'Main'>) {
  const rootNavigation = useRootNavigation()

  const { colors } = useTheme();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.text,
      headerStyle: { borderBottomColor: colors.primary },
      headerTitle: props => (
        <TouchableWithoutFeedback
          onPress={() => navigation.navigate('Search')}
        >
          <View style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', borderRadius: 4 }}
            lightColor={'rgba(0,0,0,.2)'} darkColor={'rgba(255,255,255,.2)'}
          >
            <MaterialIcons style={{ padding: 5 }} name="search" size={24} color={props.tintColor} />
            <HeaderTitle {...props}/>
          </View>
        </TouchableWithoutFeedback>
      ),
      headerRight: () => null,
      headerLeft: () => null,
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: 'blue' }} >
      <Text>EXPLORE</Text>
      <TouchableOpacity onPress={() => rootNavigation.navigate('Store', { store: 'Cagaio' })} >
        <Text >Go to store screen!</Text>
      </TouchableOpacity>
    </View>
  )
}
