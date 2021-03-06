import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { TextStyle, View, FlexStyle, TouchableOpacity, Text, StyleSheet, ColorValue, StyleProp, ViewStyle, TouchableOpacityProps } from 'react-native';
import { capitalizeFisrtLetter } from '../../utils';
import { Hoverable, Pressable, } from 'react-native-web-hover'

interface CardLinkProps {
  style?: StyleProp<ViewStyle>
  title?: string | number
  innerStyle?: StyleProp<ViewStyle>
  titleFontWeight?: TextStyle["fontWeight"]
  subTitle?: string | number
  subTitleStyle?: StyleProp<TextStyle>
  titleContainerStyle?: StyleProp<ViewStyle>
  titleContentContainerStyle?: StyleProp<ViewStyle>
  rightLabel?: string | number
  centerLabel?: string | number
  disabled?: boolean
  onPress?: () => any
  onPressed?: () => any
  color: ColorValue
  tintColor?: ColorValue
  border?: boolean | 'top' | 'bottom'
  borderColor?: ColorValue
  left?: React.ReactNode
  center?: React.ReactNode
  right?: React.ReactNode
  touchable?: boolean
  titleDirection?: FlexStyle['flexDirection']
  hoverBackgroundColor?: ColorValue
}

const CardLink: React.FC<CardLinkProps> = ({
  title, 
  subTitle, 
  color, 
  subTitleStyle={ color },
  innerStyle={},
  tintColor, 
  border='bottom', 
  style, 
  left, 
  centerLabel, 
  center=<CardLinkCenterDefault color={color} label={centerLabel} />, 
  rightLabel, right=<CardLinkRightDefault flex={center ? 1 : 0} label={rightLabel} color={color} tintColor={tintColor}/>, 
  disabled=false,
  onPress=()=>{}, 
  onPressed=()=>{},
  touchable=true,
  titleDirection='column',
  titleContainerStyle,
  titleFontWeight='normal',
  titleContentContainerStyle={},
  borderColor,
  hoverBackgroundColor,
}) => {
  const { colors } = useTheme()
  return (
    <ContainerHoverable touchable={touchable}>
      {({ hovered }) => (
        <View style={[styles.container, style, hovered && { backgroundColor: hoverBackgroundColor || colors.border }]}>
          <CardLinkTouchable disabled={disabled} touchable={touchable} onPress={() => { onPress(); onPressed(); }}>
            <View style={[styles.inner, innerStyle]}>
              {left}
              <View style={[styles.contentContainer, titleContentContainerStyle, { borderBottomWidth: (!!border && border !== 'top') ? 1 : 0, borderTopWidth: (!!border && border === 'top') ? 1 : 0 }, { borderColor: borderColor || colors.border }]}>
                <View style={[styles.titleContainer, titleContainerStyle]}>
                  <View style={{ padding: 10, paddingLeft: left ? 0 : 10, flexDirection: titleDirection }}>
                    {!!title && <Text numberOfLines={1} style={[styles.title, { color, fontWeight: titleFontWeight }]}>{capitalizeFisrtLetter(title)}</Text>}
                    {!!subTitle && <Text numberOfLines={1} style={[styles.subTitle, { color }, subTitleStyle]}>{capitalizeFisrtLetter(subTitle)}</Text>}
                  </View>
                </View>
                {center}
                {right}
              </View>
            </View>
          </CardLinkTouchable>
        </View>
      )}
    </ContainerHoverable>
  )
}

const ContainerHoverable: React.FC<TouchableOpacityProps & { 
  touchable: boolean, 
  children?: ((props: any) => any) & React.ReactNode
}> = ({ touchable, children, ...props }) => {
  if (touchable) return <Hoverable {...props} children={children} />
  else return <View>{typeof children === 'function' ? children({ hovered: false }) : children}</View>
}

const CardLinkTouchable: React.FC<TouchableOpacityProps & { touchable: boolean}> = ({ touchable, children, ...props }) => {
  if (touchable) return <TouchableOpacity {...props} children={children} />
  else return <View children={children} />
}

const CardLinkRightDefault: React.FC<{ label?: string | number, color?: ColorValue, tintColor?: ColorValue, flex?: number }> = ({ label, color, tintColor, flex }) => {
  return (
    <View style={[ flex ? { flex } : {}]}>
      <View style={[styles.rightDefaultContainer]}>
        {!!label && <Text numberOfLines={1} style={[styles.rightDefaultLabel, { color: tintColor ? tintColor : color, opacity: tintColor ? 1 : .5 }]}>{label}</Text>}
        <MaterialIcons style={{ opacity: tintColor ? 1 : .5 }} name="chevron-right" size={24} color={tintColor ? tintColor : color} />
      </View>
    </View>
  )
}

const CardLinkCenterDefault: React.FC<{ label?: string | number, color?: ColorValue }> = ({ label, color }) => {
  return !label ? null : (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={[styles.title, { color, opacity: .5 }]}>{label}</Text>
    </View>
  )
}

export default CardLink;

const styles = StyleSheet.create({
  container: {
    minHeight: 49,
  },
  inner: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1, flexDirection: 'row',
    alignSelf: 'center', 
    justifyContent: 'space-between', alignItems: 'center'
  },
  rightDefaultContainer: {
    flexDirection: 'row', 
    justifyContent: 'flex-end', alignItems: 'center', 
    paddingHorizontal: 10,
  },
  rightDefaultLabel: {
    opacity: .5, 
    fontSize: 14, fontWeight: '500'
  },
  titleContainer: {
    flex: 1, alignItems: 'flex-start',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '500', 
    fontSize: 16, 
  },
  subTitle: {
    opacity: .5,
    fontWeight: '500', 
    fontSize: 14, 
  }
})