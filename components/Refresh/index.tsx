import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native'
import IconButton from '../IconButton';

// import { Container } from './styles';
interface RefreshProps {
  onPress?: () => any
}
const Refresh: React.FC<RefreshProps> = ({
  onPress
}) => {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <IconButton 
        name="refresh" color={colors.text} size={36} 
        onPress={onPress}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 10
  }
})

export default Refresh;