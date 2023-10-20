import {View, Text, Image, TouchableOpacity, SafeAreaView} from 'react-native';
import React, {useState} from 'react';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';

//Files
import AppTextInput from '../components/constants/AppTextInput';
import Spacing from '../components/constants/Spacing';
import Colors from '../components/constants/Colors';
import Font from '../components/constants/Font';
import FontSize from '../components/constants/FontSize';

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [imageSource, setImageSource] = useState(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  const selectImage = () => {
    const options = {
      title: 'Select Profile Image',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
  };

  const saveProfile = () => {
    console.log('profile', name, bio);
    navigation.navigate('home');
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#1E1E1E'}}>
      <View style={{marginHorizontal: 15, marginTop: 30}}>
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <TouchableOpacity onPress={selectImage}>
            <Image
              source={require('../../assets/Profile/nodp.png')}
              style={{width: 200, height: 200, borderRadius: 100}}
            />
            <Image
              source={require('../../assets/Profile/camera.png')}
              style={{
                width: 35,
                height: 35,
                position: 'relative',
                top: -30,
                left: 140,
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
            onChangeText={text => setName(text)}
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
            placeholder="Bio"
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
