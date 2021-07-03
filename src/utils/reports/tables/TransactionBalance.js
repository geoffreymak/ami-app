import numeral from 'numeral';
import moment from 'moment';

import getTransactionsSolde from '../../transactions/getTransactionsSolde';
import sortTransactions from '../../transactions/sortTransactions';
import filterTransactions from '../../transactions/filterTransactions';
import getAdminAttribut from '../../admins/getAdminAttribut';
import getMemberFromTransaction from '../../members/getMemberFromTransaction';

const getFormatedDate = (date) => moment(date).format('DD/MM/YYYY');

const getTransactionLessThan = (
  transaction,
  date,
  includeLast = true,
  field = 'addTimestamp',
) =>
  transaction.filter((trans) => {
    const func = includeLast ? 'isSameOrBefore' : 'isBefore';
    return moment(trans[field])[func](date, 'days');
  });

const mergreTransaction = (data) => {
  let mergedArray = [];
  data.forEach(({transaction}) => {
    mergedArray = [...mergedArray, ...transaction];
  });
  return mergedArray;
};

const getFormatedNumber = (number) =>
  !!number ? `${numeral(number).format('0,0[.]00')} Fc` : '';

const getMontant = (transaction, type) =>
  transaction.type === type ? getFormatedNumber(transaction.montant) : '';

const createRow = (transaction, index, transactions, report) => `
  <tr>
    <td class="tg-l470">${getFormatedDate(transaction.date)}</td>
    <td class="tg-l470">
     <span style="font-weight:400;font-style:normal; font-size:8pt; text-transform: uppercase;">
        ${transaction?.memberName}
      </span>
   </td>
    <td class="tg-lvqx">${getMontant(transaction, 'D')}</td>
    <td class="tg-lvqx">${getMontant(transaction, 'R')}</td>
    <td class="tg-lvqx">
      ${getFormatedNumber(
        getTransactionsSolde(transactions.slice(0, index + 1)) + report,
      )}
    </td>
  </tr>
`;

const createRowFooter = (data, dates, transCategory) => `
  <tr>
    <th class="tg-49qb" colspan="2">Total Général/Periodique ${
      transCategory === 'C' ? 'Crédit' : 'Epargne'
    }</th>
    <td class="tg-lvqx">
      <span style="font-weight:700;font-style:normal">
        ${
          !!data
            ? getFormatedNumber(
                getTransactionsSolde(filterTransactions(data, dates), 'D'),
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
                getTransactionsSolde(filterTransactions(data, dates), 'R'),
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
                getTransactionsSolde(filterTransactions(data, dates)),
              )
            : ''
        }
      </span>
    </td>
  </tr>

   <tr>
    <th class="tg-49qb" colspan="2">Total Général/${
      transCategory === 'C' ? 'Crédit' : 'Epargne'
    }</th>
    <td class="tg-lvqx">
      <span style="font-weight:700;font-style:normal">
        ${!!data ? getFormatedNumber(getTransactionsSolde(data, 'D')) : ''}
      </span>
    </td>
    <td class="tg-lvqx">
      <span style="font-weight:700;font-style:normal">
        ${!!data ? getFormatedNumber(getTransactionsSolde(data, 'R')) : ''}
      </span>
    </td>

    <td class="tg-lvqx">
      <span style="font-weight:700;font-style:normal">
        ${!!data ? getFormatedNumber(getTransactionsSolde(data)) : ''}
      </span>
    </td>
  </tr>
`;

const createTable = ({admin, transaction}, dates) => {
  const filtredTransactions = sortTransactions(
    filterTransactions(transaction, dates),
    'asc',
    'date',
  );

  const reportTransactions = getTransactionLessThan(
    transaction,
    dates.dateFrom,
    false,
    'date',
  );

  console.log('reportTransactions', reportTransactions);
  console.log('filtredTransactions', filtredTransactions);

  return !!filtredTransactions?.length || reportTransactions?.length
    ? `
        <tr class="no-border top">
          <th class="tg-49qb">Code:</th>
          <th class="tg-j1i3">
            <span style="font-weight:400;font-style:normal">
              ${!!admin ? admin.id || '-' : ''}
            </span>
          </th>
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
          <th class="tg-49qb">Téléphone:</th>
          <th class="tg-j1i3">
            <span style="font-weight:400;font-style:normal">
              ${!!admin ? admin.telephone : ''}
            </span>
          </th>
        </tr>

        <tr class="label">
          <th class="tg-9gfu center" rowspan="2">Date</th>
          <th class="tg-9gfu center" rowspan="2">Libellé</th>
          <th class="tg-9gfu center" rowspan="2">Depot</th>
          <th class="tg-9gfu center" rowspan="2">Retrait</th>
          <th class="tg-9gfu report">
            Report :
            <span style="font-weight:400;font-style:normal; font-size:8pt;">
              ${getFormatedNumber(getTransactionsSolde(reportTransactions))}
            </span>
          </th>
        </tr>
        <tr class="label">
          <th class="tg-9gfu">Solde</th>
        </tr>

        ${
          !!filtredTransactions
            ? filtredTransactions
                .map((trans, idx) =>
                  createRow(
                    trans,
                    idx,
                    filtredTransactions,
                    getTransactionsSolde(reportTransactions),
                  ),
                )
                .join('')
            : ''
        }

        <tr>
          <td class="tg-l470" colspan="2">
            <span style="font-weight:700;font-style:normal">
              Sous Total/Periodique ${admin.nom}
            </span>
          </td>
          <td class="tg-lvqx">
            <span style="font-weight:700;font-style:normal">
              ${
                !!filtredTransactions
                  ? getFormatedNumber(
                      getTransactionsSolde(filtredTransactions, 'D'),
                    )
                  : ''
              }
            </span>
          </td>
          <td class="tg-lvqx">
            <span style="font-weight:700;font-style:normal">
              ${
                !!filtredTransactions
                  ? getFormatedNumber(
                      getTransactionsSolde(filtredTransactions, 'R'),
                    )
                  : ''
              }
            </span>
          </td>

          <td class="tg-lvqx">
            <span style="font-weight:700;font-style:normal">
              ${
                !!filtredTransactions
                  ? getFormatedNumber(getTransactionsSolde(filtredTransactions))
                  : ''
              }
            </span>
          </td>
        </tr>

        <tr>
          <td class="tg-l470" colspan="2">
            <span style="font-weight:700;font-style:normal">
              Sous Total/Général ${admin.nom}
            </span>
          </td>
          <td class="tg-lvqx">
            <span style="font-weight:700;font-style:normal">
              ${
                !!filtredTransactions
                  ? getFormatedNumber(getTransactionsSolde(transaction, 'D'))
                  : ''
              }
            </span>
          </td>
          <td class="tg-lvqx">
            <span style="font-weight:700;font-style:normal">
              ${
                !!filtredTransactions
                  ? getFormatedNumber(getTransactionsSolde(transaction, 'R'))
                  : ''
              }
            </span>
          </td>

          <td class="tg-lvqx">
            <span style="font-weight:700;font-style:normal">
              ${
                !!filtredTransactions
                  ? getFormatedNumber(getTransactionsSolde(transaction))
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
        .label th.center {
          padding-top: 20px;
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
            BALANCE DETAILLEE DES TRANSACTIONS AUX
            ${transCategory === 'C' ? 'CREDIT' : 'EPARGNE'} <br />DU
            ${getFormatedDate(dates.dateFrom)} AU
            ${getFormatedDate(dates.dateTo)}
          </h3>
        </div>
      </div>
      <table class="tg">
        ${data && data.map((data) => createTable(data, dates)).join('')}
        <!--  ${
          data && createRowFooter(mergreTransaction(data), dates, transCategory)
        } -->
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
