import {View, Text, TouchableOpacity, Image, Dimensions} from 'react-native';
import React, {useEffect, useState} from 'react';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';

//Files
import {useSelector} from 'react-redux';
import FontSize from '../components/constants/FontSize';
import Colors from '../components/constants/Colors';
import axios from 'axios';
import {API_URI} from '../utils/constants';

const settingsData = [
  {
    image: require('../../assets/Settings/account.png'),
    title: 'Account',
    content: 'Edit your profile',
    navigate: 'Settings',
  },
  {
    image: require('../../assets/Settings/invite.png'),
    title: 'Invites',
    content: 'See your all invites',
    navigate: 'invites',
  },
  {
    image: require('../../assets/Settings/help.png'),
    title: 'Help',
    content: 'Help center, contact us, privacy policy',
    navigate: 'Settings',
  },
];

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const userData = useSelector((state: any) => state?.reducer);
  const [invite, setInvite] = useState([]);

  const getOrganizations = async () => {
    try {
      const response = await axios.get(
        `${API_URI}/organization-invite/received/${userData.data._id}`,
      );
      console.log(response.data);
      setInvite(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getOrganizations();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getOrganizations();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={{flex: 1, backgroundColor: Colors.backgroundColor}}>
      <View style={{marginHorizontal: 15, marginTop: 30}}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 20,
          }}>
          <View>
            <Image
              source={{
                uri: `data:image/png;base64,${userData.data.image}`,
              }}
              style={{width: 150, height: 150, borderRadius: 100}}
            />
          </View>

          <View>
            <Text
              style={{
                fontFamily: 'Poppins-Bold',
                fontSize: FontSize.large,
                color: Colors.onPrimary,
              }}>
              {userData.data.username}
            </Text>
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                fontSize: FontSize.medium,
                color: Colors.onPrimary,
              }}>
              {userData.data.bio}
            </Text>
          </View>
        </View>

        <View
          style={{
            marginTop: 20,
            marginHorizontal: 25,
          }}>
          {settingsData.map(item => {
            return (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(item.navigate, {id: userData.data._id})
                }
                key={item.title}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 20,
                  marginVertical: 20,
                }}>
                <View>
                  <Image source={item.image} style={{width: 35, height: 35}} />
                </View>
                <View>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 15,
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Poppins-Medium',
                        fontSize: FontSize.large,
                        color: Colors.onPrimary,
                      }}>
                      {item.title}
                    </Text>
                    {item.title == 'Invites' && invite.length > 0 && (
                      <View
                        style={{
                          backgroundColor: Colors.theme,
                          paddingVertical: 5,
                          paddingHorizontal: 10,
                          borderRadius: 100,
                        }}>
                        <Text
                          style={{
                            fontFamily: 'Poppins-Medium',
                            fontSize: FontSize.medium,
                            color: Colors.onPrimary,
                          }}>
                          {invite.length}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Medium',
                      fontSize: FontSize.medium,
                      color: Colors.onPrimary,
                      marginRight: 50,
                    }}>
                    {item.content}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
          <View
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 50,
            }}>
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                fontSize: FontSize.medium,
                color: Colors.onPrimary,
              }}>
              From
            </Text>
            <View style={{display: 'flex', flexDirection: 'row', marginTop: 5}}>
              <Text
                style={{
                  fontFamily: 'Poppins-Black',
                  fontSize: FontSize.large,
                  color: Colors.onPrimary,
                }}>
                Planitar
              </Text>
              <Text
                style={{
                  fontFamily: 'Poppins-Black',
                  fontSize: FontSize.large,
                  color: Colors.theme,
                }}>
                .
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
