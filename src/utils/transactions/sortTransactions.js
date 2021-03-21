const sortTransactions = (transactions, sort = 'desc') =>
  transactions.sort((a, b) =>
    sort === 'desc'
      ? b.addTimestamp - a.addTimestamp
      : a.addTimestamp - b.addTimestamp,
  );

export default sortTransactions;
