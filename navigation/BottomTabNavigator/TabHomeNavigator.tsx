import * as React from 'react';

import { createStackNavigator, HeaderTitle, StackScreenProps } from "@react-navigation/stack"
import { BottomTabParamList, TabHomeParamList } from "../../types"

import HomeScreen from '../../screens/Home'
import IconButton from '../../components/IconButton';
import useRootNavigation from '../../hooks/useRootNavigation';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import AuthContext from '../../contexts/auth';
import { writeAndress } from '../../utils';
import { TouchableWithoutFeedback, Image, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { View } from '../../components/Themed';
import SearchTabNavigator from '../SearchTabNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useSetSnackBottomOffset } from '../../hooks/useSnackbar';

const TabHomeStack = createStackNavigator<TabHomeParamList>()

function TabHomeNavigator({ 
  navigation,
  route
} : StackScreenProps<BottomTabParamList, 'TabHome'>) {

  const bottom = React.useContext(BottomTabBarHeightContext) || 0

  const setBottomOffset = useSetSnackBottomOffset()
  useFocusEffect(React.useCallback(() => {
    setBottomOffset(bottom)

    // return function cleanup () {
    //   setBottomOffset(0)
    // }
  }, [bottom, setBottomOffset]))

  const InputRef = React.useRef<TextInput>()
  const [category, setCategory] = React.useState(
    route.params?.category === 'main' || !route.params?.category ? 
    'main' : route.params?.category
  )
  const { andress } = React.useContext(AuthContext)
  const { colors, dark } = useTheme();

  return (
    <TabHomeStack.Navigator headerMode="screen"
      initialRouteName="Main"
      screenOptions={{ 
        headerTintColor: colors.text,
        headerStyle: { elevation: 0, shadowColor: 'transparent', borderBottomWidth: .2, borderColor: colors.border },
        headerBackTitleVisible: false,
        headerBackImage: ({ tintColor }) => <MaterialIcons name="chevron-left" size={24*1.5} color={tintColor} />,
        headerTransparent: true,
        headerBackground: ({ style }) => (
          <BlurView style={[style, { flex: 1 }]} intensity={100} tint={dark ? 'dark' : 'light'} />
        ),
      }}
    >
      <TabHomeStack.Screen
        name="Main"
        component={HomeScreen}
        initialParams={{ category: route.params?.category }}
        options={{ 
          title: 'Wassit',
        }}
      />
    </TabHomeStack.Navigator>
  );
}

export default TabHomeNavigator