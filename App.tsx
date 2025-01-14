import React, {useState} from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCodeScanner,
  getCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
const App: React.FC = () => {
  const devices = useCameraDevices();
  const device = getCameraDevice(devices, 'back');
  const {hasPermission, requestPermission} = useCameraPermission();
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [flashOn, setFlashOn] = useState<boolean>(false);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'], // Các type QR code hỗ trợ (QR)
    onCodeScanned: codes => {
      if (isScanning && codes.length > 0) {
        setIsScanning(false); // pause scan QR
        console.log('Scanned Codes:', codes);
        Alert.alert('Scanned QR Code', codes[0].value || 'No Data'); // show content
      }
      console.log(`Scanned ${codes.length} codes!`);
    },
  });

  if (!hasPermission) {
    return (
      <View style={styles.permissionsContainer}>
        <Text>Camera Permission Required</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => await requestPermission()}>
          <Text style={styles.buttonText}>Request Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.permissionsContainer}>
        <Text>No Camera Device Found</Text>
      </View>
    );
  }

  return (
    <>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        torch={flashOn ? 'on' : 'off'}
        codeScanner={codeScanner}
      />

      {/* Button control */}
      <View style={styles.container}>
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Scan QR Code</Text>
          </View>
          {/* Main */}
          <View style={styles.main}>
            <View style={styles.block1} />
            <View style={styles.scanFrame} />
            <View style={styles.block2} />
          </View>
          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button]}
              onPress={() => {
                setIsScanning(!isScanning);
              }}>
              <Text style={styles.buttonText}>
                {isScanning ? 'Scanning' : 'Start scan'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button]}
              onPress={() => {
                setFlashOn(!flashOn);
              }}>
              <Text style={styles.buttonText}>
                {flashOn ? 'Turn Off Flash' : 'Turn On Flash'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flex: 1,
    alignItems: 'center',
    color: 'white',
    width: '100%',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  main: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  block1: {
    width: 120,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  block2: {
    width: 120,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  footer: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  scanFrame: {
    width: 330,
    height: 330,
    borderWidth: 3,
    borderRadius: 8,
    borderColor: 'white',
    borderStyle: 'solid',
  },
  permissionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: 'gray',
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 8,
  },
});

// Case 1: Only scan QR code in scanFrame
// Case 2: Only scan QR code not another type code
// Case 3: Scan QR code in scanFrame and show content
// Case 4: Pause scan QR code when content is shown
// Case 5: Turn on/off flash
// Case 6: Request camera permission
// Case 7: Show error when no camera device found
// Case 8: Show error when no camera permission
// Case 9: Show message when scanning QR code done
// Case 10: Show message when scanning QR code fail
// Case 11: Show message when scanning QR code error
