import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Main from './components/Main';
import VCamera from './components/VCamera';

export type RootStack = {
  Main: undefined;
  VCamera: undefined;
};

const Stack = createNativeStackNavigator<RootStack>();
function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Main" component={Main} />
        <Stack.Screen name="VCamera" component={VCamera} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigation;
