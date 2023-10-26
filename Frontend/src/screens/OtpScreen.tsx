import React, {useState, useEffect, useRef, createRef} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Files
import Spacing from '../components/constants/Spacing';
import Colors from '../components/constants/Colors';
import Font from '../components/constants/Font';
import FontSize from '../components/constants/FontSize';
import {API_URI} from '../utils/constants';

import {addUser} from '../redux/action';

const numberOfBoxes = 4;

export default function OtpScreen(): JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const dispatch = useDispatch();

  const userData = useSelector((state: any) => state.reducer);

  const [countdown, setCountdown] = useState(120); // 2 minutes in seconds
  const [timerRunning, setTimerRunning] = useState(true);
  const [apiError, setApiError] = React.useState('');

  const [otp, setOtp] = useState(['', '', '', '']); // Initialize an array to hold OTP digits
  const inputRefs = useRef<Array<TextInput | null>>([null, null, null, null]);

  const handleContinue = () => {
    //navigation.navigate('profile');
    if (otp[3] == '') {
      setApiError('OTP should contain 4 digits.');
      return;
    }

    axios
      .post(`${API_URI}/verifyOTP`, {
        otp: otp.join(''),
        phone: userData.data.phone,
        hash: userData.data.hash,
      })
      .then(response => {
        setOtp(['', '', '', '']);
        dispatch(addUser(response.data.user));
        AsyncStorage.setItem('User', JSON.stringify(response.data.user));
        if (response.data.user.activated) {
          navigation.navigate('home');
        } else {
          navigation.navigate('profile');
        }
      })
      .catch(error => {
        console.log(error);
        setApiError('This OTP is not valid');
      });
  };

  // Function to handle OTP input for each box
  const handleOtpInputChange = (text: string, index: number) => {
    setApiError('');
    if (index >= 0 && index < numberOfBoxes) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
    }
  };

  // Function to reset the countdown timer
  const resetTimer = () => {
    setCountdown(120);
    setTimerRunning(true);
  };

  useEffect(() => {
    let timer: any;
    if (timerRunning && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prevCount => prevCount - 1);
      }, 1000);
    } else if (countdown === 0) {
      setTimerRunning(false);
      clearInterval(timer);
      // Handle OTP expiration here
    }

    return () => {
      clearInterval(timer);
    };
  }, [timerRunning, countdown]);

  // Function to format time as '00:00'
  const formatTime = (timeInSeconds: any) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#1E1E1E'}}>
      <View style={{marginHorizontal: 15, marginVertical: 30}}>
        <Text
          style={{
            fontFamily: 'Poppins-Black',
            fontSize: FontSize.xxLarge,
            marginVertical: 10,
            color: Colors.onPrimary,
          }}>
          {formatTime(countdown)}
        </Text>
        <Text
          style={{
            fontFamily: 'Poppins-Medium',
            fontSize: FontSize.medium,
            marginVertical: 10,
            color: Colors.onPrimary,
          }}>
          Type the verification we've sent you.
        </Text>

        <View
          style={{
            marginHorizontal: 15,
            marginVertical: 30,
            flexDirection: 'row',
          }}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={input => (inputRefs.current[index] = input)} // Set up ref
              style={{
                flex: 1,
                fontFamily: 'Poppins-Bold',
                fontSize: 24,
                backgroundColor: Colors.lightPrimary,
                borderRadius: 10,
                padding: 16,
                textAlign: 'center',
                borderWidth: 2,
                borderColor: Colors.theme,
                marginRight: index < numberOfBoxes - 1 ? 10 : 0,
              }}
              keyboardType="numeric"
              maxLength={1}
              onChangeText={text => {
                handleOtpInputChange(text, index);

                // Move focus to the next input box
                if (text !== '' && index < numberOfBoxes - 1) {
                  inputRefs.current[index + 1]?.focus();
                }
              }}
              value={digit}
            />
          ))}
        </View>
        {apiError && (
          <Text
            style={{
              marginTop: 1,
              marginBottom: 8,
              color: Colors.red,
              fontSize: 14,
            }}>
            {apiError}
          </Text>
        )}

        <TouchableOpacity onPress={resetTimer} style={{marginTop: 20}}>
          <Text
            style={{
              color: Colors.theme,
              fontSize: FontSize.medium,
            }}>
            Send Again
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleContinue}
          style={{
            padding: Spacing * 2,
            backgroundColor: Colors.theme,
            marginVertical: Spacing * 2,
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
