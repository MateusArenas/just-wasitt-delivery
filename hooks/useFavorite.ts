import FavoriteContext from '../contexts/favorite';
import { useContextSelector } from 'use-context-selector';
import { favoriteData } from '../services/favorite';

export function useFavorite(select?: (data: favoriteData[]) => any) {
    const data = useContextSelector(FavoriteContext, favorite => favorite.data);
    const selected = select ? select(data) : data

    const loading = useContextSelector(FavoriteContext, favorite => favorite.loading);
    const refreshing = useContextSelector(FavoriteContext, favorite => favorite.refreshing);
    const missing = useContextSelector(FavoriteContext, favorite => favorite.missing);
    const onRefresh = useContextSelector(FavoriteContext, favorite => favorite.onRefresh);

    const onChangeFavorite = useContextSelector(FavoriteContext, favorite => favorite.onChangeFavorite);
    const onCreateFavorite = useContextSelector(FavoriteContext, favorite => favorite.onCreateFavorite);
    const onRemoveFavorite = useContextSelector(FavoriteContext, favorite => favorite.onRemoveFavorite);

    return { data: selected, loading, onRefresh, onCreateFavorite, onRemoveFavorite, onChangeFavorite, refreshing, missing }
}

