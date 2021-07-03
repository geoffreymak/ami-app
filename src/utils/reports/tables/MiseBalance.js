import numeral from 'numeral';
import moment from 'moment';

import getTransactionsSolde from '../../transactions/getTransactionsSolde';
import sortTransactions from '../../transactions/sortTransactions';
import filterTransactions from '../../transactions/filterTransactions';
import mergeMiseSolde from '../../transactions/mergeMiseSolde';
import getAdminAttribut from '../../admins/getAdminAttribut';
import getMemberFromTransaction from '../../members/getMemberFromTransaction';
import {lessThan} from 'react-native-reanimated';

const getFormatedDate = (date) => moment(date).format('DD/MM/YYYY');

const getTransactionLessThan = (transaction, date) =>
  transaction.filter((trans) =>
    moment(trans.addTimestamp).isBefore(date, 'days'),
  );

const mergreMise = (data) => {
  let mergedArray = [];
  data.forEach(({mise}) => {
    mergedArray = [...mergedArray, ...mise];
  });
  return mergedArray;
};

const getTotalDocumentFees = (mises) => {
  return mises.reduce(
    (accumulator, mise) => {
      let [acDebit, acCredit] = accumulator;

      const montant = getTransactionsSolde(mise.transactions, 'R');
      const credit = numeral(montant).value() - numeral(mise.mise).value();
      const month = numeral(
        Math.ceil(
          moment(mise.dateFin).diff(moment(mise.dateDebut), 'month', true),
        ),
      ).value();
      const interet = numeral((credit * ((month || 1) * 10)) / 100).value();
      const documentFees =
        numeral(mise.mise).value() - numeral(interet).value();

      if (mise?.isActive) {
        acDebit += documentFees;
      } else {
        acCredit += documentFees;
      }

      const result = [acDebit, acCredit, acDebit - acCredit];

      return result;
    },
    [0, 0, 0],
  );
};

const getFormatedNumber = (number) =>
  !!number ? `${numeral(number).format('0,0[.]00')} Fc` : '';

const getMontant = (transaction, type) =>
  transaction.type === type ? getFormatedNumber(transaction.montant) : '';

const createRowCredit = (mise, index) => `
  <tr>
    <td class="tg-l470">${getFormatedDate(mise?.addDate)}</td>
    <td class="tg-l470">${mise?.member?.id}</td>
    <td class="tg-l470">
      <span
        style="font-weight:400;font-style:normal; font-size:8pt; text-transform: uppercase;"
      >
        ${mise?.member?.nom}
      </span>
    </td>
    <td class="tg-lvqx">
      ${getFormatedNumber(getTotalDocumentFees([mise])[0])}
    </td>
    <td class="tg-lvqx">
      ${getFormatedNumber(getTotalDocumentFees([mise])[1])}
    </td>
    <td class="tg-lvqx">
      ${getFormatedNumber(getTotalDocumentFees([mise])[2])}
    </td>

    <td class="tg-lvqx">
      ${getFormatedNumber(mise?.solde[0] - getTotalDocumentFees([mise])[0])}
    </td>
    <td class="tg-lvqx">
      ${getFormatedNumber(mise?.solde[1] - getTotalDocumentFees([mise])[1])}
    </td>
    <td class="tg-lvqx">
      ${getFormatedNumber(mise?.solde[2] - getTotalDocumentFees([mise])[2])}
    </td>
  </tr>
`;

const createRow = (mise, index) => `
  <tr>
    <td class="tg-l470">${getFormatedDate(mise?.addDate)}</td>
    <td class="tg-l470">${mise?.member?.id}</td>
    <td class="tg-l470">
      <span
        style="font-weight:400;font-style:normal; font-size:8pt; text-transform: uppercase;"
      >
        ${mise?.member?.nom}
      </span>
    </td>

    <td class="tg-lvqx">${getFormatedNumber(mise?.solde[0])}</td>
    <td class="tg-lvqx">${getFormatedNumber(mise?.solde[1])}</td>
    <td class="tg-lvqx">${getFormatedNumber(mise?.solde[2])}</td>
  </tr>
`;

const createRowCreditFooter = (data, dates, transCategory) => `
  <tr>
    <td class="tg-l470 center" colspan="3">
      <span style="font-weight:700;font-style:normal">
        Sous Total/Générale
      </span>
    </td>
    <td class="tg-lvqx">
      <span style="font-weight:700;font-style:normal">
        ${
          !!data
            ? getFormatedNumber(getTotalDocumentFees(mergreMise(data))[0])
            : ''
        }
      </span>
    </td>
    <td class="tg-lvqx">
      <span style="font-weight:700;font-style:normal">
        ${
          !!data
            ? getFormatedNumber(getTotalDocumentFees(mergreMise(data))[1])
            : ''
        }
      </span>
    </td>

    <td class="tg-lvqx">
      <span style="font-weight:700;font-style:normal">
        ${
          !!data
            ? getFormatedNumber(getTotalDocumentFees(mergreMise(data))[2])
            : ''
        }
      </span>
    </td>

    <td class="tg-lvqx">
      <span style="font-weight:700;font-style:normal">
        ${
          !!data
            ? getFormatedNumber(
                mergeMiseSolde(mergreMise(data))[0] -
                  getTotalDocumentFees(mergreMise(data))[0],
              )
            : ''
        }
      </span>
    </td>
    <td class="tg-lvqx">
      <span style="font-weight:700;font-style:normal">
        ${
          !!data
            ? getFormatedNumber(
                mergeMiseSolde(mergreMise(data))[1] -
                  getTotalDocumentFees(mergreMise(data))[1],
              )
            : ''
        }
      </span>
    </td>

    <td class="tg-lvqx">
      <span style="font-weight:700;font-style:normal">
        ${
          !!data
            ? getFormatedNumber(
                mergeMiseSolde(mergreMise(data))[2] -
                  getTotalDocumentFees(mergreMise(data))[2],
              )
            : ''
        }
      </span>
    </td>
  </tr>
`;

const createRowFooter = (data, dates, transCategory) => `
  <tr>
    <td class="tg-l470 center" colspan="3">
      <span style="font-weight:700;font-style:normal">
        Sous Total/Générale
      </span>
    </td>

    <td class="tg-lvqx">
      <span style="font-weight:700;font-style:normal">
        ${!!data ? getFormatedNumber(mergeMiseSolde(mergreMise(data))[0]) : ''}
      </span>
    </td>
    <td class="tg-lvqx">
      <span style="font-weight:700;font-style:normal">
        ${!!data ? getFormatedNumber(mergeMiseSolde(mergreMise(data))[1]) : ''}
      </span>
    </td>

    <td class="tg-lvqx">
      <span style="font-weight:700;font-style:normal">
        ${!!data ? getFormatedNumber(mergeMiseSolde(mergreMise(data))[2]) : ''}
      </span>
    </td>
  </tr>
`;

const createTableCredit = ({admin, mise}, dates, transCategory) => {
  /*  const reportTransactions = getTransactionLessThan(
    transaction,
    dates.dateFrom,
  ); */
  const filtredMise = sortTransactions(
    filterTransactions(mise, dates, 'addDate'),
    'asc',
    `${transCategory === 'E' ? 'addDate' : 'dateDebut'}`,
  );

  console.log(filtredMise, 'filtredMise');

  return !!filtredMise?.length
    ? `
        <tr class="no-border top">
          <th class="tg-49qb">Code:</th>
          <th class="tg-j1i3">
            <span style="font-weight:400;font-style:normal">
              ${!!admin ? admin.id || '-' : ''}
            </span>
          </th>
          <th class="tg-49qb"></th>
          <th class="tg-49qb"></th>
          <th class="tg-49qb"></th>
          <th class="tg-49qb"></th>
          <th class="tg-49qb"></th>
          <th class="tg-49qb">Attribut:</th>
          <th class="tg-j1i3">
            <span style="font-weight:400;font-style:normal">
              ${!!admin ? getAdminAttribut(admin.attribut) : ''}
            </span>
          </th>
        </tr>

        <tr class="no-border bottom">
          <th class="tg-49qb">Nom:</th>
          <th class="tg-j1i3">
            <span style="font-weight:400;font-style:normal">
              ${!!admin ? admin.nom : ''}
            </span>
          </th>
          <th class="tg-49qb"></th>
          <th class="tg-49qb"></th>
          <th class="tg-49qb"></th>
          <th class="tg-49qb"></th>
          <th class="tg-49qb"></th>
          <th class="tg-49qb">Téléphone:</th>
          <th class="tg-j1i3">
            <span style="font-weight:400;font-style:normal">
              ${!!admin ? admin.telephone : ''}
            </span>
          </th>
        </tr>

        <tr class="label">
          <th class="tg-9gfu center" rowspan="2">Date</th>
          <th class="tg-9gfu center" rowspan="2">Code</th>
          <th class="tg-9gfu center" rowspan="2">Libellé</th>
          <th class="tg-9gfu center" colspan="3">Frais Documents</th>
          <th class="tg-9gfu center" colspan="3">Interêts</th>
        </tr>

        <tr class="label">
          <th class="tg-9gfu center">Débit</th>
          <th class="tg-9gfu center">Crédit</th>
          <th class="tg-9gfu">Solde</th>

          <th class="tg-9gfu center">Débit</th>
          <th class="tg-9gfu center">Crédit</th>
          <th class="tg-9gfu">Solde</th>
        </tr>

        ${
          !!filtredMise
            ? filtredMise
                .map((mise, idx) => createRowCredit(mise, idx))
                .join('')
            : ''
        }

        <tr>
          <td class="tg-l470 center" colspan="3">
            <span style="font-weight:700;font-style:normal">
              Sous Total/Periodique
            </span>
          </td>
          <td class="tg-lvqx">
            <span style="font-weight:700;font-style:normal">
              ${
                !!filtredMise
                  ? getFormatedNumber(getTotalDocumentFees(filtredMise)[0])
                  : ''
              }
            </span>
          </td>
          <td class="tg-lvqx">
            <span style="font-weight:700;font-style:normal">
              ${
                !!filtredMise
                  ? getFormatedNumber(getTotalDocumentFees(filtredMise)[1])
                  : ''
              }
            </span>
          </td>

          <td class="tg-lvqx">
            <span style="font-weight:700;font-style:normal">
              ${
                !!filtredMise
                  ? getFormatedNumber(getTotalDocumentFees(filtredMise)[2])
                  : ''
              }
            </span>
          </td>

          <td class="tg-lvqx">
            <span style="font-weight:700;font-style:normal">
              ${
                !!filtredMise
                  ? getFormatedNumber(
                      mergeMiseSolde(filtredMise)[0] -
                        getTotalDocumentFees(filtredMise)[0],
                    )
                  : ''
              }
            </span>
          </td>
          <td class="tg-lvqx">
            <span style="font-weight:700;font-style:normal">
              ${
                !!filtredMise
                  ? getFormatedNumber(
                      mergeMiseSolde(filtredMise)[1] -
                        getTotalDocumentFees(filtredMise)[1],
                    )
                  : ''
              }
            </span>
          </td>

          <td class="tg-lvqx">
            <span style="font-weight:700;font-style:normal">
              ${
                !!filtredMise
                  ? getFormatedNumber(
                      mergeMiseSolde(filtredMise)[2] -
                        getTotalDocumentFees(filtredMise)[2],
                    )
                  : ''
              }
            </span>
          </td>
        </tr>
      `
    : '';
};

const createTable = ({admin, mise}, dates, transCategory) => {
  /*  const reportTransactions = getTransactionLessThan(
    transaction,
    dates.dateFrom,
  ); */
  const filtredMise = sortTransactions(
    filterTransactions(mise, dates, 'addDate'),
    'asc',
    `${transCategory === 'E' ? 'addDate' : 'dateDebut'}`,
  );

  console.log(filtredMise, 'filtredMise');

  return !!filtredMise?.length
    ? `
        <tr class="no-border top">
          <th class="tg-49qb">Code:</th>
          <th class="tg-j1i3">
            <span style="font-weight:400;font-style:normal">
              ${!!admin ? admin.id || '-' : ''}
            </span>
          </th>
          <th class="tg-49qb"></th>
          <th class="tg-49qb"></th>
          <th class="tg-49qb">Attribut:</th>
          <th class="tg-j1i3">
            <span style="font-weight:400;font-style:normal">
              ${!!admin ? getAdminAttribut(admin.attribut) : ''}
            </span>
          </th>
        </tr>

        <tr class="no-border bottom">
          <th class="tg-49qb">Nom:</th>
          <th class="tg-j1i3">
            <span style="font-weight:400;font-style:normal">
              ${!!admin ? admin.nom : ''}
            </span>
          </th>
          <th class="tg-49qb"></th>
          <th class="tg-49qb"></th>
          <th class="tg-49qb">Téléphone:</th>
          <th class="tg-j1i3">
            <span style="font-weight:400;font-style:normal">
              ${!!admin ? admin.telephone : ''}
            </span>
          </th>
        </tr>

        <tr class="label">
          <th class="tg-9gfu center" rowspan="2">Date</th>
          <th class="tg-9gfu center" rowspan="2">Code</th>
          <th class="tg-9gfu center" rowspan="2">Libellé</th>
          <th class="tg-9gfu center" colspan="3">Mises</th>
        </tr>

        <tr class="label">
          <th class="tg-9gfu center">Débit</th>
          <th class="tg-9gfu center">Crédit</th>
          <th class="tg-9gfu">Solde</th>
        </tr>

        ${
          !!filtredMise
            ? filtredMise.map((mise, idx) => createRow(mise, idx)).join('')
            : ''
        }

        <tr>
          <td class="tg-l470 center" colspan="3">
            <span style="font-weight:700;font-style:normal">
              Sous Total/Periodique
            </span>
          </td>

          <td class="tg-lvqx">
            <span style="font-weight:700;font-style:normal">
              ${
                !!filtredMise
                  ? getFormatedNumber(mergeMiseSolde(filtredMise)[0])
                  : ''
              }
            </span>
          </td>
          <td class="tg-lvqx">
            <span style="font-weight:700;font-style:normal">
              ${
                !!filtredMise
                  ? getFormatedNumber(mergeMiseSolde(filtredMise)[1])
                  : ''
              }
            </span>
          </td>

          <td class="tg-lvqx">
            <span style="font-weight:700;font-style:normal">
              ${
                !!filtredMise
                  ? getFormatedNumber(mergeMiseSolde(filtredMise)[2])
                  : ''
              }
            </span>
          </td>
        </tr>
      `
    : '';
};

/**
 * @description Generate an `html` page with a populated table
 * @param {[Object]} data
 * @returns {String}
 */
const createHtml = (data, dates, transCategory) => `
  <html>
    <head>
      <style>
        body {
          font: 11pt Arial, 'Times New Roman', Times, serif;
          line-height: 1.3;
          position: relative;
          padding-top: 120px;
        }

        @page {
          /* set page margins */
          margin: 0.6cm;
          size: A4 landscape;

          counter-increment: page;

          top {
            content: 'Page ' counter(page) ' of ' counter(pages) ' pages ';
          }
        }

        #header {
          position: absolute;
          display: table-header-group;
          width: 100%;
          top: 0;
          left: 0;
          margin-bottom: 100px;
        }

        .title {
          width: 100%;
          text-align: center;
          position: relative;
          padding-top: 30px;
        }
        .title h3 {
          text-decoration: none;
          font-size: 14pt;
        }

        .title .date {
          position: absolute;
          right: 0;
          top: 0;
          font-size: 10pt;
          font-weight: normal;
        }

        .tg {
          border-collapse: collapse;
          border-spacing: 0;
          width: 100%;
          page-break-before: always;
        }
        .tg td {
          border-color: black;
          border-style: solid;
          border-width: 1px;
          font-family: Arial, sans-serif;
          font-size: 14px;
          overflow: hidden;
          padding: 10px 20px;
          word-break: normal;
        }
        .tg th {
          border-color: black;
          border-style: solid;
          border-width: 1px;
          font-family: Arial, sans-serif;
          font-size: 14px;
          font-weight: normal;
          overflow: hidden;
          padding: 10px 20px;
          word-break: normal;
        }

        .tg .tg-j1i3 {
          border-color: inherit;
          position: -webkit-sticky;
          position: sticky;
          text-align: left;
          top: -1px;
          vertical-align: top;
          will-change: transform;
        }
        .tg .tg-lvqx {
          border-color: inherit;
          font-size: 13px;
          text-align: right;
          vertical-align: top;
        }
        .tg .tg-l470 {
          border-color: inherit;
          font-size: 13px;
          text-align: left;
          vertical-align: top;
        }
        .tg .tg-49qb {
          border-color: inherit;
          font-family: Georgia, serif !important;
          font-size: 16px;
          font-weight: bold;
          position: -webkit-sticky;
          position: sticky;
          text-align: left;
          top: -1px;
          vertical-align: top;
          will-change: transform;
        }
        .tg .tg-zufh {
          border-color: inherit;
          font-family: Georgia, serif !important;
          font-size: 16px;
          font-weight: bold;
          text-align: left;
          vertical-align: top;
        }
        .tg .tg-pcvp {
          border-color: inherit;
          text-align: left;
          vertical-align: top;
        }
        .tg .tg-9gfu {
          border-color: #333333;
          font-size: 15px;
          font-weight: bold;
          text-align: center;
          vertical-align: top;
        }

        tg tfoot td {
          border-color: black;
          border-style: solid;
          border-width: 1px;
          font-family: Arial, sans-serif;
          font-size: 14px;
          font-weight: normal;
          overflow: hidden;
        }

        tr {
          text-align: left;
          border: 1px solid black;
          margin-top: 50px;
        }
        th,
        td {
          padding: 5px;
        }

        .no-content {
          background-color: red;
        }
        td,
        th {
          border: 1px solid black;
        }

        table {
          border-collapse: collapse;
        }

        tr.no-border.top {
          border-bottom: none;
        }

        .center {
          text-align: center !important;
        }

        tr.no-border.bottom {
          border-top: none;
        }

        tr.no-border th {
          border: none;
        }

        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }

        td {
          font-size: 12px;
        }

        .label th {
          padding: 5px;
        }

        .label th.report {
          text-align: left;
        }
      </style>
    </head>
    <body>
      <div id="header">
        <div class="title">
          <p class="date">Kinshasa, le ${getFormatedDate(new Date())}</p>
          <h3>
            BALANCE DETAILLEE DES
            ${transCategory === 'E' ? 'MISES' : 'INTERETS'}<br />DU
            ${getFormatedDate(dates.dateFrom)} AU
            ${getFormatedDate(dates.dateTo)}
          </h3>
        </div>
      </div>
      <table class="tg">
        ${
          transCategory === 'E'
            ? data
                ?.map((data) => createTable(data, dates, transCategory))
                .join('')
            : data
                ?.map((data) => createTableCredit(data, dates, transCategory))
                .join('')
        }
        ${
          !!data && transCategory === 'E'
            ? createRowFooter(data, dates, transCategory)
            : createRowCreditFooter(data, dates, transCategory)
        }
      </table>
    </body>
  </html>
`;

/* generate html table */
const generateTable = (data, _, dates, transCategory) => {
  try {
    const html = createHtml(data, dates, transCategory);
    return html;
  } catch (error) {
    console.log('Error generating table', error);
  }
};

export default generateTable;
