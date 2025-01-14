/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {Button, SafeAreaView, StyleSheet} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStack} from './StackNavigator';

interface AppProps extends NativeStackScreenProps<RootStack, 'App'> {}

const App: React.FC<AppProps> = ({navigation}) => {
  return (
    <SafeAreaView style={styles.Container}>
      <Button
        title="Open QR code"
        onPress={() => navigation.navigate('VCamera')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
