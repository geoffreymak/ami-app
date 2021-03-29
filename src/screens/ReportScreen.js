import React, {useCallback, useEffect, useState, useRef, memo} from 'react';
import {
  StyleSheet,
  Dimensions,
  ImageBackground,
  View,
  Linking,
} from 'react-native';
import * as XLSX from 'xlsx';
import PDFReader from 'rn-pdf-reader-js';
import Pdf from 'react-native-pdf';
import Share from 'react-native-share';
import RNPrint from 'react-native-print';
import {useSelector, useDispatch} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import {Appbar, Surface, useTheme, Paragraph, Colors} from 'react-native-paper';

import {FileSystem} from 'react-native-unimodules';

import generateReport from '../utils/reports/generateReport';
import getMiseSolde from '../utils/transactions/getMiseSolde';
import mergeTransactionFromMise from '../utils/transactions/mergeTransactionFromMise';

import {getTransactions} from '../redux/actions/transactionActions';

import Loading from '../components/Loading';

import {
  ACTIVE_MEMBERS_LIST,
  MEMBERS_CARD,
  TRANSACTION_BALANCE,
  MISE_BALANCE,
} from '../components/ReportDialog';

const FILE_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const FILE_EXTENTION = '.xlsx';

//onst HtmlTableToJson = require('html-table-to-json');

const ReportScreen = memo((props) => {
  const {navigation, route} = props;
  const {data: reportData} = route.params;
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [pdfUri, setPdfUri] = useState(null);
  const [htmlTable, setHtmlTable] = useState(null);
  const dispatch = useDispatch();
  const isLoaded = useRef(false);
  const admin = useSelector((state) => state.admin.data);
  const admins = useSelector((state) => state.admin.list);
  const members = useSelector((state) => state.members.data);
  const transactions = useSelector((state) => state.transactions.data);
  const mises = useSelector((state) => state.transactions.data);

  useFocusEffect(
    useCallback(() => {
      // Do something when the screen is focused
      return () => {
        isLoaded.current = false;
        setPdfUri(null);
      };
    }, []),
  );

  const getAdminTransData = useCallback(() => {
    let adminsTransaction = [];
    const selectedAdmin =
      admin?.attribut === 'A3' ? admin : reportData.selectedItem;
    const adminTrans = mergeTransactionFromMise(mises, reportData.transCategory)
      .filter((transaction) => transaction.code_admin === selectedAdmin.code)
      .map((transaction) => {
        const memberName = members.find(
          (member) => member.compte === transaction.compte,
        )?.nom;
        return {...transaction, memberName};
      });

    if (!!adminTrans?.length) {
      adminsTransaction = [{admin: selectedAdmin, transaction: adminTrans}];
    }
    if (admin && admin.attribut === 'A3') {
    }
    /*  else {
      admins.forEach((admin) => {
        const adminTrans = mergeTransactionFromMise(mises)
          .filter((transaction) => transaction.code_admin === admin.code)
          .map((transaction) => {
            const memberName = members.find(
              (member) => member.compte === transaction.compte,
            )?.nom;
            return {...transaction, memberName};
          });

        if (!!adminTrans?.length) {
          adminsTransaction = [
            ...adminsTransaction,
            {admin, transaction: adminTrans},
          ];
        }
      });

      const superAdminTrans = mergeTransactionFromMise(mises)
        .filter((transaction) => transaction.code_admin === admin.code)
        .map((transaction) => {
          const memberName = members.find(
            (member) => member.compte === transaction.compte,
          )?.nom;
          return {...transaction, memberName};
        });

      if (!!superAdminTrans?.length) {
        adminsTransaction = [
          ...adminsTransaction,
          {admin, transaction: superAdminTrans},
        ];
      }
    } */
    return adminsTransaction;
  }, [mises, members, admins, admin, reportData]);

  const getAdminMiseData = useCallback(() => {
    let adminsMise = [];
    const selectedAdmin =
      admin?.attribut === 'A3' ? admin : reportData.selectedItem;

    let cleanedMises = {};
    mises
      .filter((mise) => mise.code_admin === selectedAdmin.code)
      .forEach((mise) => {
        const member = members.find((member) => member.compte === mise.compte);
        const memberMises = mises.filter(
          (mise) => mise.compte === member?.compte,
        );
        if (!!member && !cleanedMises.hasOwnProperty(member?.compte)) {
          const solde = getMiseSolde(memberMises, reportData.transCategory);
          cleanedMises = {
            ...cleanedMises,
            [member?.compte]: {...mise, solde, member},
          };
        }
      });

    const data = Object.values(cleanedMises);
    if (!!data?.length) {
      adminsMise = [{admin: selectedAdmin, mise: data}];
    }
    /* if (admin && admin.attribut === 'A3') {
      let cleanedMises = {};
      mises
        .filter((mise) => mise.code_admin === admin.code)
        .forEach((mise) => {
          const member = members.find(
            (member) => member.compte === mise.compte,
          );
          const memberMises = mises.filter(
            (mise) => mise.compte === member?.compte,
          );
          if (!!member && !cleanedMises.hasOwnProperty(member?.compte)) {
            const solde = getMiseSolde(memberMises, reportData.transCategory);
            cleanedMises = {
              ...cleanedMises,
              [member?.compte]: {...mise, solde, member},
            };
          }
        });

      const data = Object.values(cleanedMises);
      if (!!data?.length) {
        adminsMise = [{admin, mise: data}];
      }
    } else {
      admins.forEach((admin) => {
        let cleanedMises = {};
        mises
          .filter((mise) => mise.code_admin === admin.code)
          .forEach((mise) => {
            const member = members.find(
              (member) => member.compte === mise.compte,
            );
            const memberMises = mises.filter(
              (mise) => mise.compte === member?.compte,
            );

            if (!!member && !cleanedMises.hasOwnProperty(member?.compte)) {
              const solde = getMiseSolde(memberMises, reportData.transCategory);
              cleanedMises = {
                ...cleanedMises,
                [member?.compte]: {...mise, solde, member},
              };
            }
          });

        const data = Object.values(cleanedMises);
        if (!!data?.length) {
          adminsMise = [...adminsMise, {admin, mise: data}];
        }
      });

      let cleanedMises = {};
      mises
        .filter((mise) => mise.code_admin === admin.code)
        .forEach((mise) => {
          const member = members.find(
            (member) => member.compte === mise.compte,
          );
          const memberMises = mises.filter(
            (mise) => mise.compte === member?.compte,
          );

          if (!!member && !cleanedMises.hasOwnProperty(member?.compte)) {
            const solde = getMiseSolde(memberMises, reportData.transCategory);
            cleanedMises = {
              ...cleanedMises,
              [member?.compte]: {...mise, solde, member},
            };
          }
        });

      const data = Object.values(cleanedMises);
      if (!!data?.length) {
        adminsMise = [...adminsMise, {admin, mise: data}];
      }
    } */
    return adminsMise;
  }, [mises, members, admins, admin, reportData]);

  const getMembersCardData = useCallback(() => {
    let membersTransaction = [];
    members.forEach((member) => {
      const memberMises = mises.filter(
        (mise) => mise.compte === member?.compte,
      );
      const miseSolde = getMiseSolde(memberMises, reportData.transCategory);
      const memberTrans = mergeTransactionFromMise(mises).filter(
        (transaction) => transaction.compte === member.compte,
      );
      if (!!memberTrans?.length) {
        membersTransaction = [
          ...membersTransaction,
          {member, transaction: memberTrans, miseSolde},
        ];
      }
    });
    return membersTransaction;
  }, [mises, members, reportData.transCategory]);

  const getMembersListData = useCallback(() => {
    let membersTransaction = [];
    const membersData = getMembersCardData();
    admins?.forEach((admin) => {
      const memberTrans = membersData.filter(
        (data) => admin.code === data?.member?.code_admin,
      );

      if (!!memberTrans?.length) {
        membersTransaction = [
          ...membersTransaction,
          {admin, data: memberTrans},
        ];
      }
    });
    return membersTransaction;
  }, [admins, getMembersCardData]);

  const getTransactionsData = useCallback(() => {
    switch (reportData.report) {
      case ACTIVE_MEMBERS_LIST: {
        return getMembersListData();
      }
      case MEMBERS_CARD: {
        return getMembersCardData();
      }
      case TRANSACTION_BALANCE: {
        return getAdminTransData();
      }
      case MISE_BALANCE: {
        return getAdminMiseData();
      }
      default: {
        break;
      }
    }
  }, [
    reportData,
    getAdminTransData,
    getMembersCardData,
    getAdminMiseData,
    getMembersListData,
  ]);

  const exportToCSV = async (table) => {
    const ws = XLSX.utils.json_to_sheet(table);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Members');
    const wbout = XLSX.write(wb, {bookType: 'xlsx', type: 'base64'});
    const uri = FileSystem.documentDirectory + 'members.xlsx';

    await FileSystem.writeAsStringAsync(uri, wbout, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const options = {
      message: 'Envoi des fichier',
      title: 'Envoi des fichier excel',
      url: uri,
      type: FILE_TYPE,
    };

    //Share.open(options);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      isLoaded.current = true;
      try {
        const data = getTransactionsData();
        console.log('TransactionsData', data);
        const start = new Date().getTime();
        const [pdfUriB64, pdfUri, html] = await generateReport(
          data,
          reportData.report,
          admins,
          reportData.dates,
          reportData.transCategory,
        );
        const end = new Date().getTime();
        console.log('generateReport', end - start);
        setLoading(false);
        setPdfUri({pdfUriB64, pdfUri, html});
      } catch (err) {
        console.log('error on fetch report :', err);
        setLoading(false);
      }
    };

    if (isLoaded.current === false) {
      fetchData();
    }
  }, [reportData, admins, getTransactionsData]);

  /* useEffect(() => {
    if (!!reportData && !!admin) {
      dispatch(getTransactions(admin, reportData.transCategory));
      console.log('getTransactions', reportData.transCategory);
    }
  }, [reportData, admin]); */

  const onPrint = useCallback(async () => {
    if (pdfUri) {
      try {
        await RNPrint.print({html: pdfUri?.html});
      } catch (err) {
        console.error(err);
      }
    }
  }, [pdfUri]);

  const onSharePdf = useCallback(async () => {
    if (!!pdfUri) {
      try {
        const options = {
          message: 'Envoi des PDF',
          title: 'Envoi des fichier PDF',
          url: pdfUri?.pdfUriB64,
          type: 'application/pdf',
        };

        Share.open(options);
      } catch (err) {
        console.error(err);
      }
    }
  }, [pdfUri]);

  const source = {
    uri: pdfUri?.pdfUriB64,
    cache: true,
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Rapport" />
        {!!pdfUri && <Appbar.Action onPress={onPrint} icon="printer" />}
        {!!pdfUri && <Appbar.Action onPress={onSharePdf} icon="share" />}
      </Appbar.Header>

      {!!pdfUri && !loading ? (
        <ImageBackground
          blurRadius={20}
          source={require('../assets/images/jason-leung-SAYzxuS1O3M-unsplash.jpg')}
          style={{
            flex: 1,
            resizeMode: 'cover',
            justifyContent: 'center',
            backgroundColor: theme.colors.background2,
          }}>
          <View style={[styles.container]}>
            <Pdf
              source={source}
              onLoadComplete={(numberOfPages, filePath) => {
                console.log(`number of pages: ${numberOfPages}`);
              }}
              onPageChanged={(page, numberOfPages) => {
                console.log(`current page: ${page}`);
              }}
              onError={(error) => {
                console.log(error);
              }}
              onPressLink={(uri) => {
                console.log(`Link presse: ${uri}`);
              }}
              enablePaging={false}
              style={styles.pdf}
            />
          </View>
        </ImageBackground>
      ) : (
        <View
          style={[
            styles.activityIndicator,
            {backgroundColor: theme.colors.background2},
          ]}>
          <Loading autoPlay loop />
          <View style={[styles.waitingText]}>
            <Paragraph>Veillez patienter un moment !</Paragraph>
          </View>
        </View>
      )}

      {/*pdfUri && <PDFReader source={{uri: pdfUri}} />*/}
    </>
  );
});

export default ReportScreen;

const styles = StyleSheet.create({
  surface: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activityIndicator: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 20,
  },

  waitingText: {},

  pdf: {
    flex: 1,
    width: Dimensions.get('window').width - 20,
    height: Dimensions.get('window').height,
    backgroundColor: 'transparent',
    paddingVertical: 10,
  },
});
