import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { View, FlatList, ColorValue } from 'react-native';
import useMediaQuery from '../../hooks/useMediaQuery';
import BoardButton from '../BoardButton';
import CardLink from '../CardLink';

interface dataInterface {
    key?: string | number
    icon?: React.ComponentProps<typeof MaterialIcons>['name']
    title?: string
    length?: number
    disabled?: boolean
    onPress?: () => any
    color?: ColorValue
    hover?: ColorValue
}

interface BottomHalfModalBoardProps {
    onClose?: () => any
    selectAndClose?: boolean
    rendered?: { data?: boolean, boardData?: boolean }
    boardData?: Array<dataInterface>
    data?: Array<dataInterface>
}

const BottomHalfModalBoard: React.FC<BottomHalfModalBoardProps> = ({ 
    onClose=()=>{},
    selectAndClose=true,
    rendered={ boardData: true, data: true },
    boardData=[],
    data=[],
}) => {
  const { colors } = useTheme()

  const { isDesktop } = useMediaQuery()

  return (
    <FlatList 
        ListHeaderComponentStyle={{ paddingHorizontal: 5 }}
        ListHeaderComponent={
        <FlatList style={{ flex: 1 }}
            contentContainerStyle={{ flex: 1, paddingHorizontal: 5 }}
            scrollEnabled={false}
            numColumns={3}
            data={(rendered?.boardData || rendered?.boardData === undefined) ? boardData : []}
            keyExtractor={(item, index) => `${item?.key}-${index}`}
            renderItem={({ item }) => (
            <BoardButton disabled={item?.disabled}
                icon={item?.icon}
                title={item?.title}
                tintColor={item?.color || colors.text}
                backgroundColor={colors.background}
                badgeEnable={!!item?.length}
                badge={{ number: item?.length, background: colors.notification }}
                onPress={item?.onPress}
                onPressed={() => selectAndClose ? onClose() : null}
            />
            )}
        />
        }
        data={(rendered?.data || rendered?.data === undefined) ? data : []}
        contentContainerStyle={[{ flexGrow: 1 }]}
        keyExtractor={(item, index) => `${item?.key}-${index}`}
        renderItem={({ item, index }) => 
        <CardLink style={{
                backgroundColor: colors.background,
                borderTopLeftRadius: (index === 0) ? 10 : 0, borderTopRightRadius: (index === 0) ? 10 : 0,
                borderBottomLeftRadius: (index === (data?.length-1)) ? 10 : 0, 
                borderBottomRightRadius: (index === (data?.length-1)) ? 10 : 0,
                marginTop: (index === 0) ? 10 : 1,
                marginBottom: (index === (data?.length-1)) ? 10 : 1,
                marginHorizontal: 10,
            }} 
            hoverBackgroundColor={item?.hover || colors.border}
            border={false}
            titleContainerStyle={{ padding: 10 }}
            title={item?.title}
            right={
            <MaterialIcons style={{ padding: 20 }}
                name={item?.icon as any}
                size={24}
                color={(isDesktop && item?.hover === item?.color) ? colors.text : item?.color || colors.text}
            />
            }
            color={(isDesktop && item?.hover === item?.color) ? colors.text : item?.color || colors.text}
            onPress={item?.onPress}
            onPressed={() => selectAndClose ? onClose() : null}
        />
        }
        ListFooterComponent={
        <View>
            <CardLink border={false} 
                style={{ margin: 10, borderRadius: 10, backgroundColor: colors.background  }}
                titleContainerStyle={{ alignItems: 'center' , padding: 10 }}
                title={'Cancelar'}
                right={null}
                color={colors.text}
                onPress={onClose}
            />
        </View>
        }
    />
  )
}

export default React.memo(BottomHalfModalBoard);