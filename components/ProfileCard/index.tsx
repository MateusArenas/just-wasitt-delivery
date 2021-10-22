import { MaterialIcons } from '@expo/vector-icons';
import { NavigationProp, RouteProp, useNavigation, useRoute, useTheme } from '@react-navigation/native';
import React from 'react';
import { View, Image, Text, TouchableOpacity, ColorValue, StyleProp, ViewStyle } from 'react-native';
import { RootStackParamList } from '../../types';
import IconButton from '../IconButton';
import { LinearGradient } from 'expo-linear-gradient';

const ProfileCard: React.FC<{
  style?: StyleProp<ViewStyle>
  statusColor?: ColorValue
  status?: string
  title?: string
  about?: string | Array<string>
  uri?: string
  disabled?: boolean
  onPress?: () => any
  onPressIn?: () => any
}> = ({
  style,
  uri='https://static-images.ifood.com.br/image/upload/t_high/logosgde/e28dd736-aa7e-438b-be05-123e27b621bd/202103031043_txRd_i.jpg',
  statusColor,
  status,
  title,
  about,
  disabled,
  onPress,
  onPressIn,
}) => {
  const { colors } = useTheme();
  
  return (
        <View style={[{ backgroundColor: colors.card, flex: 1, paddingTop: 10, paddingLeft: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, style]}>
          
          <TouchableOpacity onPress={onPressIn} >
            <View style={{ margin: 10, borderRadius: 45, overflow: 'hidden' }}>
              <LinearGradient style={{ 
                flexShrink: 1, padding: 2
              }}
              start={{ x: 0.1, y: 0.2 }}
              end={{ x: 1, y: 0.8 }}
              colors={['orange', 'red']}
              >
                {uri ? 
                  <Image style={{ borderRadius: 45, borderWidth: 2, borderColor: colors.card }}
                    source={{ uri, width: 90, height: 90 }} 
                  />
                : <MaterialIcons name="account-circle" size={80} color={colors.text} />
                }
              </LinearGradient>
            </View>
          </TouchableOpacity>

          <View style={{ flex: 1, paddingVertical: 10 }}>
            {!!title && <Text numberOfLines={1} style={{ fontSize: 14, color: colors.text, fontWeight: '400' }}>{title}</Text>}
            <Text numberOfLines={1} style={{ textTransform: 'uppercase', fontSize: 12, color: statusColor, fontWeight: '700' }}>{status}</Text>

            {
              !Array.isArray(about) ? <Text numberOfLines={2} style={{ fontSize: 14, color: colors.text, opacity: .8, fontWeight: '500' }}>{about}</Text>
              : about?.map(item => <Text numberOfLines={1} style={{ fontSize: 14, color: colors.text, opacity: .8, fontWeight: '500' }}>{item}</Text>)
            }
          </View>
          
          <IconButton 
            name={"chevron-right"}
            size={24}
            color={colors.border}
            disabled={disabled}
            onPress={onPress}
          />
          
        </View>
  )
}

export default ProfileCard;