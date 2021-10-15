import React from "react"
import { MaterialIcons } from "@expo/vector-icons"
import { useTheme } from "@react-navigation/native"
import { View, Text } from 'react-native'

interface FeedbackCardProps {
  name: string
  message: string
}
const FeedbackCard: React.FC<FeedbackCardProps> = ({ name, message }) => {
  const { colors } = useTheme()
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', padding: 10 }}>
      <MaterialIcons 
        name="account-circle"
        size={24*2}
        color={colors.text}
      />
      <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', padding: 10 }}>
        <Text style={{ marginRight: 5, 
          fontWeight: '500', fontSize: 16,
          color: colors.text, 
        }}>{name}</Text>
        <Text style={{
          fontWeight: '500', fontSize: 16,
          color: colors.text, 
          flex: 1, opacity: .5,
        }}>{message}</Text>
      </View>
    </View>
  )
}

export default FeedbackCard