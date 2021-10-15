import React, { useCallback, useMemo } from 'react';
import { FlatList, FlatListProps, View } from 'react-native';

const FlatColumnList: React.FC<FlatListProps<any> & { numColumns: number }> = ({
  numColumns,
  renderItem,
  ...props
}) => {
  const data = (props.data.length%numColumns===0) ? props.data : [...props.data, { key: 'last-space-item' }]

  const Render = useCallback(() => (
    <FlatList 
      {...props}
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      numColumns={numColumns}
      horizontal={false}
      columnWrapperStyle={numColumns > 1 && { flexGrow: 1 }}
      data={data}
      renderItem={({ item, index, separators }) => {
        if (item.key === 'last-space-item') return <View style={{ flex: 1 }}/>
        return (
        <View style={{ flex: 1 }}>
           {renderItem({ item, index, separators })}
        </View>
      )
    }}
    />
  ), [numColumns])

  return (
    <Render />
  )
}

export default FlatColumnList;