import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Contacts from 'react-native-contacts';
import CheckBox from 'react-native-check-box';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';

// Files
import Colors from '../components/constants/Colors';
import FontSize from '../components/constants/FontSize';

export default function AddMembers(): JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [contacts, setContacts] = useState<any>([]);
  const [checkedState, setCheckedState] = useState<any>({}); // To track checked state for each contact
  const [selectedPhoneNumbers, setSelectedPhoneNumbers] = useState<any>([]);

  useEffect(() => {
    Contacts.getAll().then(contacts => {
      const initialCheckedState: any = {};
      for (const contact of contacts) {
        initialCheckedState[contact.givenName] = false; // Initialize all contacts as unchecked
      }
      setCheckedState(initialCheckedState);
      setContacts(contacts);
    });
  }, []);

  // Function to handle checkbox clicks
  const handleCheckBoxClick = (contactName: any) => {
    const newCheckedState = {
      ...checkedState,
      [contactName]: !checkedState[contactName],
    };
    setCheckedState(newCheckedState);

    // Update the selectedPhoneNumbers state based on the checkedState
    const newSelectedPhoneNumbers = Object.keys(newCheckedState)
      .filter(name => newCheckedState[name])
      .map(name => {
        const contact = contacts.find((c: any) => c.givenName === name);
        if (contact?.phoneNumbers.length > 0) {
          // Use regular expression to remove non-numeric characters from the phone number
          const phoneNumber = contact.phoneNumbers[0].number.replace(/\D/g, '');

          // Create an object with name and phone properties
          return {
            name: name,
            phone: phoneNumber,
          };
        }
        return null; // Return null for contacts with no phone number
      })
      .filter(Boolean); // Filter out null values

    setSelectedPhoneNumbers(newSelectedPhoneNumbers);
  };

  return (
    <ScrollView style={{backgroundColor: Colors.backgroundColor, flex: 1}}>
      <View
        style={{
          marginTop: 10,
        }}>
        {contacts.map((contact: any) => {
          return (
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 20,
                marginVertical: 15,
                marginLeft: 20,
              }}
              key={contact.recordID}>
              <View>
                <CheckBox
                  isChecked={checkedState[contact.givenName]}
                  onClick={() => handleCheckBoxClick(contact.givenName)}
                  checkedCheckBoxColor={Colors.theme}
                  uncheckedCheckBoxColor={Colors.onPrimary}
                />
              </View>
              <View>
                <Image
                  source={require('../../assets/Profile/nodp.png')}
                  style={{width: 80, height: 80, borderRadius: 100}}
                />
              </View>
              <View>
                <Text
                  style={{
                    fontFamily: 'Poppins-Medium',
                    fontSize: FontSize.medium,
                    color: Colors.onPrimary,
                    marginRight: 50,
                  }}>
                  {contact.givenName}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Poppins-Medium',
                    fontSize: FontSize.medium,
                    color: Colors.onPrimary,
                    marginRight: 50,
                  }}>
                  {contact.phoneNumbers.length > 0
                    ? contact.phoneNumbers[0].number
                    : 'No phone number'}
                </Text>
              </View>
            </View>
          );
        })}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('createteam', {selectedPhoneNumbers})
          }
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
    </ScrollView>
  );
}
