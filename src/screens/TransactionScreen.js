import React, {useMemo, useState, useEffect, memo, useCallback} from 'react';
import {
  StyleSheet,
  Linking,
  View,
  ScrollView,
  ImageBackground,
} from 'react-native';

import {
  Appbar,
  RadioButton,
  useTheme,
  Card,
  List,
  Avatar,
  IconButton,
  Colors,
  Text,
  Button,
  TextInput,
  Divider,
  ProgressBar,
  HelperText,
  FAB,
  Dialog,
} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import numeral from 'numeral';

import {connect} from 'react-redux';

import Layout from '../components/Layout';
import Table from '../components/Table';

import {
  addTransaction,
  addMise,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from '../redux/actions/transactionActions';

import getAdminFromMember from '../utils/admins/getAdminFromMember';
import getTransactionsSolde from '../utils/transactions/getTransactionsSolde';
import getFormatedDate from '../utils/formating/getFormatedDate';
import getFormatedNumber from '../utils/formating/getFormatedNumber';
import useSnackbar from '../utils/hooks/useSnackbar';
//import Autocomplete from 'react-native-textinput-material-autocomplete';

import {Icon, IndexPath, Select, SelectItem} from '@ui-kitten/components';

const ITEM_PER_PAGE = 5;

const LockIcon = (props) => <Icon {...props} name="lock" />;
const UnlockIcon = (props) => <Icon {...props} name="unlock" />;

const TransactionScreen = memo(({
  navigation,
  route,
  addTransaction,
  addMise,
  transactionsState,
  admin,
  admins,
}) => {
  const [montant, setMontant] = useState(null);
  const [mise, setMise] = useState(null);
  const [type, setType] = useState('D');
  const [transCategory, setTransCategory] = useState('E');
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [updateTrans, setUpdateTrans] = useState(null);
  const [montantError, setMontantError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [openAddMiseDialog, setOpenAddMiseDialog] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(new IndexPath(0));
  const theme = useTheme();
  const {showSnackbar, checkConnection} = useSnackbar();
  const {member} = route.params;
  const {success, loading} = transactionsState.adding;

  const sowAddMiseDialog = () => setOpenAddMiseDialog(true);
  const hideAddMiseDialog = () => setOpenAddMiseDialog(false);
  const handleAccordionInfoPress = () => setExpanded(!expanded);
  const handleAccordionTransPress = (expandedId) => {
    setTransCategory(expandedId);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
    setShowDate(false);
  };

  const _pressCall = (phone) => {
    const url = `tel://${phone}`;
    Linking.openURL(url);
  };

  const handleReset = () => {
    setMontant(null);
    setType('D');
    setMise(null);
    setDate(new Date());
    setUpdateTrans(null);
    setMontantError(null);
    hideAddMiseDialog();
  };

  useEffect(() => {
    if (success) {
      handleReset();
      showSnackbar('Operation effectuée avec succées !');
    }
  }, [success]);

  useFocusEffect(
    useCallback(() => {
      // Do something when the screen is focused
      return () => {
        handleReset();
        /* navigation.setParams({member: null});*/
      };
    }, []),
  );

  const mises = useMemo(() => {
    if (!!transactionsState.data && !!member) {
      return transactionsState.data.filter(
        (t) => t.compte === member.compte && t.category === transCategory,
      );
    } else {
      return [];
    }
  }, [transactionsState, member, transCategory]);

  useEffect(() => {
    const transactions = mises[selectedIndex.row]?.transactions;
    setTransactions(transactions);
  }, [mises, selectedIndex]);

  const currentMise = useMemo(() => {
    const mise = mises[selectedIndex.row];
    return mise;
  }, [mises, selectedIndex]);

  const handleTransactionUpdatePress = useCallback(
    (transaction) => {
      if (admin.attribut !== 'A3') {
        setMontant(transaction.montant);
        setType(transaction.type);
        setUpdateTrans(transaction);
        setDate(transaction.date);
      }
    },
    [admin],
  );

  const handleAddMisePress = useCallback(() => {
    if (!checkConnection()) return;
    if (!!numeral(mise).value()) {
      const parsedMontant = numeral(mise).value();
      if (!!admin && !!member && !!transCategory) {
        const data = {
          compte: member.code,
          code_admin: admin.code,
          isActive: true,
          addTimestamp: new Date().getTime(),
          addDate: new Date().toISOString(),
          mise: parsedMontant,
          category: transCategory,
          transactions: [],
        };
        addMise(data);
      }
    }
  }, [admin, member, mise, transCategory]);

  const handleDeleteTransaction = useCallback(() => {
    if (admin.attribut === 'A1' && !!updateTrans) {
      const newTrans = currentMise.transactions.filter(
        (t) => t.id !== updateTrans.id,
      );
      const solde = getTransactionsSolde(newTrans);
      const mise = currentMise?.mise;

      const data = {
        ...currentMise,
        isActive: solde > mise,
        transactions: newTrans,
      };
      addTransaction(data);
    }
  }, [admin, updateTrans, currentMise]);

  const onAddOrUpdate = useCallback(() => {
    if (!checkConnection()) return;
    if (!!numeral(montant).value() && !!currentMise) {
      const parsedMontant = numeral(montant).value();
      let isActive = true;
      if (type === 'R' && transCategory === 'E') {
        const solde = getTransactionsSolde(currentMise.transactions);
        const mise = currentMise?.mise;
        const retraitPossible = solde - mise;

        if (parsedMontant > retraitPossible) {
          const message =
            retraitPossible > 0
              ? `Le montant du retrait ne peut excéder ${getFormatedNumber(
                  retraitPossible,
                )}`
              : 'Le solde de ce membre ne permet pas de retrait pour le moment !';
          setMontantError(message);
          return;
        }

        if (!updateTrans) {
          if (solde - parsedMontant === mise) isActive = false;
        } else {
          if (solde - parsedMontant * 2 === mise) isActive = false;
        }
      }

      let data;
      if (!updateTrans) {
        const newTrans = {
          id: Math.floor(
            Math.random() * Math.floor(Math.random() * Date.now()),
          ).toString(),
          montant: parsedMontant,
          date: new Date(date || new Date()).toISOString(),
          type,
        };
        data = {
          ...currentMise,
          isActive,
          transactions: [...currentMise.transactions, newTrans],
        };
      } else {
        const newTrans = {
          montant: parsedMontant,
          updatedTimestamp: new Date().getTime(),
          updatedDate: new Date().toISOString(),
          code_admin_update: admin.code,
          type,
        };
        data = {
          ...currentMise,
          updatedTimestamp: new Date().getTime(),
          updatedDate: new Date().toISOString(),
          code_admin_update: admin.code,
          category: transCategory,
          isActive,
          transactions: currentMise.transactions.map((t) => {
            if (t.id === updateTrans.id) return {...t, ...newTrans};
            return t;
          }),
        };
      }
      addTransaction(data);
    } else {
      setMontantError('Entrez un montant valide !');
    }
  }, [admin, updateTrans, montant, currentMise, date, type, transCategory]);

  const getTransactionType = (type) => (type === 'D' ? 'Dépot' : 'Rétrait');

  const getFieldColor = (fiedlKey, field) =>
    field.type === 'D' ? Colors.green500 : Colors.red500;

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Transactions" />
      </Appbar.Header>
      <ImageBackground
        source={require('../assets/images/jason-leung-SAYzxuS1O3M-unsplash.jpg')}
        blurRadius={5}
        style={{
          flex: 1,
          resizeMode: 'cover',
          justifyContent: 'center',
        }}>
        <ScrollView>
          <Layout>
            <Card style={{marginBottom: 10}}>
              <List.Item
                onPress={() => {}}
                title={member?.nom}
                description={member?.telephone}
                left={(props) => (
                  <Avatar.Icon
                    style={{marginTop: 10, marginRight: 10}}
                    size={40}
                    icon="account"
                  />
                )}
                right={(props) => (
                  <IconButton
                    icon="phone"
                    style={{marginTop: 10}}
                    color={Colors.green700}
                    onPress={() => _pressCall(member?.telephone)}
                  />
                )}
              />
              <Divider />
              <List.Accordion
                title="Plus d'informations"
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="information-outline"
                    style={{paddingTop: 5}}
                  />
                )}
                expanded={expanded}
                onPress={handleAccordionInfoPress}>
                {admin?.attribut !== 'A3' && (
                  <>
                    <List.Item
                      title="Collecteur :"
                      style={{paddingLeft: 15, paddingTop: 0}}
                      right={(props) => (
                        <Text
                          {...props}
                          style={{
                            marginTop: 8,
                            marginRight: 10,
                            color: theme.colors.placeholder,
                          }}>
                          {getAdminFromMember(member, admins)?.nom}
                        </Text>
                      )}
                    />
                    <Divider />
                  </>
                )}
                <List.Item
                  title="Adresse :"
                  style={{paddingLeft: 15}}
                  right={(props) => (
                    <Text
                      {...props}
                      style={{
                        marginTop: 8,
                        marginRight: 10,
                        color: theme.colors.placeholder,
                      }}>
                      {member?.adresse}
                    </Text>
                  )}
                />
                <Divider />
                {/* <List.Item title="Activité :" description={member.activite} /> */}
                <Divider />
                <List.Item
                  style={{paddingLeft: 15}}
                  title="Activité :"
                  right={(props) => (
                    <Text
                      {...props}
                      style={{
                        marginTop: 8,
                        marginRight: 10,
                        color: theme.colors.placeholder,
                      }}>
                      {member?.activite}
                    </Text>
                  )}
                />
                {transCategory === 'C' && (
                  <>
                    <Divider />
                    <List.Item
                      title="Crédit remboursé à :"
                      style={{
                        paddingLeft: 15,
                        marginBottom: 25,
                        position: 'relative',
                      }}
                      right={(props) => (
                        <Text
                          {...props}
                          style={{
                            marginTop: 8,
                            marginRight: 10,
                            color: theme.colors.placeholder,
                          }}>
                          {`${parseInt(
                            (100 *
                              getTransactionsSolde(transactions, 'D', 'C')) /
                              getTransactionsSolde(transactions, 'R', 'C') || 0,
                          )} % `}
                        </Text>
                      )}
                    />
                    <View
                      style={{
                        marginHorizontal: 15,
                        marginBottom: 20,
                        position: 'absolute',
                        left: 8,
                        right: 5,
                        bottom: 0,
                      }}>
                      <ProgressBar
                        progress={
                          ((100 *
                            getTransactionsSolde(transactions, 'D', 'C')) /
                            getTransactionsSolde(transactions, 'R', 'C') || 0) /
                            100 || 0
                        }
                        color={
                          (transactions && transactions.length) === 31
                            ? Colors.green500
                            : Colors.red500
                        }
                      />
                    </View>
                  </>
                )}
              </List.Accordion>
            </Card>

            <Card style={{marginBottom: 10}}>
              <Card.Title
                title={!updateTrans ? 'Transaction' : 'Modifier la transaction'}
              />
              <Divider />
              <Card.Content>
                <View style={{marginTop: 10}}>
                  <TextInput
                    mode="outlined"
                    label="Montant"
                    value={
                      !!numeral(montant).value()
                        ? numeral(montant).format('0,0[.]00')
                        : null
                    }
                    onChangeText={(text) => setMontant(text)}
                    keyboardType="numeric"
                    dense
                    disabled={
                      (admin.attribut === 'A3' && !currentMise?.isActive) ||
                      !mises?.length
                    }
                    error={!!montantError}
                    style={{flex: 1}}
                  />
                  <HelperText visible={!!montantError} type="error">
                    {montantError}
                  </HelperText>
                </View>

                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    backgroundColor: theme.colors.background,
                    borderRadius: 4,
                    marginTop: 10,
                    borderColor: theme.colors.placeholder,
                    borderWidth: 1,
                  }}>
                  <View
                    style={{
                      flex: 1,
                      paddingHorizontal: 12,
                      marginVertical: 10,
                      borderRightWidth: 1,
                      borderRightColor: theme.colors.placeholder,
                    }}>
                    <Text style={{color: theme.colors.placeholder}}>
                      {getFormatedDate(date)}
                    </Text>
                  </View>

                  <IconButton
                    icon="calendar-month"
                    color={Colors.green700}
                    size={20}
                    onPress={() => setShowDate(true)}
                    disabled={
                      admin.attribut === 'A3' ||
                      (admin.attribut === 'A2' && !!updateTrans)
                    }
                  />
                </View>

                <View
                  style={{
                    marginTop: 15,
                    marginBottom: 10,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <View style={{flex: 1}}>
                    <Text
                      style={{
                        color: theme.colors.placeholder,
                        marginBottom: 5,
                      }}>
                      Mise :
                    </Text>

                    <Select
                      style={{
                        backgroundColor: theme.colors.background,
                      }}
                      status="success"
                      placeholder="Choisir la mise"
                      size="medium"
                      selectedIndex={selectedIndex}
                      onSelect={(index) => setSelectedIndex(index)}
                      value={
                        <Text
                          style={{
                            color: theme.colors.placeholder,
                          }}>
                          {mises?.length
                            ? `${getFormatedNumber(
                                mises[selectedIndex.row]?.mise,
                              )} | ${getFormatedDate(
                                mises[selectedIndex.row]?.addTimestamp,
                              )}`
                            : 'Ajoutez une mise !'}
                        </Text>
                      }>
                      {mises?.map((t) => (
                        <SelectItem
                          key={t.code}
                          accessoryRight={t.isActive ? UnlockIcon : LockIcon}
                          title={`${getFormatedNumber(
                            t.mise,
                          )} | ${getFormatedDate(t.addTimestamp)}`}
                        />
                      ))}
                    </Select>
                  </View>
                  <View style={{marginLeft: 10, marginTop: 28}}>
                    <FAB
                      style={{
                        backgroundColor: Colors.green700,
                        marginRight: 10,
                        color: 'fff',
                      }}
                      onPress={sowAddMiseDialog}
                      color={Colors.white}
                      small
                      icon="plus"
                    />
                  </View>
                </View>
                <View style={{marginTop: 15, marginBottom: 10}}>
                  <Text style={{color: theme.colors.placeholder}}>
                    Catégorie de la transactions
                  </Text>
                  <List.AccordionGroup
                    onAccordionPress={handleAccordionTransPress}
                    expandedId={transCategory}>
                    <List.Accordion
                      title="Epargne"
                      id="E"
                      style={{
                        paddingHorizontal: 0,
                        paddingVertical: 5,
                        position: 'relative',
                      }}
                      left={(props) => (
                        <List.Icon
                          {...props}
                          icon="account-arrow-right"
                          style={{paddingLeft: 0, margin: 0}}
                        />
                      )}>
                      <List.Item title="" />
                      <View
                        style={{
                          position: 'absolute',
                          bottom: 5,
                          left: -50,
                        }}>
                        <RadioButton.Group
                          onValueChange={(type) => setType(type)}
                          value={type}>
                          <View
                            style={{
                              flexDirection: 'row',
                            }}>
                            <View
                              style={{
                                flexDirection: 'row',
                              }}>
                              <Text
                                style={{marginTop: 5, color: Colors.green500}}>
                                Dépot
                              </Text>
                              <RadioButton
                                value="D"
                                uncheckedColor={Colors.green500}
                                color={Colors.green500}
                              />
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                marginLeft: 20,
                              }}>
                              <Text
                                style={{marginTop: 5, color: Colors.red500}}>
                                Rétrait
                              </Text>
                              <RadioButton
                                value="R"
                                color={Colors.red500}
                                uncheckedColor={Colors.red500}
                              />
                            </View>
                          </View>
                        </RadioButton.Group>
                      </View>
                    </List.Accordion>

                    <List.Accordion
                      title="Crédit"
                      id="C"
                      style={{
                        paddingHorizontal: 0,
                        paddingVertical: 5,
                        position: 'relative',
                      }}
                      left={(props) => (
                        <List.Icon
                          {...props}
                          icon="account-arrow-left"
                          style={{paddingLeft: 0, margin: 0}}
                        />
                      )}>
                      <List.Item title="" />
                      <View
                        style={{
                          position: 'absolute',
                          bottom: 5,
                          left: -50,
                        }}>
                        <RadioButton.Group
                          onValueChange={(type) => setType(type)}
                          value={type}>
                          <View
                            style={{
                              flexDirection: 'row',
                            }}>
                            <View
                              style={{
                                flexDirection: 'row',
                              }}>
                              <Text
                                style={{marginTop: 5, color: Colors.green500}}>
                                Dépot
                              </Text>
                              <RadioButton
                                value="D"
                                uncheckedColor={Colors.green500}
                                color={Colors.green500}
                              />
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                marginLeft: 20,
                              }}>
                              <Text
                                style={{marginTop: 5, color: Colors.red500}}>
                                Rétrait
                              </Text>
                              <RadioButton
                                value="R"
                                color={Colors.red500}
                                uncheckedColor={Colors.red500}
                              />
                            </View>
                          </View>
                        </RadioButton.Group>
                      </View>
                    </List.Accordion>
                  </List.AccordionGroup>
                </View>
              </Card.Content>
              <Divider />
              <Card.Actions style={{justifyContent: 'flex-end'}}>
                {!!admin && admin.attribut === 'A1' && !!updateTrans && (
                  <FAB
                    style={{
                      backgroundColor: Colors.red400,
                      marginRight: 10,
                      color: 'fff',
                    }}
                    onPress={handleReset}
                    disabled={loading}
                    color={Colors.white}
                    small
                    icon="delete"
                    onPress={handleDeleteTransaction}
                  />
                )}
                <Button
                  style={{backgroundColor: Colors.red400, width: 115}}
                  onPress={handleReset}
                  disabled={loading}
                  mode="contained">
                  Annuler
                </Button>
                <Button
                  style={{
                    marginLeft: 10,
                    backgroundColor: Colors.green500,
                    width: 115,
                  }}
                  disabled={
                    loading ||
                    (admin.attribut === 'A3' && !currentMise?.isActive) ||
                    !mises?.length
                  }
                  loading={loading}
                  onPress={onAddOrUpdate}
                  mode="contained">
                  {!updateTrans ? 'confirmer' : 'modifier'}
                </Button>
              </Card.Actions>
            </Card>

            <Card>
              <View
                style={{
                  backgroundColor: theme.colors.primary,
                  paddingHorizontal: 10,
                  paddingTop: 10,
                  padding: 10,
                  borderTopStartRadius: 4,
                  borderTopEndRadius: 4,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text style={{color: Colors.white, fontWeight: 'bold'}}>
                  Solde
                </Text>
                <Text style={{color: Colors.grey300}}>
                  {getFormatedNumber(getTransactionsSolde(transactions))}
                </Text>
              </View>
            </Card>

            <Table
              colomns={[
                {
                  field: 'date',
                  label: 'Date',
                  transform: getFormatedDate,
                  getFieldColor,
                },
                {
                  field: 'type',
                  label: 'Type',
                  transform: getTransactionType,
                  getFieldColor,
                },
                {
                  field: 'montant',
                  label: 'Montant',
                  transform: getFormatedNumber,
                  getFieldColor,
                },
              ]}
              rows={transactions}
              itemsPerPage={ITEM_PER_PAGE}
              onRowPress={handleTransactionUpdatePress}
              selectedRowOptions={{
                item: updateTrans,
                field: 'id',
              }}
            />
          </Layout>
        </ScrollView>
      </ImageBackground>

      {showDate && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          maximumDate={new Date()}
          maxi
          display="default"
          onChange={onDateChange}
        />
      )}
      <Dialog visible={openAddMiseDialog} onDismiss={hideAddMiseDialog}>
        <Dialog.Title>Ajouter une mise</Dialog.Title>
        <Dialog.ScrollArea>
          <View style={{marginVertical: 12}}>
            <TextInput
              mode="outlined"
              label="Mise"
              dense
              value={
                !!numeral(mise).value()
                  ? numeral(mise).format('0,0[.]00')
                  : null
              }
              onChangeText={(text) => setMise(text)}
              keyboardType="numeric"
            />
          </View>

          {/*  <View style={{marginVertical: 12, marginBottom: 20}}>
            <TextInput
              mode="outlined"
              label="Intitulé"
              dense
              value={intitule}
              onChangeText={(text) => setIntitule(text)}
              maxLength={5}
            />
          </View> */}
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button
            disabled={loading}
            loading={loading}
            onPress={hideAddMiseDialog}>
            annuler
          </Button>
          <Button
            disabled={loading}
            loading={loading}
            onPress={handleAddMisePress}>
            confirmer
          </Button>
        </Dialog.Actions>
      </Dialog>
    </>
  );
})

const mapStateToProps = (state) => ({
  transactionsState: state.transactions,
  admin: state.admin.data,
  admins: state.admin.list,
  settings: state.settings,
  members: state.members.data,
});

export default connect(mapStateToProps, {
  addTransaction,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  addMise,
})(TransactionScreen);

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    padding: 20,
  },
});
