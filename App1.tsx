/* eslint-disable no-lone-blocks */
/* eslint-disable react-native/no-inline-styles */
import React, {useState, useRef, useCallback} from 'react';
import {
  Dimensions,
  Animated,
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  Alert,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCodeScanner,
  getCameraDevice,
  useCameraPermission,
  useCameraFormat,
} from 'react-native-vision-camera';

import Svg, {Defs, Line, Mask, Path, Rect} from 'react-native-svg';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ButtonComponent from './components/ButtonComponent';
import RequestPermission from './components/RequestPermission';
import Error from './components/Error';

const {width: screenWidth, height: screenHeight} = Dimensions.get('screen');

const AnimatedPath = Animated.createAnimatedComponent(Path);
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

  const format = useCameraFormat(device, [
    {videoResolution: {width: 1280, height: 720}},
  ]);

  const {hasPermission, requestPermission} = useCameraPermission();
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [flashOn, setFlashOn] = useState<boolean>(false);
  const [isQRCodeDetected, setIsQRCodeDetected] = useState(false);

  const [frameWidth, setFrameWidth] = useState(640);
  const [frameHeight, setFrameHeight] = useState(480);

  const [qrCodeWidth, setQrCodeWidth] = useState(0);
  const [qrCodeHeight, setQrCodeHeight] = useState(0);

  //const qrTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Tham chiếu timeout để reset

  const isProcessingQRCode = useRef(false); // Biến kiểm soát đảm bảo xử lý 1 lần

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
      const qrCode = codes[0];
      if (isProcessingQRCode.current) {
        return;
      } // Ngăn gọi lại nếu đang xử lý
      isProcessingQRCode.current = true;
      if (codes.length === 0 || codes.length > 1) {
        return;
      }
      if (qrCode.corners === undefined) {
        return;
      }
      // if (qrTimeoutRef.current) {
      //   clearTimeout(qrTimeoutRef.current);
      // }
      // qrTimeoutRef.current = setTimeout(() => {
      //   setIsQRCodeDetected(false); // Reset trạng thái
      //   setIsScanning(true); // Tiếp tục quét
      //   //Reset vị trí của các góc
      //   Animated.parallel([
      //     Animated.timing(animatedCornerTopLeft, {
      //       toValue: initialCornerTopLeft,
      //       duration: 300,
      //       useNativeDriver: true,
      //     }),
      //     Animated.timing(animatedCornerTopRight, {
      //       toValue: initialCornerTopRight,
      //       duration: 300,
      //       useNativeDriver: true,
      //     }),
      //     Animated.timing(animatedCornerBottomRight, {
      //       toValue: initialCornerBottomRight,
      //       duration: 300,
      //       useNativeDriver: true,
      //     }),
      //     Animated.timing(animatedCornerBottomLeft, {
      //       toValue: initialCornerBottomLeft,
      //       duration: 300,
      //       useNativeDriver: true,
      //     }),
      //   ]).start();
      // }, 500);

      const topLeftCorner = qrCode.corners[0];
      const topRightCorner = qrCode.corners[1];
      const bottomRightCorner = qrCode.corners[2];
      const bottomLeftCorner = qrCode.corners[3];

      setQrCodeWidth(qrCode.frame?.width || 0);
      setQrCodeHeight(qrCode.frame?.height || 0);

      const isCodeInRegionOfInterest =
        // topleft
        topLeftCorner.x >= initialCornerTopLeft.x &&
        topLeftCorner.y >= initialCornerTopLeft.y &&
        // topRight
        topRightCorner.x <= initialCornerTopRight.x &&
        topRightCorner.y >= initialCornerTopRight.y &&
        // bottomRight
        bottomRightCorner.x <= initialCornerBottomRight.x &&
        bottomRightCorner.y <= initialCornerBottomRight.y &&
        // bottomLeft
        bottomLeftCorner.x >= initialCornerBottomLeft.x &&
        bottomLeftCorner.y <= initialCornerBottomLeft.y;

      if (isScanning && isCodeInRegionOfInterest) {
        setIsScanning(false); // Pause scan
        setIsQRCodeDetected(true);
        setFrameWidth(frame.width);
        setFrameHeight(frame.height);
        Animated.parallel([
          Animated.timing(animatedCornerTopLeft, {
            toValue: topLeftCorner,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(animatedCornerTopRight, {
            toValue: topRightCorner,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(animatedCornerBottomRight, {
            toValue: bottomRightCorner,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(animatedCornerBottomLeft, {
            toValue: bottomLeftCorner,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          Alert.alert('QR code scanned', qrCode.value, [
            {
              text: 'OK',
              onPress: () => {
                resetScanningState();
              },
            },
          ]);
        });
      } else {
        isProcessingQRCode.current = false;
      }
    },
  });

  const resetScanningState = () => {
    setTimeout(() => {
      setIsQRCodeDetected(false);
      setIsScanning(true);
      isProcessingQRCode.current = false; // Cho phép xử lý lại
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
    }, 500); // Nghỉ 1 giây trước khi reset
  };

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
    <SafeAreaView style={{flex: 1}}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        torch={flashOn ? 'on' : 'off'}
        codeScanner={codeScanner}
        format={format}
        fps={30}
      />
      <Svg
        style={[StyleSheet.absoluteFill, {zIndex: 10}]}
        preserveAspectRatio="xMidYMid slice"
        viewBox={`0 0 ${frameHeight} ${frameWidth}`}>
        {/* Top right */}
        <AnimatedPath
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M-42.5 0C-42.5 -1.38071 -41.38071 -2.5 -40 -2.5H-20C-7.5736 -2.5 2.5 7.5736 2.5 20V40C2.5 41.3807 1.38071 42.5 0 42.5C-1.38071 42.5 -2.5 41.3807 -2.5 40V20C-2.5 10.335 -10.335 2.5 -20 2.5H-40C-41.38071 2.5 -42.5 1.38071 -42.5 0Z"
          fill={isQRCodeDetected ? 'green' : 'white'}
          //transform="scale(0.2)"
          x={animatedCornerTopRight.x}
          y={animatedCornerTopRight.y}
        />
        {/* Top left */}
        <AnimatedPath
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M0 42.5C-1.38071 42.5 -2.5 41.3807 -2.5 40L-2.500001 20C-2.500002 7.5736 7.5736 -2.5 20 -2.500001L40 -2.500002C41.3807 -2.500002 42.5 -1.38071 42.5 0C42.5 1.38071 41.3807 2.5 40 2.5L20 2.5C10.335 2.5 2.5 10.335 2.5 20L2.5 40C2.5 41.3807 1.38071 42.5 0 42.5Z"
          fill={isQRCodeDetected ? 'green' : 'white'}
          x={animatedCornerTopLeft.x}
          y={animatedCornerTopLeft.y}
        />
        {/* Bottom right */}
        <AnimatedPath
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M0 -42.5C1.3807 -42.5 2.5 -41.38071 2.5 -40L2.5 -20C2.5 -7.5736 -7.5736 2.5 -20 2.5L-40 2.5C-41.38071 2.5 -42.500002 1.3807 -42.500002 0C-42.500002 -1.3807 -41.38071 -2.5 -40 -2.5L-20 -2.5C-10.335 -2.5 -2.5 -10.335 -2.5 -20L-2.5 -40C-2.5 -41.38071 -1.3807 -42.5 0 -42.5Z"
          fill={isQRCodeDetected ? 'green' : 'white'}
          x={animatedCornerBottomRight.x}
          y={animatedCornerBottomRight.y}
        />
        {/* Bottom left */}
        <AnimatedPath
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M42.5 0C42.5 1.3807 41.3807 2.5 40 2.5L20 2.5C7.5736 2.5 -2.499999 -7.5736 -2.499998 -20L-2.499996 -40C-2.499996 -41.38071 -1.38071 -42.500004 0 -42.500004C1.38072 -42.500004 2.5 -41.38071 2.5 -40L2.5 -20C2.5 -10.335 10.335 -2.5 20 -2.5L40 -2.5C41.3807 -2.5 42.5 -1.3807 42.5 0Z"
          fill={isQRCodeDetected ? 'green' : 'white'}
          x={animatedCornerBottomLeft.x}
          y={animatedCornerBottomLeft.y}
        />
      </Svg>

      <Svg
        style={StyleSheet.absoluteFill}
        preserveAspectRatio="xMidYMid slice"
        viewBox={`0 0 ${frameHeight} ${frameWidth}`}>
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
        <Svg height="100%" width="100%">
          <Defs>
            <Mask id="mask" x="0" y="0" height="100%" width="100%">
              <Rect height="100%" width="100%" fill="#fff" />
              <Rect
                x={initialCornerTopLeft.x}
                y={initialCornerTopLeft.y}
                width={initialCornerTopRight.x - initialCornerTopLeft.x}
                height={initialCornerBottomLeft.y - initialCornerTopLeft.y}
                fill="#000"
                rx={23}
                ry={23}
              />
            </Mask>
          </Defs>
          <Rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="black"
            fillOpacity="0.7"
            mask="url(#mask)"
          />
        </Svg>
        {/* Header */}
        <View
          style={{
            position: 'absolute',
            top: 10,
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
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
        {/* Footer */}
        <View
          style={{
            position: 'absolute',
            bottom: 30,
            flexDirection: 'row',
            justifyContent: 'space-around',
            width: '100%',
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
