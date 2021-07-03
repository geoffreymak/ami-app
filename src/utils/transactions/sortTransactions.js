const sortTransactions = (transactions, sort = 'desc', field = null) =>
  transactions.sort((a, b) => {
    const firstDate = field ? a[field] : a.date || a.time;
    const secondDate = field ? b[field] : b.date || b.time;

    return sort === 'desc'
      ? new Date(secondDate).getTime() - new Date(firstDate).getTime()
      : new Date(firstDate).getTime() - new Date(secondDate).getTime();
  });

export default sortTransactions;
