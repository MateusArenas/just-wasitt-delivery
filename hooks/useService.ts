import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as React from 'react';

/*
ATENÇÂO REGRAS
1 - tudo que será retornado deverá vir em um array, tanto na api ou no local
2 - formato de retorno sera do axios mesmo até no local
3 - erros... api (not found, network), local (not found)
4 -
*/

// interface useServiceProps<T extends keyof typeof services, S> extends useServiceState<T> {
//   onRefresh: (method: S, params: any) => any
//   onService: (method: S, params: any) => any
// }

interface useServiceProps<T, S> extends useServiceState<T> {
  onRefresh: (method: S, params?: any) => Promise<any>
  onService: (method: S, params?: any) => Promise<any>
}

interface useServiceState<T> {
  response: AxiosResponse<Array<T>>
  refreshed: boolean
  loading: 'LOADING' | 'REFRESHING'
  error: 'NOT_FOUND' | 'NETWORK'
}
//serviceName: keyof typeof Services,
export default function useService<T>(Service, loadMethod?: keyof typeof Service, loadParams?: any, deps?: React.DependencyList) : useServiceProps<T, keyof typeof Service> {
  const [state, setState] = React.useState<useServiceState<T>>({} as useServiceState<T>)

  const [refreshed, setRefreshed] = React.useState<boolean>(true)

    const onService = React.useCallback(async (method: keyof typeof Service, params, isRefreshing?: boolean) => {
      try {
        setState(state => ({...state, loading: isRefreshing ? 'REFRESHING' : 'LOADING' }))
        const response = await Service[method as any](params)
        if (typeof response === 'boolean' && !!loadMethod) return await onService(loadMethod, loadParams, true)
        const data = !!response?.data ? response?.data : response
        response.data = Array.isArray(data) ? data : [data]
        setState(state => ({...state, response }))
      } catch (err) {
        const { response }:AxiosError = err
        if (response?.status === 404) setState(state => ({...state, error: 'NOT_FOUND' }))
        if (!response) setState(state => ({ ...state, error: 'NETWORK' }))
      } finally {
        setState(state => ({ ...state, loading: undefined }))
        setRefreshed(false)
      } 
  }, [setState, setRefreshed])

  React.useEffect(() => { if(!!loadMethod) onService(loadMethod, loadParams) }, [].concat(deps))

  React.useEffect(() => {
    const interval = setInterval(() => {
      setRefreshed(true)
    }, 1000);
    return () => clearInterval(interval);
  }, [setRefreshed, state]);

  return ({ 
    ...state, 
    refreshed,
    onRefresh: React.useCallback(async (method, params) => { 
      return refreshed ? await onService(method, params, true) : null
    }, [refreshed]), 
    onService: async (method, params) => await onService(method, params), 
  })
}