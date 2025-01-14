import React from 'react';

import {Button, SafeAreaView, StyleSheet} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStack} from './StackNavigator';

interface VCameraProps extends NativeStackScreenProps<RootStack, 'VCamera'> {}

const VCamera: React.FC<VCameraProps> = ({}) => {
  const device = useCameraDevice('back');
  const {hasPermission, requestPermission} = useCameraPermission();

  if (!hasPermission) return <PermissionsPage />;
  if (device == null) return <NoCameraDeviceError />;

  return (
    <SafeAreaView style={styles.Container}>
      <Button
        title="Open QR code"
        onPress={() => console.log('Button pressed')}
      />
      <Camera style={StyleSheet.absoluteFill} device={device} isActive={true} />
    </SafeAreaView>
  );
};

export default VCamera;

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
