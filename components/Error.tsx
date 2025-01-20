import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

const Error: React.FC = () => {
  return (
    <View style={styles.permissionsContainer}>
      <Text>No Camera Device Found</Text>
    </View>
  );
};

export default Error;

const styles = StyleSheet.create({
  permissionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});
