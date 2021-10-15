import { useTheme } from '@react-navigation/native';
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Colors from '../../constants/Colors';
import useColorScheme from '../../hooks/useColorScheme';
import { MonoText } from '../StyledText';
import { Text, View, Divider } from '../Themed';
// import { Container } from './styles';
interface itemProps {
  label?: string
  action?: () => any
}
interface OptionsProps {
  data: Array<itemProps>
}
const Options: React.FC<OptionsProps> = ({
  data,
}) => {
  const { colors } = useTheme();
  
  return <FlatList 
    style={{ backgroundColor: 'rgba(255,255,255,.3)', paddingTop: 10}}
    data={data} 
    renderItem={({ item }) => (
      <TouchableWithoutFeedback 
        disabled={!item.action}
        onPress={item.action}
      >
        <Text style={[styles.item, { color: colors.text }]}>{item.label}</Text>
      </TouchableWithoutFeedback>
    )}
  />
}

const styles = StyleSheet.create({
  headerTitle: {
    padding: 20, 
    paddingBottom: 10, 
    textAlign: 'center', 
    textTransform: 'uppercase', 
    // fontWeight: 'bold',
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  }
})

export default Options;