const getTransactionsSolde = (transactions, type = null, category = null) => {
  let solde = 0;
  if (!!transactions && !!transactions.length) {
    const depotSomme = transactions
      .filter((t) =>
        !category ? t.type === 'D' : t.type === 'D' && t.category === category,
      )
      .reduce(
        (accumulator, currentValue) =>
          parseFloat(accumulator) + parseFloat(currentValue.montant),
        0,
      );

    const retraitSomme = transactions
      .filter((t) =>
        !category ? t.type === 'R' : t.type === 'R' && t.category === category,
      )
      .reduce(
        (accumulator, currentValue) =>
          parseFloat(accumulator) + parseFloat(currentValue.montant),
        0,
      );

    solde = !type
      ? parseFloat(depotSomme - retraitSomme)
      : type === 'D'
      ? parseFloat(depotSomme)
      : parseFloat(retraitSomme);
  }
  return solde;
};

export default getTransactionsSolde;
