import moment from 'moment';

const filterTransactions = (transactions, {dateFrom, dateTo}) => {
  const formatedDateFrom = moment(dateFrom);
  const formatedDateTo = moment(dateTo);

  return transactions.filter((transaction) => {
    const currentDate = moment(transaction.date);
    return currentDate.isBetween(
      formatedDateFrom,
      formatedDateTo,
      'days',
      '[]',
    );
  });
};

export default filterTransactions;
