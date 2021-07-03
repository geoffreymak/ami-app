import numeral from 'numeral';
import moment from 'moment';

import getTransactionsSolde from '../../transactions/getTransactionsSolde';
import sortTransactions from '../../transactions/sortTransactions';
import filterTransactions from '../../transactions/filterTransactions';
import mergeMiseSolde from '../../transactions/mergeMiseSolde';
import getAdminAttribut from '../../admins/getAdminAttribut';
import getMemberFromTransaction from '../../members/getMemberFromTransaction';

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

const mergreTransaction = (data, field = 'transactions') => {
  let mergedArray = [];
  data.forEach((v) => {
    const transaction = v[field];
    mergedArray = [...mergedArray, ...transaction];
  });
  return mergedArray;
};

const getFormatedNumber = (number) =>
  !!number ? `${numeral(number).format('0,0[.]00')} Fc` : '';

const getMontant = (transaction, type) =>
  transaction.type === type ? getFormatedNumber(transaction.montant) : '';

const createRow = (
  member,
  {dateDebut, dateFin, addDate, mise, transactions},
  transCategory,
) => {
  const sortedTransactions = sortTransactions(transactions, 'asc', 'date');
  return `
    ${
      transCategory === 'C'
        ? `<tr class="no-border top">
            <th class="tg-49qb">Date décaissement</th>
            <th class="tg-j1i3">
              <span style="font-weight:400;font-style:normal">
                ${getFormatedDate(dateDebut)}
              </span>
            </th>
            <th class="tg-49qb">Date fin:</th>
            <th class="tg-j1i3">
              <span style="font-weight:400;font-style:normal">
               ${getFormatedDate(dateFin)}
              </span>
            </th>
          </tr>`
        : ''
    }

    <tr class="no-border ${transCategory === 'C' ? 'bottom' : 'top'}">
      <th class="tg-49qb">
        ${transCategory === 'C' ? 'Montant décaissé:' : 'Date mise:'}
      </th>
      <th class="tg-j1i3">
        <span style="font-weight:400;font-style:normal">
          ${
            transCategory === 'C'
              ? getFormatedNumber(
                  getTransactionsSolde(sortedTransactions, 'R') - mise,
                )
              : getFormatedDate(addDate)
          }
        </span>
      </th>
      <th class="tg-49qb">${transCategory === 'C' ? 'Intêret:' : 'Mise:'}</th>
      <th class="tg-j1i3">
        <span style="font-weight:400;font-style:normal">
          ${getFormatedNumber(mise)}</span
        >
      </th>
    </tr>

    <tr class="label">
      <th class="tg-9gfu center">Date</th>
      <th class="tg-9gfu center">Dépot</th>
      <th class="tg-9gfu center">Rétrait</th>
      <th class="tg-9gfu">Solde</th>
    </tr>

    ${sortedTransactions
      .map(
        (transaction, index) =>
          `
             <tr>
               <td class="tg-l470">${getFormatedDate(transaction?.date)}</td>
               <td class="tg-lvqx">${getMontant(transaction, 'D')}</td>
               <td class="tg-lvqx">${getMontant(transaction, 'R')}</td>
               <td class="tg-lvqx">
                 ${getFormatedNumber(
                   getTransactionsSolde(sortedTransactions.slice(0, index + 1)),
                 )}
               </td>
             </tr>
           `,
      )
      .join('')}

    <tr>
      <td class="tg-l470">
        <span style="font-weight:700;font-style:normal"> Sous-Total </span>
      </td>
      <td class="tg-lvqx">
        <span style="font-weight:700;font-style:normal">
          ${getFormatedNumber(
            getTransactionsSolde(sortedTransactions, 'D'),
          )}</span
        >
      </td>
      <td class="tg-lvqx">
        <span style="font-weight:700;font-style:normal">
          ${getFormatedNumber(getTransactionsSolde(sortedTransactions, 'R'))}
        </span>
      </td>

      <td class="tg-lvqx">
        <span style="font-weight:700;font-style:normal">
          ${getFormatedNumber(getTransactionsSolde(sortedTransactions))}
        </span>
      </td>
    </tr>
  `;
};

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

const createTable = ({admin, data}, dates, transCategory) => {
  /*  const reportTransactions = getTransactionLessThan(
    transaction,
    dates.dateFrom,
  ); */

  return data
    .map(({mise, member}) => {
      const filtredMise = sortTransactions(
        filterTransactions(mise, dates, 'addDate'),
        'asc',
        `${transCategory === 'E' ? 'addDate' : 'dateDebut'}`,
      );

      console.log(filtredMise, 'filtredMise');

      return !!filtredMise?.length
        ? `
            <div class="table-wrapper">
              <div id="header">
                <div class="title">
                  <p class="date">
                    Kinshasa, le ${getFormatedDate(new Date())}
                  </p>
                  <h3>
                    FICHE DE MEMBRE
                    ${transCategory === 'E' ? 'EPARGNE' : 'CREDIT'} <br />DU
                    ${getFormatedDate(dates.dateFrom)} AU
                    ${getFormatedDate(dates.dateTo)}
                  </h3>
                </div>
              </div>

              <table class="tg">
                <tr class="no-border head">
                  <th class="tg-49qb">Code du membre:</th>
                  <th class="tg-j1i3">
                    <span
                      style="font-weight:400;font-style:normal; text-transform: uppercase;"
                    >
                      ${member?.id}
                    </span>
                  </th>
                  <th class="tg-zufh">Nom du collecteur:</th>
                  <th class="tg-j1i3">
                    <span style="font-weight:400;font-style:normal">
                      ${admin?.nom}
                    </span>
                  </th>
                </tr>

                <tr class="no-border head bottom">
                  <th class="tg-49qb">Nom du membre:</th>
                  <th class="tg-j1i3">
                    <span style="font-weight:400;font-style:normal">
                      ${member?.nom}
                    </span>
                  </th>
                  <th class="tg-zufh">Code du collecteur:</th>
                  <th class="tg-pcvp">
                    <span
                      style="font-weight:400;font-style:normal; text-transform: uppercase;"
                    >
                      ${admin?.id}
                    </span>
                  </th>
                </tr>

                ${
                  !!filtredMise
                    ? filtredMise
                        .map((mise, idx) =>
                          createRow(member, mise, transCategory),
                        )
                        .join('')
                    : ''
                }

                <tr>
                  <td class="tg-l470">
                    <span style="font-weight:700;font-style:normal">
                      Sous-Total/Générale
                    </span>
                  </td>
                  <td class="tg-lvqx">
                    <span style="font-weight:700;font-style:normal">
                      ${
                        !!filtredMise
                          ? getFormatedNumber(
                              getTransactionsSolde(
                                mergreTransaction(filtredMise),
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
                        !!filtredMise
                          ? getFormatedNumber(
                              getTransactionsSolde(
                                mergreTransaction(filtredMise),
                                'R',
                              ),
                            )
                          : ''
                      }</span
                    >
                  </td>

                  <td class="tg-lvqx">
                    <span style="font-weight:700;font-style:normal">
                      ${
                        !!filtredMise
                          ? getFormatedNumber(
                              getTransactionsSolde(
                                mergreTransaction(filtredMise),
                              ),
                            )
                          : ''
                      }</span
                    >
                  </td>
                </tr>
                <tr>
                  <td class="tg-l470">
                    <span style="font-weight:700;font-style:normal">
                      Total/Générale
                    </span>
                  </td>
                  <td class="tg-lvqx">
                    <span style="font-weight:700;font-style:normal">
                      ${
                        !!mise
                          ? getFormatedNumber(
                              getTransactionsSolde(
                                mergreTransaction(mise),
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
                        !!mise
                          ? getFormatedNumber(
                              getTransactionsSolde(
                                mergreTransaction(mise),
                                'R',
                              ),
                            )
                          : ''
                      }</span
                    >
                  </td>

                  <td class="tg-lvqx">
                    <span style="font-weight:700;font-style:normal">
                      ${
                        !!mise
                          ? getFormatedNumber(
                              getTransactionsSolde(mergreTransaction(mise)),
                            )
                          : ''
                      }</span
                    >
                  </td>
                </tr>
              </table>
            </div>
          `
        : '';
    })
    .join('');
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
        }

        @page {
          /* set page margins */
          margin: 0.6cm;
          /* size: landscape;*/
          counter-increment: page;

          top {
            content: 'Page ' counter(page) ' of ' counter(pages) ' pages ';
          }
        }

        #header {
          padding-bottom: 25px;
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

        .center{
          text-align: center !important;
        }

        tr.no-border.bottom {
          border-top: none;
        }

        tr.no-border th {
          border: none !important;
        }

        tr.no-border.head {
          border: none !important;
          margin-bottom: 10px ;
        }

        tr.no-border.head th {
          padding-left: 5px;
          padding-right: 0;
        }

        tr.no-border.head.bottom th {
          margin-bottom: 10px !important;
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
        ${data?.map((data) => createTable(data, dates, transCategory)).join('')}
       <!--  --> 
     
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
