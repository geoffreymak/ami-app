import numeral from 'numeral';
import moment from 'moment';

import getTransactionsSolde from '../../transactions/getTransactionsSolde';
import sortTransactions from '../../transactions/sortTransactions';
import filterTransactions from '../../transactions/filterTransactions';
import getAdminAttribut from '../../admins/getAdminAttribut';
const getFormatedDate = (date) => moment(date).format('DD/MM/YYYY');

const getFormatedNumber = (number) =>
  !!number ? `${numeral(number).format('0,0[.]00')} Fc` : '';

const getSpecificAdminName = (admins, code) =>
  !!admins.find((admin) => admin.code === code)
    ? admins.find((admin) => admin.code === code).nom
    : '';

const mergreTransaction = (data, field = 'transaction') => {
  let mergedArray = [];
  data.forEach((v) => {
    const transaction = v[field];
    mergedArray = [...mergedArray, ...transaction];
  });
  return mergedArray;
};

const getTotalDocumentFees = (mises) => {
  return mises.reduce((accumulator, mise) => {
    const montant = getTransactionsSolde(mise.transactions, 'R');
    const credit = numeral(montant).value() - numeral(mise.mise).value();
    const month = numeral(
      Math.ceil(
        moment(mise.dateFin).diff(moment(mise.dateDebut), 'month', true),
      ),
    ).value();
    const interet = numeral((credit * ((month || 1) * 10)) / 100).value();
    const documentFees = numeral(mise.mise).value() - numeral(interet).value();

    return numeral(documentFees + accumulator).value();
  }, 0);
};

const mergeMiseSolde = (mises) => {
  return mises.reduce(
    (accumulator, currentValue) => [
      accumulator[0] + currentValue[0],
      accumulator[1] + currentValue[1],
      accumulator[2] + currentValue[2],
    ],
    [0, 0, 0],
  );
};

const mergreMise = (data) => {
  let mergedArray = [];
  data.forEach(({solde}) => {
    mergedArray = [...mergedArray, solde];
  });
  return mergedArray;
};

const getRetard = (transactions, date) => {
  if (
    moment(date).isBefore(moment(), 'day') &&
    getTransactionsSolde(transactions) < 0
  ) {
    return (
      getTransactionsSolde(transactions, 'R') -
      getTransactionsSolde(transactions, 'D')
    );
  }
  return 0;
};

const getTotalRetard = (mises) =>
  mises
    .map((mise) => getRetard(mise.transactions, mise.dateFin))
    .reduce((pre, cur) => parseFloat(pre) + parseFloat(cur), 0);

const createRow = (
  {member, transactions, solde, addDate},
  dates,
  admins,
  idx,
) => {
  // const filtredTransactions = filterTransactions(transaction, dates);
  return true
    ? `
        <tr>
          <td class="tg-l470">${member?.id}</td>
          <td class="tg-l470">
            <span
              style="font-weight:400;font-style:normal; font-size:8pt; text-transform: uppercase;"
            >
              ${member?.nom}
            </span>
          </td>
          <td class="tg-lvqx">${getFormatedDate(addDate)}</td>
          <td class="tg-lvqx">
            ${getFormatedNumber(getTransactionsSolde(transactions, 'D'))}
          </td>
          <td class="tg-lvqx">
            ${getFormatedNumber(getTransactionsSolde(transactions, 'R'))}
          </td>
           <td class="tg-lvqx">${getFormatedNumber(
             getTransactionsSolde(transactions) - solde[0],
           )}</td>
          <td class="tg-lvqx">
            ${getFormatedNumber(getTransactionsSolde(transactions))}
          </td>        
          <td class="tg-lvqx">${getFormatedNumber(solde[0])}</td>
        </tr>
      `
    : '';
};

const createRowCredit = (mise, dates, admins, idx) => {
  const {member, transactions, solde, dateDebut, dateFin} = mise;
  const filtredTransactions = filterTransactions(transactions, dates);
  return `
    <tr>
      <td class="tg-l470">${member?.id}</td>
      <td class="tg-l470">
        <span
          style="font-weight:400;font-style:normal; font-size:8pt; text-transform: uppercase;"
        >
          ${member?.nom}
        </span>
      </td>
      <td class="tg-l470">${getFormatedDate(dateDebut)}</td>
      <td class="tg-l470">${getFormatedDate(dateFin)}</td>
      <td class="tg-lvqx">
        ${getFormatedNumber(
          getTransactionsSolde(transactions, 'R') -
            getTransactionsSolde(transactions, 'D'),
        )}
      </td>
      <td class="tg-lvqx">
        ${getFormatedNumber(getTransactionsSolde(transactions, 'D'))}
      </td>

      <td class="tg-lvqx">
        ${getFormatedNumber(getTransactionsSolde(transactions, 'R') - solde[0])}
      </td>

      <td class="tg-lvqx">
        ${getFormatedNumber(getTotalDocumentFees([mise]))}
      </td>

      <td class="tg-lvqx">
        ${getFormatedNumber(solde[0] - getTotalDocumentFees([mise]))}
      </td>

      <td class="tg-lvqx">${getFormatedNumber(
        getRetard(transactions, dateFin),
      )}</td>
    </tr>
  `;
};

const createRowFooter = ({mise: data}, label = 'Sous-Total/Générale') => `
  <tr>
    <th class="tg-49qb center" colspan="3">${label}</th>
    <td class="tg-lvqx">
      <span style="font-weight:700;font-style:normal">
        ${
          !!data
            ? getFormatedNumber(
                getTransactionsSolde(
                  mergreTransaction(data, 'transactions'),
                  'D',
                ),
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
                getTransactionsSolde(
                  mergreTransaction(data, 'transactions'),
                  'R',
                ),
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
                getTransactionsSolde(mergreTransaction(data, 'transactions')) -
                  mergeMiseSolde(mergreMise(data))[0],
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
                getTransactionsSolde(mergreTransaction(data, 'transactions')),
              )
            : ''
        }
      </span>
    </td>

     <td class="tg-lvqx">
      <span style="font-weight:700;font-style:normal">
       ${getFormatedNumber(mergeMiseSolde(mergreMise(data))[0])}
      </span>
    </td>
  </tr>
`;

const createRowFooterCredit = ({mise: data}, label = 'Sous-Total/Générale') => `
  <tr>
    <th class="tg-49qb center" colspan="4">${label}</th>
    <td class="tg-lvqx">
      <span style="font-weight:700;font-style:normal">
        ${
          !!data
            ? getFormatedNumber(
                getTransactionsSolde(
                  mergreTransaction(data, 'transactions'),
                  'R',
                ) -
                  getTransactionsSolde(
                    mergreTransaction(data, 'transactions'),
                    'D',
                  ),
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
                getTransactionsSolde(
                  mergreTransaction(data, 'transactions'),
                  'D',
                ),
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
                getTransactionsSolde(
                  mergreTransaction(data, 'transactions'),
                  'R',
                ) - mergeMiseSolde(mergreMise(data))[0],
              )
            : ''
        }
      </span>
    </td>

     <td class="tg-lvqx">
      <span style="font-weight:700;font-style:normal">
       ${getFormatedNumber(getTotalDocumentFees(data))}
      </span>
    </td>

    <td class="tg-lvqx">
      <span style="font-weight:700;font-style:normal">
       ${getFormatedNumber(
         mergeMiseSolde(mergreMise(data))[0] - getTotalDocumentFees(data),
       )}
      </span>
    </td>

    <td class="tg-lvqx">
      <span style="font-weight:700;font-style:normal">
        ${getFormatedNumber(getTotalRetard(data))}   
      </span>
    </td>
  </tr>
`;

const createTable = ({admin, data, mise}, dates, admins, transCategory) => {
  const filtredMise = sortTransactions(
    filterTransactions(
      mise,
      dates,
      `${transCategory === 'E' ? 'addDate' : 'dateDebut'}`,
    ),
    'asc',
    `${transCategory === 'E' ? 'addDate' : 'dateDebut'}`,
  );

  return `
    <tr class="no-border top">
      <th class="tg-49qb">Code:</th>
      <th class="tg-j1i3">
        <span style="font-weight:400;font-style:normal">
          ${!!admin ? admin?.id : ''}
        </span>
      </th>
      <th class="tg-49qb"></th>
      <th class="tg-49qb"></th>
      <th class="tg-49qb"></th>
      <th class="tg-49qb"></th>
      ${transCategory === 'C' ? '<th class="tg-49qb"></th>' : ''}
      ${transCategory === 'C' ? '<th class="tg-49qb"></th>' : ''}
      <th class="tg-49qb">Attribut:</th>
      <th class="tg-j1i3">
        <span style="font-weight:400;font-style:normal">
          ${!!admin ? getAdminAttribut(admin?.attribut) : ''}
        </span>
      </th>
    </tr>

    <tr class="no-border bottom">
      <th class="tg-49qb">Nom:</th>
      <th class="tg-j1i3">
        <span style="font-weight:400;font-style:normal">
          ${!!admin ? admin?.nom : ''}
        </span>
      </th>
      <th class="tg-49qb"></th>
      <th class="tg-49qb"></th>
      <th class="tg-49qb"></th>
      <th class="tg-49qb"></th>
      ${transCategory === 'C' ? '<th class="tg-49qb"></th>' : ''}
      ${transCategory === 'C' ? '<th class="tg-49qb"></th>' : ''}
      <th class="tg-49qb">Téléphone:</th>
      <th class="tg-j1i3">
        <span style="font-weight:400;font-style:normal">
          ${!!admin ? admin?.telephone : ''}
        </span>
      </th>
    </tr>

    <tr class="label">
      <th class="tg-9gfu center">Code</th>
      <th class="tg-9gfu center">Libellé</th>
      <th class="tg-9gfu center">${
        transCategory === 'E' ? 'Date Mise' : 'Date Décaissement'
      }</th>
      <th class="tg-9gfu center">${
        transCategory === 'E' ? 'Dépot' : 'Date Fin'
      }</th>
      <th class="tg-9gfu center">${
        transCategory === 'E' ? 'Rétrait' : 'Reste à Payer'
      }</th>
      <th class="tg-9gfu center">${
        transCategory === 'E' ? 'Solde Membre' : 'Total Payé'
      }</th>

      <th class="tg-9gfu center">${
        transCategory === 'E' ? 'Solde Total' : 'Montant Décaissé'
      }</th>

      <th class="tg-9gfu center">${
        transCategory === 'E' ? 'Mise' : 'Frais Document'
      }</th>

      ${transCategory === 'C' ? '<th class="tg-9gfu center">Intérêt</th>' : ''}

      ${transCategory === 'C' ? '<th class="tg-9gfu center">Rétard</th>' : ''}
    </tr>

    ${
      !!filtredMise
        ? filtredMise
            .map((m, idx) =>
              transCategory === 'E'
                ? createRow(m, dates, admins, idx)
                : createRowCredit(m, dates, admins, idx),
            )
            .join('')
        : ''
    }

    ${
      transCategory === 'E'
        ? createRowFooter({mise: filtredMise}, 'Sous-Total/Periodique')
        : createRowFooterCredit({mise: filtredMise}, 'Sous-Total/Periodique')
    }
  `;
};

/**
 * @description Generate an `html` page with a populated table
 * @param {[Object]} data
 * @returns {String}
 */
const createHtml = (data, dates, admins, transCategory) => `
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
          font-size: 8pt;
          text-align: right;
          vertical-align: top;
        }
        .tg .tg-l470 {
          border-color: inherit;
          font-size: 8pt;
          text-align: left;
          vertical-align: top;
        }
        .tg .tg-49qb {
          border-color: inherit;
          font-family: Georgia, serif !important;
          font-size: 11px !important;
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

        .center{
          text-align: center !important;
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
            LISTE DETAILLEE DE MEMBRES ACTIFS AUX
            ${transCategory === 'E' ? 'EPARGNE' : 'CREDIT'}<br />DU
            ${getFormatedDate(dates.dateFrom)} AU
            ${getFormatedDate(dates.dateTo)}
          </h3>
        </div>
      </div>
      <table class="tg">
        ${
          data &&
          data
            .map((data) => createTable(data, dates, admins, transCategory))
            .join('')
        }
         ${
           data &&
           data
             .map((data) =>
               transCategory === 'E'
                 ? createRowFooter(data)
                 : createRowFooterCredit(data),
             )
             .join('')
         }
      </table>
    </body>
  </html>
`;

/* generate html table */
const generateTable = (data, admins, dates, transCategory) => {
  try {
    const html = createHtml(data, dates, admins, transCategory);
    return html;
  } catch (error) {
    console.log('Error generating table', error);
  }
};

export default generateTable;
