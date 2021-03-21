import numeral from 'numeral';
import moment from 'moment';

import getTransactionsSolde from '../../transactions/getTransactionsSolde';
import sortTransactions from '../../transactions/sortTransactions';
import filterTransactions from '../../transactions/filterTransactions';

const getFormatedDate = (date) => moment(date).format('DD/MM/YYYY');

const getFormatedNumber = (number) =>
  !!number ? `${numeral(number).format('0,0[.]00')} Fc` : '';

const getMontant = (transaction, type) =>
  transaction.type === type ? getFormatedNumber(transaction.montant) : '';

const getSpecificAdminName = (admins, code) =>
  !!admins.find((admin) => admin.code === code)
    ? admins.find((admin) => admin.code === code).nom
    : '';

const createRow = (transaction, index, transactions) => `
  <tr>
    <td class="tg-l470">${getFormatedDate(transaction.date)}</td>
    <td class="tg-lvqx">
    ${getMontant(transaction, 'D')}
    </td>
    <td class="tg-lvqx">
      ${getMontant(transaction, 'R')}
    </td>
    <td class="tg-lvqx">
      ${getFormatedNumber(
        getTransactionsSolde(transactions.slice(0, index + 1)),
      )}
    </td>
  </tr>
`;

const createTable = ({member, transaction}, admins, dates) => {
  const filtredTransactions = filterTransactions(transaction, dates);
  return filtredTransactions?.length
    ? `
    <div class="table-wrapper">
      <div id="header">
        <div class="title">
          <p class="date">Kinshasa, le ${getFormatedDate(new Date())}</p>
          <h3>
            FICHE DE MEMBRE <br />DU ${getFormatedDate(dates.dateFrom)} AU
            ${getFormatedDate(dates.dateTo)}
          </h3>
        </div>
      </div>
      <table class="tg">
        <tr class="no-border">
          <th class="tg-49qb">Nom du membre:</th>
          <th class="tg-j1i3">
            <span style="font-weight:400;font-style:normal; text-transform: uppercase;">
              ${!!member ? member.nom : ''}
            </span>
          </th>
          <th class="tg-zufh">Mise:</th>
          <th class="tg-j1i3">
            <span style="font-weight:400;font-style:normal">
              ${!!member ? getFormatedNumber(member.mise) : ''}
            </span>
          </th>
        </tr>

        <tr class="no-border spacing">
          <th class="tg-49qb">Téléphone:</th>
          <th class="tg-j1i3">
            <span style="font-weight:400;font-style:normal">
              ${!!member ? member.telephone : ''}
            </span>
          </th>
          <th class="tg-zufh">Nom du collecteur:</th>
          <th class="tg-pcvp">
            <span style="font-weight:400;font-style:normal; text-transform: uppercase;">
              ${
                !!admins && !!member
                  ? getSpecificAdminName(admins, member.code_admin)
                  : ''
              }
            </span>
          </th>
        </tr>
        <tr>
          <th class="tg-9gfu">Date</th>
          <th class="tg-9gfu">Depot</th>
          <th class="tg-9gfu">Retrait</th>
          <th class="tg-9gfu">Solde</th>
        </tr>
        ${
          !!filtredTransactions
            ? sortTransactions(filtredTransactions, 'asc')
                .map((trans, idx) => createRow(trans, idx, filtredTransactions))
                .join('')
            : ''
        }
        <tr>
          <th class="tg-49qb">S/Total</th>
          <td class="tg-lvqx">
            ${getFormatedNumber(getTransactionsSolde(filtredTransactions, 'D'))}
          </td>
          <td class="tg-lvqx">
            ${getFormatedNumber(getTransactionsSolde(filtredTransactions, 'R'))}
          </td>
          <td class="tg-lvqx">
            ${getFormatedNumber(getTransactionsSolde(filtredTransactions))}
          </td>
        </tr>

         <tr>
          <th class="tg-49qb">Total/Général</th>
          <td class="tg-lvqx">
            <strong>${getFormatedNumber(
              getTransactionsSolde(transaction, 'D'),
            )}</strong>
          </td>
          <td class="tg-lvqx">
             <strong>${getFormatedNumber(
               getTransactionsSolde(transaction, 'R'),
             )}</strong>
          </td>
          <td class="tg-lvqx">
             <strong>${getFormatedNumber(
               getTransactionsSolde(transaction),
             )}</strong>
          </td>
        </tr>
      </table>
    </div>
  `
    : '';
};

/**
 * @description Generate an `html` page with a populated table
 * @param {[Object]} data
 * @returns {String}
 */
const createHtml = (data, admins, dates) => `
  <html>
    <head>
      <style>
        body {
          font: 11pt Arial, 'Times New Roman', Times, serif;
          line-height: 1.3;
          position: relative;
        }

        @page {
          /* set page margins */
          margin: 0.6cm;
        }

        .tg {
        }

        .table-wrapper {
          page-break-inside: auto;
          page-break-after: always;
        }

        #header {
          padding-bottom: 25px;
        }

        .title {
          width: 100%;
          text-align: center;
          position: relative;
          padding-top: 40px;
        }
        .title h3 {
          text-decoration: none;
          font-size: 12pt;
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

        .tg .no-border th {
          border: none;
          padding-left: 0;
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

        tr.no-border.spacing th {
          padding-bottom: 30px;
        }

        tr.no-border,
        tr.no-border td,
        tr.no-border th {
          border: none;
        }

        table {
          border-collapse: collapse;
        }

        td {
          font-size: 12px;
        }

        table {
        }
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }
      </style>
    </head>
    <body>
      ${data.map((data) => createTable(data, admins, dates)).join('')}
    </body>
  </html>
`;

/* generate html table */
const generateTable = (data, admins, dates) => {
  try {
    const html = createHtml(data, admins, dates);
    return html;
  } catch (error) {
    console.log('Error generating table', error);
  }
};

export default generateTable;
