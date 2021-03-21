import React from 'react';
import LottieView from 'lottie-react-native';

function Loading(props) {
  return <LottieView source={require('./loading1.json')} {...props} />;
}

export default Loading;
