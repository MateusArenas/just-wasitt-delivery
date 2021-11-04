import React, { useContext, useMemo, useRef } from "react";
import { createContext, useContextSelector } from 'use-context-selector';
import { bagData } from "../services/bag";
import { bundleData } from "../services/bundle";
import * as BagService from '../services/bag'
import * as BundleService from '../services/bundle'
import AuthContext from "./auth";

interface BagData {
    data: bagData[]
    loading: boolean
    refreshing: boolean
    missing: boolean
    onRefresh: () => any
    onSearchBundle: (params: { store: string, userId: string, id: string }) => Promise<any>
    onCreateBundle: (params: { store: string, userId: string }, body: Partial<bundleData>) => Promise<any>
    onUpdateBundle: (params: { store: string, userId: string }, body: Partial<bundleData>) => Promise<any>
    onRemoveBundle: (params: { store: string, userId: string, id: string }) => Promise<any>
    
    onCreateBag: (params: { userId: string }, body: Partial<bundleData>) => Promise<any>
    onRemoveBag: (params: { userId: string, id: string }) => Promise<any>
}

const BagContext = createContext<BagData>({} as BagData)

export const BagProvider: React.FC = ({ children }) => {
    const { user } = React.useContext(AuthContext)

    const [loading, setLoading] = React.useState(false)
    const [refreshing, setRefreshing] = React.useState(false)
    const [missing, setMissing] = React.useState(false)
    const [data, setData] = React.useState([])

    React.useEffect(() => { onLoad() }, [])

    const onLoad = React.useCallback(async (refreshed?: boolean) => {
        refreshed ? setRefreshing(true) : setLoading(true)
        try {
            const data = await BagService.index({ userId: user?._id })
            setData(data as any)
        } catch (err) {
            if (err?.response?.status === 404) setMissing(true)
            if (!err?.response) {//network
            }
        } finally {
            refreshed ? setRefreshing(false) : setLoading(false)
        }
    }, [user])

    const onRefresh = React.useCallback(() => {
        onLoad(true)
    }, [])

    const onCreateBag = React.useCallback(async ({ userId }, body) => {
        try {
            const bag = await BagService.create({ userId, body })
            setData(data => [...data, bag])
        } catch (err) {
        }
    }, [])

    const onRemoveBag = React.useCallback(async ({ userId, id }) => {
        try {
            await BagService.remove({ userId, id })
            setData(data => data.filter(item => item?._id !== id))
        } catch (err) {
        }
    }, [])


    const onSearchBundle = React.useCallback(async ({ store, userId, id }) => {
        return await BundleService.search({ store, userId, id })
    }, [])

    const onCreateBundle = React.useCallback(async ({ store, userId }, body) => {
        try {
            const bundle = await BundleService.create({ store, userId, body })
            const find = data?.find(item => item?.store?.name === store && item?.user === userId)
            if (find) {
                setData(data => data.map(item =>
                    (item?.store?.name === store && item?.user === userId) 
                    ? {...item, bundles: [
                        ...item?.bundles, bundle
                    ]} : item
                ))
            } else {
                onLoad(true)
            }
        } catch (err) {
        }
    }, [data])

    const onUpdateBundle = React.useCallback(async ({ store, userId }, body) => {
        try {
            const bundle = await BundleService.update({ store, userId, body })

            setData(data => data.map(item => 
                (item?.store?.name === store && item?.user === userId) 
                ? { ...item, bundles: item?.bundles?.map(_item =>
                        (_item?._id === body?._id) ? {..._item, ...bundle} : _item
                   )}
                : item
            ))
        } catch (err) {
        }
    }, [])

    const onRemoveBundle = React.useCallback(async ({ store, userId, id }) => {
        try {
            await BundleService.remove({ store, userId, id })
            setData(data => data.map(item => 
                (item?.store?.name === store && item?.user === userId) 
                ? {...item, bundles: item?.bundles?.filter(bundle => bundle?._id !== id)} : item
            ))
        } catch (err) {
        }
    }, [])

  return (
    <BagContext.Provider value={{ 
        data, loading, refreshing, missing, 
        onRefresh, 
        onSearchBundle,
        onCreateBundle,
        onUpdateBundle, 
        onRemoveBundle,
        onCreateBag,
        onRemoveBag,
    }} >
        {children}
    </BagContext.Provider>
  )
}

export default BagContext
