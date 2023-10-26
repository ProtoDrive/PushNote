import {View, Text, Image, TouchableOpacity, SafeAreaView} from 'react-native';
import React, {useState} from 'react';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch, useSelector} from 'react-redux';

//Files
import AppTextInput from '../components/constants/AppTextInput';
import Spacing from '../components/constants/Spacing';
import Colors from '../components/constants/Colors';
import Font from '../components/constants/Font';
import FontSize from '../components/constants/FontSize';
import {API_URI} from '../utils/constants';

import {addUser} from '../redux/action';

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const dispatch = useDispatch();

  const userData = useSelector((state: any) => state.reducer);

  const [apiError, setApiError] = React.useState('');
  const [imageSource, setImageSource] = useState(
    require('../../assets/Profile/nodp.png'),
  );
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [imgFile, setImgFile] = useState(
    require('../../assets/Profile/nodp.png'),
  );

  const selectImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
      includeBase64: true,
    });
    if (result?.assets) {
      setImageSource({
        uri: `data:image/png;base64,${result?.assets[0]?.base64}`,
      });
      setImgFile(result?.assets[0]?.base64);
    }
  };

  const saveProfile = () => {
    if (!name) {
      setApiError('Name is required');
    }

    axios
      .post(`${API_URI}/activate`, {
        name: name,
        image: imgFile,
        userId: userData.data._id,
        bio: bio,
      })
      .then(response => {
        setName('');
        setBio('');
        setImageSource(require('../../assets/Profile/nodp.png'));
        dispatch(addUser(response.data.user));
        AsyncStorage.setItem('User', JSON.stringify(response.data.user));
        navigation.navigate('home');
      })
      .catch(error => {
        console.log(error);
        setApiError('Internal server error.');
      });
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#1E1E1E'}}>
      <View style={{marginHorizontal: 15, marginTop: 30}}>
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <TouchableOpacity onPress={selectImage}>
            <Image
              source={imageSource}
              style={{width: 200, height: 200, borderRadius: 100}}
            />
            <Image
              source={require('../../assets/Profile/camera.png')}
              style={{
                width: 35,
                height: 35,
                position: 'relative',
                top: -25,
                left: 135,
              }}
            />
          </TouchableOpacity>
        </View>

        <View style={{marginBottom: 10}}>
          <Text
            style={{
              fontFamily: 'Poppins-Medium',
              fontSize: FontSize.medium,
              color: Colors.onPrimary,
            }}>
            Name
          </Text>
          <AppTextInput
            placeholder="Your Name"
            value={name}
            onChangeText={text => {
              setName(text);
              setApiError('');
            }}
            error={apiError}
          />
        </View>

        <View style={{marginBottom: 15}}>
          <Text
            style={{
              fontFamily: 'Poppins-Medium',
              fontSize: FontSize.medium,
              color: Colors.onPrimary,
            }}>
            Bio
          </Text>
          <AppTextInput
            placeholder="Tell us about yourself"
            value={bio}
            onChangeText={text => setBio(text)}
            height={150}
            multiline
          />
        </View>

        <TouchableOpacity
          onPress={saveProfile}
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
