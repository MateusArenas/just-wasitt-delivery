import React, { useContext } from 'react';
import BagContext from '../contexts/bag';
import { createContext, useContextSelector } from 'use-context-selector';
import { bagData } from '../services/bag';

export function useBag(select?: (data: bagData[]) => any) {
    const data = useContextSelector(BagContext, bag => bag.data);
    const selected = select ? select(data) : data
    const loading = useContextSelector(BagContext, bag => bag.loading);
    const refreshing = useContextSelector(BagContext, bag => bag.refreshing);
    const missing = useContextSelector(BagContext, bag => bag.missing);
    const onRefresh = useContextSelector(BagContext, bag => bag.onRefresh);
    const onRemoveBag = useContextSelector(BagContext, bag => bag.onRemoveBag);
    const onCreateBag = useContextSelector(BagContext, bag => bag.onCreateBag);
    return { data: selected, loading, onRefresh, onRemoveBag, onCreateBag, refreshing, missing }
}

export function useBundle(select?: (data: bagData[]) => any) {
    const data = useContextSelector(BagContext, bag => bag.data);
    const selected = select ? select(data) : data
    const onCreateBundle = useContextSelector(BagContext, bag => bag.onCreateBundle);
    const onUpdateBundle = useContextSelector(BagContext, bag => bag.onUpdateBundle);
    const onRemoveBundle = useContextSelector(BagContext, bag => bag.onRemoveBundle);
    return { data: selected, onCreateBundle, onRemoveBundle, onUpdateBundle }
}