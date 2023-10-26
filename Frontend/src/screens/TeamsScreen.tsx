import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation, useRoute} from '@react-navigation/native';
import axios from 'axios';
import {useSelector} from 'react-redux';

//Files
import FontSize from '../components/constants/FontSize';
import Colors from '../components/constants/Colors';
import {API_URI} from '../utils/constants';
import Loading from '../components/constants/Loading';

export default function TeamsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const userData = useSelector((state: any) => state?.reducer);

  const [organizationsID, setOrganizationsID] = useState<any>([]);
  const [organizationsData, setOrganizationsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastMessages, setLastMessages] = useState<any>({});

  const getOrganizations = async () => {
    try {
      const response = await axios.get(`${API_URI}/user/${userData.data._id}`);
      setOrganizationsID(response.data.organizations);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getOrganizations();
  }, [userData]);

  const getOrganizationData = async () => {
    const orgDataPromises = organizationsID.map(async (item: any) => {
      try {
        const response = await axios.get(
          `${API_URI}/organizations/${item.organizationId}`,
        );

        const organizationData = response.data;

        if (organizationData) {
          // Get the last message ID
          const lastMessageId =
            organizationData.organization.organizationMessages[
              organizationData.organization.organizationMessages?.length - 1
            ] || null;

          if (lastMessageId) {
            try {
              // Fetch the message content by message ID
              const messageResponse = await axios.get(
                `${API_URI}/organization-messages/message/${lastMessageId}`,
              );
              const lastMessage =
                messageResponse.data.message.messageType == 'image'
                  ? 'This is a photo.'
                  : messageResponse.data.message.message;

              // Update organization data with the last message
              setLastMessages((prevState: any) => ({
                ...prevState,
                [item.organizationId]: {
                  message: lastMessage,
                  time: messageResponse.data.message.timestamp,
                },
              }));
            } catch (messageErr) {
              console.log(
                `Error fetching message data for message ID ${lastMessageId}:`,
                messageErr,
              );
            }
          } else {
            // No messages found
            setLastMessages((prevState: any) => ({
              ...prevState,
              [item.organizationId]: {
                message: "You haven't started a conversation.",
                time: '',
              },
            }));
          }
        } else {
          console.log(
            `Organization data for ID ${item.organizationId} is undefined.`,
          );
        }

        return organizationData;
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
  }, [organizationsID]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setLoading(true);
      getOrganizations();
      getOrganizationData();
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    });

    return unsubscribe;
  }, [navigation]);

  setTimeout(() => {
    setLoading(false);
  }, 1000);

  const formatTime = (time: any) => {
    const options: any = {hour: 'numeric', minute: 'numeric'};
    return new Date(time).toLocaleString('en-US', options);
  };

  return (
    <View style={{flex: 1, backgroundColor: Colors.backgroundColor}}>
      <ScrollView style={{marginTop: 10}}>
        {organizationsData?.length > 0 ? (
          organizationsData?.map((item: any) => {
            return (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('messages', {
                    userId: userData.data._id,
                    organizationId: item.organization._id,
                  })
                }
                key={item.organization._id}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 20,
                    paddingVertical: 15,
                    padding: 10,
                  }}>
                  <View>
                    {item.organization.image.length > 2 ? (
                      <Image
                        source={{
                          uri: `data:image/png;base64,${item?.organization.image}`,
                        }}
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          resizeMode: 'cover',
                        }}
                      />
                    ) : (
                      <Image
                        source={require('../../assets/Profile/nodp.png')}
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          resizeMode: 'cover',
                        }}
                      />
                    )}
                  </View>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      gap: Dimensions.get('window').width - 300,
                    }}>
                    <View>
                      <Text
                        style={{
                          fontFamily: 'Poppins-SemiBold',
                          fontSize: FontSize.large,
                          color: Colors.onPrimary,
                        }}>
                        {item?.organization.name}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Poppins-Medium',
                          fontSize: FontSize.medium,
                          color: Colors.onPrimary,
                        }}>
                        {lastMessages[item.organization._id].message.length > 15
                          ? lastMessages[item.organization._id].message.slice(
                              0,
                              15,
                            ) + '...'
                          : lastMessages[item.organization._id].message}
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={{
                          fontFamily: 'Poppins-Medium',
                          fontSize: FontSize.medium,
                          color: Colors.onPrimary,
                        }}>
                        {lastMessages[item.organization._id].time.length > 0
                          ? formatTime(lastMessages[item.organization._id].time)
                          : ''}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View>
            {loading ? (
              <Loading />
            ) : (
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
                No Teams
              </Text>
            )}
          </View>
        )}
      </ScrollView>
      <TouchableOpacity
        onPress={() => navigation.navigate('createteam')}
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
          source={require('../../assets/Teams/plus.png')}
          style={{width: 50, height: 50}}
        />
      </TouchableOpacity>
    </View>
  );
}
