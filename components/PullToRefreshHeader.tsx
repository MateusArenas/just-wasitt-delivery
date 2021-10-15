/**
 * custom header component for pull to refresh
 */

import { useTheme } from '@react-navigation/native';

//  import {
//   BallIndicator,
//   BarIndicator,
//   DotIndicator,
//   MaterialIndicator,
//   PacmanIndicator,
//   PulseIndicator,
//   SkypeIndicator,
//   UIActivityIndicator,
//   WaveIndicator,
// } from 'react-native-indicators';

import { AnimatedCircularProgress } from 'react-native-circular-progress';
// import { Circle } from 'react-native-svg'


 /**
 * custom header component for pull to refresh
 */

import * as React from 'react';
import {
    Text,
    View,
    ScrollView,
    FlatList,
    Animated,
    PanResponder,
    ViewStyle,
    TextStyle,
    Alert,
    ActivityIndicator,
} from 'react-native';

import PullToRefresh, { PullToRefreshHeaderProps } from 'react-native-pull-to-refresh-custom';
import { Easing } from 'react-native-reanimated';
import { MaterialIcons, AntDesign, FontAwesome } from '@expo/vector-icons';

const { Component } = React;

const headerStyle = {
    con: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
    title: {
        fontSize: 22,
    } as TextStyle,
};

interface ClassHeaderState {
    pullDistance: number;
    percent: number;
}

export default class Header extends Component<PullToRefreshHeaderProps, ClassHeaderState> {
    constructor(props: PullToRefreshHeaderProps) {
        super(props);
        this.state = {
            pullDistance: props.pullDistance,
            percent: props.percent,
        };
    }

    setProgress({ pullDistance, percent }: { pullDistance: number; percent: number}) {
        this.setState({
            pullDistance,
            percent,
        });
    }


    componentWillReceiveProps(nextProps: Readonly<PullToRefreshHeaderProps>) {
        this.setState({
            pullDistance: nextProps.pullDistance,
            percent: nextProps.percent,
        });
    }

    
    render() {
      // const spinValue = new Animated.Value(this.state.percent <= 1.05 ? this.state.percent : 1.05);
        const { percentAnimatedValue, percent, refreshing } = this.props;
        const { percent: statePercent, pullDistance } = this.state;
        let text = 'oi'
        if(statePercent >= 1.4 ){
          text = 'não'
        } else {
          text = 'sim'
        }

        return (
            <Animated.View style={[headerStyle.con, { opacity: percentAnimatedValue }]}>
              {/* <Text>{text}</Text> */}
              {/* <Text>{pullDistance/100}</Text> */}
              <Animated.View 
                style={{
                  transform: [{ 
                    rotate: percentAnimatedValue.interpolate({ 
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'] 
                    }) ,
                  }] 
                }}
              >  
                <ProgressIndicator 
                  percent={statePercent} 
                  percentAnimatedValue={percentAnimatedValue} 
                  pullDistance={pullDistance}
                  refreshing={refreshing}
                />
              </Animated.View>
            </Animated.View>
        );
    }
}

export const ProgressIndicator: React.FC<PullToRefreshHeaderProps> = ({
  percent,
  percentAnimatedValue,
  refreshing,
}) => {
  const { colors } = useTheme()

  const spinValue = new Animated.Value(percent <= 1.05 ? percent : 1.05);

  const Indicator = () => {
    if (percent >= 1) {
      if (refreshing) {
        return <ActivityIndicator animating size={'large'} color={colors.text}/>
      } else {
        return <MaterialIcons name={'thumb-up'} size={32} color={colors.text} />
      }
    } 

    return (
      <AnimatedCircularProgress
        duration={0}
        width={3}
        tintColor={colors.text}
        size={32}
        fill={percent*100}
        backgroundColor={colors.border}
        // renderCap={({ center }) => <Circle cx={center.x} cy={center.y} r="1" fill={colors.text} />}
        lineCap="round"
      />
    )
  }

  return (
    <Animated.View style={[headerStyle.con, { opacity: percentAnimatedValue }]}>
      <Animated.View 
        style={{
          transform: [{ 
            rotate: spinValue.interpolate({ 
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'] 
            }) ,
          }] 
        }}
      >  
        <Indicator />
      </Animated.View>
    </Animated.View>
  )
}