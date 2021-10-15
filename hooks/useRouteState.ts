import { ParamListBase, StackNavigationState, useNavigationState } from "@react-navigation/native"


export default function useRouteState<T extends ParamListBase>() : StackNavigationState<T> {
  const state = useNavigationState<StackNavigationState<T>>(getState)

  function getState (state: any) {
    const routeState = state?.routes[state?.index]?.state as any
    return routeState ? getState(routeState) : state
  }

  if (!state?.stale) return state
}