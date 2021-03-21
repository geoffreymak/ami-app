const getAttribut = (attribut) => {
  switch (attribut) {
    case "A1":
      return "Administrateur";
    case "A2":
      return "Superviseur";
    case "A3":
      return "Collecteur";

    default:
      return "";
  }
};

export default getAttribut;
