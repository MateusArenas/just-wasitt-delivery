import React from 'react';
import { View, ActivityIndicator, StyleSheet, Animated, Easing, LogBox, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native'
import { UIActivityIndicator } from 'react-native-indicators';

interface LoadingProps {
  animating?: boolean
  hidesWhenStopped?: boolean
  size?: 'small' | 'large'
  color?: string
  pulse?: boolean
}

const Loading: React.FC<LoadingProps> = ({ 
  animating=true,
  hidesWhenStopped=false,
  size='large',
  color=null,
  pulse=true,
}) => {
  const { colors } = useTheme()
  const anim = React.useRef(new Animated.Value(0)).current

  const animate = easing => {
    if(Platform.select({ android: true, ios: true })) LogBox.ignoreLogs(['Animated: `useNativeDriver`'])
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      easing, 
      useNativeDriver: true,
    }).start();
  }

  React.useEffect(() => { pulse && animate(Easing.elastic(4)) }, [animate, pulse])

  return (
    <View style={styles.container}>
      <Animated.View style={{ 
        transform: [{ 
          scale: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [.8, 1],
          }) 
        }], 
        opacity: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [.5, 1]
        })
      }}>  
        <UIActivityIndicator 
          hidesWhenStopped={hidesWhenStopped} 
          animating={animating} 
          size={size === 'small' ? 26 : size === 'large' ? 36 : 26} 
          count={12} 
          color={color ? color : colors.text}
        />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
})

export default Loading;