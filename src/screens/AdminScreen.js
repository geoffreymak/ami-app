import React, {memo} from 'react';
import {Appbar, Surface, TextInput} from 'react-native-paper';
import {ImageBackground} from 'react-native';
import AdminForm from '../components/AdminForm';
import DismissKeyboard from '../components/DismissKeyboard';

import {connect} from 'react-redux';
import {
  addAdmin,
  updateAdmin,
  removeAdminUpdate,
} from '../redux/actions/adminActions';

const AdminScreen = memo((props) => {
  const {
    addAdmin,
    updateAdmin,
    addingState,
    updatedAdmin,
    removeAdminUpdate,
  } = props;

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => props.navigation.goBack()} />
        <Appbar.Content
          title={
            !!updatedAdmin
              ? 'Modifier un Administrateur'
              : 'Ajouter un Administrateur'
          }
        />
      </Appbar.Header>

      <ImageBackground
        source={require('../assets/images/jason-leung-SAYzxuS1O3M-unsplash.jpg')}
        blurRadius={10}
        style={{
          flex: 1,
          resizeMode: 'cover',
          justifyContent: 'center',
        }}>
        <DismissKeyboard>
          <AdminForm
            navigation={props.navigation}
            onAdd={addAdmin}
            onUpdate={updateAdmin}
            addingState={addingState}
            removeAdminUpdate={removeAdminUpdate}
          />
        </DismissKeyboard>
      </ImageBackground>
    </>
  );
});

const mapStateToProps = (state) => ({
  addingState: state.admin.adding,
  updatedAdmin: state.admin.updatedAdmin,
});

export default connect(mapStateToProps, {
  addAdmin,
  updateAdmin,
  removeAdminUpdate,
})(AdminScreen);
