import moment from 'moment';

const filterTransactions = (
  transactions,
  {dateFrom, dateTo},
  field = 'date',
) => {
  const formatedDateFrom = moment(dateFrom);
  const formatedDateTo = moment(dateTo);

  return transactions.filter((transaction) => {
    const currentDate = moment(transaction[field]);
    return currentDate.isBetween(
      formatedDateFrom,
      formatedDateTo,
      'days',
      '[]',
    );
  });
};

export default filterTransactions;
