import React, {useState, useMemo} from 'react';

import {
  Card,
  Headline,
  DataTable,
  useTheme,
  Colors,
  Caption,
} from 'react-native-paper';

import TablePagination from '../TablePagination';

const Table = (props) => {
  const {
    title,
    colomns,
    rows,
    itemsPerPage,
    headerBackground,
    onRowPress,
    selectedRowOptions,
  } = props;
  const [page, setPage] = useState(0);
  const theme = useTheme();

  const paginationData = useMemo(() => {
    const from = page * itemsPerPage;
    const to = (page + 1) * itemsPerPage;
    return [from, to];
  }, [page, itemsPerPage]);

  return (
    <>
      {!!title && (
        <Headline style={{marginBottom: 10, color: theme.colors.primary}}>
          {title}
        </Headline>
      )}

      <Card>
        <DataTable>
          <DataTable.Header
            style={{
              backgroundColor: headerBackground || theme.colors.primary,
            }}>
            {!!colomns &&
              colomns.map((colomn, idx) => (
                <DataTable.Title
                  key={`table-title-${colomn.field}-${idx}`}
                  theme={{
                    ...theme,
                    colors: {...theme.colors, text: '#fff'},
                  }}>
                  {colomn.label || colomn.field}
                </DataTable.Title>
              ))}
          </DataTable.Header>

          {!!rows &&
            rows.slice(...paginationData).map((row, idx) => (
              <DataTable.Row
                key={`table-row-${idx}`}
                style={{
                  backgroundColor:
                    !!selectedRowOptions && selectedRowOptions.item
                      ? selectedRowOptions.item[selectedRowOptions.field] ===
                        row[selectedRowOptions.field]
                        ? Colors.green100
                        : idx % 2 === 0
                        ? theme.colors.row2
                        : theme.colors.row1
                      : idx % 2 === 0
                      ? theme.colors.row2
                      : theme.colors.row1,
                }}
                onPress={() => onRowPress(row)}>
                {!!colomns &&
                  colomns.map((colomn, idx) => (
                    <DataTable.Cell
                      key={`table-cell-${colomn.field}-${idx}`}
                      theme={{
                        ...theme,
                        colors: {...theme.colors, text: '#fff'},
                      }}>
                      {idx > 0 && '| '}
                      <Caption
                        style={{
                          color: !!colomn.getFieldColor
                            ? colomn.getFieldColor(row[colomn.field], row)
                            : theme.colors.text,
                        }}>
                        {colomn.transform
                          ? colomn.transform(row[colomn.field])
                          : row[colomn.field]}
                      </Caption>
                    </DataTable.Cell>
                  ))}
              </DataTable.Row>
            ))}

          <TablePagination
            page={page}
            onPageChange={(page) => setPage(page)}
            itemsPerPage={itemsPerPage}
            itemsLength={(!!rows && rows.length) || 0}
          />
        </DataTable>
      </Card>
    </>
  );
};

export default Table;
