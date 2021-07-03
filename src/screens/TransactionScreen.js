import React, {
  useMemo,
  useState,
  useEffect,
  memo,
  useCallback,
  useRef,
} from 'react';
import {
  StyleSheet,
  Linking,
  View,
  ScrollView,
  ImageBackground,
} from 'react-native';

import {
  Appbar,
  ActivityIndicator,
  RadioButton,
  useTheme,
  Card,
  List,
  Avatar,
  IconButton,
  Colors,
  Text,
  Paragraph,
  Caption,
  Button,
  TextInput,
  Divider,
  ProgressBar,
  HelperText,
  FAB,
  Dialog,
  Switch,
  Portal,
} from 'react-native-paper';
import {TabRouter, useFocusEffect} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import numeral from 'numeral';
import moment from 'moment';

import {connect} from 'react-redux';

import Layout from '../components/Layout';
import Table from '../components/Table';

import {
  addTransaction,
  addWaitingTransaction,
  addTransactionToTrash,
  updateWaitingTransaction,
  deleteWaitingTransaction,
  addMise,
  getTransaction,
  updateTransaction,
  deleteMise,
} from '../redux/actions/transactionActions';

import getAdminFromMember from '../utils/admins/getAdminFromMember';
import getTransactionsSolde from '../utils/transactions/getTransactionsSolde';
import sortTransactions from '../utils/transactions/sortTransactions';
import getFormatedDate from '../utils/formating/getFormatedDate';
import getFormatedNumber from '../utils/formating/getFormatedNumber';
import useSnackbar from '../utils/hooks/useSnackbar';
//import Autocomplete from 'react-native-textinput-material-autocomplete';

import {
  Icon,
  IndexPath,
  Select,
  SelectItem,
  Tab,
  TabView,
  Card as KittenCard,
} from '@ui-kitten/components';

const ITEM_PER_PAGE = 5;

const MOUTH_LIST = Array(12)
  .fill(0)
  .map((_, idx) => ({id: idx + 1, title: `${idx + 1} Mois`}));

const LockIcon = (props) => (
  <Icon {...props} name="lock" onPress={() => console.log('update press')} />
);
const UnlockIcon = (props) => (
  <Icon {...props} name="unlock" onPress={() => console.log('update press')} />
);

const EditIcon = (props) => <Icon {...props} name="edit" />;
//<Icon {...props} name="edit-2" onPress={() => console.log('update press')} />;
const EpargneIcon = (props) => <Icon {...props} name="person-add-outline" />;
const CreditIcon = (props) => <Icon {...props} name="person-remove-outline" />;

const TransactionScreen = memo(
  ({
    navigation,
    route,
    addTransaction,
    addWaitingTransaction,
    addTransactionToTrash,
    updateWaitingTransaction,
    deleteWaitingTransaction,
    deleteMise,
    addMise,
    transactionsState,
    admin,
    admins,
  }) => {
    const [montant, setMontant] = useState(null);
    const [mise, setMise] = useState(null);
    const [credit, setCredit] = useState(null);
    const [interet, setInteret] = useState(null);
    const [marge, setMarge] = useState(null);
    const [type, setType] = useState('D');
    const [transCategory, setTransCategory] = useState('E');
    const [date, setDate] = useState(new Date());
    const [dateMise, setDateMise] = useState(new Date());
    const [showDate, setShowDate] = useState(false);
    const [showDateMise, setShowDateMise] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [updateTrans, setUpdateTrans] = useState(null);
    const [updateMise, setUpdateMise] = useState(null);
    const [montantError, setMontantError] = useState(null);
    const [margeError, setMargeError] = useState(null);
    const [openAddMiseDialog, setOpenAddMiseDialog] = useState(false);
    const [switching, setSwitching] = useState(false);

    const [openAddCreditDialog, setOpenAddCreditDialog] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(new IndexPath(0));
    const [selectedCreditIndex, setSelectedCreditIndex] = useState(
      new IndexPath(0),
    );
    const [selectedMouthIndex, setSelectedMouthIndex] = useState(
      new IndexPath(0),
    );
    const selectERef = useRef(null);
    const selectCRef = useRef(null);

    const [selectedTabIndex, setSelectedTabIndex] = useState(0);

    const theme = useTheme();
    const {showSnackbar, checkConnection} = useSnackbar();
    const {member} = route.params;
    const {success, loading} = transactionsState.adding;

    const showAddMiseDialog = () => setOpenAddMiseDialog(true);
    const hideAddMiseDialog = () => {
      setUpdateMise(null);
      setMise(null);
      setOpenAddMiseDialog(false);
    };

    const showAddCreditDialog = () => setOpenAddCreditDialog(true);
    const hideAddCreditDialog = () => setOpenAddCreditDialog(false);
    const handleAccordionInfoPress = () => setExpanded(!expanded);
    const handleAccordionTransPress = (expandedId) => {
      setTransCategory(expandedId);
    };

    const handleTabSelect = (index) => {
      setSelectedTabIndex(index);
      const transCategory = index === 0 ? 'E' : 'C';
      setTransCategory(transCategory);
    };

    const onDateChange = (event, selectedDate) => {
      const currentDate = selectedDate || date;
      setDate(currentDate);
      setShowDate(false);
    };

    const onDateMiseChange = useCallback(
      (event, selectedDate) => {
        const currentDate = selectedDate || dateMise;
        setDateMise(currentDate);
        setShowDateMise(false);
      },
      [dateMise],
    );
    const _pressCall = (phone) => {
      const url = `tel://${phone}`;
      Linking.openURL(url);
    };

    const handleReset = () => {
      setMontant(null);
      setType('D');
      setMise(null);
      setCredit(null);
      setInteret(null);
      setMarge(null);
      setSelectedMouthIndex(new IndexPath(0));
      setDate(new Date());
      setDateMise(new Date());
      setUpdateTrans(null);
      setMontantError(null);
      setMargeError(null);
      hideAddMiseDialog();
      hideAddCreditDialog();
    };

    useEffect(() => {
      if (success) {
        setSwitching(false);
        handleReset();
        showSnackbar('Operation effectuée avec succées !');
      }
    }, [success]);

    useEffect(() => {
      setSelectedIndex(new IndexPath(0));
    }, [transCategory]);

    useEffect(() => {
      const mouth = MOUTH_LIST[selectedMouthIndex.row];
      const formatedCredit = numeral(credit).value();
      const interet = numeral((formatedCredit * (mouth.id * 10)) / 100).value();
      setInteret(interet);
    }, [selectedMouthIndex, credit]);

    const totalCredit = useMemo(() => {
      const parsedInteret = numeral(interet).value();
      const parsedCredit = numeral(credit).value();
      const parsedMarge = numeral(marge).value();
      const somme = parsedInteret + parsedCredit + parsedMarge;
      return numeral(somme).value();
    }, [interet, credit, marge]);

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
        return sortTransactions(
          transactionsState.data.filter(
            (t) => t.compte === member.compte && t.category === transCategory,
          ),
        );
      } else {
        return [];
      }
    }, [transactionsState, member, transCategory]);

    const enableNewCredit = useMemo(() => {
      let isActive = false;
      mises.forEach((m) => {
        if (m.isActive === true) isActive = true;
      });

      return !isActive;
    }, [mises]);

    const enableNewEpargne = useMemo(() => {
      let enable = true;
      mises.forEach((m) => {
        if (!m?.transactions?.length) enable = false;
      });
      return enable;
    }, [mises]);

    const transactions = useMemo(() => {
      const transactions = mises[selectedIndex.row]?.transactions;
      return sortTransactions(transactions || []);
    }, [mises, selectedIndex]);

    const currentMise = useMemo(() => {
      const mise = mises[selectedIndex.row];
      return mise;
    }, [mises, selectedIndex]);

    const currentWaiting = useMemo(() => {
      const {waiting} = transactionsState;
      const currentWaiting = waiting?.filter(
        (w) => w.transCode === currentMise?.code,
      );
      return currentWaiting;
    }, [transactionsState, currentMise]);

    const hasWaitingTrans = useMemo(() => {
      let hasWaitingTrans = false;
      currentWaiting?.forEach((w) => {
        if (w.statusCode === 'W') hasWaitingTrans = true;
      });
      return hasWaitingTrans;
    }, [currentWaiting]);

    const onResponseWaitingTrans = useCallback(
      (statusCode) => () => {
        if (!!currentWaiting?.length) {
          let data = {
            ...currentWaiting[0],
            responseDate: moment().format(),
            code_admin_response: admin?.code,
          };
          switch (statusCode) {
            case 'A': {
              data = {...data, status: 'accepted', statusCode: 'A'};
              break;
            }

            case 'R': {
              data = {...data, status: 'refused', statusCode: 'R'};
              break;
            }

            case 'W': {
              data = {...data, status: 'waiting', statusCode: 'W'};
              break;
            }

            default:
              break;
          }

          updateWaitingTransaction(data);
        }
      },
      [admin, currentWaiting],
    );

    const onDeleteWaitingTrans = useCallback(() => {
      if (!!currentWaiting?.length) {
        let data = {
          ...currentWaiting[0],
        };
        deleteWaitingTransaction(data);
      }
    }, [currentWaiting]);

    const onConfirmWaitingTrans = useCallback(() => {
      if (!!currentWaiting?.length) {
        let isActive = true;
        const parsedMontant = currentWaiting[0]?.transaction?.montant;
        const solde = getTransactionsSolde(currentMise.transactions);
        const mise = currentMise?.mise;
        const realSolde = solde - mise;

        if (parsedMontant > realSolde) {
          const message = 'Le montant du retrait ne peut excéder le solde';
          setMontantError(message);
          return;
        }

        if (realSolde - parsedMontant === 0) isActive = false;

        const newTrans = {
          ...currentWaiting[0]?.transaction,
          confirmDate: moment().format(),
        };

        const data = {
          ...currentMise,
          isActive,
          transactions: [...currentMise.transactions, newTrans],
        };
        addTransaction(data);
        onDeleteWaitingTrans();
      }
    }, [currentWaiting, currentMise]);

    const onToggleSwitch = useCallback(() => {
      if (!!currentMise) {
        const data = {
          ...currentMise,
          isActive: !currentMise.isActive,
        };
        addTransaction(data);
        setSwitching(true);
      }
    }, [currentMise]);

    const handleTransactionUpdatePress = useCallback(
      (transaction) => {
        if (admin.attribut === 'A1') {
          if (transCategory === 'C' && transaction?.type === 'R') return;
          setMontant(transaction.montant);
          setType(transaction.type);
          setUpdateTrans(transaction);
          setDate(transaction.date);
        }
      },
      [admin, transCategory],
    );

    const handleMiseUpdatePress = useCallback(
      (idx) => {
        const mise = mises[idx];
        if (admin.attribut !== 'A3' && !!mise) {
          selectERef.current?.blur();
          selectCRef.current?.blur();

          setMise(mise?.mise);

          setUpdateMise(mise);
          setSelectedIndex(new IndexPath(idx));

          if (transCategory === 'E') {
            setDateMise(mise?.addDate);
            showAddMiseDialog();
          } else {
            const montant = getTransactionsSolde(mise.transactions, 'R');

            const credit =
              numeral(montant).value() - numeral(mise.mise).value();

            const month = numeral(
              Math.ceil(
                moment(mise.dateFin).diff(
                  moment(mise.dateDebut),
                  'month',
                  true,
                ),
              ),
            ).value();

            const interet = numeral(
              (credit * ((month || 1) * 10)) / 100,
            ).value();
            const marge =
              numeral(mise.interet).value() - numeral(interet).value();
            console.log('month ', month);

            setDateMise(mise?.dateDebut);
            setInteret(interet);
            setCredit(credit);
            setSelectedMouthIndex(new IndexPath((month || 1) - 1));
            setMarge(marge);
            showAddCreditDialog();
          }
        }
      },
      [admin, mises, transCategory],
    );

    const handleAddCreditPress = useCallback(() => {
      if (!checkConnection()) return;

      if (!!numeral(totalCredit).value() && !!numeral(credit).value()) {
        const parsedCredit = numeral(credit).value();
        const parsedTotalCredit = numeral(totalCredit).value();
        const interet = numeral(parsedTotalCredit - parsedCredit).value();
        const mouth = MOUTH_LIST[selectedMouthIndex.row].id;
        const parsedMarge = numeral(marge).value();
        if (!!admin && !!member && !!transCategory) {
          if (!updateMise) {
            if (!parsedMarge) {
              setMargeError('Veillez renseigner un montant valide !');
              return;
            }

            const newTrans = {
              id: Math.floor(
                Math.random() * Math.floor(Math.random() * Date.now()),
              ).toString(),
              montant: parsedTotalCredit,
              date: new Date(date || new Date()).toISOString(),
              type: 'R',
              time: new Date().getTime(),
            };

            const data = {
              compte: member.code,
              code_admin: member.code_admin,
              real_code_admin: admin.code,
              isActive: true,
              isBlocked: false,
              addTimestamp: new Date().getTime(),
              addDate: new Date().toISOString(),
              dateDebut: moment().format(),
              dateFin: moment().add(mouth, 'months').format(),
              mise: interet,
              interet,
              category: transCategory,
              transactions: [newTrans],
            };

            addMise(data);
            console.log('data', data);
          } else {
            const newTrans = updateMise?.transactions.map((t) => {
              if (t.type === 'R')
                return {
                  ...t,
                  montant: parsedTotalCredit,
                  updateTime: moment().format(),
                };
              return t;
            });
            const data = {
              ...updateMise,
              dateDebut: moment(dateMise || new Date()).format(),
              dateFin: moment(dateMise || new Date())
                .add(mouth, 'months')
                .format(),
              mise: interet,
              interet,
              updateDate: moment().format(),
              transactions: newTrans,
            };
            addTransaction(data);
          }
        }
      }
    }, [
      admin,
      dateMise,
      member,
      credit,
      marge,
      totalCredit,
      selectedMouthIndex,
      transCategory,
      updateMise,
    ]);

    const handleAddMisePress = useCallback(() => {
      if (!checkConnection()) return;
      if (!!numeral(mise).value()) {
        const parsedMontant = numeral(mise).value();

        if (!!admin && !!member && !!transCategory) {
          if (!updateMise) {
            const data = {
              compte: member.code,
              code_admin: member.code_admin,
              real_code_admin: admin.code,
              isActive: true,
              isBlocked: false,
              createdAt: moment().format(),
              addTimestamp: new Date(dateMise || new Date()).getTime(),
              addDate: new Date(dateMise || new Date()).toISOString(),
              mise: parsedMontant,
              category: transCategory,
              transactions: [],
            };
            addMise(data);
          } else {
            const data = {
              ...updateMise,
              mise: parsedMontant,
              addTimestamp: new Date(dateMise || new Date()).getTime(),
              addDate: new Date(dateMise || new Date()).toISOString(),
              updateDate: moment().format(),
            };
            addTransaction(data);
          }
        }
      }
    }, [admin, member, updateMise, dateMise, currentMise, mise, transCategory]);

    const handleDeleteMise = useCallback(() => {
      if (admin.attribut === 'A1' && !!updateMise) {
        const data = {
          ...updateMise,
          isBlocked: true,
        };
        addTransaction(data);
      }
    }, [admin, updateMise]);

    const handleDeleteTransaction = useCallback(() => {
      if (admin.attribut === 'A1' && !!updateTrans) {
        const deletedTrans = currentMise.transactions.find(
          (t) => t.id === updateTrans.id,
        );
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
        const trashData = {
          ...data,
          deletedTrans,
          deletedAt: new Date(date || new Date()).toISOString(),
          code_admin_delete: admin.code,
          transCode: data.code,
        };
        delete trashData['transactions'];
        addTransactionToTrash(trashData);
      }
    }, [admin, updateTrans, currentMise]);

    const onAddOrUpdate = useCallback(() => {
      if (!checkConnection()) return;
      if (!!numeral(montant).value() && !!currentMise) {
        const parsedMontant = numeral(montant).value();
        const checkedType = transCategory === 'E' ? type : 'D';
        let isActive = true;
        let data;

        if (checkedType === 'R' && !updateTrans) {
          const solde = getTransactionsSolde(currentMise.transactions);
          const mise = currentMise?.mise;
          const realSolde = solde - mise;

          if (parsedMontant > realSolde) {
            const message = 'Le montant du retrait ne peut excéder le solde';
            setMontantError(message);
            return;
          }

          if (realSolde - parsedMontant === 0) isActive = false;
        }

        if (transCategory === 'C' && !updateTrans) {
          const solde = getTransactionsSolde(currentMise.transactions);

          if (parsedMontant + solde > 0) {
            const message = 'Le montant depasse le reste à payer !';
            setMontantError(message);
            return;
          }

          if (parsedMontant + solde === 0) isActive = false;
        }

        if (!updateTrans) {
          const newTrans = {
            id: Math.floor(
              Math.random() * Math.floor(Math.random() * Date.now()),
            ).toString(),
            montant: parsedMontant,
            date: new Date(date || new Date()).toISOString(),
            time: new Date(date || new Date()).getTime(),
            createdAt: new Date(date || new Date()).toISOString(),
            type: checkedType,
          };
          data = {
            ...currentMise,
            isActive,
            transactions: [...currentMise.transactions, newTrans],
          };

          if (
            transCategory === 'E' &&
            type === 'R' &&
            admin.attribut === 'A3'
          ) {
            const waitingData = {
              ...data,
              createdAt: new Date(date || new Date()).toISOString(),
              transCode: data.code,
              transaction: newTrans,
              montant: parsedMontant,
              status: 'waiting',
              statusCode: 'W',
              isBlocked: false,
            };
            delete waitingData['transactions'];
            addWaitingTransaction(waitingData);
            return;
          }
        } else {
          const newTrans = currentMise.transactions.map((t) => {
            if (t.id === updateTrans.id)
              return {
                ...t,
                montant: parsedMontant,
                updatedTimestamp: new Date().getTime(),
                updatedDate: new Date().toISOString(),
                code_admin_update: admin.code,
                type: checkedType,
              };
            return t;
          });

          if (transCategory === 'E') {
            if (getTransactionsSolde(newTrans) - currentMise?.mise < 0) {
              const message =
                'Cette modification ne pas possible, veillez changer le montant';
              setMontantError(message);
              return;
            }

            if (getTransactionsSolde(newTrans) === currentMise?.mise)
              isActive = false;
          } else {
            if (getTransactionsSolde(newTrans) > 0) {
              const message =
                'Cette modification ne pas possible, veillez changer le montant';
              setMontantError(message);
              return;
            }

            if (getTransactionsSolde(newTrans) === 0) isActive = false;
          }

          data = {
            ...currentMise,
            updatedTimestamp: new Date().getTime(),
            updatedDate: new Date().toISOString(),
            code_admin_update: admin.code,
            category: transCategory,
            isActive,
            transactions: newTrans,
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
                    title={
                      admin?.attribut === 'A1'
                        ? 'Rendre inactive :'
                        : 'Adresse :'
                    }
                    style={{paddingLeft: 15}}
                    right={(props) =>
                      admin?.attribut !== 'A1' ? (
                        <Text
                          {...props}
                          style={{
                            marginTop: 8,
                            marginRight: 10,
                            color: theme.colors.placeholder,
                          }}>
                          {member?.adresse}
                        </Text>
                      ) : loading ? (
                        <ActivityIndicator
                          animating={true}
                          color={Colors.red800}
                        />
                      ) : (
                        <Switch
                          disabled={!currentMise}
                          value={!currentMise?.isActive}
                          onValueChange={onToggleSwitch}
                        />
                      )
                    }
                  />
                  <Divider />
                  {/* <List.Item title="Activité :" description={member.activite} /> */}
                  <Divider />
                  <List.Item
                    style={{paddingLeft: 15}}
                    title={
                      transCategory === 'E'
                        ? 'Activité :'
                        : 'Montant décaissé :'
                    }
                    right={(props) => (
                      <Text
                        {...props}
                        style={{
                          marginTop: 8,
                          marginRight: 10,
                          color: theme.colors.placeholder,
                        }}>
                        {transCategory === 'E'
                          ? member?.activite
                          : getFormatedNumber(
                              getTransactionsSolde(transactions, 'R') -
                                currentMise?.mise,
                            )}
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
                              (100 * getTransactionsSolde(transactions, 'D')) /
                                getTransactionsSolde(transactions, 'R') || 0,
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
                            ((100 * getTransactionsSolde(transactions, 'D')) /
                              getTransactionsSolde(transactions, 'R') || 0) /
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

              <Card style={{marginBottom: 10, overflow: 'hidden'}}>
                <TabView
                  style={{flex: 1}}
                  selectedIndex={selectedTabIndex}
                  onSelect={handleTabSelect}>
                  <Tab icon={EpargneIcon} title="Epargne">
                    <Card.Content>
                      <Divider />
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
                            ref={selectERef}
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
                            {mises?.map((t, idx) => (
                              <SelectItem
                                key={t.code}
                                accessoryLeft={
                                  t.isActive ? UnlockIcon : LockIcon
                                }
                                accessoryRight={(props) =>
                                  admin?.attribut === 'A1' ? (
                                    <FAB
                                      onPress={() => handleMiseUpdatePress(idx)}
                                      color={Colors.white}
                                      style={{
                                        width: 30,
                                        height: 30,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        backgroundColor: Colors.orange500,
                                      }}
                                      small
                                      icon="pencil"
                                    />
                                  ) : null
                                }
                                title={(props) => (
                                  <Caption
                                    style={{
                                      flex: 1,
                                    }}>{`${getFormatedNumber(
                                    t.mise,
                                  )} | ${getFormatedDate(
                                    t.addTimestamp,
                                  )}`}</Caption>
                                )}
                              />
                            ))}
                          </Select>
                        </View>
                        <View
                          style={{
                            marginTop: 28,
                            marginRight: -10,
                            marginLeft: 10,
                          }}>
                          <FAB
                            style={{
                              backgroundColor: enableNewEpargne
                                ? Colors.green800
                                : Colors.grey500,
                              marginRight: 10,
                              color: 'fff',
                            }}
                            onPress={showAddMiseDialog}
                            disabled={!enableNewEpargne}
                            color={Colors.white}
                            small
                            icon="plus"
                          />
                        </View>
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

                      <View style={{marginTop: 18}}>
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
                            (admin.attribut === 'A3' &&
                              !currentMise?.isActive) ||
                            !mises?.length
                          }
                          error={!!montantError}
                          style={{flex: 1}}
                        />
                        <HelperText visible={!!montantError} type="error">
                          {montantError}
                        </HelperText>
                      </View>
                      <View style={{marginBottom: 25}}>
                        <View>
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
                                <Paragraph
                                  style={{
                                    marginTop: 6,
                                    color: Colors.green500,
                                  }}>
                                  Dépot
                                </Paragraph>
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
                                <Paragraph
                                  style={{
                                    marginTop: 6,
                                    color: Colors.red500,
                                  }}>
                                  Rétrait
                                </Paragraph>
                                <RadioButton
                                  value="R"
                                  color={Colors.red500}
                                  uncheckedColor={Colors.red500}
                                />
                              </View>
                            </View>
                          </RadioButton.Group>
                        </View>
                      </View>
                    </Card.Content>
                  </Tab>
                  <Tab icon={CreditIcon} title="Crédit">
                    <Card.Content>
                      <Divider />
                      <View style={{marginTop: 18}}>
                        <Text
                          style={{
                            color: theme.colors.placeholder,
                            marginBottom: 5,
                          }}>
                          Credits :
                        </Text>

                        {transCategory === 'C' && (
                          <Select
                            style={{
                              backgroundColor: theme.colors.background,
                            }}
                            ref={selectCRef}
                            status="danger"
                            placeholder="Ajouter un crédit"
                            size="medium"
                            selectedIndex={selectedIndex}
                            onSelect={(index) => setSelectedIndex(index)}
                            value={
                              <Text
                                style={{
                                  color: theme.colors.placeholder,
                                }}>
                                {mises?.length
                                  ? `Du ${getFormatedDate(
                                      mises[selectedIndex.row]?.dateDebut,
                                    )} AU ${getFormatedDate(
                                      mises[selectedIndex.row]?.dateFin,
                                    )}`
                                  : 'Ajoutez un crédit !'}
                              </Text>
                            }>
                            {mises?.map((t, idx) => (
                              <SelectItem
                                key={t.code}
                                accessoryLeft={
                                  t.isActive ? UnlockIcon : LockIcon
                                }
                                accessoryRight={(props) =>
                                  admin?.attribut === 'A1' ? (
                                    <FAB
                                      onPress={() => handleMiseUpdatePress(idx)}
                                      color={Colors.white}
                                      style={{
                                        width: 30,
                                        height: 30,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        backgroundColor: Colors.orange500,
                                      }}
                                      small
                                      icon="pencil"
                                    />
                                  ) : null
                                }
                                title={(props) => (
                                  <Caption
                                    style={{
                                      flex: 1,
                                    }}>{`DU ${getFormatedDate(
                                    t.dateDebut,
                                  )} AU ${getFormatedDate(
                                    t.dateFin,
                                  )}`}</Caption>
                                )}
                              />
                            ))}
                          </Select>
                        )}
                      </View>
                      <View
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          backgroundColor: theme.colors.background,
                          borderRadius: 4,
                          marginTop: 20,
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
                      <View style={{marginTop: 20}}>
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
                            (admin.attribut === 'A3' &&
                              !currentMise?.isActive) ||
                            !mises?.length
                          }
                          error={!!montantError}
                          style={{flex: 1}}
                        />
                        <HelperText visible={!!montantError} type="error">
                          {montantError}
                        </HelperText>
                      </View>
                      <View style={{marginTop: 0}}>
                        <FAB
                          style={{
                            backgroundColor: enableNewCredit
                              ? Colors.red600
                              : Colors.grey400,
                            marginRight: 10,
                          }}
                          onPress={showAddCreditDialog}
                          color={Colors.white}
                          small
                          disabled={!enableNewCredit}
                          label="Contracter un crédit"
                          icon="plus"
                        />
                      </View>
                    </Card.Content>
                  </Tab>
                </TabView>

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
                    style={{backgroundColor: Colors.yellow800, width: 115}}
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
                      !mises?.length ||
                      (admin.attribut === 'A3' &&
                        type === 'R' &&
                        !!currentWaiting?.length)
                    }
                    loading={loading}
                    onPress={onAddOrUpdate}
                    mode="contained">
                    {!updateTrans ? 'confirmer' : 'modifier'}
                  </Button>
                </Card.Actions>
              </Card>

              {transCategory === 'E' &&
                !!currentWaiting?.length &&
                ((admin?.attribut !== 'A3' && hasWaitingTrans) ||
                  admin?.attribut === 'A3') && (
                  <Card style={{marginBottom: 10}}>
                    <View style={{marginVertical: 10, marginHorizontal: 15}}>
                      <KittenCard
                        status={
                          currentWaiting[0]?.statusCode === 'A'
                            ? 'success'
                            : currentWaiting[0]?.statusCode === 'W'
                            ? 'warning'
                            : 'danger'
                        }>
                        <Text>
                          {currentWaiting[0]?.statusCode === 'A'
                            ? 'Démande de rétrait accepté !'
                            : currentWaiting[0]?.statusCode === 'W'
                            ? 'Démande de rétrait en attente !'
                            : 'Démande de rétrait réfusé !'}
                        </Text>
                        <Text
                          style={{color: Colors.red800, fontWeight: 'bold'}}>
                          {`Montant: ${getFormatedNumber(
                            currentWaiting[0]?.montant,
                          )}`}
                        </Text>
                      </KittenCard>
                    </View>

                    <Divider />
                    <Card.Actions style={{justifyContent: 'flex-end'}}>
                      {!!admin && admin.attribut === 'A3' ? (
                        <>
                          {currentWaiting[0]?.statusCode === 'A' ? (
                            <Button
                              style={{backgroundColor: Colors.green800}}
                              onPress={onConfirmWaitingTrans}
                              disabled={loading}
                              mode="contained">
                              effectuer
                            </Button>
                          ) : (
                            <Button
                              style={{backgroundColor: Colors.red500}}
                              onPress={onDeleteWaitingTrans}
                              disabled={loading}
                              mode="contained">
                              {currentWaiting[0]?.statusCode === 'W'
                                ? 'Annuler la demande'
                                : 'rétirer'}
                            </Button>
                          )}
                        </>
                      ) : (
                        <>
                          <Button
                            style={{
                              backgroundColor: Colors.red800,
                              width: 115,
                            }}
                            onPress={onResponseWaitingTrans('R')}
                            disabled={loading}
                            mode="contained">
                            réfuser
                          </Button>
                          <Button
                            style={{
                              marginLeft: 10,
                              backgroundColor: Colors.green500,
                              width: 115,
                            }}
                            disabled={
                              loading ||
                              (admin.attribut === 'A3' &&
                                !currentMise?.isActive) ||
                              !mises?.length
                            }
                            loading={loading}
                            onPress={onResponseWaitingTrans('A')}
                            mode="contained">
                            accepter
                          </Button>
                        </>
                      )}
                    </Card.Actions>
                  </Card>
                )}

              <Card
                style={{
                  borderBottomColor: Colors.grey400,
                  borderBottomWidth: 1,
                }}>
                <View
                  style={{
                    backgroundColor:
                      transCategory === 'E' ? Colors.green800 : Colors.red800,
                    paddingHorizontal: 10,
                    paddingTop: 10,
                    padding: 10,
                    borderTopStartRadius: 4,
                    borderTopEndRadius: 4,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={{color: Colors.white, fontWeight: 'bold'}}>
                    {transCategory === 'E'
                      ? 'Solde du membre :'
                      : 'Reste à payer :'}
                  </Text>
                  <Text style={{color: Colors.grey300}}>
                    {getFormatedNumber(
                      transCategory === 'E'
                        ? getTransactionsSolde(transactions) -
                            currentMise?.mise <
                          0
                          ? 0
                          : getTransactionsSolde(transactions) -
                            currentMise?.mise
                        : getTransactionsSolde(transactions, 'R') -
                            getTransactionsSolde(transactions, 'D'),
                    )}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor:
                      transCategory === 'E' ? Colors.green800 : Colors.red800,
                    paddingHorizontal: 10,
                    paddingBottom: 10,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={{color: Colors.white, fontWeight: 'bold'}}>
                    {transCategory === 'E' ? 'Solde Total :' : 'Total payé :'}
                  </Text>
                  <Text style={{color: Colors.grey300}}>
                    {getFormatedNumber(
                      transCategory === 'E'
                        ? getTransactionsSolde(transactions)
                        : getTransactionsSolde(transactions, 'D'),
                    )}
                  </Text>
                </View>
              </Card>

              <Table
                headerBackground={
                  transCategory === 'E' ? Colors.green800 : Colors.red800
                }
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
                rows={sortTransactions(transactions)}
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

        <Portal>
          <Dialog visible={openAddMiseDialog} onDismiss={hideAddMiseDialog}>
            <Dialog.Title>
              {!updateMise ? 'Ajouter une mise' : 'Modifier la mise'}
            </Dialog.Title>
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

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  backgroundColor: theme.colors.background,
                  borderRadius: 4,
                  borderColor: theme.colors.placeholder,
                  borderWidth: 1,
                  marginVertical: 12,
                  marginBottom: 20,
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
                    {getFormatedDate(dateMise)}
                  </Text>
                </View>

                <IconButton
                  icon="calendar-month"
                  color={Colors.green700}
                  size={20}
                  onPress={() => setShowDateMise(true)}
                  disabled={
                    admin.attribut === 'A3' ||
                    (admin.attribut === 'A2' && !!updateTrans)
                  }
                />
              </View>
            </Dialog.ScrollArea>
            <Dialog.Actions>
              {!!admin && admin.attribut === 'A1' && !!updateMise && (
                <FAB
                  style={{
                    backgroundColor: Colors.red500,
                    marginRight: 10,
                    color: 'fff',
                  }}
                  disabled={loading}
                  color={Colors.white}
                  small
                  icon="delete"
                  onPress={handleDeleteMise}
                />
              )}
              <Button
                style={{backgroundColor: Colors.yellow800, width: 115}}
                mode="contained"
                disabled={loading}
                loading={loading}
                onPress={hideAddMiseDialog}>
                annuler
              </Button>
              <Button
                style={{
                  marginLeft: 10,
                  backgroundColor: Colors.green500,
                  width: 115,
                }}
                mode="contained"
                disabled={loading}
                loading={loading}
                onPress={handleAddMisePress}>
                {!updateMise ? 'confirmer' : 'modifier'}
              </Button>
            </Dialog.Actions>
          </Dialog>
          <Dialog
            visible={openAddCreditDialog}
            onDismiss={hideAddCreditDialog}
            style={{flex: 1}}>
            <Dialog.Title>
              {!updateMise ? 'Ajouter un crédit' : 'Modifier le crédit'}
            </Dialog.Title>
            <Dialog.ScrollArea>
              <ScrollView>
                <View style={{marginVertical: 12}}>
                  <Text
                    style={{
                      color: theme.colors.placeholder,
                      marginBottom: 5,
                    }}>
                    Date decaissement :
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      backgroundColor: theme.colors.background,
                      borderRadius: 4,
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
                        {getFormatedDate(dateMise)}
                      </Text>
                    </View>

                    <IconButton
                      icon="calendar-month"
                      color={Colors.green700}
                      size={20}
                      onPress={() => setShowDateMise(true)}
                      disabled={
                        admin.attribut === 'A3' ||
                        (admin.attribut === 'A2' && !!updateTrans)
                      }
                    />
                  </View>
                </View>

                <View style={{marginVertical: 12}}>
                  <Text
                    style={{
                      color: theme.colors.placeholder,
                      marginBottom: 5,
                    }}>
                    Periode de rembourssement :
                  </Text>

                  <Select
                    ref={selectERef}
                    status="danger"
                    placeholder="Choisir la mise"
                    size="medium"
                    selectedIndex={selectedMouthIndex}
                    onSelect={(index) => setSelectedMouthIndex(index)}
                    value={
                      <Text
                        style={{
                          color: theme.colors.placeholder,
                        }}>
                        {MOUTH_LIST[selectedMouthIndex.row]?.title}
                      </Text>
                    }>
                    {MOUTH_LIST.map((item, idx) => (
                      <SelectItem
                        key={idx}
                        title={(props) => (
                          <Text style={{flex: 1}}>{item.title}</Text>
                        )}
                      />
                    ))}
                  </Select>
                </View>

                <View style={{marginVertical: 12}}>
                  <TextInput
                    mode="outlined"
                    label="Montant du crédit"
                    dense
                    value={
                      !!numeral(credit).value()
                        ? numeral(credit).format('0,0[.]00')
                        : null
                    }
                    onChangeText={(text) => setCredit(text)}
                    keyboardType="numeric"
                  />
                </View>

                <View style={{marginVertical: 12}}>
                  <TextInput
                    mode="outlined"
                    label="Interêt"
                    dense
                    disabled
                    value={
                      !!numeral(interet).value()
                        ? numeral(interet).format('0,0[.]00')
                        : null
                    }
                    onChangeText={(text) => setInteret(text)}
                    keyboardType="numeric"
                  />
                </View>

                <View style={{marginVertical: 12}}>
                  <TextInput
                    mode="outlined"
                    label="Frais document"
                    dense
                    error={!!margeError}
                    value={
                      !!numeral(marge).value()
                        ? numeral(marge).format('0,0[.]00')
                        : null
                    }
                    onChangeText={(text) => setMarge(text)}
                    keyboardType="numeric"
                  />
                  <HelperText visible={!!margeError} type="error">
                    {margeError}
                  </HelperText>
                </View>

                <View style={{marginVertical: 12, marginBottom: 20}}>
                  <KittenCard status="danger">
                    <Text>
                      Total à rembourser: {getFormatedNumber(totalCredit)}
                    </Text>
                  </KittenCard>
                </View>
              </ScrollView>
            </Dialog.ScrollArea>
            <Dialog.Actions>
              {!!admin && admin.attribut === 'A1' && !!updateMise && (
                <FAB
                  style={{
                    backgroundColor: Colors.red500,
                    marginRight: 10,
                    color: 'fff',
                  }}
                  disabled={loading}
                  color={Colors.white}
                  small
                  icon="delete"
                  onPress={handleDeleteMise}
                />
              )}
              <Button
                style={{backgroundColor: Colors.yellow800, width: 115}}
                mode="contained"
                disabled={loading}
                loading={loading}
                onPress={hideAddCreditDialog}>
                annuler
              </Button>
              <Button
                style={{
                  marginLeft: 10,
                  backgroundColor: Colors.green500,
                  width: 115,
                }}
                mode="contained"
                disabled={loading}
                loading={loading}
                onPress={handleAddCreditPress}>
                {!updateMise ? 'confirmer' : 'modifier'}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <Portal>
          {showDateMise && (
            <DateTimePicker
              testID="dateTimePicker1"
              value={new Date(dateMise)}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={onDateMiseChange}
            />
          )}

          {showDate && (
            <DateTimePicker
              testID="dateTimePicker1"
              value={new Date(date)}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={onDateChange}
            />
          )}
        </Portal>
      </>
    );
  },
);

const mapStateToProps = (state) => ({
  transactionsState: state.transactions,
  admin: state.admin.data,
  admins: state.admin.list,
  settings: state.settings,
  members: state.members.data,
});

export default connect(mapStateToProps, {
  addTransaction,
  addWaitingTransaction,
  addTransactionToTrash,
  updateWaitingTransaction,
  deleteWaitingTransaction,
  getTransaction,
  updateTransaction,
  deleteMise,
  addMise,
})(TransactionScreen);

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    padding: 20,
  },
});
