import React, {useState, useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {Appbar, List, Switch, useTheme, Surface} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {archiveTransaction} from '../redux/actions/transactionActions';

import ConfirmDialog from '../components/ConfirmDialog';

const SettingScreen = (props) => {
  const {navigation, route} = props;
  const [visible, setVisible] = useState(false);
  const transactions = useSelector((state) => state.transactions.data);
  const dispatch = useDispatch();

  const onConfirmResponse = useCallback(
    (response) => {
      setVisible(false);
      if (response === true && !!transactions?.length) {
        dispatch(archiveTransaction(transactions));
      }
    },
    [transactions],
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Paramètres" />
      </Appbar.Header>

      <Surface style={[styles.surface]}>
        <List.Section>
          <List.Subheader>Transactions</List.Subheader>
          <List.Item
            title="Archiver les transaction"
            description="Permet d'archiver les tous transactions qui sont à terme !"
            onPress={() => setVisible(true)}
            left={(props) => <List.Icon {...props} icon="database-lock" />}
          />
        </List.Section>
        <List.Section>
          <List.Subheader>A propos</List.Subheader>
          <List.Item
            title="A propos"
            description="A propos de l'application"
            onPress={() => navigation.navigate('About')}
            left={(props) => (
              <List.Icon {...props} icon="information-outline" />
            )}
          />
        </List.Section>
      </Surface>

      <ConfirmDialog
        visible={visible}
        onDismiss={onConfirmResponse}
        title="Confirmation"
        message="Etes vous sûr de vouloir archiver les transactions ?"
      />
    </>
  );
};

export default SettingScreen;

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    // paddingVertical: 20,
  },
  paragraph: {
    textAlign: 'center',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
});
