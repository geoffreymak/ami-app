import React, {useState, useEffect} from 'react';

import {ScrollView} from 'react-native';
import {
  Dialog,
  Portal,
  Button,
  Searchbar,
  useTheme,
  List,
  Avatar,
  Colors,
} from 'react-native-paper';

import getAttribut from '../../utils/admins/getAdminAttribut';
import AccountForm from '../AccountForm';

const AccountDialog = ({
  visible,
  onDismiss,
  addingState,
  updateAdmin,
  resetLoading,
}) => {
  const theme = useTheme();

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={{flex: 1, maxHeight: 560}}>
        <Dialog.Title style={{color: theme.colors.primary}}>
          Modifier mon compte
        </Dialog.Title>

        <AccountForm
          onDismiss={onDismiss}
          onUpdate={updateAdmin}
          addingState={addingState}
          resetLoading={resetLoading}
        />
      </Dialog>
    </Portal>
  );
};

export default AccountDialog;
