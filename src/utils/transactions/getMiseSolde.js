const getMiseSolde = (mises, category = 'E') => {
  if (!!mises?.length) {
    const debitSomme = mises
      .filter((m) => m.category === category)
      .reduce(
        (accumulator, currentValue) =>
          parseFloat(accumulator) + parseFloat(currentValue.mise),
        0,
      );

    const creditSomme = mises
      .filter((m) => m.category === category && m.isActive === false)
      .reduce(
        (accumulator, currentValue) =>
          parseFloat(accumulator) + parseFloat(currentValue.mise),
        0,
      );

    const solde = parseFloat(parseFloat(debitSomme) - parseFloat(creditSomme));
    return [debitSomme, creditSomme, solde];
  }
  return [0, 0, 0];
};

export default getMiseSolde;
