import React, { useContext } from 'react';
import SnackBarContext from '../contexts/snackbar';
import { createContext, useContextSelector } from 'use-context-selector';

export function useSnackbar () {
    const open = useContextSelector(SnackBarContext, snackbar => snackbar.open);
    const close = useContextSelector(SnackBarContext, snackbar => snackbar.close);
    return { open, close }
}

export function useSnackbarHeight () {
    const snackbarHeight = useContextSelector(SnackBarContext, snackbar => snackbar.snackbarHeight);
    return snackbarHeight
}

export function useSetSnackBottomOffset () {
    const setBottomOffset = useContextSelector(SnackBarContext, snackbar => snackbar.setBottomOffset);
    return setBottomOffset
}

export function useSetSnackExtraBottomOffset () {
    const setExtraBottomOffset = useContextSelector(SnackBarContext, snackbar => snackbar.setExtraBottomOffset);
    return setExtraBottomOffset
}