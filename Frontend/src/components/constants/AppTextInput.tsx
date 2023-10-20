import {StyleSheet, TextInput, TextInputProps, View, Text} from 'react-native';
import React, {useState} from 'react';
import Colors from '../constants/Colors';
import Font from '../constants/Font';
import FontSize from '../constants/FontSize';
import Spacing from '../constants/Spacing';

interface AppTextInputProps extends TextInputProps {
  error?: string | null;
  height?: number | null;
}

const AppTextInput: React.FC<AppTextInputProps> = ({
  error,
  height,
  ...otherProps
}) => {
  const [focused, setFocused] = useState<boolean>(false);

  const getBorderColor = () => {
    if (error) {
      return Colors.red; // Use red border when there's an error
    } else if (focused) {
      return Colors.primary; // Use primary color border when focused
    } else {
      return Colors.gray; // Use gray border in other cases
    }
  };

  return (
    <View>
      <TextInput
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor={Colors.darkText}
        style={[
          {
            fontFamily: Font['poppins-regular'],
            fontSize: FontSize.medium,
            padding: Spacing * 2,
            backgroundColor: Colors.lightPrimary,
            borderRadius: Spacing,
            marginTop: Spacing,
            borderWidth: 3,
            borderColor: getBorderColor(),
            height: height && height,
          },
          focused && {
            borderWidth: 3,
            borderColor: Colors.theme,
            shadowOffset: {width: 4, height: Spacing},
            shadowColor: Colors.primary,
            shadowOpacity: 0.2,
            shadowRadius: Spacing,
          },
        ]}
        {...otherProps}
      />
      {error && (
        <Text style={{marginTop: 7, color: Colors.red, fontSize: 12}}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default AppTextInput;

const styles = StyleSheet.create({});
