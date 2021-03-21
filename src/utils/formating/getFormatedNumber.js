import numeral from 'numeral';

const getFormatedNumber = (number, noCurrency = false, format = null) =>
  `${numeral(number).format(format || '0,0[.]00')}${!noCurrency ? ' Fc' : ''}`;

export default getFormatedNumber;
