import React, {useEffect, useState, useRef} from 'react';

import {
  StatusBar,
  AppState,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import {Snackbar, Provider as PaperProvider} from 'react-native-paper';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import NetInfo from '@react-native-community/netinfo';
import {useSelector, useDispatch} from 'react-redux';

import * as eva from '@eva-design/eva';
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';

import {ThemeProvider} from 'styled-components/native';
import LoginScreen from '../screens/LoginScreen';
import {
  setSnackState,
  setPreferencestate,
} from '../redux/actions/settingActions';
import {logoutAdmin} from '../redux/actions/loginActions';

import HomeDrawerNavigator from './HomeDrawerNavigator';
import useThemeMode from '../utils/hooks/useThemeMode';
import useCachedResources from '../utils/hooks/useCachedResources';
import usePreferences from '../utils/hooks/usePreferences';

const LOGOUT_TIME = 1000 * (60 * 3);
const Stack = createStackNavigator();

auth()
  .signInAnonymously()
  .then((value) => {
    console.log('User signed in anonymously', value);
  })
  .catch((error) => {
    if (error.code === 'auth/operation-not-allowed') {
      console.log('Enable anonymous in your firebase console.');
    }
    console.error(error);
  });

const StackNavigator = () => {
  const clearTimeoutRef = useRef(null);
  const dispatch = useDispatch();
  const loginState = useSelector((state) => state.login);
  const {snackbarText} = useSelector((state) => state.settings);
  const theme = useThemeMode();
  const preferencesState = usePreferences();
  const onDismissSnackBar = () => dispatch(setSnackState(null));
  useCachedResources();

  useEffect(() => {
    dispatch(setPreferencestate(preferencesState));
    console.log('preference change');
  }, [preferencesState.themeName, preferencesState.primaryColor]);

  useEffect(() => {
    AppState.addEventListener('change', _handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', _handleAppStateChange);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        dispatch(setSnackState("Pas d'accés à internet !"));
      } else {
        onDismissSnackBar();
      }
    });
    /*   return () => {
      typeof unsubscribe === 'function' && unsubscribe();
    }; */
  }, []);

  const _handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'background' && !clearTimeoutRef.current) {
      clearTimeoutRef.current = setTimeout(
        () => dispatch(logoutAdmin()),
        LOGOUT_TIME,
      );
    }

    if (nextAppState === 'active' && !!clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = null;
    }
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        animated={true}
        backgroundColor={theme.colors.primary}
      />
      <IconRegistry icons={EvaIconsPack} />
      <NavigationContainer theme={theme}>
        <ApplicationProvider {...eva} theme={eva.light}>
          <PaperProvider theme={theme}>
            <ThemeProvider theme={theme}>
              <Stack.Navigator>
                {!loginState.success ? (
                  <Stack.Screen
                    name="Login"
                    options={{
                      headerShown: false,
                    }}
                    component={LoginScreen}
                  />
                ) : (
                  <Stack.Screen
                    name="Main"
                    options={{
                      headerShown: false,
                    }}
                    component={HomeDrawerNavigator}
                  />
                )}
              </Stack.Navigator>
            </ThemeProvider>
          </PaperProvider>
        </ApplicationProvider>
      </NavigationContainer>
      <Snackbar
        visible={!!snackbarText}
        onDismiss={onDismissSnackBar}
        action={{
          label: 'OK',
          onPress: () => onDismissSnackBar(),
        }}>
        {snackbarText}
      </Snackbar>
    </>
  );
};

export default StackNavigator;
