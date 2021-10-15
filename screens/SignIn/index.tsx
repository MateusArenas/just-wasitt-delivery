import { useTheme } from '@react-navigation/native';
import { StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useContext } from 'react';
import { View, KeyboardAvoidingView, StyleSheet, Text, Platform, Button, Keyboard, TouchableWithoutFeedbac, TouchableWithoutFeedback  } from 'react-native';
import AuthContext from '../../contexts/auth';
import { RootStackParamList } from '../../types';
import ContainerButton from '../../components/ContainerButton';
import TextInputLabel from '../../components/TextInputLabel';
import { ScrollView } from 'react-native-gesture-handler';
import IconButton from '../../components/IconButton';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';

export default function SignIn ({
  navigation,
  route
}: StackScreenProps<RootStackParamList, 'SignIn'>) {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  
  const [secureTextEntry, setSecureTextEntry] = React.useState(true)
  const [{ email, password }, setState] = React.useState({ email: 'arenas1234@gmail.com', password: '1234' }) 
  const { signIn, error: { message }, loading } = useContext(AuthContext)

  const { colors } = useTheme()
  
  const onSubimit = async () => { 
    try {
      const signed = await signIn(email, password) 
      if (signed) navigation.replace('Root')
    } catch (err) {}
  }
   
  const onChangeEmail = (email: string) => setState(state => ({ ...state, email }))
  const onChangePassword = (password: string) => setState(state => ({ ...state, password }))
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.card }]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.inner} 
          contentContainerStyle={{ paddingTop: top, paddingBottom: bottom }}
          scrollIndicatorInsets={{ top, bottom }}
        >
          <TextInputLabel autoFocus
            color={colors.text}
            label={"Email"}
            placeholder={"Email"} 
            style={styles.textInput} 
            value={email}
            onChangeText={onChangeEmail}
            children={
              <IconButton disabled={!email}
                name={"close"}
                color={colors.text}
                size={24}
                onPress={() => onChangeEmail('')}
              />
            }
          />
          <TextInputLabel secureTextEntry={secureTextEntry}
            color={colors.text}
            label={"Senha"}
            placeholder={"Senha"} 
            style={styles.textInput}
            value={password} 
            onChangeText={onChangePassword}
            children={
              <IconButton disabled={!password}
                name={secureTextEntry ? "visibility" : "visibility-off"}
                color={colors.text}
                size={24}
                onPress={() => setSecureTextEntry(v => !v)}
              />
            }
          />
          <Text style={[styles.message, { color: colors.text }]} >{message}</Text>
          <View style={styles.btnContainer}>
            <ContainerButton style={{ marginBottom: 10 }}
              loading={loading}
              onSubimit={onSubimit}
              title={"Entrar"} 
              disabled={(!email || !password)}
            />
            <ContainerButton border transparent
              loading={loading}
              onSubimit={() => navigation.navigate('SignUp')}
              title={"Criar Conta"} 
            />
          </View>
        </ScrollView>
       </TouchableWithoutFeedback>
     </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  inner: {
    padding: 10,
    flex: 1,
    // justifyContent: "space-around",
  },
  message: {
    fontSize: 14,
    padding: 10
  },
  btnContainer: {
    marginTop: 12
  },
});
