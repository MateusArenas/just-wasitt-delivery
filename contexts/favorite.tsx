import React from "react";
import { createContext } from 'use-context-selector';
import { favoriteData } from "../services/favorite";
import * as FavoriteService from '../services/favorite'
import AuthContext from "./auth";

interface FavoriteData {
    data: favoriteData[]
    loading: boolean
    refreshing: boolean
    missing: boolean
    onRefresh: () => any

    onChangeFavorite: (params: { _id: string, store: string, product: string }) => Promise<any>
    onCreateFavorite: (params: { _id: string, store: string, product: string }) => Promise<any>
    onRemoveFavorite: (params: { _id: string, store: string }) => Promise<any>
}

const FavoriteContext = createContext<FavoriteData>({} as FavoriteData)

export const FavoriteProvider: React.FC = ({ children }) => {
    const { user } = React.useContext(AuthContext)

    const [loading, setLoading] = React.useState(false)
    const [refreshing, setRefreshing] = React.useState(false)
    const [missing, setMissing] = React.useState(false)
    const [data, setData] = React.useState<favoriteData[]>([])

    React.useEffect(() => { onLoad() }, [])

    const onLoad = React.useCallback(async (refreshed?: boolean) => {
        refreshed ? setRefreshing(true) : setLoading(true)
        try {
            const data = await FavoriteService.all({ userId: user?._id })
            setData(data as any)
        } catch (err) {
            // if (err?.response?.status === 404) setMissing(true)
            if (!err?.response) {//network
            }
        } finally {
            refreshed ? setRefreshing(false) : setLoading(false)
        }
    }, [user])

    const onRefresh = React.useCallback(() => {
        onLoad(true)
    }, [])


    const onChangeFavorite = React.useCallback(async ({ _id, store, product } : { _id: string, store: string, product: string }) => {
        try {
            if (data?.find(item => item._id === _id)) {
                await onRemoveFavorite({ _id, store })
            } else {
                await onCreateFavorite({ _id, store, product })
            }
        } catch (err) {}
    }, [user, data])

    const onRemoveFavorite = React.useCallback(async ({ _id, store } : { _id: string, store: string }) => {
        try {
            await FavoriteService.remove({ _id, store, userId: user?._id })
            setData(data => data?.filter(item => item?._id !== _id))
        } catch (err) {}
    }, [user])

    const onCreateFavorite = React.useCallback(async ({ _id, store, product } : { _id: string, store: string, product: string }) => {
        try {
            const favorite = await FavoriteService.save({ userId: user?._id, params: { _id, store, product } })
            setData(data => [...data, favorite])
        } catch (err) {}
    }, [user])


  return (
    <FavoriteContext.Provider value={{ 
        data, loading, refreshing, missing, 
        onRefresh, 
        onChangeFavorite,
        onCreateFavorite,
        onRemoveFavorite,
    }} >
        {children}
    </FavoriteContext.Provider>
  )
}

export default FavoriteContext
