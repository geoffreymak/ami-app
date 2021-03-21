import React, { useState } from "react";
import { DataTable } from "react-native-paper";

const TablePagination = (props) => {
  const { itemsPerPage, itemsLength, page, onPageChange } = props;

  const numberOfPages =
    itemsLength % itemsPerPage === 0
      ? Math.floor(itemsLength / itemsPerPage)
      : Math.floor(itemsLength / itemsPerPage) + 1;

  const from = page * itemsPerPage;
  const to =
    page + 1 === numberOfPages ? itemsLength : (page + 1) * itemsPerPage;
  return (
    <DataTable.Pagination
      page={page}
      numberOfPages={numberOfPages}
      onPageChange={onPageChange}
      label={`${from + 1}-${to} sur ${itemsLength}`}
    />
  );
};

export default TablePagination;
