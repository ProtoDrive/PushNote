import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

//Files
import OnboardingScreen from './src/screens/OnboardingScreen';
import MobileNumberScreen from './src/screens/MobileNumberScreen';
import OtpScreen from './src/screens/OtpScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TeamsScreen from './src/screens/TeamsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import Colors from './src/components/constants/Colors';

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

function Home() {
  return (
    <Tab.Navigator
      style={{paddingTop: 80, backgroundColor: '#FF6B6B'}}
      screenOptions={{
        tabBarStyle: {backgroundColor: '#FF6B6B'},
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Medium',
          fontSize: 16,
          color: Colors.onPrimary,
        },
        tabBarIndicatorStyle: {
          borderBottomColor: '#fff',
          borderBottomWidth: 3,
        },
      }}>
      <Tab.Screen name="Teams" component={TeamsScreen} />
      <Tab.Screen name="Schedules" component={ScheduleScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function App(): JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="onboarding">
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
