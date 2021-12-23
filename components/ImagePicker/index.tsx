import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity, View, Text, Image, Clipboard } from 'react-native';

// import { Container } from './styles';

const ImagePicker: React.FC<{
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
            <Image source={{ 
              uri: value || "https://www.leonardusa.com/assets/corals/images/default_product_image.png", 
              width: 24*4, height: 24*4 
            }} style={{ borderRadius: 200 }}/>
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

export default ImagePicker;