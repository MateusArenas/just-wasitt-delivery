import React from "react"

interface useLoadPageData<T> {
    data: T[]
    loadPage: (pageNumber?: number, shouldRefresh?: boolean) => Promise<any>
    onRefresh: () => Promise<any>
    loading: boolean
    refreshing: boolean
    network: boolean
    missing: boolean
    page: number
    total: number
}

export default function useLoadPage<T>(
    service: (params: any) => Promise<any>, 
    select: (data: any) => T[],
    deeps?: Array<any>
) : useLoadPageData<T> {
  const [loading, setLoading] = React.useState(false)
  const [refreshing, setRefreshing] = React.useState(false)
  const [network, setNetwork] = React.useState(true)
  const [missing, setMissing] = React.useState(false)

  const [data, setData] = React.useState<T[]>([])
  
  const [page, setPage] = React.useState(1)
  const [total, setTotal] = React.useState(0)

  const loadPage = React.useCallback(async (pageNumber = page, shouldRefresh=false) => {
    if (total && pageNumber > total) return;
    setLoading(true)
    try {
      setNetwork(true)
      const params = { skip: (pageNumber-1)*5, limit: 5 }

      const response = await service(params)
    //   const response = await api.get(`/store/${store}/promotions/${id}`, { params })
  
      const totalCount = Number(response.headers['x-total-count'])
  
      setTotal(Math.ceil(totalCount / 5))

      const selectedData = select ? select(response?.data) : response?.data

      setData(data => shouldRefresh ? selectedData : [...data, ...selectedData])
      setMissing(response?.data?.products?.length > 0 ? false : true)
  
      setPage(pageNumber + 1)
    } catch ({ response }) {
      if (response?.status === 404) {
        setMissing(true)
        setData([])
      }
      if (!response) setNetwork(false)
    } finally {
      setLoading(false)
    }
  }, [page, total, select, deeps, service, setPage, setData, setTotal, setNetwork, setMissing, setLoading])

  async function onRefresh () {
    setRefreshing(true)

    await loadPage(1, true)

    setRefreshing(false)
  }
  
  React.useEffect(() => {
    loadPage(1, true)
  }, [deeps])

  return {
      data, 
      loadPage,
      onRefresh,
      loading,
      refreshing,
      network,
      missing,
      page,
      total,
  }
}