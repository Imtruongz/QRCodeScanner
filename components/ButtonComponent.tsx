import {StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export type ButtonComponentProps = {
  iconName: string;
  iconSize: number;
  iconColor: string;
  style?: object;
  bgColor: string;
  onPress: () => void;
};

export const initialButtonComponent: ButtonComponentProps = {
  iconName: '',
  iconSize: 0,
  iconColor: '',
  bgColor: '',
  onPress: () => {},
};

const ButtonComponent: React.FC<ButtonComponentProps> = ({
  iconName,
  iconSize,
  iconColor,
  style,
  bgColor,
  onPress,
}) => {
  return (
    <>
      <TouchableOpacity
        style={[styles.button, style, {backgroundColor: bgColor}]}
        onPress={() => {
          onPress();
        }}>
        <MaterialIcons name={iconName} size={iconSize} color={iconColor} />
      </TouchableOpacity>
    </>
  );
};

export default ButtonComponent;

const styles = StyleSheet.create({
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 11,
  },
});
