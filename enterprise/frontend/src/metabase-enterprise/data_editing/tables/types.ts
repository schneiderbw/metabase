import type {
  ConcreteTableId,
  DatasetColumn,
  RowValue,
  TableId,
} from "metabase-types/api";

export type RowCellsWithPkValue = Record<DatasetColumn["name"], RowValue>;

export type RowPkValue = string | number;

export type CellUniqKey = string;

export type TableEditingScope =
  | { "table-id": ConcreteTableId }
  | { "dashcard-id": number };

export type TableInsertRowsRequest = {
  rows: RowCellsWithPkValue[];
  scope?: TableEditingScope;
};

export type TableInsertRowsResponse = {
  outputs: { op: "created"; row: RowCellsWithPkValue; "table-id": TableId }[];
};

export type TableUpdateRowsRequest = {
  rows: RowCellsWithPkValue[];
  scope?: TableEditingScope;
};

export type TableUpdateRowsResponse = {
  outputs: { op: "updated"; row: RowCellsWithPkValue; "table-id": TableId }[];
};

export type TableDeleteRowsRequest = {
  rows: RowCellsWithPkValue[];
  scope?: TableEditingScope;
};

export type TableDeleteRowsResponse = {
  outputs: { op: "deleted"; row: RowCellsWithPkValue; "table-id": TableId }[];
};

export type UpdateCellValueHandlerParams = {
  updatedData: RowCellsWithPkValue;
  rowIndex: number;
  columnName: string;
};

export type UpdatedRowHandlerParams = {
  updatedData: RowCellsWithPkValue;
  rowIndex: number;
};

export type TableUndoRedoRequest = {
  tableId: ConcreteTableId;
  scope?: TableEditingScope;
};

export type TableOperation = [string, Record<string, RowValue>];

export type TableUndoRedoResponse = {
  outputs?: {
    "action-type": "create" | "update" | "delete";
    row: RowCellsWithPkValue;
    "table-id": TableId;
  }[];
};
