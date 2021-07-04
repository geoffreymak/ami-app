import React, {memo} from 'react';
import {Appbar, Surface, TextInput} from 'react-native-paper';
import {ScrollView, Dimensions, View} from 'react-native';
import LoginForm from '../components/LoginForm';
import DismissKeyboard from '../components/DismissKeyboard';

import {connect} from 'react-redux';
import {loginAdmin} from '../redux/actions/loginActions';

const windowHeight = Dimensions.get('window').height;

const LoginScreen = memo((props) => {
  const {login, loginAdmin} = props;
  return (
    <DismissKeyboard>
      <ScrollView style={{flex: 1}}>
        <LoginForm
          navigation={props.navigation}
          loginState={login}
          onLogin={loginAdmin}
        />
      </ScrollView>
    </DismissKeyboard>
  );
});

const mapStateToProps = (state) => ({
  login: state.login,
});

export default connect(mapStateToProps, {
  loginAdmin,
})(LoginScreen);
