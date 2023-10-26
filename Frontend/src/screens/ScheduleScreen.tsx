import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import axios from 'axios';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation, useRoute} from '@react-navigation/native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Dropdown} from 'react-native-element-dropdown';
import Octicons from 'react-native-vector-icons/Octicons';

//Files
import FontSize from '../components/constants/FontSize';
import Colors from '../components/constants/Colors';
import {API_URI} from '../utils/constants';
import Spacing from '../components/constants/Spacing';
import Font from '../components/constants/Font';
import Loading from '../components/constants/Loading';

const data = [
  {
    label: 'Inprogress',
    value: '1',
    color: 'yellow',
  },
  {label: 'Priority low', value: '2', color: '#00A9FF'},
  {label: 'Priority medium', value: '3', color: 'orange'},
  {label: 'Priority high', value: '4', color: '#FE0000'},
  {label: 'Incomplete', value: '5', color: '#7752FE'},
  {label: 'Doubt', value: '6', color: 'gray'},
  {label: 'Completed', value: '7', color: 'green'},
];

export default function ScheduleScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const userData = useSelector((state: any) => state?.reducer);

  const [tasks, setTasks] = useState<any>([]);
  const [tasksData, setTasksData] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  const getTasks = async () => {
    try {
      const response = await axios.get(`${API_URI}/user/${userData.data._id}`);
      console.log(response.data.task);
      setTasks(response.data.task);
    } catch (err) {
      console.log(err);
    }
  };

  const getTasksData = async () => {
    const taskDataPromises = tasks.map(async (item: any) => {
      try {
        const response = await axios.get(`${API_URI}/tasks/${item.taskId}`);

        const taskData = response.data;

        // Fetch the user data for assigned and createdBy
        const [assignedUser, createdByUser] = await Promise.all([
          axios.get(`${API_URI}/user/${taskData.assigned}`),
          axios.get(`${API_URI}/user/${taskData.createdBy}`),
        ]);

        // Combine user data with task data
        taskData.assignedUser = assignedUser.data;
        taskData.createdByUser = createdByUser.data;

        return taskData;
      } catch (err) {
        console.log(`Error fetching task data for ID ${item.taskId}:`, err);
        return null; // Return null in case of an error
      }
    });

    // Wait for all requests to complete and get the task data
    const taskDataArray = await Promise.all(taskDataPromises);

    // Filter out any null values (task that couldn't be fetched)
    const filteredOrgData = taskDataArray.filter(taskData => taskData !== null);

    setTasksData(filteredOrgData);
  };

  useEffect(() => {
    getTasks();
  }, [userData]);

  useEffect(() => {
    getTasksData();
  }, [tasks]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setLoading(true);
      getTasks();
      getTasksData();
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    });

    return unsubscribe;
  }, [navigation]);

  setTimeout(() => {
    setLoading(false);
  }, 1000);

  const renderItem = (item: any) => {
    return (
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          backgroundColor: Colors.backgroundColor,
          padding: 10,
          gap: 15,
        }}>
        <Octicons name="dot-fill" size={20} color={item.color} />
        <Text
          style={{
            fontFamily: 'Poppins-medium',
            fontSize: FontSize.medium,
            color: item.color,
            backgroundColor: Colors.backgroundColor,
          }}>
          {item.label}
        </Text>
      </View>
    );
  };

  const updateTaskStatus = async (taskId: any, newStatus: any) => {
    try {
      // Make an API call to update the task status
      await axios.put(`${API_URI}/tasks/${taskId}`, {
        status: newStatus,
      });
      getTasksData();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <ScrollView style={{flex: 1, backgroundColor: '#1E1E1E'}}>
      {tasksData.length > 0 ? (
        tasksData.map((item: any) => {
          return (
            <View key={item._id}>
              <View
                style={{
                  backgroundColor: Colors.theme,
                  margin: 10,
                  borderRadius: 15,
                  paddingVertical: 20,
                  paddingHorizontal: 20,
                }}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 35,
                    alignItems: 'center',
                  }}>
                  <View style={{display: 'flex', flexDirection: 'row'}}>
                    {item.assignedUser.image.length > 3 ? (
                      <Image
                        source={{
                          uri: `data:image/png;base64,${item.assignedUser.image}`,
                        }}
                        style={{width: 35, height: 35, borderRadius: 100}}
                      />
                    ) : (
                      <Image
                        source={require('../../assets/Profile/nodp.png')}
                        style={{width: 35, height: 35, borderRadius: 100}}
                      />
                    )}
                    {item.createdByUser.image.length > 3 ? (
                      <Image
                        source={{
                          uri: `data:image/png;base64,${item.createdByUser.image}`,
                        }}
                        style={{
                          width: 35,
                          height: 35,
                          borderRadius: 100,
                          position: 'absolute',
                          left: 20,
                        }}
                      />
                    ) : (
                      <Image
                        source={require('../../assets/Profile/nodp.png')}
                        style={{
                          width: 35,
                          height: 35,
                          borderRadius: 100,
                          position: 'absolute',
                          left: 20,
                        }}
                      />
                    )}
                  </View>
                  <View>
                    <Text
                      style={{
                        fontFamily: 'Poppins-SemiBold',
                        fontSize: FontSize.xLarge,
                        color: Colors.onPrimary,
                      }}>
                      {item.title}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    marginTop: 0,
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 15,
                  }}>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 10,
                      alignItems: 'center',
                    }}>
                    <MaterialCommunityIcons
                      name="clock-time-four-outline"
                      color={Colors.onPrimary}
                      size={24}
                    />
                    <Text
                      style={{
                        fontFamily: 'Poppins-Medium',
                        fontSize: FontSize.medium,
                        color: Colors.onPrimary,
                      }}>
                      {new Date(item.deadlineTime).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View>
                    <Dropdown
                      style={styles.dropdown}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={
                        item.status
                          ? {
                              color:
                                data.find(
                                  d =>
                                    d.label.toLowerCase() ===
                                    item.status.toLowerCase(),
                                )?.color || Colors.onPrimary,
                              fontFamily: 'Poppins-medium',
                              fontSize: FontSize.medium,
                              backgroundColor: Colors.backgroundColor,
                            }
                          : styles.selectedTextStyle
                      }
                      iconStyle={styles.iconStyle}
                      data={data}
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      value={
                        data.find(
                          d =>
                            d.label.toLowerCase() ===
                            item?.status?.toLowerCase(),
                        )?.value || null
                      }
                      onChange={async newStatus => {
                        console.log(item._id, newStatus.label);
                        await updateTaskStatus(item._id, newStatus.label);
                      }}
                      renderLeftIcon={() => (
                        <Octicons
                          name="dot-fill"
                          size={20}
                          color={
                            item.status
                              ? data.find(
                                  d =>
                                    d.label.toLowerCase() ===
                                    item.status.toLowerCase(),
                                )?.color
                              : Colors.backgroundColor
                          }
                          style={{marginRight: 10}}
                        />
                      )}
                      renderItem={renderItem}
                    />
                  </View>
                </View>

                <View>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Medium',
                      fontSize: FontSize.medium,
                      color: Colors.onPrimary,
                    }}>
                    {item.content}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('taskmessages', {taskData: item})
                  }
                  style={{
                    padding: Spacing * 2,
                    backgroundColor: Colors.backgroundColor,
                    marginTop: Spacing * 2,
                    borderRadius: 100,
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
                    Discuss
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
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
              No Tasks
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    margin: 16,
    height: 50,
    width: Dimensions.get('window').width - 220,
    backgroundColor: Colors.backgroundColor,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  icon: {
    marginRight: 5,
  },
  item: {
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textItem: {
    flex: 1,
    fontSize: 16,
    color: Colors.onPrimary,
    backgroundColor: Colors.backgroundColor,
  },
  placeholderStyle: {
    fontSize: 16,
    color: Colors.onPrimary,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
});
