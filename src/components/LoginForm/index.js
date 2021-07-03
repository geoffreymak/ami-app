import React, {useState, useEffect} from 'react';
import {
  StatusBar,
  ScrollView,
  Dimensions,
  SafeAreaView,
  View,
} from 'react-native';
import {
  HelperText,
  TextInput,
  Avatar,
  useTheme,
  Subheading,
  Headline,
  Paragraph,
} from 'react-native-paper';

import {useDispatch} from 'react-redux';

import useSnackbar from '../../utils/hooks/useSnackbar';
import {mergeTransaction} from '../../redux/actions/transactionActions';
import * as S from './styles';

const windowHeight = Dimensions.get('window').height - StatusBar.currentHeight;

export default function LoginForm({navigation, onLogin, loginState}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const {checkConnection} = useSnackbar();

  const dispatch = useDispatch();

  useEffect(() => {
    if (loginState.success) {
      setUsername('');
      setPassword('');
      navigation.navigate('Main');
    }
  }, [loginState]);

  const {error} = loginState;

  const handleLogin = () => {
    /*  if (!checkConnection()) {
      return;
    }*/

    onLogin({username, password});
    //dispatch(mergeTransaction());
  };

  const theme = useTheme();
  return (
    <S.Wrapper
      style={{
        backgroundColor: theme.colors.background,
        height: windowHeight,
      }}>
      <S.Top
        blurRadius={0.1}
        source={require('../../assets/images/jason-leung-SAYzxuS1O3M-unsplash.jpg')}>
        <S.LogoContainer>
          <Avatar.Icon
            style={{backgroundColor: theme.colors.background2}}
            color={theme.colors.primary}
            size={120}
            icon="account"
          />

          <S.LogoTitle>LOGIN</S.LogoTitle>
        </S.LogoContainer>
      </S.Top>
      <S.Bottom>
        <S.FormContainer>
          <S.InputContainer>
            <Subheading>Nom d'utilisateur </Subheading>
            <TextInput
              error={!!error?.username}
              mode="outlined"
              value={username}
              onChangeText={(text) => setUsername(text)}
            />
            <HelperText type="error" visible={!!error?.username}>
              {error?.username}
            </HelperText>
          </S.InputContainer>

          <S.InputContainer>
            <Subheading>Mot de passe </Subheading>
            <TextInput
              mode="outlined"
              error={!!error?.password}
              secureTextEntry={!visible}
              right={
                <TextInput.Icon
                  icon={!visible ? 'eye-outline' : 'eye-off-outline'}
                  onPress={() => setVisible(!visible)}
                  error={!!error?.password}
                />
              }
              value={password}
              onChangeText={(text) => setPassword(text)}
            />
            <HelperText type="error" visible={!!error?.password}>
              {error?.password}
            </HelperText>
          </S.InputContainer>
        </S.FormContainer>
        <S.ButtonContainer>
          <S.Button
            mode="contained"
            onPress={handleLogin}
            uppercase={false}
            contentStyle={{padding: 8}}
            loading={loginState.loading}
            disabled={loginState.loading}>
            S' authentifier
          </S.Button>
        </S.ButtonContainer>
      </S.Bottom>
    </S.Wrapper>
  );
}
