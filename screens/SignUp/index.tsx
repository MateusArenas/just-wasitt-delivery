import { useTheme } from '@react-navigation/native';
import { StackScreenProps, useHeaderHeight } from '@react-navigation/stack';
import React, { useContext, useState } from 'react';
import { DotIndicator } from 'react-native-indicators';
import AuthContext from '../../contexts/auth';
import { RootStackParamList } from '../../types';
import TextInputLabel from '../../components/TextInputLabel'

import { View, KeyboardAvoidingView, TextInput, StyleSheet, Text, Platform, TouchableWithoutFeedback, Button, Keyboard  } from 'react-native';
import ContainerButton from '../../components/ContainerButton';
import { ScrollView } from 'react-native-gesture-handler';
import IconButton from '../../components/IconButton';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';

export default function SignUp ({
  navigation,
  route
}: StackScreenProps<RootStackParamList, 'SignUp'>) {
  const top = useHeaderHeight()
  const bottom = useContext(BottomTabBarHeightContext) || 0
  
  const [secureTextEntry, setSecureTextEntry] = useState(true)
  const [{ name, email, password, confirmPassword }, setState] = useState({ 
    name: 'Mateus Arenas', email: 'arenas.mateus2@gmail.com', password: '12345', confirmPassword: '12345' 
  }) 
  const { signUp, signed, error: { message }, loading } = useContext(AuthContext)

  const { colors } = useTheme()

  const onSubimit = async () => { 
    try {
      const signed = await signUp(email, password, name)
      if (signed) navigation.replace('Root')
    } catch (err) {}
  }

  const onChangeName = (name: string) => setState(state => ({ ...state, name }))
  const onChangeEmail = (email: string) => setState(state => ({ ...state, email }))
  const onChangePassword = (password: string) => setState(state => ({ ...state, password }))
  const onChangeConfirmPassword = (confirmPassword: string) => setState(state => ({ ...state, confirmPassword }))

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
          <TextInputLabel autoFocus focusable
            color={colors.text}
            label={"Nome"} 
            placeholder={"Nome"} 
            value={name}
            onChangeText={onChangeName}
            children={<IconButton disabled={!name}
              name={"close"}
              color={colors.text}
              size={24}
              onPress={() => onChangeName('')}
            />}
          />
          <TextInputLabel 
            color={colors.text}
            label={"Email"} 
            placeholder={"Email"} 
            value={email}
            onChangeText={onChangeEmail}
            children={<IconButton disabled={!email}
              name={"close"}
              color={colors.text}
              size={24}
              onPress={() => onChangeEmail('')}
            />}
          />
          <TextInputLabel secureTextEntry={secureTextEntry} 
            color={colors.text}
            label={"Senha"} 
            placeholder={"Senha"}
            value={password} 
            onChangeText={onChangePassword}
            children={<IconButton disabled={!password}
              name={secureTextEntry ? "visibility" : "visibility-off"}
              color={colors.text}
              size={24}
              onPress={() => setSecureTextEntry(v => !v)}
            />}
          />
          <TextInputLabel secureTextEntry={secureTextEntry} 
            color={colors.text}
            label={"Confirmar Senha"} 
            placeholder={"Confirmar Senha"}
            value={confirmPassword} 
            onChangeText={onChangeConfirmPassword}
            children={<IconButton disabled={!confirmPassword}
              name={secureTextEntry ? "visibility" : "visibility-off"}
              color={colors.text}
              size={24}
              onPress={() => setSecureTextEntry(v => !v)}
            />}
          />
          <Text style={[styles.message, { color: colors.text }]} >{message}</Text>
          <View style={styles.btnContainer}>
            <ContainerButton style={{ marginBottom: 10 }}
              loading={loading}
              onSubimit={onSubimit}
              title={"Criar Conta"} 
              disabled={(!email || !name || !password || !confirmPassword || (password !== confirmPassword))}
            />
            <ContainerButton border transparent
              loading={loading}
              onSubimit={() => navigation.navigate('SignIn')}
              title={"Conta Existente"} 
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  inner: {
    flex: 1,
    padding: 10
  },
  btnContainer: {
    padding: 10
  },
  message: {
    fontSize: 14,
    padding: 10
  },
});
