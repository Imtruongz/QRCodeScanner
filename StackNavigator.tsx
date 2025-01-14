import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import App from './App';
import VCamera from './VCamera';

export type RootStack = {
  App: undefined;
  VCamera: undefined;
};

const Stack = createNativeStackNavigator<RootStack>();
function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="App" component={App} />
        <Stack.Screen name="VCamera" component={VCamera} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigation;
