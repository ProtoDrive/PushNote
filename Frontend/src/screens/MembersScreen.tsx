import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Colors from '../components/constants/Colors';
import {useRoute} from '@react-navigation/native';
import {API_URI} from '../utils/constants';
import axios from 'axios';
import CheckBox from 'react-native-check-box';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';

import FontSize from '../components/constants/FontSize';

export default function MembersScreen(): JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const route = useRoute<any>();
  const {organizationId} = route?.params;

  const [members, setMembers] = useState([]);
  const [usersData, setUsersData] = useState<any>([]);
  const [selectedUsers, setSelectedUsers] = useState<any>([]);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        const response = await axios.get(
          `${API_URI}/organizations/${organizationId}`,
        );
        const memberIds = response.data.organization.members;
        setMembers(memberIds);

        // Fetch user data for each member
        const userDataPromises = memberIds.map(async (memberId: any) => {
          try {
            const userResponse = await axios.get(`${API_URI}/user/${memberId}`);
            return userResponse.data;
          } catch (userErr) {
            console.log(
              `Error fetching user data for ID ${memberId}:`,
              userErr,
            );
            return null; // Return null in case of an error
          }
        });

        // Wait for all requests to complete and get the user data
        const userDataArray = await Promise.all(userDataPromises);

        // Filter out any null values (users that couldn't be fetched)
        const filteredUserData = userDataArray.filter(
          userData => userData !== null,
        );
        setUsersData(filteredUserData);
      } catch (err) {
        console.log(
          `Error fetching organization data for ID ${organizationId}:`,
          err,
        );
        return null;
      }
    };

    fetchOrganizationData();
  }, []);

  const handleCheckBoxClick = (user: any) => {
    // Check if the user is already in selectedUsers
    const userIndex = selectedUsers.findIndex(
      (selectedUser: any) => selectedUser?._id === user._id,
    );

    if (userIndex === -1) {
      // User not found, so add it to the selectedUsers state
      setSelectedUsers([...selectedUsers, user]);
    } else {
      // User found, so remove it from the selectedUsers state
      const updatedSelectedUsers = [...selectedUsers];
      updatedSelectedUsers.splice(userIndex, 1);
      setSelectedUsers(updatedSelectedUsers);
    }
  };

  return (
    <View style={{backgroundColor: Colors.backgroundColor, flex: 1}}>
      <ScrollView>
        <View style={{marginTop: 10}}>
          {usersData.map((userData: any, index: any) => (
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 20,
                marginVertical: 15,
                marginLeft: 20,
              }}
              key={userData._id}>
              <View>
                <CheckBox
                  isChecked={selectedUsers.some(
                    (user: any) => user._id === userData._id,
                  )}
                  onClick={() => handleCheckBoxClick(userData)}
                  checkedCheckBoxColor={Colors.theme}
                  uncheckedCheckBoxColor={Colors.onPrimary}
                />
              </View>
              <View>
                {userData.image.length > 3 ? (
                  <Image
                    source={{
                      uri: `data:image/png;base64,${userData.image}`,
                    }}
                    style={{width: 50, height: 50, borderRadius: 100}}
                  />
                ) : (
                  <Image
                    source={require('../../assets/Profile/nodp.png')}
                    style={{width: 80, height: 80, borderRadius: 100}}
                  />
                )}
              </View>
              <View>
                <Text
                  style={{
                    fontFamily: 'Poppins-Medium',
                    fontSize: FontSize.medium,
                    color: Colors.onPrimary,
                    marginRight: 50,
                  }}>
                  {userData.username}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('createtask', {
            selectedUsers: selectedUsers,
            organizationId: organizationId,
          });
          console.log(selectedUsers);
        }}
        style={{
          backgroundColor: Colors.theme,
          borderRadius: 30,
          width: 80,
          height: 80,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          top: Dimensions.get('window').height / 2 + 190,
          right: 30,
        }}>
        <Image
          source={require('../../assets/Teams/right-arrow.png')}
          style={{width: 50, height: 50}}
        />
      </TouchableOpacity>
    </View>
  );
}
