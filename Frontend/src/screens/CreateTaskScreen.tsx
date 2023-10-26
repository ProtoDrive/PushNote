import {View, Text, Button, Image} from 'react-native';
import React, {useEffect, useState} from 'react';
import Colors from '../components/constants/Colors';
import {ScrollView} from 'react-native-gesture-handler';
import FontSize from '../components/constants/FontSize';
import AppTextInput from '../components/constants/AppTextInput';
import {TouchableOpacity} from '@gorhom/bottom-sheet';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation, useRoute} from '@react-navigation/native';

//Files
import Spacing from '../components/constants/Spacing';
import Font from '../components/constants/Font';
import axios from 'axios';
import {API_URI} from '../utils/constants';
import {useSelector} from 'react-redux';

export default function CreateTask(): JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const userData = useSelector((state: any) => state?.reducer);

  const route = useRoute<any>();
  const {organizationId, selectedUsers} = route?.params;

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [task, setTask] = useState('');
  const [brief, setBrief] = useState('');
  const [assign, setAssign] = useState(null);
  const [deadline, setDeadline] = useState<any>(null);
  const [apiErr, setApiError] = useState('');

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: any) => {
    setDeadline(date);
    hideDatePicker();
  };

  const saveTask = () => {
    setAssign(selectedUsers[0]._id);
    if (!task || !brief || !assign) {
      //setApiError('Please fill all the deatils');
      return;
    }

    axios
      .post(`${API_URI}/tasks`, {
        title: task,
        content: brief,
        status: 'inprogress',
        deadlineTime: deadline,
        assigned: assign,
        creatorUserId: userData.data._id,
      })
      .then(response => {
        setTask('');
        setBrief('');
        setAssign(null);
        setDeadline('');
        setApiError('');
        navigation.navigate('Tasks');
      })
      .catch(error => {
        console.log(error);
        setApiError('Internal server error.');
      });
  };

  return (
    <ScrollView style={{flex: 1, backgroundColor: Colors.backgroundColor}}>
      <View style={{paddingHorizontal: 15, marginTop: 20}}>
        <View style={{marginBottom: 10}}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                fontSize: FontSize.medium,
                color: Colors.theme,
              }}>
              Task
            </Text>
          </View>
          <AppTextInput
            placeholder="Task"
            value={task}
            onChangeText={text => {
              setTask(text);
              setApiError('');
            }}
          />
        </View>
        <View style={{marginBottom: 15}}>
          <Text
            style={{
              fontFamily: 'Poppins-Medium',
              fontSize: FontSize.medium,
              color: Colors.theme,
            }}>
            Brief
          </Text>
          <AppTextInput
            placeholder="Write about task"
            value={brief}
            onChangeText={text => {
              setBrief(text);
              setApiError('');
            }}
            height={150}
            multiline
          />
        </View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('members', {organizationId: organizationId})
          }
          style={{marginVertical: 10}}>
          <Text
            style={{
              fontFamily: 'Poppins-Medium',
              color: Colors.theme,
              fontSize: FontSize.medium,
            }}>
            Assign member?
          </Text>
        </TouchableOpacity>
        {selectedUsers?.length > 0 && (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              marginVertical: 10,
            }}>
            {selectedUsers.map((item: any) => (
              <View
                key={item.phone}
                style={{width: '30%', padding: 10, alignItems: 'center'}}>
                {item.image.length > 3 ? (
                  <Image
                    source={{
                      uri: `data:image/png;base64,${item.image}`,
                    }}
                    style={{width: 50, height: 50, borderRadius: 100}}
                  />
                ) : (
                  <Image
                    source={require('../../assets/Profile/nodp.png')}
                    style={{width: 80, height: 80, borderRadius: 100}}
                  />
                )}
                <Text
                  style={{
                    fontFamily: 'Poppins-Medium',
                    fontSize: FontSize.medium,
                    color: Colors.onPrimary,
                    textAlign: 'center',
                    marginTop: 8,
                  }}>
                  {item.username}
                </Text>
              </View>
            ))}
          </View>
        )}
        <View>
          <TouchableOpacity
            onPress={showDatePicker}
            style={{
              marginTop: 0,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}>
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                color: Colors.theme,
                fontSize: FontSize.medium,
              }}>
              Deadline
            </Text>
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                color: Colors.onPrimary,
                fontSize: FontSize.medium,
              }}>
              {deadline
                ? deadline.toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : new Date().toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
            </Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
          />
        </View>

        {apiErr && (
          <Text
            style={{
              marginTop: 12,
              marginBottom: 5,
              color: Colors.red,
              fontSize: 16,
            }}>
            {apiErr}
          </Text>
        )}

        <TouchableOpacity
          onPress={saveTask}
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
            Save
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
