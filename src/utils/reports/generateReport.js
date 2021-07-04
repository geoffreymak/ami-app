import * as Print from 'expo-print';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import {FileSystem} from 'react-native-unimodules';
import createTable from './createTable';

const createPDF = async (html) => {
  try {
    const {uri} = await Print.printToFileAsync({html});
    return uri;
  } catch (err) {
    console.error(err);
  }
};

const generateReport = async (
  data,
  reportType,
  admins,
  dates,
  transCategory,
) => {
  try {
    const start = new Date().getTime();
    console.log('reportType', reportType);
    const html = createTable(reportType, data, admins, dates, transCategory);
    const end = new Date().getTime();
    console.log('generateHtml', end - start);

    const uri = `${
      FileSystem.documentDirectory
    }${reportType}_${transCategory}_${new Date().getTime()}.pdf`;

    const start1 = new Date().getTime();
    const {base64, filePath} = await RNHTMLtoPDF.convert({html, base64: true});
    const end1 = new Date().getTime();
    console.log('RNHTMLtoPDF', end1 - start1);

    const start2 = new Date().getTime();
    await FileSystem.writeAsStringAsync(uri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const end2 = new Date().getTime();
    console.log('writeAsStringAsync', end2 - start2);

    console.log('generating pdf success : ', uri);
    return [uri, filePath, html];
  } catch (e) {
    console.log('Error generating pdf', e);
  }
};

export default generateReport;
