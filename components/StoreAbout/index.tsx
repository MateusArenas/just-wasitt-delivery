import { useTheme } from '@react-navigation/native';
import React from 'react';
import { View, Image, Text } from 'react-native';
import Colors from '../../constants/Colors';
import useColorScheme from '../../hooks/useColorScheme';
import IconButton from '../IconButton';
import { useThemeColor } from '../Themed';

import { 
  ProfileAbout,
  ProfileImage,
  ProfileState
} from './styles';

const StoreAbout: React.FC = () => {
  const { colors } = useTheme();
  
  return (
    <View
      style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', padding: 5
    }}
    >
      <View
        style={{display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'flex-start',
        flexDirection: 'row' }}
      >
        <ProfileImage>
          <Image 
          style={{ height: '100%', width: '100%' }}
          source={{ uri: '' }} 
          />
        </ProfileImage>

        <View 
            style={{
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'flex-start',
            //  flexGrow: 1,
              padding: 5
            }}
        >
          <Text style={{ color: colors.text, marginBottom: 2, fontWeight: 'bold' }}>{'Cag'}</Text>
          <ProfileState>{true ? 'Aberto' : 'Fechado'}</ProfileState>

        </View>
          
        <ProfileAbout
          numberOfLines={3}
        >{'sadklsdlaklsdklasdkaskdk'}</ProfileAbout>
        
          <IconButton 
            name={'expand-more'} size={24} color={colors.text}
            onPress={() => {}}
          />
        
      </View>
  </View>
  )
}

export default StoreAbout;