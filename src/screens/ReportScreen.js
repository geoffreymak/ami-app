import React, {useCallback, useEffect, useState, useRef, memo} from 'react';
import {StyleSheet, Dimensions, ImageBackground, View} from 'react-native';
import * as XLSX from 'xlsx';
//import PDFReader from 'rn-pdf-reader-js';
import Pdf from 'react-native-pdf';
import Share from 'react-native-share';
import RNPrint from 'react-native-print';
import {useSelector, useDispatch} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import {Appbar, useTheme, Paragraph, Colors} from 'react-native-paper';

import {FileSystem, Permissions} from 'react-native-unimodules';

//import * as Notifications from 'expo-notifications';
import * as MediaLibrary from 'expo-media-library';

import generateReport from '../utils/reports/generateReport';
import getMiseSolde from '../utils/transactions/getMiseSolde';
import mergeTransactionFromMise from '../utils/transactions/mergeTransactionFromMise';

//import {getTransactions} from '../redux/actions/transactionActions';

import Loading from '../components/Loading';

import {
  MEMBERS_CARD,
  ACTIVE_MEMBERS_LIST,
  ACTIVE_MEMBERS_GLOBAL_LIST,
  TRANSACTION_BALANCE,
  TRANSACTION_GLOBAL_BALANCE,
  MISE_BALANCE,
  MISE_GLOBAL_BALANCE,
} from '../components/ReportDialog';

const FILE_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
//const FILE_EXTENTION = '.xlsx';

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

  const getMembersCardData = useCallback(() => {
    let adminsMise = [];
    const selectedAdmin =
      admin?.attribut === 'A3' ? admin : reportData.selectedItem;

    let cleanedMises = {};
    /*   let cleanedMises = []; */
    mises
      .filter(
        (mise) =>
          mise.code_admin === selectedAdmin.code &&
          mise.category === reportData.transCategory &&
          !!mise?.transactions?.length,
      )
      .forEach((mise) => {
        const member = members.find((member) => member.compte === mise.compte);
        const memberMises = mises.filter(
          (mise) =>
            mise.compte === member?.compte &&
            mise.category === reportData.transCategory,
        );

        if (!!member && !cleanedMises.hasOwnProperty(member?.compte)) {
          cleanedMises = {
            ...cleanedMises,
            [member?.compte]: {mise: memberMises, member},
          };
        }
      });

    const data = Object.values(cleanedMises);

    if (!!data?.length) {
      let sortedData = data.sort((a, b) =>
        a?.member?.nom.localeCompare(b?.member?.nom),
      );

      if (admin?.attribut === 'A3') {
        sortedData = sortedData.filter(
          (d) => d?.member?.code === reportData.selectedItem?.code,
        );
      }
      adminsMise = [{admin: selectedAdmin, data: sortedData}];
    }

    return adminsMise;
  }, [mises, members, admins, admin, reportData]);

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

    console.log(
      'adminTrans',
      mergeTransactionFromMise(mises, reportData.transCategory),
    );

    if (!!adminTrans?.length) {
      adminsTransaction = [{admin: selectedAdmin, transaction: adminTrans}];
    }
    return adminsTransaction;
  }, [mises, members, admins, admin, reportData]);

  const getAdminGlobalTransData = useCallback(() => {
    let adminsTransaction = [];

    const transactions = mergeTransactionFromMise(
      mises,
      reportData.transCategory,
    );

    admins?.forEach((selectedAdmin) => {
      const adminTrans = transactions
        .filter((transaction) => transaction.code_admin === selectedAdmin.code)
        .map((transaction) => {
          const memberName = members.find(
            (member) => member.compte === transaction.compte,
          )?.nom;
          return {...transaction, memberName};
        });

      if (!!adminTrans?.length) {
        adminsTransaction = [
          ...adminsTransaction,
          {admin: selectedAdmin, transaction: adminTrans},
        ];
      }
    });
    const sortedAdminsTransaction = adminsTransaction.sort((a, b) =>
      a?.admin?.nom.localeCompare(b?.admin?.nom),
    );
    return sortedAdminsTransaction;
  }, [mises, members, admins, admin, reportData]);

  const getAdminMiseData = useCallback(() => {
    let adminsMise = [];
    const selectedAdmin =
      admin?.attribut === 'A3' ? admin : reportData.selectedItem;

    /* let cleanedMises = {}; */
    let cleanedMises = [];
    mises
      .filter(
        (mise) =>
          mise.code_admin === selectedAdmin.code &&
          mise.category === reportData.transCategory &&
          !!mise?.transactions?.length,
      )
      .forEach((mise) => {
        const member = members.find((member) => member.compte === mise.compte);
        /*  const memberMises = mises.filter(
          (mise) => mise.compte === member?.compte,
        ); */

        /*  if (!!member && !cleanedMises.hasOwnProperty(member?.compte)) {
          const solde = getMiseSolde(memberMises, reportData.transCategory);
          cleanedMises = {
            ...cleanedMises,
            [member?.compte]: {...mise, solde, member},
          };
        } */

        if (!!member) {
          const solde = getMiseSolde([mise], reportData.transCategory);
          cleanedMises = [...cleanedMises, {...mise, solde, member}];
        }
      });

    /*  const data = Object.values(cleanedMises); */
    const data = cleanedMises;
    if (!!data?.length) {
      adminsMise = [{admin: selectedAdmin, mise: data}];
    }

    return adminsMise;
  }, [mises, members, admins, admin, reportData]);

  const getAdminGlobalMiseData = useCallback(() => {
    let adminsMise = [];

    /* let cleanedMises = {}; */

    admins?.forEach((selectedAdmin) => {
      let cleanedMises = [];

      mises
        .filter(
          (mise) =>
            mise.code_admin === selectedAdmin.code &&
            mise.category === reportData.transCategory &&
            !!mise?.transactions?.length,
        )
        .forEach((mise) => {
          const member = members.find(
            (member) => member.compte === mise.compte,
          );

          if (!!member) {
            const solde = getMiseSolde([mise], reportData.transCategory);
            cleanedMises = [...cleanedMises, {...mise, solde, member}];
          }
        });
      /*  const data = Object.values(cleanedMises); */
      const data = cleanedMises;
      if (!!data?.length) {
        adminsMise = [...adminsMise, {admin: selectedAdmin, mise: data}];
      }
    });

    const sortedAdminsMise = adminsMise.sort((a, b) =>
      a?.admin?.nom.localeCompare(b?.admin?.nom),
    );
    return sortedAdminsMise;
  }, [mises, members, admins, admin, reportData]);

  /* const getMembersCardData = useCallback(
    (member = null) => {
      const selectedItem = member || reportData.selectedItem;
      const memberData = (selectedMember) => {
        let membersTransaction = [];
        const memberMises = mises.filter(
          (mise) => mise.compte === selectedMember?.compte,
        );
        const miseSolde = getMiseSolde(memberMises, reportData.transCategory);
        const memberTrans = mergeTransactionFromMise(
          mises,
          reportData.transCategory,
        ).filter(
          (transaction) => transaction.compte === selectedMember?.compte,
        );
        if (!!memberTrans?.length) {
          membersTransaction = [
            ...membersTransaction,
            {member: selectedMember, transaction: memberTrans, miseSolde},
          ];
        }
        return membersTransaction;
      };

      if (member) {
        return memberData(selectedItem);
      }

      if (admin?.attribut === 'A3') {
        return memberData(selectedMember);
      }

      return members
        .filter((m) => m.code_admin === selectedItem.code)
        .map((m) => memberData(m)[0])
        .filter((m) => !!m);
    },
    [mises, reportData, members],
  ); */

  /*   const getMembersListData = useCallback(() => {
    let adminMembers = [];
    let membersTransactions = [];
    const selectedAdmin =
      admin?.attribut === 'A3' ? admin : reportData.selectedItem;

    members
      .filter((m) => m.code_admin === selectedAdmin.code)
      .forEach((member) => {
        const memberTrans = getMembersCardData(member);
        if (memberTrans?.length) {
          membersTransactions = [...membersTransactions, ...memberTrans];
        }
      });

    if (!!membersTransactions?.length) {
      adminMembers = [
        ...adminMembers,
        {admin: selectedAdmin, data: membersTransactions},
      ];
    }

    return adminMembers;
  }, [members, reportData, getMembersCardData]); */

  const getTransactionsData = useCallback(() => {
    switch (reportData.report) {
      case MEMBERS_CARD: {
        return getMembersCardData();
      }
      case ACTIVE_MEMBERS_LIST: {
        return getAdminMiseData();
      }
      case ACTIVE_MEMBERS_GLOBAL_LIST: {
        return getAdminGlobalMiseData();
      }
      case TRANSACTION_BALANCE: {
        return getAdminTransData();
      }
      case TRANSACTION_GLOBAL_BALANCE: {
        return getAdminGlobalTransData();
      }
      case MISE_BALANCE: {
        return getAdminMiseData();
      }
      case MISE_GLOBAL_BALANCE: {
        return getAdminGlobalMiseData();
      }
      default: {
        break;
      }
    }
  }, [
    reportData,
    getAdminTransData,
    getAdminGlobalTransData,
    getAdminMiseData,
    getMembersCardData,
    getAdminGlobalMiseData,
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
        console.log('pdfUri', pdfUriB64);
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

  const onSavePdf = useCallback(async () => {
    if (!!pdfUri) {
      await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
      try {
        const asset = await MediaLibrary.createAssetAsync(pdfUri?.pdfUriB64);
        const album = await MediaLibrary.getAlbumAsync('Download');
        if (album == null) {
          await MediaLibrary.createAlbumAsync('Download', asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }
      } catch (e) {
        console.log(e);
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
        {!!pdfUri && <Appbar.Action onPress={onSavePdf} icon="download" />}
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
