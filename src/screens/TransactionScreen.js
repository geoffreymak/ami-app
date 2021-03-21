import React, {useMemo, useState, useEffect, useCallback} from 'react';
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
} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import numeral from 'numeral';
import moment from 'moment';

import Layout from '../components/Layout';
import Table from '../components/Table';

import {connect} from 'react-redux';

import {
  addTransaction,
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

const ITEM_PER_PAGE = 5;
let unsubscribeTransaction = null;
const TransactionScreen = (props) => {
  const {
    navigation,
    route,
    addTransaction,
    getTransaction,
    updateTransaction,
    transactionsState,
    admin,
    admins,
    deleteTransaction,
    settings,
    members,
  } = props;

  const [montant, setMontant] = useState(null);
  const [type, setType] = useState('D');
  const [transCategory, setTransCategory] = useState('E');
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [updateTrans, setUpdateTrans] = useState(null);
  const [montantError, setMontantError] = useState(null);
  const {member} = route.params;
  const theme = useTheme();
  const {showSnackbar, checkConnection} = useSnackbar();
  const handleAccordionInfoPress = () => setExpanded(!expanded);
  const handleAccordionTransPress = (expandedId) => {
    setTransCategory(expandedId);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
    setShowDate(false);
  };

  const {success, loading} = transactionsState.adding;

  const handleReset = () => {
    setMontant(null);
    setType('D');
    setDate(new Date());
    setUpdateTrans(null);
    setMontantError(null);
  };

  const handleUnsubscribeTransaction = () => {
    typeof unsubscribeTransaction === 'function' && unsubscribeTransaction();
  };

  useEffect(() => {
    if (!!member) {
      getTransaction(member, transCategory);
    }
  }, [member, transCategory]);

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
        navigation.setParams({member: null});
        handleUnsubscribeTransaction();
      };
    }, []),
  );

  const transactions = useMemo(() => {
    if (
      !!transactionsState.data &&
      !!member &&
      transactionsState.data.hasOwnProperty(member.compte)
    ) {
      return transactionsState.data[member.compte];
    } else {
      return [];
    }
  }, [transactionsState, member]);

  const _pressCall = (phone) => {
    const url = `tel://${phone}`;
    Linking.openURL(url);
  };

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

  const handleDeleteTransaction = useCallback(() => {
    if (admin.attribut === 'A1' && !!updateTrans) {
      deleteTransaction(updateTrans);
    }
  }, [admin, updateTrans]);

  const onAddOrUpdate = useCallback(() => {
    if (!checkConnection()) return;
    if (!!numeral(montant).value()) {
      const parsedMontant = numeral(montant).value();

      if (type === 'R' && transCategory === 'E') {
        const solde = getTransactionsSolde(transactions, null, transCategory);
        const mise = member && member.mise;
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
      }

      if (!updateTrans) {
        const data = {
          montant: parsedMontant,
          date: new Date(date || new Date()).toISOString(),
          addTimestamp: new Date(date || new Date()).getTime(),
          compte: member.compte,
          code_admin: admin.code,
          category: transCategory,
          type,
        };
        addTransaction(data);
      } else {
        const data = {
          montant: parsedMontant,
          updatedTimestamp: new Date().getTime(),
          updatedDate: new Date().toISOString(),
          code_admin_update: admin.code,
          category: transCategory,
          type,
        };
        updateTransaction(admin, updateTrans, data);
      }
    } else {
      setMontantError('Entrez un montant valide !');
    }
  }, [admin, updateTrans, member, montant, date, type, transCategory]);

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
              {/* <Autocomplete
                array={members}
                field="nom"
                label="nom"
                value={(val) => {}}
                error={() => {
                  console.log('field invalid');
                }}>
                {' '}
              </Autocomplete> */}
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
                  title="Mise :"
                  right={(props) => (
                    <Text
                      {...props}
                      style={{
                        marginTop: 8,
                        marginRight: 10,
                        color: theme.colors.placeholder,
                      }}>
                      {getFormatedNumber(member?.mise)}
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
                title={
                  !updateTrans ? 'Transaction' : 'Modifier une transaction'
                }
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

                {/*
                 */}
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
                  disabled={loading}
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
                field: 'code',
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
    </>
  );
};

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
})(TransactionScreen);

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    padding: 20,
  },
});
