import React, { useContext, useMemo, useRef } from "react";
import { createContext, useContextSelector } from 'use-context-selector';
import { savedData } from "../services/saved";
import { bundleData } from "../services/bundle";
import * as SavedService from '../services/saved'
import * as BundleService from '../services/bundle'
import AuthContext from "./auth";

interface SavedData {
    data: savedData[]
    loading: boolean
    refreshing: boolean
    missing: boolean
    onRefresh: () => any

    onChangeSaved: (params: { _id: string, store: string }) => Promise<any>
    onCreateSaved: (params: { _id: string, store: string }) => Promise<any>
    onRemoveSaved: (_id: string) => Promise<any>
}

const SavedContext = createContext<SavedData>({} as SavedData)

export const SavedProvider: React.FC = ({ children }) => {
    const { user } = React.useContext(AuthContext)

    const [loading, setLoading] = React.useState(false)
    const [refreshing, setRefreshing] = React.useState(false)
    const [missing, setMissing] = React.useState(false)
    const [data, setData] = React.useState<savedData[]>([])

    React.useEffect(() => { onLoad() }, [])

    const onLoad = React.useCallback(async (refreshed?: boolean) => {
        refreshed ? setRefreshing(true) : setLoading(true)
        try {
            const data = await SavedService.index({ userId: user?._id })
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


    const onChangeSaved = React.useCallback(async ({ _id, store } : { _id: string, store: string }) => {
        try {
            if (data?.find(item => item._id === _id)) {
                await onRemoveSaved(_id)
            } else {
                await onCreateSaved({ _id, store})
            }
        } catch (err) {}
    }, [user, data])

    const onRemoveSaved = React.useCallback(async ( _id: string) => {
        try {
            await SavedService.remove({ _id, userId: user?._id })
            setData(data => data?.filter(item => item?._id !== _id))
        } catch (err) {}
    }, [user])

    const onCreateSaved = React.useCallback(async ({ _id, store } : { _id: string, store: string }) => {
        try {
            const saved = await SavedService.save({ userId: user?._id, params: { _id, store } })
            setData(data => [...data, saved])
        } catch (err) {}
    }, [user])


  return (
    <SavedContext.Provider value={{ 
        data, loading, refreshing, missing, 
        onRefresh, 
        onChangeSaved,
        onCreateSaved,
        onRemoveSaved,
    }} >
        {children}
    </SavedContext.Provider>
  )
}

export default SavedContext
