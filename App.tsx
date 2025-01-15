import React, {useState, useRef} from 'react';
import {
  Dimensions,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCodeScanner,
  getCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

const {width: screenWidth, height: screenHeight} = Dimensions.get('screen');

export type Frame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const initialFrame: Frame = {
  x: (screenWidth - 280) / 2,
  y: (screenHeight - 280) / 2,
  width: 280,
  height: 280,
};

const App: React.FC = () => {
  const devices = useCameraDevices();
  const device = getCameraDevice(devices, 'back');

  const {hasPermission, requestPermission} = useCameraPermission();
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [flashOn, setFlashOn] = useState<boolean>(false);

  const [detectedFrame, setDetectedFrame] = useState<Frame>(initialFrame);

  const animatedFramePosition = useRef(
    new Animated.ValueXY(initialFrame),
  ).current;

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (isScanning && codes.length > 0) {
        setIsScanning(false); // Pause scan
        console.log('Scanned QR code:', codes[0]);
        //Alert.alert('Scanned QR code:', codes[0].value);
        const newFrame = codes[0].frame || initialFrame;

        Animated.timing(animatedFramePosition, {
          toValue: {x: newFrame.x - newFrame.width, y: newFrame.y},
          duration: 500,
          useNativeDriver: false,
        }).start();
        setDetectedFrame(newFrame);
      }
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
      {detectedFrame && (
        <Animated.View
          style={[
            styles.frame,
            {
              width: detectedFrame.width + 20,
              height: detectedFrame.height + 20,
              transform: [
                {translateX: animatedFramePosition.x},
                {translateY: animatedFramePosition.y},
              ],
            },
          ]}>
          {/* Bo góc */}
          <View
            style={[
              styles.corner,
              styles.topLeft,
              {
                width: detectedFrame.width * 0.22,
                height: detectedFrame.height * 0.22,
              },
            ]}
          />
          <View
            style={[
              styles.corner,
              styles.topRight,
              {
                width: detectedFrame.width * 0.22,
                height: detectedFrame.height * 0.22,
              },
            ]}
          />
          <View
            style={[
              styles.corner,
              styles.bottomLeft,
              {
                width: detectedFrame.width * 0.22,
                height: detectedFrame.height * 0.22,
              },
            ]}
          />
          <View
            style={[
              styles.corner,
              styles.bottomRight,
              {
                width: detectedFrame.width * 0.22,
                height: detectedFrame.height * 0.22,
              },
            ]}
          />
        </Animated.View>
      )}

      {/* Button control */}
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
        </View>
        <View style={styles.main} />
        <View style={styles.footer}>
          {/* scan btn */}
          <TouchableOpacity
            style={[styles.button]}
            onPress={() => {
              setIsScanning(!isScanning);
            }}>
            <Text style={styles.buttonText}>
              {isScanning ? 'Scanning' : 'Start scan'}
            </Text>
          </TouchableOpacity>
          {/* flash btn */}
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
    </>
  );
};

export default App;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    flex: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  footer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    position: 'absolute',
  },
  corner: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
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
