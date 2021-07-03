import React, {useState, useCallback, memo} from 'react';

import {ScrollView, View, TouchableWithoutFeedback} from 'react-native';
import {Autocomplete, AutocompleteItem, Icon} from '@ui-kitten/components';
import {
  useTheme,
  Dialog,
  Portal,
  Button,
  RadioButton,
  List,
  Avatar,
  Colors,
  IconButton,
  Subheading,
  Text,
  Paragraph,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

import AdminDialog from '../AdminDialog';
import MembersDialog from '../MembersDialog';

//import MultiSelect from 'react-native-multiple-select';

//import getAttribut from '../../utils/admins/getAdminAttribut';

const filter = (item, query) =>
  item.nom.toLowerCase().includes(query.toLowerCase());

const StarIcon = (props) => <Icon {...props} name="star" />;

// !!no change value
export const ACTIVE_MEMBERS_LIST = 'ActiveMembersList';
export const ACTIVE_MEMBERS_GLOBAL_LIST = 'ActiveMembersGlobalList';
export const MEMBERS_CARD = 'MembersCard';
export const TRANSACTION_BALANCE = 'TransactionBalance';
export const TRANSACTION_GLOBAL_BALANCE = 'TransactionGlobalBalance';
export const MISE_BALANCE = 'MiseBalance';
export const MISE_GLOBAL_BALANCE = 'MiseGlobalBalance';

const ReportDialog = memo(
  ({visible, onDismiss, admin, admins, members, navigation}) => {
    const [dateFrom, setDateFrom] = useState(new Date());
    const [showDateFrom, setShowDateFrom] = useState(false);
    const [dateTo, setDateTo] = useState(new Date());
    const [showDateTo, setShowDateTo] = useState(false);
    const [openDateDialog, setOpenDateDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectType, setSelectType] = useState(null);
    const [reportType, setReportType] = useState(null);
    const [transCategory, setTransCategory] = useState('E');
    const [loading, setLoading] = useState(false);
    const theme = useTheme();

    const onDateFromChange = (event, selectedDate) => {
      const currentDate = selectedDate || dateFrom;
      setDateFrom(currentDate);
      setShowDateFrom(false);
    };

    const onDateToChange = (event, selectedDate) => {
      const currentDate = selectedDate || dateTo;
      setDateTo(currentDate);
      setShowDateTo(false);
    };

    const onItemSelect = (item, withItem) => {
      if (!!withItem) {
        setSelectedItem(item);
        setOpenDateDialog(true);
      }
      setSelectType(null);
    };

    const onReportPresse = (reportType) => async () => {
      setReportType(reportType);
      if (reportType === MEMBERS_CARD && admin?.attribut === 'A3') {
        setSelectType('member');
      } else if (
        reportType === MISE_GLOBAL_BALANCE ||
        reportType === TRANSACTION_GLOBAL_BALANCE ||
        reportType === ACTIVE_MEMBERS_GLOBAL_LIST
      ) {
        setOpenDateDialog(true);
      } else {
        setSelectType('admin');
        if (admin?.attribut === 'A3') setOpenDateDialog(true);
      }

      onDismiss();
    };

    const handleShowReport = useCallback(() => {
      setLoading(true);
      const dates = {
        dateFrom: new Date(dateFrom).toISOString(),
        dateTo: new Date(dateTo).toISOString(),
      };

      navigation.navigate('Report', {
        data: {dates, report: reportType, transCategory, selectedItem},
      });
      setLoading(false);
      setOpenDateDialog(false);
    }, [dateFrom, dateTo, reportType, transCategory, selectedItem]);

    const getFormatedDate = (date) => moment(date).format('DD/MM/YYYY');

    return (
      <>
        <Portal>
          <Dialog visible={visible} onDismiss={onDismiss}>
            <Dialog.Title style={{color: theme.colors.primary}}>
              Choisir Le Rapport
            </Dialog.Title>
            {/* <Dialog.Content> */}
            <Dialog.ScrollArea
              style={{
                paddingHorizontal: 10,
                paddingBottom: 15,
                backgroundColor: theme.colors.background2,
              }}>
              <ScrollView>
                <List.Item
                  onPress={onReportPresse(MEMBERS_CARD)}
                  title="Fiche De Membre"
                  left={(props) => (
                    <Avatar.Icon
                      size={30}
                      icon="file-document-outline"
                      style={{
                        borderRadius: 10,
                        marginTop: 5,
                        marginRight: 2,
                      }}
                    />
                  )}
                />
                <List.Item
                  onPress={onReportPresse(ACTIVE_MEMBERS_LIST)}
                  title="Liste Détailée De Membres Actifs"
                  left={(props) => (
                    <Avatar.Icon
                      size={30}
                      icon="file-document-outline"
                      style={{
                        borderRadius: 10,
                        marginTop: 5,
                        marginRight: 2,
                      }}
                    />
                  )}
                />
                {admin?.attribut !== 'A3' && (
                  <List.Item
                    onPress={onReportPresse(ACTIVE_MEMBERS_GLOBAL_LIST)}
                    title="Liste Globale De Membres Actifs"
                    left={(props) => (
                      <Avatar.Icon
                        size={30}
                        icon="file-document-outline"
                        style={{
                          borderRadius: 10,
                          marginTop: 5,
                          marginRight: 2,
                        }}
                      />
                    )}
                  />
                )}
                <List.Item
                  onPress={onReportPresse(TRANSACTION_BALANCE)}
                  title="Balance Détailée Transactions"
                  left={(props) => (
                    <Avatar.Icon
                      size={30}
                      icon="file-document-outline"
                      style={{
                        borderRadius: 10,
                        marginTop: 5,
                        marginRight: 2,
                      }}
                    />
                  )}
                />
                {admin?.attribut !== 'A3' && (
                  <List.Item
                    onPress={onReportPresse(TRANSACTION_GLOBAL_BALANCE)}
                    title="Balance Globale Transactions"
                    left={(props) => (
                      <Avatar.Icon
                        size={30}
                        icon="file-document-outline"
                        style={{
                          borderRadius: 10,
                          marginTop: 5,
                          marginRight: 2,
                        }}
                      />
                    )}
                  />
                )}
                <List.Item
                  onPress={onReportPresse(MISE_BALANCE)}
                  title="Balance Détailée Bénefice"
                  left={(props) => (
                    <Avatar.Icon
                      size={30}
                      icon="file-document-outline"
                      style={{
                        borderRadius: 10,
                        marginTop: 5,
                        marginRight: 2,
                      }}
                    />
                  )}
                />
                {admin?.attribut !== 'A3' && (
                  <List.Item
                    onPress={onReportPresse(MISE_GLOBAL_BALANCE)}
                    title="Balance Globale Bénefice"
                    left={(props) => (
                      <Avatar.Icon
                        size={30}
                        icon="file-document-outline"
                        style={{
                          borderRadius: 10,
                          marginTop: 5,
                          marginRight: 2,
                        }}
                      />
                    )}
                  />
                )}
              </ScrollView>
            </Dialog.ScrollArea>
            {/* </Dialog.Content> */}

            <Dialog.Actions>
              <Button onPress={onDismiss}>ok</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <Portal>
          <Dialog
            visible={openDateDialog}
            onDismiss={() => setOpenDateDialog(false)}
            style={{}}>
            <Dialog.Title style={{color: theme.colors.primary}}>
              Info supplementaire
            </Dialog.Title>
            {/* <Dialog.Content> */}
            <Dialog.ScrollArea
              style={{
                padding: 20,
                backgroundColor: theme.colors.background2,
              }}>
              <ScrollView>
                <Subheading>Date du : </Subheading>
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
                      {getFormatedDate(dateFrom)}
                    </Text>
                  </View>

                  <IconButton
                    icon="calendar-month"
                    color={Colors.green700}
                    size={20}
                    onPress={() => setShowDateFrom(true)}
                  />
                </View>

                <Subheading style={{marginTop: 20}}>Au : </Subheading>
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
                      {getFormatedDate(dateTo)}
                    </Text>
                  </View>

                  <IconButton
                    icon="calendar-month"
                    color={Colors.green700}
                    size={20}
                    onPress={() => setShowDateTo(true)}
                  />
                </View>

                <Subheading style={{marginTop: 20}}>Categorie : </Subheading>
                <View style={{}}>
                  <RadioButton.Group
                    onValueChange={(category) => setTransCategory(category)}
                    value={transCategory}>
                    <View
                      style={{
                        flexDirection: 'row',
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                        }}>
                        <Text style={{marginTop: 5, color: Colors.green500}}>
                          Epargne
                        </Text>
                        <RadioButton
                          value="E"
                          uncheckedColor={Colors.green500}
                          color={Colors.green500}
                        />
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          marginLeft: 20,
                        }}>
                        <Text style={{marginTop: 5, color: Colors.red500}}>
                          Crédit
                        </Text>
                        <RadioButton
                          value="C"
                          color={Colors.red500}
                          uncheckedColor={Colors.red500}
                        />
                      </View>
                    </View>
                  </RadioButton.Group>
                </View>
              </ScrollView>
            </Dialog.ScrollArea>
            {/* </Dialog.Content> */}

            <Dialog.Actions>
              <Button
                style={{marginRight: 10}}
                loading={loading}
                disabled={loading}
                onPress={() => setOpenDateDialog(false)}>
                Annuler
              </Button>
              <Button
                onPress={handleShowReport}
                disabled={loading}
                loading={loading}>
                Afficher
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <AdminDialog
          visible={selectType === 'admin' && admin?.attribut !== 'A3'}
          dialogType="select"
          onDismiss={onItemSelect}
          admins={admins}
          navigation={navigation}
        />

        <MembersDialog
          visible={selectType === 'member'}
          dialogType="select"
          onDismiss={onItemSelect}
          members={members}
          admin={admin}
          admins={admins}
          navigation={navigation}
        />

        {showDateFrom && (
          <DateTimePicker
            testID="dateTimePicker"
            value={dateFrom}
            mode="date"
            maximumDate={dateTo}
            display="default"
            onChange={onDateFromChange}
          />
        )}

        {showDateTo && (
          <DateTimePicker
            testID="dateTimePicker"
            value={dateTo}
            mode="date"
            minimumDate={dateFrom}
            maximumDate={new Date()}
            display="default"
            onChange={onDateToChange}
          />
        )}
      </>
    );
  },
);

export default ReportDialog;
