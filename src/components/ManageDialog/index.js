import React from 'react';

import {ScrollView} from 'react-native';
import {
  Dialog,
  Portal,
  Button,
  useTheme,
  List,
  Avatar,
} from 'react-native-paper';

const AdminManageDialog = (props) => {
  const {visible, onDismiss, title, options} = props;
  const theme = useTheme();

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title style={{color: theme.colors.primary}}>
          {title}
        </Dialog.Title>
        <Dialog.ScrollArea
          style={{
            paddingHorizontal: 10,
            backgroundColor: theme.colors.background2,
          }}>
          <ScrollView>
            {!!options &&
              options.map(
                (option, idx) =>
                  option.visible && (
                    <List.Item
                      key={idx}
                      onPress={() => {
                        option.onPress();
                        onDismiss();
                      }}
                      title={option.title}
                      left={(props) => (
                        <Avatar.Icon
                          style={{marginTop: 10, marginRight: 10}}
                          size={40}
                          icon={option.icon}
                        />
                      )}
                    />
                  ),
              )}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={onDismiss}>ok</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default AdminManageDialog;
