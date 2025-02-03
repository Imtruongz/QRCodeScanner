import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';

export type RequestPermissionProps = {
  title: string;
  onPress: () => void;
  content: string;
  style?: object;
};

const RequestPermission: React.FC<RequestPermissionProps> = ({
  content,
  onPress,
  title,
  style,
}) => {
  return (
    <View style={[styles.permissionsContainer, style]}>
      <Text>{title}</Text>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.buttonText}>{content}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RequestPermission;

const styles = StyleSheet.create({
  permissionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  buttonText: {
    color: 'red',
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 8,
  },
});
