import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as React from 'react';

interface useServiceProps<T> extends useServiceState<T> {
  onRefresh: () => Promise<boolean>
  onLoading: () => Promise<boolean>
  onService: (callback: (response?: responseType<Array<T>>) => Promise<Array<T>>, refresh?: boolean) => Promise<boolean>
}

interface responseType<T> extends AxiosResponse<T> {
  network: boolean
  ok: boolean
}

interface useServiceState<T> {
  response: responseType<Array<T>>
  disabled: boolean
  refreshing: boolean
  loading: boolean
}

export default function useLoadScreen<T>(callback: () => Promise<any>) : useServiceProps<T> {
  const [state, setState] = React.useState<useServiceState<T>>({ 
    response: { ok: true, network: true, data: [] }
  } as useServiceState<T>)
  const [disabled, setDisabled] = React.useState<boolean>(false)

    const onService = React.useCallback(async (refresh?: boolean, onCallback?: (response?: responseType<Array<T>>) => Promise<Array<T>>) : Promise<boolean> => {
      try {
        setState(state => ({...state, refreshing: refresh, loading: !refresh }))
        const response = onCallback  ? await onCallback(state?.response) : await callback()
        const data = !!response?.data ? response?.data : response
        response.data = Array.isArray(data) ? data : [data]
        response.ok = true
        response.network = true
        response.date = new Date()
        setState(state => ({...state, response }))
      } catch (err) {
        const { response }:AxiosError = err
        setState(state => ({ 
          ...state, 
          response: {
            ...state.response, 
            ok: response?.status !== 404,
            network: !!response
          } 
        }))
        return false
      } finally {
        setState(state => ({ ...state, loading: false, refreshing: false }))
        setDisabled(true)
        return true
      } 
  }, [setState, setDisabled])

  React.useEffect(() => {
    const interval = setInterval(() => {
      setDisabled(false)
    }, 1000);
    return () => clearInterval(interval);
  }, [setDisabled, state]);

  return ({ 
    ...state, 
    disabled,
    onLoading: React.useCallback(async () => { 
      return !disabled ? await onService() : await (async () => false)()
    }, [disabled]), 
    onRefresh: React.useCallback(async () => { 
      return !disabled ? await onService(true) : await (async () => false)()
    }, [disabled]), 
    onService: React.useCallback(async (callback, refresh) => { 
      return !disabled ? await onService(refresh, callback) : await (async () => false)()
    }, [disabled]),
  })
}