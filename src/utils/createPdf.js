import * as Print from 'expo-print';
//import * as MediaLibrary from "expo-media-library";
//import * as Sharing from "expo-sharing";
import {
  createMemberListeTable,
  createMemberCardTable,
  createAdminBalanceDaysTable,
} from './createHtml';

export const createPDF = async (html) => {
  try {
    const {uri} = await Print.printToFileAsync({html});
    //const results = await RNHTMLtoPDF.convert(options);
    return uri;
  } catch (err) {
    console.error(err);
  }
};

export const createAndSavePDF = async (html) => {
  try {
    //const uri = await createPDF(html);
    if (Platform.OS === 'ios') {
      // await Sharing.shareAsync(uri);
    } else {
      //const permission = await MediaLibrary.requestPermissionsAsync();

      if (permission.granted) {
        // await MediaLibrary.createAssetAsync(uri);
      }
    }
    return uri;
  } catch (error) {
    console.error(error);
  }
};

const getHtmlTemplate = (report) => {
  switch (report) {
    case 'members-actif':
      return createMemberListeTable;

    case 'members-fiche':
      return createMemberCardTable;

    case 'admins-balance-days':
      return createAdminBalanceDaysTable;
    default:
      return;
  }
};

export const generateTable = async (data, report, admins) => {
  try {
    const template = getHtmlTemplate(report);
    if (template) {
      console.log('Succesfully created an HTML table');
      const html = template(data, admins);
      const uri = await createPDF(html);
      return uri;
    }
  } catch (error) {
    console.log('Error generating table', error);
  }
};
