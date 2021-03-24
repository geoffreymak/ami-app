const mergeMiseSolde = (mises) => {
  return mises.reduce(
    (accumulator, currentValue) => [
      accumulator[0] + currentValue.solde[0],
      accumulator[1] + currentValue.solde[1],
      accumulator[2] + currentValue.solde[2],
    ],
    [0, 0, 0],
  );
};

export default mergeMiseSolde;
