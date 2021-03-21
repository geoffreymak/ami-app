const getMemberFromTransaction = (transaction, members) => {
  if (!!transaction && !!members) {
    return members.find((member) => member.compte === transaction.compte);
  }
};

export default getMemberFromTransaction;
