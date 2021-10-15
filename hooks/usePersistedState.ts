import { useEffect, useState,Dispatch, SetStateAction } from 'react';
//import AsyncStorage from '@react-native-community/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage'

type Response<T> = [
  T,
  Dispatch<SetStateAction<T>>
];

function usePersistedState<T>(key: string, initialState: T): Response<T> {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    (async () => {
      const storageValue = await AsyncStorage.getItem(key);

      if (storageValue) {
        const parseV = JSON.parse(storageValue);

        if(Array.isArray(initialState) && !Array.isArray(parseV)) {
          setState(Object.values(parseV) as any);
        } else {
          setState(parseV);
        }
      } else {
        setState(initialState);
      }
    })()
  }, [])

  useEffect(() => {
    (async () => {
      try {
      await AsyncStorage.setItem(key, JSON.stringify(state))
      
      } catch (err) {
        console.log(err);
      }
    })()
  }, [key, state])

  
  return [state, setState]
}

export default usePersistedState