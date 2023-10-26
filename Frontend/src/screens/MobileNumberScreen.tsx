import {View, Text, SafeAreaView, TouchableOpacity} from 'react-native';
import React from 'react';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import axios from 'axios';

//Files
import AppTextInput from '../components/constants/AppTextInput';
import Spacing from '../components/constants/Spacing';
import Colors from '../components/constants/Colors';
import Font from '../components/constants/Font';
import FontSize from '../components/constants/FontSize';
import {API_URI} from '../utils/constants';

import {addUser} from '../redux/action';

export default function MobileNumberScreen(): JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const dispatch = useDispatch();
  const [number, setNumber] = React.useState('');
  const [error, setError] = React.useState('');
  const [apiError, setApiError] = React.useState('');

  const handleContinue = () => {
    console.log('number', number);
    //navigation.navigate('otp');
    if (number.length != 10) {
      setError('Number should contain 10 digits.');
      return;
    }

    axios
      .post(`${API_URI}/sendOTP`, {phone: `+91${number}`})
      .then(response => {
        console.log(response.data);
        setNumber('');
        setError('');
        dispatch(
          addUser({phone: response.data.phone, hash: response.data.hash}),
        );
        navigation.navigate('otp');
      })
      .catch(error => {
        console.log(error);
        setError('This number is not valid');
      });
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#1E1E1E'}}>
      <View style={{marginHorizontal: 15, marginVertical: 30}}>
        <Text
          style={{
            fontFamily: 'Poppins-Bold',
            fontSize: FontSize.xLarge,
            marginVertical: 10,
            color: Colors.onPrimary,
          }}>
          My mobile
        </Text>
        <Text
          style={{
            fontFamily: 'Poppins-Medium',
            fontSize: FontSize.medium,
            marginVertical: 10,
            color: Colors.onPrimary,
          }}>
          Please enter your valid phone number. We will send you a 4-digit code
          to verify your account.
        </Text>
        <AppTextInput
          keyboardType="numeric"
          value={number}
          placeholder="Enter phone number"
          error={error}
          onChangeText={e => {
            setNumber(e);
            setApiError('');
            setError('');
          }}
          onFocus={() => {
            setApiError('');
            setError('');
          }}
        />
        {apiError && (
          <Text
            style={{
              marginTop: 12,
              marginBottom: -18,
              color: Colors.red,
              fontSize: 14,
            }}>
            {apiError}
          </Text>
        )}
        <TouchableOpacity
          onPress={handleContinue}
          style={{
            padding: Spacing * 2,
            backgroundColor: Colors.theme,
            marginVertical: Spacing * 3,
            borderRadius: Spacing,
            shadowColor: Colors.theme,
            shadowOffset: {
              width: 0,
              height: Spacing,
            },
            shadowOpacity: 0.3,
            shadowRadius: Spacing,
          }}>
          <Text
            style={{
              fontFamily: Font['poppins-bold'],
              color: Colors.onPrimary,
              textAlign: 'center',
              fontSize: FontSize.large,
            }}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
