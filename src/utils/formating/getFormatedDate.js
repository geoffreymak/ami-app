import moment from 'moment';

const getFormatedDate = (date, format = null) =>
  moment(date).format(format || 'DD/MM/YYYY');

export default getFormatedDate;
