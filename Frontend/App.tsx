import * as React from 'react';
import {Dimensions, StatusBar, Text, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';

//Files
import OnboardingScreen from './src/screens/OnboardingScreen';
import MobileNumberScreen from './src/screens/MobileNumberScreen';
import OtpScreen from './src/screens/OtpScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TeamsScreen from './src/screens/TeamsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import Colors from './src/components/constants/Colors';
import FontSize from './src/components/constants/FontSize';
import {addUser} from './src/redux/action';
import CreateTeam from './src/screens/CreateTeam';
import AddMembers from './src/screens/AddMembers';
import InvitesScreen from './src/screens/InvitesScreen';
import Loading from './src/components/constants/Loading';
import ChatMessagesScreen from './src/screens/ChatMessagesScreen';
import CreateTask from './src/screens/CreateTaskScreen';
import MembersScreen from './src/screens/MembersScreen';
import TaskMessagesScreen from './src/screens/TaskMessagesScreen';

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

function Home() {
  return (
    <Tab.Navigator
      style={{paddingTop: 80, backgroundColor: '#FF6B6B'}}
      screenOptions={{
        tabBarStyle: {backgroundColor: '#FF6B6B'},
        tabBarLabelStyle: {
          fontFamily: 'Poppins-SemiBold',
          fontSize: 16,
          color: Colors.onPrimary,
        },
        tabBarIndicatorStyle: {
          borderBottomColor: '#fff',
          borderBottomWidth: 3,
        },
      }}>
      <Tab.Screen name="Teams" component={TeamsScreen} />
      <Tab.Screen name="Tasks" component={ScheduleScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function App(): JSX.Element {
  const [initialRouteName, setInitialRouteName] = React.useState('');
  const dispatch = useDispatch();

  React.useEffect(() => {
    const userData = async () => {
      try {
        const value = await AsyncStorage.getItem('User');
        if (value) {
          // We have data!!
          const user = JSON.parse(value);
          dispatch(addUser(user));
          setInitialRouteName('home');
          console.log(initialRouteName);
        } else {
          setInitialRouteName('onboarding');
        }
      } catch (error) {
        console.log(error);
      }
    };

    userData();
  }, []);

  // Wait for user data to be loaded
  if (initialRouteName == '') {
    return (
      <View style={{flex: 1, backgroundColor: '#1E1E1E', marginTop: 100}}>
        <Loading />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle={'light-content'} />
      <Stack.Navigator initialRouteName={initialRouteName}>
        <Stack.Screen
          name="onboarding"
          component={OnboardingScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="mobilenumber"
          component={MobileNumberScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="otp"
          component={OtpScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="profile"
          component={ProfileScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="home"
          component={Home}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="createteam"
          component={CreateTeam}
          options={{
            title: 'New Team',
            headerStyle: {
              backgroundColor: Colors.theme,
            },
            headerTintColor: Colors.onPrimary,
            headerTitleStyle: {
              color: Colors.onPrimary,
              fontSize: 20,
            },
          }}
        />
        <Stack.Screen
          name="addmembers"
          component={AddMembers}
          options={{
            title: 'Add Members',
            headerStyle: {
              backgroundColor: Colors.theme,
            },
            headerTintColor: Colors.onPrimary,
            headerTitleStyle: {
              color: Colors.onPrimary,
              fontSize: 20,
            },
          }}
        />
        <Stack.Screen
          name="invites"
          component={InvitesScreen}
          options={{
            title: 'Invites',
            headerStyle: {
              backgroundColor: Colors.theme,
            },
            headerTintColor: Colors.onPrimary,
            headerTitleStyle: {
              color: Colors.onPrimary,
              fontSize: 20,
            },
          }}
        />
        <Stack.Screen name="messages" component={ChatMessagesScreen} />
        <Stack.Screen
          name="createtask"
          component={CreateTask}
          options={{
            title: 'Create Task',
            headerStyle: {
              backgroundColor: Colors.theme,
            },
            headerTintColor: Colors.onPrimary,
            headerTitleStyle: {
              color: Colors.onPrimary,
              fontSize: 20,
            },
          }}
        />
        <Stack.Screen
          name="members"
          component={MembersScreen}
          options={{
            title: 'Members',
            headerStyle: {
              backgroundColor: Colors.theme,
            },
            headerTintColor: Colors.onPrimary,
            headerTitleStyle: {
              color: Colors.onPrimary,
              fontSize: 20,
            },
          }}
        />
        <Stack.Screen name="taskmessages" component={TaskMessagesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
