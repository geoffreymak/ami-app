import React from 'react';

import {ScrollView} from 'react-native';
import {Dialog, Portal, Button, Paragraph} from 'react-native-paper';

const ConfirmDialog = ({title, message, visible, onDismiss}) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>

        <Dialog.Content>
          <ScrollView>
            <Paragraph>{message}</Paragraph>
          </ScrollView>
        </Dialog.Content>

        <Dialog.Actions>
          <Button onPress={() => onDismiss(false)}>non</Button>
          <Button onPress={() => onDismiss(true)}>oui</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default ConfirmDialog;
