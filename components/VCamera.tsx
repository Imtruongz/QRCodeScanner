import React, {useState} from 'react';
import {
  Alert,
  SafeAreaView,
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

const VCamera: React.FC = () => {
  const devices = useCameraDevices();
  const device = getCameraDevice(devices, 'back'); // Lấy camera sau
  const {hasPermission, requestPermission} = useCameraPermission();
  const [isScanning, setIsScanning] = useState<boolean>(true); // Trạng thái bật/tắt quét mã QR
  const [scannedCode, setScannedCode] = useState<string | null>(null); // Mã QR đã quét

  // Hook xử lý quét mã QR
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'], // Các loại mã QR/mã vạch hỗ trợ
    onCodeScanned: codes => {
      if (isScanning && codes.length > 0) {
        setIsScanning(false); // Tạm dừng quét sau khi nhận mã
        setScannedCode(codes[0].content || 'No Data'); // Lưu nội dung mã QR
        Alert.alert('Scanned QR Code', codes[0].content || 'No Data'); // Hiển thị nội dung mã bằng Alert
      }
    },
  });

  // Nếu chưa có quyền camera => Hiển thị thông báo và yêu cầu quyền
  if (!hasPermission) {
    return (
      <View style={styles.permissionsContainer}>
        <Text style={styles.text}>Camera Permission Required</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => await requestPermission()}>
          <Text style={styles.buttonText}>Request Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Nếu không tìm thấy thiết bị camera => Hiển thị lỗi
  if (device == null) {
    return (
      <View style={styles.permissionsContainer}>
        <Text style={styles.text}>No Camera Device Found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Màn hình hiển thị Camera */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        enableZoomGesture // Bật tính năng zoom
        codeScanner={codeScanner} // Quét mã QR
      />

      {/* Trạng thái và nút trên giao diện */}
      <View style={styles.overlay}>
        <TouchableOpacity
          style={[styles.button, styles.scanButton]}
          onPress={() => {
            setIsScanning(!isScanning); // Bật/Tắt quét mã QR
          }}>
          <Text style={styles.buttonText}>
            {isScanning ? 'Pause Scanning' : 'Resume Scanning'}
          </Text>
        </TouchableOpacity>
        {scannedCode && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>Scanned Code: {scannedCode}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default VCamera;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  overlay: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderRadius: 8,
  },
  resultText: {
    color: 'white',
    fontSize: 18,
  },
  button: {
    backgroundColor: '#1e90ff',
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
    color: 'black',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scanButton: {
    marginTop: 10,
  },
});