const mergeTransactionFromMise = (mises, category) => {
  let transactions = [];
  mises
    .filter((t) => t.category === category)
    .forEach((mise) => {
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
