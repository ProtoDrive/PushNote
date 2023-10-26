import {View, Text, Dimensions} from 'react-native';
import React from 'react';
import LottieView from 'lottie-react-native';

export default function Loading(): JSX.Element {
  return (
    <View
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Dimensions.get('window').height / 2 - 150,
      }}>
      <LottieView
        source={require('../../../assets/Loading/loading.json')}
        style={{
          width: 100,
          height: 100,
        }}
        autoPlay
        loop
      />
    </View>
  );
}
