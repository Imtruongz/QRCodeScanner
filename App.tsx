/* eslint-disable react-native/no-inline-styles */
import React, {useState, useRef, useEffect} from 'react';
import {
  Dimensions,
  Animated,
  StyleSheet,
  View,
  SafeAreaView,
  Alert,
  Text,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCodeScanner,
  getCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

import Svg, {Line} from 'react-native-svg';
import ButtonComponent from './components/ButtonComponent';
import RequestPermission from './components/RequestPermission';
import Error from './components/Error';

const {width: screenWidth, height: screenHeight} = Dimensions.get('screen');

const AnimatedLine = Animated.createAnimatedComponent(Line);

//Góc
export type Corner = {
  x: number;
  y: number;
};

export const initialCornerTopLeft: Corner = {
  x: screenWidth * 0.1,
  y: screenHeight * 0.25,
};
export const initialCornerTopRight: Corner = {
  x: screenWidth * 0.9,
  y: screenHeight * 0.25,
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
  const [isQRCodeDetected, setIsQRCodeDetected] = useState(false);

  // const [cornerTopLeft, setCornerTopLeft] = useState<Corner>(initialCornerTopLeft);
  // const [cornerTopRight, setCornerTopRight] = useState<Corner>(initialCornerTopRight);
  // const [cornerBottomRight, setCornerBottomRight] = useState<Corner>(initialCornerBottomRight);
  // const [cornerBottomLeft, setCornerBottomLeft] = useState<Corner>(initialCornerBottomLeft);

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
        setIsScanning(false); // Pause scan
        setIsQRCodeDetected(true);
        // setTimeout(() => {
        //   Alert.alert('Scanned code detected', codes[0].value, [
        //     {
        //       text: 'OK',
        //       onPress: () => {
        //         setIsScanning(true);
        //         setIsQRCodeDetected(false);
        //       },
        //     },
        //   ]);
        // }, 1000);
        console.log('Scanned QR code:', codes[0]);
        console.log(
          'Scanned QR code:',
          codes[0].frame?.width
            ? codes[0].frame?.width - 60
            : codes[0].frame?.width,
        ); //Frame là 1 object chứa 4 góc của QR code
        console.log('frame width', frame.width, 'frame height', frame.height);
        // let widthCode = codes[0].frame?.width
        //   ? codes[0].frame?.width - 60
        //   : codes[0].frame?.width ?? 0;
        if (codes[0].corners && codes[0].frame) {
          const newCornerTopLeft = {
            x: codes[0].corners[0].x - 50,
            y: codes[0].corners[0].y + 60,
          };
          const newCornerTopRight = {
            x: codes[0].corners[1].x - 50,
            y: codes[0].corners[1].y + 60,
          };
          const newCornerBottomRight = {
            x: codes[0].corners[2].x - 50,
            y: codes[0].corners[2].y + 60,
          };
          const newCornerBottomLeft = {
            x: codes[0].corners[3].x - 50,
            y: codes[0].corners[3].y + 60,
          };
          Animated.parallel([
            Animated.timing(animatedCornerTopLeft, {
              toValue: newCornerTopLeft,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(animatedCornerTopRight, {
              toValue: newCornerTopRight,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(animatedCornerBottomRight, {
              toValue: newCornerBottomRight,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(animatedCornerBottomLeft, {
              toValue: newCornerBottomLeft,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        }
      }
    },
  });

  // useEffect(() => {
  //   if (isQRCodeDetected) {
  //     setTimeout(() => {
  //       setIsQRCodeDetected(false);
  //     }, 3000);
  //   }
  // }, [isQRCodeDetected]);

  if (!hasPermission) {
    return (
      <RequestPermission
        title="Camera Permission Required"
        content="Request Permission"
        onPress={async () => await requestPermission()}
      />
    );
  }

  if (device == null) {
    return <Error />;
  }

  return (
    <SafeAreaView
      style={{flex: 1, width: screenWidth, borderWidth: 1}}>
      <Camera
        style={{
          flex: 1,
        }}
        device={device}
        isActive={true}
        torch={flashOn ? 'on' : 'off'}
        codeScanner={codeScanner}
      />

      <Svg style={StyleSheet.absoluteFill}>
        <AnimatedLine
          x1={animatedCornerTopLeft.x}
          y1={animatedCornerTopLeft.y}
          x2={animatedCornerTopRight.x}
          y2={animatedCornerTopRight.y}
          stroke={isQRCodeDetected ? 'green' : 'red'}
          strokeWidth="6"
          strokeDashoffset={5}
          //strokeDasharray={[55, 180]}
          strokeLinecap="round"
        />
        <AnimatedLine
          x1={animatedCornerTopRight.x}
          y1={animatedCornerTopRight.y}
          x2={animatedCornerBottomRight.x}
          y2={animatedCornerBottomRight.y}
          stroke={isQRCodeDetected ? 'green' : 'red'}
          strokeWidth="6"
          strokeDashoffset={5}
          //strokeDasharray={[55, 180]}
          strokeLinecap="round"
        />
        <AnimatedLine
          x1={animatedCornerBottomRight.x}
          y1={animatedCornerBottomRight.y}
          x2={animatedCornerBottomLeft.x}
          y2={animatedCornerBottomLeft.y}
          stroke={isQRCodeDetected ? 'green' : 'red'}
          strokeWidth="6"
          //strokeDasharray={[55, 180]}
          strokeLinecap="round"
        />
        <AnimatedLine
          x1={animatedCornerBottomLeft.x}
          y1={animatedCornerBottomLeft.y}
          x2={animatedCornerTopLeft.x}
          y2={animatedCornerTopLeft.y}
          stroke={isQRCodeDetected ? 'green' : 'red'}
          strokeWidth="6"
          //strokeDasharray={[55, 180]}
          strokeLinecap="round"
        />
      </Svg>
      <View
        style={{
          flex: 1,
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          left: 0,
        }}>
        <View style={{flex: 1, alignItems: 'center'}}>
          <Text style={{color: 'white'}}>Scan QR code</Text>
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'flex-end',
          }}>
          <ButtonComponent
            iconName={flashOn ? 'flashlight-on' : 'flashlight-off'}
            iconSize={28}
            iconColor="white"
            bgColor={flashOn ? 'gray' : 'rgba(0, 0, 0, 0.5)'}
            onPress={() => {
              setFlashOn(!flashOn);
            }}
          />
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
    </SafeAreaView>
  );
};

export default App;
