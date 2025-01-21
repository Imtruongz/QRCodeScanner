/* eslint-disable react-native/no-inline-styles */
import React, {useState, useRef, useCallback} from 'react';
import {
  Dimensions,
  Animated,
  StyleSheet,
  View,
  Text,
  SafeAreaView,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCodeScanner,
  getCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

import Svg, {Line} from 'react-native-svg';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ButtonComponent from './components/ButtonComponent';
import RequestPermission from './components/RequestPermission';
import Error from './components/Error';

const {width: screenWidth, height: screenHeight} = Dimensions.get('screen');

console.log('screenWidth', screenWidth, 'screenHeight', screenHeight);

const AnimatedLine = Animated.createAnimatedComponent(Line);

export type Corner = {
  x: number;
  y: number;
};

//vi tri ban dau cua corner
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

  const qrTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Tham chiếu timeout để reset

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

  const [qrFrame, setQrFrame] = useState({width: 0, height: 0});

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    // Vị trí top left and width height of frame
    regionOfInterest: {
      x: 0,
      y: 0,
      width: 320,
      height: 240,
    },
    //Main code
    onCodeScanned: (codes, frame) => {
      //Codes: là giá trị width, height, frame, corners của mã QR code
      //Frame: là giá trị width, height của khung quét QR code camera
      console.log('scanning qr code');//Log ra scanning lien tuc khi ma thay ma QR code trong frame
      setIsQRCodeDetected(true); // set trang thai da tim thay qr

      if (qrTimeoutRef.current) {
        clearTimeout(qrTimeoutRef.current);
      }
      qrTimeoutRef.current = setTimeout(() => {
        setIsQRCodeDetected(false); // Reset trạng thái
        setIsScanning(true); // Tiếp tục quét
        //Reset vị trí của các góc
        Animated.parallel([
          Animated.timing(animatedCornerTopLeft, {
            toValue: initialCornerTopLeft,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(animatedCornerTopRight, {
            toValue: initialCornerTopRight,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(animatedCornerBottomRight, {
            toValue: initialCornerBottomRight,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(animatedCornerBottomLeft, {
            toValue: initialCornerBottomLeft,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, 500);

      if (isScanning && codes.length > 0) {
        setIsScanning(false); // Pause scan
        setIsQRCodeDetected(true);
        console.log('Scanned QR code:', codes[0].corners);
        console.log('frame width', frame.width, 'frame height', frame.height);
        setQrFrame({width: frame.width, height: frame.height});
        // let widthCode = codes[0].frame?.width
        //   ? codes[0].frame?.width - 60
        //   : codes[0].frame?.width ?? 0;
        if (codes[0].corners && codes[0].frame) {
          const newCornerTopLeft = {
            x: codes[0].corners[0].x,
            y: codes[0].corners[0].y,
          };
          const newCornerTopRight = {
            x: codes[0].corners[1].x,
            y: codes[0].corners[1].y,
          };
          const newCornerBottomRight = {
            x: codes[0].corners[2].x,
            y: codes[0].corners[2].y,
          };
          const newCornerBottomLeft = {
            x: codes[0].corners[3].x,
            y: codes[0].corners[3].y,
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

  const toggleFlash = useCallback(() => {
    setFlashOn(prev => !prev);
  }, []);

  const toggleScan = useCallback(() => {
    setIsScanning(prev => !prev);
  }, []);

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
    <SafeAreaView style={{flex: 1, borderWidth: 1, borderColor: 'white'}}>
      <Camera
        style={StyleSheet.absoluteFill}
        //style={{width: qrFrame.width, height: qrFrame.height}}
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
          stroke={isQRCodeDetected ? 'green' : 'white'}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <AnimatedLine
          x1={animatedCornerTopRight.x}
          y1={animatedCornerTopRight.y}
          x2={animatedCornerBottomRight.x}
          y2={animatedCornerBottomRight.y}
          stroke={isQRCodeDetected ? 'green' : 'white'}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <AnimatedLine
          x1={animatedCornerBottomRight.x}
          y1={animatedCornerBottomRight.y}
          x2={animatedCornerBottomLeft.x}
          y2={animatedCornerBottomLeft.y}
          stroke={isQRCodeDetected ? 'green' : 'white'}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <AnimatedLine
          x1={animatedCornerBottomLeft.x}
          y1={animatedCornerBottomLeft.y}
          x2={animatedCornerTopLeft.x}
          y2={animatedCornerTopLeft.y}
          stroke={isQRCodeDetected ? 'green' : 'white'}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </Svg>
      <View style={StyleSheet.absoluteFill}>
        <View style={{flex: 1, paddingTop: 12}}>
          <View style={{width: '100%', paddingLeft: 20}}>
            <MaterialIcons name="arrow-back-ios" size={22} color="white" />
          </View>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}>
            <Text style={{color: 'white', fontSize: 28, fontWeight: 'bold'}}>
              Scan QR code
            </Text>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'flex-end',
            paddingBottom: 40,
          }}>
          <ButtonComponent
            iconName={flashOn ? 'flashlight-on' : 'flashlight-off'}
            iconSize={28}
            iconColor="white"
            bgColor={flashOn ? 'gray' : 'rgba(0, 0, 0, 0.5)'}
            onPress={() => {
              toggleFlash();
            }}
          />
          <ButtonComponent
            iconName="qr-code-scanner"
            iconSize={28}
            iconColor="white"
            bgColor={isScanning ? 'rgba(0, 0, 0, 0.5)' : 'gray'}
            onPress={() => {
              toggleScan();
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default App;
