import React, {useCallback, useEffect, useState, useRef} from 'react';
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

import {getTransactions} from '../redux/actions/transactionActions';

import Loading from '../components/Loading';
const fileType =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const fileExtension = '.xlsx';

//onst HtmlTableToJson = require('html-table-to-json');

const ReportScreen = (props) => {
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
  const transactions = useSelector((state) => state.transactions.list);

  useFocusEffect(
    useCallback(() => {
      // Do something when the screen is focused
      return () => {
        isLoaded.current = false;
        setPdfUri(null);
      };
    }, []),
  );

  const transactionsLoadingState = useSelector(
    (state) => state.transactions.adding,
  );

  const getBalanceData = useCallback(() => {
    let adminsTransaction = [];
    if (admin && admin.attribut === 'A3') {
      const adminTrans = transactions
        .filter((transaction) => transaction.code_admin === admin.code)
        .map((transaction) => {
          const memberName = members.find(
            (member) => member.compte === transaction.compte,
          )?.nom;
          return {...transaction, memberName};
        });

      adminsTransaction = [{admin, transaction: adminTrans}];
    } else {
      admins.forEach((admin) => {
        const adminTrans = transactions
          .filter((transaction) => transaction.code_admin === admin.code)
          .map((transaction) => {
            const memberName = members.find(
              (member) => member.compte === transaction.compte,
            )?.nom;
            return {...transaction, memberName};
          });

        adminsTransaction = [
          ...adminsTransaction,
          {admin, transaction: adminTrans},
        ];
      });
    }

    return adminsTransaction;
  }, [transactions, members, admins, admin]);

  const getMembersCardData = useCallback(() => {
    let membersTransaction = [];
    members.forEach((member) => {
      const memberTrans = transactions.filter(
        (transaction) => transaction.compte === member.compte,
      );

      membersTransaction = [
        ...membersTransaction,
        {member, transaction: memberTrans},
      ];
    });

    return membersTransaction;
  }, [transactions, members]);

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
      type: fileType,
    };

    //Share.open(options);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      isLoaded.current = true;
      try {
        const data =
          reportData.report === 'DailyBalance'
            ? getBalanceData()
            : getMembersCardData();

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

    if (transactionsLoadingState.success && isLoaded.current === false) {
      fetchData();
    }
  }, [transactionsLoadingState.success, loading, getBalanceData, reportData]);

  useEffect(() => {
    if (!!reportData && !!admin) {
      dispatch(getTransactions(admin, reportData.transCategory));
      console.log('getTransactions', reportData.transCategory);
    }
  }, [reportData, admin]);

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
};

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
