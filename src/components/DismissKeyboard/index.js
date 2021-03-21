import React from 'react';
import {Keyboard, TouchableWithoutFeedback} from 'react-native';

const DismissKeyboard = ({children}) => (
  <TouchableWithoutFeedback
    onPress={() => Keyboard.dismiss()}
    style={{flex: 1}}>
    {children}
  </TouchableWithoutFeedback>
);

export default DismissKeyboard;
