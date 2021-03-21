import getTransactionsSolde from './transactions/getTransactionsSolde';
import sortTransactions from './transactions/sortTransactions';
import numeral from 'numeral';
import moment from 'moment';

const getFormatedDate = (date) => moment(date).format('DD/MM/YYYY');

const mergreTransaction = (data) => {
  let mergedArray = [];
  data.forEach(({transaction}) => {
    mergedArray = [...mergedArray, ...transaction];
  });
  return mergedArray;
};

const getFormatedNumber = (number) =>
  !!number ? `${numeral(number).format('0,0[.]00')} Fc` : '';

/**
 * @description Generate an `html` page with a populated table
 * @param {String} table
 * @returns {String}
 */
export const createMemberListeTable = (data) => `
  <html>
    <head>
      <style>
        table {
          width: 100%;
        }
        tr {
          border: 1px solid black;
        }
        th,
        td {
          padding: 5px;
        }

        th {
          text-align: center;
          font-size: 12px;
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

        td {
          font-size: 12px;
        }

        td.numeric {
          text-align: right;
        }

        table {
          page-break-inside: auto;
          page-break-after: always;
        }
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }

        @page {
          margin: 50px;
        }

        .title {
          width: 100%;
          text-align: center;
          margin-bottom: 20px;
        }
        .title h3 {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <th>CODE</th>
          <th>NOM</th>
          <th>TELEPHONE</th>
          <th>ADRESSE</th>
          <th>ACTIVITE</th>
          <th>MISE</th>
          <th>SOLDE</th>
        </tr>
        <div class="title"><h3>LISTE DE MEMBRE ACTIFS</h3></div>
        ${data
          .map(
            ({member, transaction}) => `
              <tr>
              <td>${member.id}</td>
                <td>${member.nom}</td>
                <td>${member.telephone}</td>
                <td>${member.adresse}</td>
                <td>${member.activite}</td>
                <td class="numeric">${getFormatedNumber(member.mise)}</td>
                <td class="numeric">${getFormatedNumber(
                  getTransactionsSolde(transaction),
                )}</td>
              </tr>
            `,
          )
          .join('')}
      </table>
    </body>
  </html>
`;

export const createMemberCardTable = (data, admins) => `
  <html>
    <head>
      <style>
        .tg {
          border-collapse: collapse;
          border-spacing: 0;
          width: 100%;
          page-break-before: always;
          margin-top: 120px;
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

        @page {
          margin: 40px 50px;
        }

        .title {
          width: 100%;
          text-align: center;
          position: relative;
          padding-top: 40px;
        }
        .title h3 {
          text-decoration: underline;
          font-size: 12pt;
        }

        .title .date {
          position: absolute;
          right: 0;
          top:0;
          font-size: 10pt;
          font-weight: normal;
        }

        .title .foot {
          position: absolute;
          top: -40px;
          right: 0;
        }

        .spacing th {
          padding-bottom: 25px;
        }

        body {
          font: 12pt 'Times New Roman', Times, serif;
          line-height: 1.3;
        }

        .custom-page-start {
          margin-top: 50px;
        }

        @page {
          /* set page margins */
          margin: 0.5cm 1.5cm;
          /* Default footers */
          @bottom-left {
            content: 'Department of Strategy';
          }
          @bottom-right {
            content: counter(page) ' of ' counter(pages);
          }
        }

        /* footer, header - position: fixed */
        #header {
          position: fixed;
          width: 100%;
          top: 0;
          left: 0;
          right: 0;
        }

        #footer {
          position: fixed;
          width: 100%;
          bottom: 0;
          left: 0;
          right: 0;
        }

        .custom-footer-page-number:after {

        }
      </style>
    </head>
    <body>
      ${
        data &&
        data
          .map(
            ({member, transaction}, idx) => `


              <!-- Custom HTML header -->
              <div id="header">
                <div class="title">
                <p class="date">Kinshasa, le ${getFormatedDate(new Date())}</p>
                <h3>FICHE DE MEMBRE</h3>
              </div>
              </div>

              <!-- Custom HTML footer -->
              <div id="footer">

                <span class="custom-footer-page-number"> </span>
              </div>

              <table class="tg">
                <thead>
                  <tr class="no-border">
                    <th class="tg-49qb">Nom:</th>
                    <th class="tg-j1i3">${member && member.nom}</th>
                    <th class="tg-49qb">Téléphone:</th>
                    <th class="tg-j1i3">
                      <span style="font-weight:400;font-style:normal"
                        >${member && member.telephone}</span
                      >
                    </th>
                  </tr>

                  <tr class="no-border spacing">
                    <th class="tg-zufh">Mise:</th>
                    <th class="tg-pcvp">
                      ${member && getFormatedNumber(member.mise)}
                    </th>
                    <th class="tg-zufh">Nom du collecteur:</th>
                    <th class="tg-pcvp">
                      <span style="font-weight:400;font-style:normal"
                        >${
                          !!admins &&
                          !!member &&
                          !!admins.find(
                            (admin) => admin.code === member.code_admin,
                          )
                            ? admins.find(
                                (admin) => admin.code === member.code_admin,
                              ).nom
                            : ''
                        }</span
                      >
                    </th>
                  </tr>
                  <tr>
                    <th class="tg-9gfu">Date</th>
                    <th class="tg-9gfu">Depot</th>
                    <th class="tg-9gfu">Retrait</th>
                    <th class="tg-9gfu">Solde</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    transaction &&
                    transaction
                      .map(
                        (trans, idx) => `
                <tr>
                  <td class="tg-l470">${getFormatedDate(trans.date)}</td>
                  <td class="tg-lvqx">
                    ${
                      trans.type === 'D' ? getFormatedNumber(trans.montant) : ''
                    }
                  </td>
                  <td class="tg-lvqx">
                    ${
                      trans.type === 'R' ? getFormatedNumber(trans.montant) : ''
                    }
                  </td>

                  <td class="tg-lvqx">
                    ${getFormatedNumber(
                      getTransactionsSolde(transaction.slice(0, idx + 1)),
                    )}
                  </td>
                </tr>
              `,
                      )
                      .join('')
                  }
                </tbody>

                <tfoot>
                  <tr>
                    <th class="tg-49qb">TOTAUX</th>
                    <td class="tg-lvqx">
                      ${getFormatedNumber(
                        getTransactionsSolde(transaction, 'D'),
                      )}
                    </td>
                    <td class="tg-lvqx">
                      ${getFormatedNumber(
                        getTransactionsSolde(transaction, 'R'),
                      )}
                    </td>

                    <td class="tg-lvqx">
                      ${getFormatedNumber(getTransactionsSolde(transaction))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            `,
          )
          .join('')
      }
    </body>
  </html>
`;

export const createAdminBalanceDaysTable = (data, admins) => `
  <html>
    <head>
      <style>
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

        .tg .no-border {
          border: 1px solid black;
        }

        .tg .no-border th {
          border: none;
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
          page-break-inside: avoid;
          page-break-after: auto;
        }

        @page {
          margin: 40px 50px;
        }

        .title {
          width: 100%;
          text-align: center;
          position: relative;
          padding-top: 40px;
        }
        .title h3 {
          text-decoration: underline;
          font-size: 12pt;
        }

        .title .date {
          position: absolute;
          right: 0;
          top: 0;
          font-size: 10pt;
          font-weight: normal;
        }

        .title .foot {
          position: absolute;
          top: -40px;
          right: 0;
        }

        .spacing th {
          padding-bottom: 25px;
        }

        body {
          font: 12pt 'Times New Roman', Times, serif;
          line-height: 1.3;
            padding-top: 100px;
        }

        .custom-page-start {
          margin-top: 50px;
        }

        @page {
          /* set page margins */
          margin: 0.5cm 1.5cm;
          /* Default footers */
          @bottom-left {
            content: 'Department of Strategy';
          }
          @bottom-right {
            content: counter(page) ' of ' counter(pages);
          }
        }

        /* footer, header - position: fixed */
        #header {
          position: fixed;
          width: 100%;
          top: 0;
          left: 0;
          right: 0;

        }

        #footer {
          position: fixed;
          width: 100%;
          bottom: 0;
          left: 0;
          right: 0;
        }

        .custom-footer-page-number:after {
        }
      </style>
    </head>
    <body>
      <table class="tg">
        <!-- Custom HTML header -->
        <div id="header">
          <div class="title">
            <p class="date">Kinshasa, le ${getFormatedDate(new Date())}</p>
            <h3>BALANCE JOURNALIER PAR COLLECTEUR</h3>
          </div>
        </div>

        <!-- Custom HTML footer -->
        <div id="footer">
          <span class="custom-footer-page-number"> </span>
        </div>
        ${
          data &&
          data
            .map(
              ({admin, transaction}, idx) => `
              <thead>
                <tr class="no-border">
                  <th class="tg-49qb">Collecteur:</th>
                  <th class="tg-j1i3">${admin && admin.nom}</th>
                  <th class="tg-49qb">Téléphone:</th>
                  <th class="tg-j1i3">
                    <span style="font-weight:400;font-style:normal"
                      >${admin && admin.telephone}</span
                    >
                  </th>
                </tr>

                <tr>
                  <th class="tg-9gfu">Date</th>
                  <th class="tg-9gfu">Depot</th>
                  <th class="tg-9gfu">Retrait</th>
                  <th class="tg-9gfu">Solde</th>
                </tr>
              </thead>
              <tbody>
                ${
                  transaction &&
                  transaction
                    .map(
                      (trans, idx) => `
                          <tr>
                            <td class="tg-l470">
                              ${getFormatedDate(trans.date)}
                            </td>
                            <td class="tg-lvqx">
                              ${
                                trans.type === 'D'
                                  ? getFormatedNumber(trans.montant)
                                  : ''
                              }
                            </td>
                            <td class="tg-lvqx">
                              ${
                                trans.type === 'R'
                                  ? getFormatedNumber(trans.montant)
                                  : ''
                              }
                            </td>

                            <td class="tg-lvqx">
                              ${getFormatedNumber(
                                getTransactionsSolde(
                                  transaction.slice(0, idx + 1),
                                ),
                              )}
                            </td>
                          </tr>
                        `,
                    )
                    .join('')
                }

                <tr>
                  <th class="tg-49qb">TOTAL/COLLECTEUR</th>
                  <td class="tg-lvqx">
                    ${getFormatedNumber(getTransactionsSolde(transaction, 'D'))}
                  </td>
                  <td class="tg-lvqx">
                    ${getFormatedNumber(getTransactionsSolde(transaction, 'R'))}
                  </td>

                  <td class="tg-lvqx">
                    ${getFormatedNumber(getTransactionsSolde(transaction))}
                  </td>
                </tr>
                ${
                  idx + 1 === data.length
                    ? `
                <tr>
                  <th class="tg-49qb">TOTAL/GENERAL</th>
                  <td class="tg-lvqx">
                    ${getFormatedNumber(
                      getTransactionsSolde(mergreTransaction(data), 'D'),
                    )}
                  </td>
                  <td class="tg-lvqx">
                    ${getFormatedNumber(
                      getTransactionsSolde(mergreTransaction(data), 'R'),
                    )}
                  </td>

                  <td class="tg-lvqx">
                    ${getFormatedNumber(
                      getTransactionsSolde(mergreTransaction(data)),
                    )}
                  </td>
                </tr>`
                    : ''
                }
              </tbody>
            `,
            )
            .join('')
        }
      </table>
    </body>
  </html>
`;
