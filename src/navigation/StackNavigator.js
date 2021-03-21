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
import NetInfo from '@react-native-community/netinfo';
import {useSelector, useDispatch} from 'react-redux';

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

const LOGOUT_TIME = 1000 * (60 * 2);
const Stack = createStackNavigator();

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
      <NavigationContainer theme={theme}>
        <PaperProvider theme={theme}>
          <ThemeProvider theme={theme}>
            <ImageBackground style={{flex: 1}}>
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
            </ImageBackground>
          </ThemeProvider>
        </PaperProvider>
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
