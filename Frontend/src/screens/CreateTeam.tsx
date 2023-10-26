import {
  View,
  Text,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation, useRoute} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import {useSelector} from 'react-redux';

//Files
import Colors from '../components/constants/Colors';
import FontSize from '../components/constants/FontSize';
import AppTextInput from '../components/constants/AppTextInput';
import Font from '../components/constants/Font';
import Spacing from '../components/constants/Spacing';
import {API_URI} from '../utils/constants';
import Loading from '../components/constants/Loading';

export default function CreateTeam(): JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const userData = useSelector((state: any) => state.reducer);

  const [imageSource, setImageSource] = useState(
    require('../../assets/Profile/nodp.png'),
  );
  const [imgFile, setImgFile] = useState(
    require('../../assets/Profile/nodp.png'),
  );
  const [focused, setFocused] = useState<boolean>(false);
  const [error, setError] = useState();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [apiError, setApiError] = React.useState('');
  const [loading, setLoading] = useState(false);

  const route = useRoute<any>();

  // Access the selectedPhoneNumbers and any other data passed as route parameters
  const selectedPhoneNumbers = route.params?.selectedPhoneNumbers || [];

  const getBorderColor = () => {
    if (error) {
      return Colors.red; // Use red border when there's an error
    } else if (focused) {
      return Colors.primary; // Use primary color border when focused
    } else {
      return Colors.gray; // Use gray border in other cases
    }
  };

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

  const createTeam = () => {
    if (name == '') {
      setApiError('Name is required');
    }

    const phoneNumbersArray = selectedPhoneNumbers.map(
      (item: any) => item.phone,
    );

    if (phoneNumbersArray.length <= 0) {
      setApiError('Their should be a one member');
    }

    setLoading(true);

    axios
      .post(`${API_URI}/organizations`, {
        name: name,
        image: imgFile,
        members: phoneNumbersArray,
        admin: userData.data._id,
        bio: bio,
      })
      .then(response => {
        setName('');
        setBio('');
        setImageSource(require('../../assets/Profile/nodp.png'));
        navigation.navigate('home', {refresh: true});
        setLoading(false);
      })
      .catch(error => {
        console.log(error);
        setApiError('Internal server error.');
      });
  };

  return (
    <ScrollView style={{backgroundColor: Colors.backgroundColor, flex: 1}}>
      {loading ? (
        <Loading />
      ) : (
        <SafeAreaView>
          <View
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              flexDirection: 'row',
              gap: 20,
              marginVertical: 30,
              marginHorizontal: 20,
            }}>
            <TouchableOpacity onPress={selectImage}>
              <Image
                source={imageSource}
                style={{width: 100, height: 100, borderRadius: 100}}
              />
              <Image
                source={require('../../assets/Profile/camera.png')}
                style={{
                  width: 30,
                  height: 30,
                  position: 'relative',
                  top: -20,
                  left: 70,
                }}
              />
            </TouchableOpacity>

            <View>
              <TextInput
                placeholder="Team Name"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                value={name}
                onChangeText={e => {
                  setName(e);
                  setApiError('');
                }}
                placeholderTextColor={Colors.darkText}
                style={[
                  {
                    fontFamily: Font['poppins-regular'],
                    fontSize: FontSize.medium,
                    padding: Spacing * 2,
                    backgroundColor: Colors.lightPrimary,
                    borderRadius: Spacing,
                    marginTop: Spacing,
                    borderWidth: 3,
                    borderColor: getBorderColor(),
                    //height: height && height,
                  },
                  focused && {
                    borderWidth: 3,
                    borderColor: Colors.theme,
                    shadowOffset: {width: 4, height: Spacing},
                    shadowColor: Colors.primary,
                    shadowOpacity: 0.2,
                    shadowRadius: Spacing,
                  },
                  {width: Dimensions.get('window').width - 150},
                ]}
              />
            </View>
          </View>
          <View style={{marginHorizontal: 15}}>
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                fontSize: FontSize.medium,
                color: Colors.onPrimary,
              }}>
              Team Bio
            </Text>
            <AppTextInput
              placeholder="Write about your team"
              value={bio}
              onChangeText={text => setBio(text)}
              height={150}
              multiline
            />
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('addmembers', {selectedPhoneNumbers});
                setApiError('');
              }}
              style={{marginTop: 20}}>
              <Text
                style={{
                  color: Colors.theme,
                  fontSize: FontSize.medium,
                }}>
                Add members
              </Text>
            </TouchableOpacity>

            {apiError && (
              <Text
                style={{
                  marginTop: 12,
                  marginBottom: 0,
                  color: Colors.red,
                  fontSize: 14,
                }}>
                {apiError}
              </Text>
            )}

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'flex-start',
                marginTop: 10,
              }}>
              {selectedPhoneNumbers.length > 0 &&
                selectedPhoneNumbers.map((item: any) => (
                  <View
                    key={item.phone}
                    style={{width: '30%', padding: 10, alignItems: 'center'}}>
                    <Image
                      source={require('../../assets/Profile/nodp.png')}
                      style={{width: 60, height: 60, borderRadius: 100}}
                    />
                    <Text
                      style={{
                        fontFamily: 'Poppins-Medium',
                        fontSize: FontSize.medium,
                        color: Colors.onPrimary,
                        textAlign: 'center',
                        marginTop: 5,
                      }}>
                      {item.name}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
          <TouchableOpacity
            onPress={createTeam}
            style={{
              backgroundColor: Colors.theme,
              borderRadius: 30,
              width: 80,
              height: 80,
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              top: Dimensions.get('window').height / 2 + 150,
              right: 30,
            }}>
            <Image
              source={require('../../assets/Teams/check.png')}
              style={{width: 50, height: 50}}
            />
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </ScrollView>
  );
}
