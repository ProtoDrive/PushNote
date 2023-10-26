/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {Provider} from 'react-redux';
import store from './src/redux/store';
import {MenuProvider} from 'react-native-popup-menu';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

const AppRedux = () => (
  <Provider store={store}>
    <GestureHandlerRootView style={{flex: 1}}>
      <MenuProvider>
        <App />
      </MenuProvider>
    </GestureHandlerRootView>
  </Provider>
);

AppRegistry.registerComponent(appName, () => AppRedux);
