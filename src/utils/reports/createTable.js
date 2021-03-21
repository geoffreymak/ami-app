import * as tables from './tables';

const createTable = (type, ...params) => tables[type](...params);

export default createTable;
