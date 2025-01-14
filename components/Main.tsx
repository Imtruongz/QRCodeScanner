import React from 'react';
import {Button, SafeAreaView, StyleSheet} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStack} from '../StackNavigator';

interface MainProps extends NativeStackScreenProps<RootStack, 'Main'> {}

const Main: React.FC<MainProps> = ({navigation}) => {
  return (
    <SafeAreaView style={styles.Container}>
      <Button
        title="Open QR codeee"
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

export default Main;
