import {View, Text, Image} from 'react-native';
import React from 'react';
import FontSize from '../components/constants/FontSize';
import Colors from '../components/constants/Colors';

export default function TeamsScreen() {
  return (
    <View style={{flex: 1, backgroundColor: '#1E1E1E'}}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginHorizontal: 15,
        }}>
        <Text
          style={{
            fontFamily: 'Poppins-Medium',
            fontSize: FontSize.large,
            marginVertical: 10,
            color: Colors.onPrimary,
          }}>
          Teams
        </Text>
        <Image
          source={require('../../assets/Home/dots.png')}
          style={{width: 25, height: 25}}
        />
      </View>
    </View>
  );
}
