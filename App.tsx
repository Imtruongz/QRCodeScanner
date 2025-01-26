/* eslint-disable react-native/no-inline-styles */
import React, {useState, useRef, useCallback} from 'react';
import {Dimensions, Animated, StyleSheet, View, Text} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCodeScanner,
  getCameraDevice,
  useCameraPermission,
  useCameraFormat,
  Templates,
} from 'react-native-vision-camera';

import Svg, {Line, Path} from 'react-native-svg';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ButtonComponent from './components/ButtonComponent';
import RequestPermission from './components/RequestPermission';
import Error from './components/Error';

const {width: screenWidth, height: screenHeight} = Dimensions.get('screen');

console.log('screen Width', screenWidth, 'screen Height', screenHeight);

const AnimatedLine = Animated.createAnimatedComponent(Line);

export type Corner = {
  x: number;
  y: number;
};

export type QRFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const initialQRFrame = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

//vi tri ban dau cua corner
export const initialCornerTopLeft: Corner = {
  x: screenWidth * 0.1,
  y: screenHeight * 0.25,
};
export const initialCornerTopRight: Corner = {
  x: screenWidth * 0.89,
  y: screenHeight * 0.25,
};
export const initialCornerBottomRight: Corner = {
  x: screenWidth * 0.89,
  y: screenHeight * 0.65,
};
export const initialCornerBottomLeft: Corner = {
  x: screenWidth * 0.1,
  y: screenHeight * 0.65,
};

const App: React.FC = () => {
  const devices = useCameraDevices();
  const device = getCameraDevice(devices, 'back');

  const format = useCameraFormat(device, Templates.Video);

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

  //const [qrFrame, setQrFrame] = useState<QRFrame>(initialQRFrame);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes, frame) => {
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
        console.log('Scanned QR code:', codes[0].corners, codes[0].frame);
        console.log(
          'frame width camera',
          frame.width,
          'frame height camera',
          frame.height,
        );
        // const scaleX = screenWidth / frame.width;
        // const scaleY = screenHeight / frame.height;
        // console.log('scaleX', scaleX, 'scaleY', scaleY);
        // setQrFrame({
        //   x: codes[0].frame?.x ?? initialQRFrame.x,
        //   y: codes[0].frame?.y ?? initialQRFrame.y,
        //   width: codes[0].frame?.width ?? initialQRFrame.width,
        //   height: codes[0].frame?.height ?? initialQRFrame.height,
        // });
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
    <View style={{flex: 1}}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        torch={flashOn ? 'on' : 'off'}
        codeScanner={codeScanner}
        format={format}
      />
      <Svg style={[StyleSheet.absoluteFill, {zIndex: 10}]}>
        {/* Top right */}
        <Path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M0.5 3C0.5 1.61929 1.61929 0.5 3 0.5H23C35.4264 0.5 45.5 10.5736 45.5 23V43C45.5 44.3807 44.3807 45.5 43 45.5C41.6193 45.5 40.5 44.3807 40.5 43V23C40.5 13.335 32.665 5.5 23 5.5H3C1.61929 5.5 0.5 4.38071 0.5 3Z"
          fill="white"
          x={initialCornerTopRight.x - 26}
          y={initialCornerTopRight.y - 20}
        />
        {/* Top left */}
        <Path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M3 45.5C1.61929 45.5 0.5 44.3807 0.5 43L0.499999 23C0.499998 10.5736 10.5736 0.5 23 0.499999L43 0.499998C44.3807 0.499998 45.5 1.61929 45.5 3C45.5 4.38071 44.3807 5.5 43 5.5L23 5.5C13.335 5.5 5.5 13.335 5.5 23L5.5 43C5.5 44.3807 4.38071 45.5 3 45.5Z"
          fill="white"
          x={initialCornerTopLeft.x - 20}
          y={initialCornerTopLeft.y - 20}
        />
        {/* Bottom right */}
        <Path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M43 0.5C44.3807 0.5 45.5 1.61929 45.5 3L45.5 23C45.5 35.4264 35.4264 45.5 23 45.5L3 45.5C1.61929 45.5 0.499998 44.3807 0.499998 43C0.499998 41.6193 1.61929 40.5 3 40.5L23 40.5C32.665 40.5 40.5 32.665 40.5 23L40.5 3C40.5 1.61929 41.6193 0.5 43 0.5Z"
          fill="white"
          x={initialCornerBottomRight.x - 26}
          y={initialCornerBottomRight.y - 25}
        />
        {/* Bottom left */}
        <Path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M45.5 43C45.5 44.3807 44.3807 45.5 43 45.5L23 45.5C10.5736 45.5 0.500001 35.4264 0.500002 23L0.500004 3C0.500004 1.61929 1.61929 0.499996 3 0.499996C4.38072 0.499996 5.5 1.61929 5.5 3L5.5 23C5.5 32.665 13.335 40.5 23 40.5L43 40.5C44.3807 40.5 45.5 41.6193 45.5 43Z"
          fill="white"
          x={initialCornerBottomLeft.x - 20}
          y={initialCornerBottomLeft.y - 25}
        />
      </Svg>

      <Svg style={StyleSheet.absoluteFill}>
        <AnimatedLine
          x1={animatedCornerTopLeft.x}
          y1={animatedCornerTopLeft.y}
          x2={animatedCornerTopRight.x}
          y2={animatedCornerTopRight.y}
          stroke={isQRCodeDetected ? 'green' : 'transparent'}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <AnimatedLine
          x1={animatedCornerTopRight.x}
          y1={animatedCornerTopRight.y}
          x2={animatedCornerBottomRight.x}
          y2={animatedCornerBottomRight.y}
          stroke={isQRCodeDetected ? 'green' : 'transparent'}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <AnimatedLine
          x1={animatedCornerBottomRight.x}
          y1={animatedCornerBottomRight.y}
          x2={animatedCornerBottomLeft.x}
          y2={animatedCornerBottomLeft.y}
          stroke={isQRCodeDetected ? 'green' : 'transparent'}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <AnimatedLine
          x1={animatedCornerBottomLeft.x}
          y1={animatedCornerBottomLeft.y}
          x2={animatedCornerTopLeft.x}
          y2={animatedCornerTopLeft.y}
          stroke={isQRCodeDetected ? 'green' : 'transparent'}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </Svg>

      <View style={StyleSheet.absoluteFill}>
        {/* Top */}
        <View
          style={{
            paddingTop: 12,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            width: '100%',
            height: screenHeight * 0.25,
          }}>
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
        {/* Left */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: screenHeight * 0.25,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            width: screenWidth * 0.1,
            height: screenHeight * 0.65 - screenHeight * 0.25,
          }}
        />
        {/* right */}
        <View
          style={{
            position: 'absolute',
            right: 0,
            top: screenHeight * 0.25,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            width: screenWidth * 0.11,
            height: screenHeight * 0.65 - screenHeight * 0.25,
          }}
        />

        {/* Bottom */}
        <View
          style={{
            position: 'absolute',
            top: screenHeight * 0.65,
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            width: '100%',
            height: screenHeight - screenHeight * 0.65,
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
    </View>
  );
};

export default App;

export const styles = StyleSheet.create({
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
