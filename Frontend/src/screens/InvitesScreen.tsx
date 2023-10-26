import {View, Text, ScrollView, Image, Dimensions} from 'react-native';
import React, {useEffect, useState} from 'react';
import Colors from '../components/constants/Colors';
import {useRoute} from '@react-navigation/native';
import axios from 'axios';
import {API_URI} from '../utils/constants';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';

import FontSize from '../components/constants/FontSize';
import Font from '../components/constants/Font';
import Spacing from '../components/constants/Spacing';

export default function InvitesScreen(): JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const route = useRoute<any>();
  const userId = route.params?.id || '';

  const [invites, setInvites] = useState([]);
  const [organizationsData, setOrganizationsData] = useState<any>([]);

  const getOrganizations = async () => {
    try {
      const response = await axios.get(
        `${API_URI}/organization-invite/received/${userId}`,
      );
      console.log(response.data);
      setInvites(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getOrganizations();
  }, []);

  const getOrganizationData = async () => {
    const orgDataPromises = invites.map(async (item: any) => {
      try {
        const response = await axios.get(
          `${API_URI}/organizations/${item.organizationId}`,
        );
        return response.data;
      } catch (err) {
        console.log(
          `Error fetching organization data for ID ${item.organizationId}:`,
          err,
        );
        return null; // Return null in case of an error
      }
    });

    // Wait for all requests to complete and get the organization data
    const orgDataArray = await Promise.all(orgDataPromises);

    // Filter out any null values (organizations that couldn't be fetched)
    const filteredOrgData = orgDataArray.filter(orgData => orgData !== null);

    setOrganizationsData(filteredOrgData);
  };

  useEffect(() => {
    getOrganizationData();
  }, [invites]);

  const acceptInvite = async (orgId: any) => {
    await axios
      .post(`${API_URI}/organization-invite/accept`, {
        userId: userId,
        organizationId: orgId,
      })
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.log(error);
      });
    navigation.navigate('home');
  };

  return (
    <ScrollView style={{flex: 1, backgroundColor: Colors.backgroundColor}}>
      <View style={{marginTop: 20}}>
        {organizationsData.length > 0 ? (
          organizationsData.map((item: any) => {
            return (
              <View
                key={item.organization._id}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 20,
                    marginLeft: 40,
                    marginVertical: 20,
                  }}>
                  <View>
                    {item.organization.image.length > 2 ? (
                      <Image
                        source={{
                          uri: `data:image/png;base64,${item?.organization.image}`,
                        }}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 100,
                        }}
                      />
                    ) : (
                      <Image
                        source={require('../../assets/Profile/nodp.png')}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 100,
                        }}
                      />
                    )}
                  </View>
                  <View>
                    <Text
                      style={{
                        fontFamily: 'Poppins-Bold',
                        fontSize: FontSize.medium,
                        color: Colors.onPrimary,
                        width: Dimensions.get('window').width - 250,
                      }}>
                      {item?.organization.name}
                    </Text>
                  </View>
                </View>
                <View>
                  <TouchableOpacity
                    onPress={() => acceptInvite(item.organization._id)}
                    style={{
                      padding: Spacing * 1,
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
                        fontSize: FontSize.medium,
                      }}>
                      Accept
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <View>
            <Text
              style={{
                display: 'flex',
                justifyContent: 'center',
                textAlign: 'center',
                fontFamily: 'Poppins-Medium',
                fontSize: FontSize.large,
                color: Colors.onPrimary,
                marginTop: Dimensions.get('window').height / 2 - 100,
              }}>
              No Invites
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
