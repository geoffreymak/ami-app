import React, {memo} from 'react';
import {Appbar, Surface, TextInput} from 'react-native-paper';
import {ImageBackground} from 'react-native';
import MembersForm from '../components/MembersForm';
import DismissKeyboard from '../components/DismissKeyboard';

import {connect} from 'react-redux';
import {
  addMember,
  removeMemberUpdate,
  updateMember,
  deleteMember,
} from '../redux/actions/membersActions';

import {updateTransactions} from '../redux/actions/transactionActions';

const MembersScreen = memo((props) => {
  const {
    addMember,
    addingState,
    updatedMember,
    updateTransactions,
    updateMember,
    deleteMember,
    removeMemberUpdate,
  } = props;
  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => props.navigation.goBack()} />
        <Appbar.Content
          title={!!updatedMember ? 'Modifier un Membre' : 'Ajout des membres'}
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
          <MembersForm
            navigation={props.navigation}
            onAdd={addMember}
            onUpdate={updateMember}
            onUpdateTransactions={updateTransactions}
            onDelete={deleteMember}
            addingState={addingState}
            updatedMember={updatedMember}
            removeMemberUpdate={removeMemberUpdate}
          />
        </DismissKeyboard>
      </ImageBackground>
    </>
  );
});

const mapStateToProps = (state) => ({
  addingState: state.members.adding,
  updatedMember: state.members.updatedMember,
});

export default connect(mapStateToProps, {
  addMember,
  updateMember,
  updateTransactions,
  removeMemberUpdate,
  deleteMember,
})(MembersScreen);
