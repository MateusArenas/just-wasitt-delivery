import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';

const ProfileStatistic: React.FC<{
  style?: StyleProp<ViewStyle>
  itemContentContainerStyle?: StyleProp<ViewStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
  data: Array<{
    title: string
    numbers: number
    onPress: () => any
    disabled?: boolean
  }>
}> = ({ data, style, itemContentContainerStyle, contentContainerStyle }) => {
  const { colors } = useTheme();
  return (
    <FlatList horizontal centerContent scrollEnabled={false}
      contentContainerStyle={[{ justifyContent: 'center', flexShrink: 1 }, contentContainerStyle]}
      style={[{ }, style]}
      data={data}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item, index) => `${item?._id}-${index}`}      
      renderItem={({ item }) => (
          <TouchableOpacity key={item?.title} disabled={item?.disabled} onPress={item?.onPress}>
            <View style={[{ padding: 10, alignItems: 'center'}, itemContentContainerStyle]}>
              <Text numberOfLines={1} style={{ fontWeight: '500', fontSize: 18, color: colors.text }}>{item?.numbers || 0}</Text>
              <Text numberOfLines={1} style={{ paddingHorizontal: 10,textTransform: 'capitalize', fontWeight: '500', opacity: .8, fontSize: 14, color: colors.text }}>{item?.title}</Text>
            </View>
          </TouchableOpacity>
      )}
    />
    // <View style={{ alignItems: 'center',  }}>  
    //   <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
    //     {data?.map(item => (
    //       <TouchableOpacity key={item?.title} disabled={!item?.numbers} onPress={item?.onPress}>
    //         <View style={{ padding: 10, alignItems: 'center', }}>
    //           <Text numberOfLines={1} style={{ fontWeight: '500', fontSize: 18, color: colors.text }}>{item?.numbers}</Text>
    //           <Text numberOfLines={1} style={{ paddingHorizontal: 10,textTransform: 'capitalize', fontWeight: '500', opacity: .8, fontSize: 14, color: colors.text }}>{item?.title}</Text>
    //         </View>
    //       </TouchableOpacity>
    //     ))}
    //   </View>
    // </View>
  )
}

export default ProfileStatistic;