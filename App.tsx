/* eslint-disable react-native/no-inline-styles */
import React, {useState, useRef} from 'react';
import {
  Dimensions,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCodeScanner,
  getCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Svg, {Line} from 'react-native-svg';
import ButtonComponent from './components/ButtonComponent';

const {width: screenWidth, height: screenHeight} = Dimensions.get('screen');

const AnimatedLine = Animated.createAnimatedComponent(Line);

//Góc
export type Corner = {
  x: number;
  y: number;
};

export const initialCornerTopLeft: Corner = {
  x: screenWidth * 0.1,
  y: screenHeight * 0.22,
};
export const initialCornerTopRight: Corner = {
  x: screenWidth * 0.9,
  y: screenHeight * 0.22,
};
export const initialCornerBottomRight: Corner = {
  x: screenWidth * 0.9,
  y: screenHeight * 0.65,
};
export const initialCornerBottomLeft: Corner = {
  x: screenWidth * 0.1,
  y: screenHeight * 0.65,
};

const App: React.FC = () => {
  const devices = useCameraDevices();
  const device = getCameraDevice(devices, 'back');

  const {hasPermission, requestPermission} = useCameraPermission();
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [flashOn, setFlashOn] = useState<boolean>(false);

  //Góc
  const [cornerTopLeft, setCornerTopLeft] =
    useState<Corner>(initialCornerTopLeft);
  const [cornerTopRight, setCornerTopRight] = useState<Corner>(
    initialCornerTopRight,
  );
  const [cornerBottomRight, setCornerBottomRight] = useState<Corner>(
    initialCornerBottomRight,
  );
  const [cornerBottomLeft, setCornerBottomLeft] = useState<Corner>(
    initialCornerBottomLeft,
  );

  const animatedCornerTopLeft = useRef(
    new Animated.ValueXY(initialCornerTopLeft),
  ).current;

  const animatedCornerTopRight = useRef(
    new Animated.ValueXY(initialCornerTopRight),
  ).current;

  const animatedCornerBottomLeft = useRef(
    new Animated.ValueXY(initialCornerBottomLeft),
  ).current;

  const animatedCornerBottomRight = useRef(
    new Animated.ValueXY(initialCornerBottomRight),
  ).current;

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes, frame) => {
      if (isScanning && codes.length > 0) {
        // Nếu đang scanning và có code thì dừng scan ( setIsScanning(false) )
        setIsScanning(false); // Pause scan
        console.log('Scanned QR code:', codes[0].corners); //Codes là 1 mảng các mã QR code, vì set điều kiện nên chỉ nhận mã QR của đầu tiên và duy nhất
        console.log('Scanned QR code:', codes[0].frame?.width); //Frame là 1 object chứa 4 góc của QR code
        console.log('frame width', frame.width, 'frame height', frame.height);
        //Set giá trị của 4 góc vào state
        if (codes[0].corners && codes[0].frame) {
          //Top Left
          const newCornerTopLeft = {
            x: codes[0].corners[0].x - codes[0].frame.width,
            y: codes[0].corners[0].y,
          };
          setCornerTopLeft(newCornerTopLeft);
          Animated.timing(animatedCornerTopLeft, {
            toValue: {
              x:
                codes[0].corners[0].x -
                (newCornerTopLeft.x + codes[0].frame.width),
              y: codes[0].corners[0].y - newCornerTopLeft.y,
            },
            duration: 500,
            useNativeDriver: false,
          }).start();
          //Top Right
          const newCornerTopRight = {
            x: codes[0].corners[1].x - codes[0].frame.width,
            y: codes[0].corners[1].y,
          };
          setCornerTopRight(newCornerTopRight);
          Animated.timing(animatedCornerTopRight, {
            toValue: {
              x:
                codes[0].corners[1].x -
                (newCornerTopRight.x + codes[0].frame.width),
              y: codes[0].corners[1].y - newCornerTopRight.y,
            },
            duration: 500,
            useNativeDriver: false,
          }).start();

          //Bottom Right
          const newCornerBottomRight = {
            x: codes[0].corners[2].x - codes[0].frame.width,
            y: codes[0].corners[2].y,
          };
          setCornerBottomRight(newCornerBottomRight);
          Animated.timing(animatedCornerBottomRight, {
            toValue: {
              x:
                codes[0].corners[2].x -
                (newCornerBottomRight.x + codes[0].frame.width),
              y: codes[0].corners[2].y - newCornerBottomRight.y,
            },
            duration: 500,
            useNativeDriver: false,
          }).start();

          //Bottom Left
          const newCornerBottomLeft = {
            x: codes[0].corners[3].x - codes[0].frame.width,
            y: codes[0].corners[3].y,
          };
          setCornerBottomLeft(newCornerBottomLeft);
          Animated.timing(animatedCornerBottomLeft, {
            toValue: {
              x:
                codes[0].corners[3].x -
                (newCornerBottomLeft.x + codes[0].frame.width),
              y: codes[0].corners[3].y - newCornerBottomLeft.y,
            },
            duration: 500,
            useNativeDriver: false,
          }).start();
        }
      }
    },
    regionOfInterest: {
      x: 0.1,
      y: 0.22,
      width: 0.8,
      height: 0.43,
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
      {cornerTopLeft && (
        <Animated.View
          style={{
            position: 'absolute',
            top: cornerTopLeft.y,
            left: cornerTopLeft.x,
            borderColor: 'red',
            backgroundColor: 'transparent',
            transform: [
              {translateX: animatedCornerTopLeft.x},
              {translateY: animatedCornerTopLeft.y},
            ],
          }}
        />
      )}
      {cornerTopRight && (
        <Animated.View
          style={{
            position: 'absolute',
            top: cornerTopRight.y,
            left: cornerTopRight.x,
            borderColor: 'blue',
            backgroundColor: 'transparent',
            transform: [
              {translateX: animatedCornerTopRight.x},
              {translateY: animatedCornerTopRight.y},
            ],
          }}
        />
      )}
      {cornerBottomRight && (
        <Animated.View
          style={{
            position: 'absolute',
            top: cornerBottomRight.y,
            left: cornerBottomRight.x,
            borderColor: 'green',
            backgroundColor: 'transparent',
            transform: [
              {translateX: animatedCornerBottomRight.x},
              {translateY: animatedCornerBottomRight.y},
            ],
          }}
        />
      )}
      {cornerBottomLeft && (
        <Animated.View
          style={{
            position: 'absolute',
            top: cornerBottomLeft.y,
            left: cornerBottomLeft.x,
            borderColor: 'yellow',
            backgroundColor: 'transparent',
            transform: [
              {translateX: animatedCornerBottomLeft.x},
              {translateY: animatedCornerBottomLeft.y},
            ],
          }}
        />
      )}

      {/* Hình tứ giác */}
      <Svg style={StyleSheet.absoluteFill}>
        {/* Top Left -> Top Right */}
        <AnimatedLine
          x1={cornerTopLeft.x}
          y1={cornerTopLeft.y}
          x2={cornerTopRight.x}
          y2={cornerTopRight.y}
          stroke="red"
          strokeWidth="2"
        />
        {/* Top Right -> Bottom Right */}
        <Line
          x1={cornerTopRight.x}
          y1={cornerTopRight.y}
          x2={cornerBottomRight.x}
          y2={cornerBottomRight.y}
          stroke="red"
          strokeWidth="2"
        />
        {/* Bottom Right -> Bottom Left */}
        <Line
          x1={cornerBottomRight.x}
          y1={cornerBottomRight.y}
          x2={cornerBottomLeft.x}
          y2={cornerBottomLeft.y}
          stroke="red"
          strokeWidth="2"
        />
        {/* Bottom Left -> Top Left */}
        <Line
          x1={cornerBottomLeft.x}
          y1={cornerBottomLeft.y}
          x2={cornerTopLeft.x}
          y2={cornerTopLeft.y}
          stroke="red"
          strokeWidth="2"
        />
      </Svg>
      {/* Button control */}
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
        </View>
        <View style={styles.main} />
        <View style={styles.footer}>
          {/* flash btn */}
          <ButtonComponent
            iconName={flashOn ? 'flashlight-on' : 'flashlight-off'}
            iconSize={28}
            iconColor="white"
            bgColor={flashOn ? 'gray' : 'rgba(0, 0, 0, 0.5)'}
            onPress={() => {
              setFlashOn(!flashOn);
            }}
          />
          {/* scan btn */}
          <ButtonComponent
            iconName="qr-code-scanner"
            iconSize={28}
            iconColor="white"
            bgColor={isScanning ? 'rgba(0, 0, 0, 0.5)' : 'gray'}
            onPress={() => {
              setIsScanning(!isScanning);
            }}
          />
        </View>
      </View>
    </>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'white',
  },
  camera: {
    position: 'absolute',
  },
  overlay: {
    flex: 1,
  },
  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    flex: 2,
  },
  footer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  frame: {
    position: 'absolute',
    borderColor: 'white',
    borderWidth: 2,
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
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 8,
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
    borderTopWidth: 6,
    borderLeftWidth: 6,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 6,
    borderRightWidth: 6,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 6,
    borderLeftWidth: 6,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderBottomRightRadius: 16,
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

// Alert.alert('Scanned QR code:', codes[0].value, [
//   {
//     text: 'Resume Scan',
//     onPress: () => {
//       setIsScanning(true); // Resume scan
//     },
//   },
//   {
//     text: 'Cancel',
//     onPress: () => {
//       setIsScanning(false); // Cancel scan
//     },
//   },
// ]);
