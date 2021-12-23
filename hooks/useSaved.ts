import SavedContext from '../contexts/saved';
import { useContextSelector } from 'use-context-selector';
import { savedData } from '../services/saved';

export function useSaved(select?: (data: savedData[]) => any) {
    const data = useContextSelector(SavedContext, saved => saved.data);
    const selected = select ? select(data) : data

    const loading = useContextSelector(SavedContext, saved => saved.loading);
    const refreshing = useContextSelector(SavedContext, saved => saved.refreshing);
    const missing = useContextSelector(SavedContext, saved => saved.missing);
    const onRefresh = useContextSelector(SavedContext, saved => saved.onRefresh);

    const onChangeSaved = useContextSelector(SavedContext, saved => saved.onChangeSaved);
    const onCreateSaved = useContextSelector(SavedContext, saved => saved.onCreateSaved);
    const onRemoveSaved = useContextSelector(SavedContext, saved => saved.onRemoveSaved);

    return { data: selected, loading, onRefresh, onCreateSaved, onRemoveSaved, onChangeSaved, refreshing, missing }
}

