import { MaterialIcons } from '@expo/vector-icons';
import { NavigationProp, RouteProp, useNavigation, useRoute, useTheme } from '@react-navigation/native';
import React from 'react';
import { View, Image, Text, TouchableOpacity, ColorValue, StyleProp, ViewStyle } from 'react-native';
import { RootStackParamList } from '../../types';
import IconButton from '../IconButton';

const ProfileCard: React.FC<{
  style?: StyleProp<ViewStyle>
  statusColor?: ColorValue
  status?: string
  title?: string
  about?: string | Array<string>
  uri?: string
  disabled?: boolean
  onPress?: () => any
}> = ({
  style,
  uri='https://static-images.ifood.com.br/image/upload/t_high/logosgde/e28dd736-aa7e-438b-be05-123e27b621bd/202103031043_txRd_i.jpg',
  statusColor,
  status,
  title,
  about,
  disabled,
  onPress,
}) => {
  const { colors } = useTheme();
  
  return (
      <TouchableOpacity disabled={disabled} onPress={onPress}>
        <View style={[{ backgroundColor: colors.card, flex: 1, paddingTop: 10, paddingLeft: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, style]}>
          
          <View style={{ padding: 10, flexShrink: 1, justifyContent: 'flex-start' }}>
            {uri ? 
              <Image 
                style={{ width: 80, height: 80, borderRadius: 120, borderWidth: 1, borderColor: colors.border }}
                source={{ uri: 'https://static-images.ifood.com.br/image/upload/t_thumbnail/logosgde/322ccdf6-abeb-4249-9d7b-a0ddb19dbc3b/202103031143_Lf0g_i.jpg'}} 
              />
            : <MaterialIcons name="account-circle" size={80} color={colors.text} />
            }
          </View>

          <View style={{ flex: 1, paddingVertical: 10 }}>
            {!!title && <Text numberOfLines={1} style={{ fontSize: 14, color: colors.text, fontWeight: '400' }}>{title}</Text>}
            <Text numberOfLines={1} style={{ textTransform: 'uppercase', fontSize: 12, color: statusColor, fontWeight: '700' }}>{status}</Text>

            {
              !Array.isArray(about) ? <Text numberOfLines={2} style={{ fontSize: 14, color: colors.text, opacity: .8, fontWeight: '500' }}>{about}</Text>
              : about?.map(item => <Text numberOfLines={1} style={{ fontSize: 14, color: colors.text, opacity: .8, fontWeight: '500' }}>{item}</Text>)
            }
          </View>
          
          <MaterialIcons style={{ padding: 10, opacity: disabled ? 0 : 1 }}
            name={"chevron-right"}
            size={24}
            color={colors.border}
          />
          
        </View>
      </TouchableOpacity>
  )
}

export default ProfileCard;