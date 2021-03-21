import React, {useState} from 'react';
import {ScrollView, ImageBackground} from 'react-native';
import {Appbar, Card, useTheme} from 'react-native-paper';

import Layout from '../components/Layout';
import ProfilCard from '../components/ProfilCard';

const AccountScreen = ({navigation}) => {
  const theme = useTheme();
  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Mon Compte" />
      </Appbar.Header>
      <ImageBackground
        source={require('../assets/images/jason-leung-SAYzxuS1O3M-unsplash.jpg')}
        blurRadius={10}
        style={{
          flex: 1,
          resizeMode: 'cover',
          justifyContent: 'center',
          backgroundColor: theme.colors.background2,
        }}>
        <ScrollView style={{flex: 1}}>
          <Layout>
            <ProfilCard />
          </Layout>
        </ScrollView>
      </ImageBackground>
    </>
  );
};

export default AccountScreen;
