import React, {useState, useCallback, useRef} from 'react';

import {ScrollView, View} from 'react-native';
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
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

//import MultiSelect from 'react-native-multiple-select';

//import getAttribut from '../../utils/admins/getAdminAttribut';

const ReportDialog = ({visible, onDismiss, admins, members, navigation}) => {
  const [dateFrom, setDateFrom] = useState(new Date());
  const [showDateFrom, setShowDateFrom] = useState(false);
  const [dateTo, setDateTo] = useState(new Date());
  const [showDateTo, setShowDateTo] = useState(false);
  const [openDateDialog, setOpenDateDialog] = useState(false);
  const [openMemberDialog, setOpenMemberDialog] = useState(false);
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

  const onReportPresse = (reportType) => async () => {
    setOpenDateDialog(true);
    setReportType(reportType);
    onDismiss();
  };

  const handleShowReport = useCallback(() => {
    setLoading(true);
    const dates = {
      dateFrom: new Date(dateFrom).toISOString(),
      dateTo: new Date(dateTo).toISOString(),
    };

    navigation.navigate('Report', {
      data: {dates, report: reportType, transCategory},
    });
    setLoading(false);
    setOpenDateDialog(false);
  }, [dateFrom, dateTo, reportType, transCategory]);

  const getFormatedDate = (date) => moment(date).format('DD/MM/YYYY');

  return (
    <>
      <Portal>
        <Dialog visible={visible} onDismiss={onDismiss}>
          <Dialog.Title style={{color: theme.colors.primary}}>
            Choisir le Rapport
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
                onPress={onReportPresse('ActiveMembersList')}
                title="Liste de membre actifs"
                left={(props) => (
                  <Avatar.Icon
                    size={45}
                    icon="file-document-outline"
                    style={{
                      borderRadius: 10,
                      marginTop: 10,
                      marginRight: 10,
                    }}
                  />
                )}
              />

              <List.Item
                onPress={onReportPresse('MembersCard')}
                title="Fiche de membres"
                left={(props) => (
                  <Avatar.Icon
                    size={45}
                    icon="file-document-outline"
                    style={{
                      borderRadius: 10,
                      marginTop: 10,
                      marginRight: 10,
                    }}
                  />
                )}
              />

              <List.Item
                onPress={onReportPresse('DailyBalance')}
                title="Balance"
                left={(props) => (
                  <Avatar.Icon
                    size={45}
                    icon="file-document-outline"
                    style={{
                      borderRadius: 10,
                      marginTop: 10,
                      marginRight: 10,
                    }}
                  />
                )}
              />
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
};

export default ReportDialog;
