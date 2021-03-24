const mergeTransactionFromMise = (mises) => {
  let transactions = [];
  mises.forEach((mise) => {
    const transaction = mise.transactions.map((t) => {
      const data = {...t, ...mise};
      delete data.transactions;
      return data;
    });
    transactions = [...transactions, ...transaction];
  });
  return transactions;
};

export default mergeTransactionFromMise;
