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

import Layout from '../Layout';
import Table from '../Table';

import {
  addTransaction,
  addMise,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from '../../redux/actions/transactionActions';

import getAdminFromMember from '../../utils/admins/getAdminFromMember';
import getTransactionsSolde from '../../utils/transactions/getTransactionsSolde';
import sortTransactions from '../../utils/transactions/sortTransactions';
import getFormatedDate from '../../utils/formating/getFormatedDate';
import getFormatedNumber from '../../utils/formating/getFormatedNumber';
import useSnackbar from '../../utils/hooks/useSnackbar';
//import Autocomplete from 'react-native-textinput-material-autocomplete';

import {
  Icon,
  IndexPath,
  Select,
  SelectItem,
  Tab,
  TabView,
} from '@ui-kitten/components';

const ITEM_PER_PAGE = 5;

const LockIcon = (props) => <Icon {...props} name="lock" />;
const UnlockIcon = (props) => <Icon {...props} name="unlock" />;
const EpargneIcon = (props) => <Icon {...props} name="person-outline" />;
const CreditIcon = (props) => <Icon {...props} name="bell-outline" />;

const TransactionControls = memo(({member}) => {
  return (
    <>
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
                          (100 * getTransactionsSolde(transactions, 'D', 'C')) /
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
                        ((100 * getTransactionsSolde(transactions, 'D', 'C')) /
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
                              style={{
                                marginTop: 5,
                                color: Colors.green500,
                              }}>
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
                              style={{
                                marginTop: 5,
                                color: Colors.red500,
                              }}>
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
                              style={{
                                marginTop: 5,
                                color: Colors.green500,
                              }}>
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
                              style={{
                                marginTop: 5,
                                color: Colors.red500,
                              }}>
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
                {getFormatedNumber(
                  getTransactionsSolde(transactions) - currentMise?.mise,
                )}
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
    </>
  );
});

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
})(TransactionControls);

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    padding: 20,
  },
});
