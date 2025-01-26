/* eslint-disable react-native/no-inline-styles */
import React, {useState, useRef, useCallback} from 'react';
import {
  Dimensions,
  Animated,
  StyleSheet,
  View,
  Text,
  LayoutChangeEvent,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCodeScanner,
  getCameraDevice,
  useCameraPermission,
  runAtTargetFps,
  useCameraDevice,
  CodeScannerFrame,
  Code,
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

type CameraHighlight = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type HightlightBoxProps = {
  highlight: CameraHighlight;
  layout: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  scanFrame: CodeScannerFrame;
};

const App: React.FC = () => {
  const devices = useCameraDevices();
  const device = getCameraDevice(devices, 'back');

  // const format = useCameraFormat(device, [
  //   {videoResolution: {width: screenWidth, height: screenHeight}}, // Video 16:9 ở độ phân giải 1280x720
  //   {photoResolution: {width: screenWidth, height: screenHeight}},
  //   {videoAspectRatio: screenHeight / screenWidth}, // Có tỷ lệ gần giống 16:9
  //   {photoAspectRatio: screenHeight / screenWidth},
  //   {fps: 30}, // 30 khung hình mỗi giây
  // ]);

  // const frameProcessor = useFrameProcessor(frame => {
  //   'worklet';
  //   console.log(`Frame: ${frame.width}x${frame.height} (${frame.pixelFormat})`);

  // }, []);

  const {hasPermission, requestPermission} = useCameraPermission();
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [flashOn, setFlashOn] = useState<boolean>(false);
  const [isQRCodeDetected, setIsQRCodeDetected] = useState(false);
  const [paths, setPaths] = useState<{d: string}[] | null>(null);
  const [codeScanned, handleCodeScanned] = useState<String>('');
  const [scanFrame, setScanFrame] = useState<CodeScannerFrame>({
    height: 1,
    width: 1,
  });
  const [codeScannerHighlights, setCodeScannerHighlights] = useState<
    CameraHighlight[]
  >([]);
  const [layout, setLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes: Code[], frame: CodeScannerFrame) => {
      setScanFrame(frame);
      setCodeScannerHighlights(
        codes.map(code => ({
          height: code.frame?.width ?? 0,
          width: code.frame?.height ?? 0,
          x: code.frame?.y ?? 0,
          y: code.frame?.x ?? 0,
        })),
      );
    },
  });

  const onLayout = (evt: LayoutChangeEvent) => {
    if (evt.nativeEvent.layout) {
      setLayout(evt.nativeEvent.layout);
    }
  };

  if (!hasPermission) {
    return (
      <View><Text>loi~</Text></View>
    );
  }

  if (!device) {
    return <Text>No camera device</Text>;
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        onLayout={onLayout}
        codeScanner={codeScanner}
      />
      {codeScannerHighlights.map((hightlight, key) => (
        <HightlightBox
          key={key}
          highlight={hightlight}
          layout={layout}
          scanFrame={scanFrame}
        />
      ))}
    </View>
  );
};

const HightlightBox = ({
  highlight,
  layout,
  scanFrame,
}: HightlightBoxProps): JSX.Element => {
  return (
    <View
      style={[
        {
          position: 'absolute',
          borderWidth: 2,
          borderColor: 'red',
        },
        {
          right: highlight.x * (layout.width / scanFrame.height),
          top: highlight.y * (layout.height / scanFrame.width),
          height: highlight.height * (layout.width / scanFrame.height),
          width: highlight.width * (layout.height / scanFrame.width),
        },
      ]}
    />
  );
};

export default App;
