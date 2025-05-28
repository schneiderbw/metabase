import { useCallback } from "react";
import { t } from "ttag";

import { useDispatch } from "metabase/lib/redux";
import { addUndo } from "metabase/redux/undo";
import {
  useTableRedoMutation,
  useTableUndoMutation,
} from "metabase-enterprise/api/table-data-edit";
import type { ConcreteTableId, RowValue } from "metabase-types/api";

import type { TableEditingScope } from "../types";

import type { TableEditingStateUpdateStrategy } from "./use-table-state-update-strategy";

type UseTableEditingUndoRedoProps = {
  tableId: ConcreteTableId;
  scope?: TableEditingScope;
  stateUpdateStrategy: TableEditingStateUpdateStrategy;
};

export function useTableEditingUndoRedo({
  tableId,
  scope,
  stateUpdateStrategy,
}: UseTableEditingUndoRedoProps) {
  const [undoMutation, { isLoading: isUndoLoading }] = useTableUndoMutation();
  const [redoMutation, { isLoading: isRedoLoading }] = useTableRedoMutation();
  const dispatch = useDispatch();

  const handleResponse = useCallback(
    (
      operationName: "undo" | "redo",
      response:
        | Awaited<ReturnType<typeof undoMutation>>
        | Awaited<ReturnType<typeof redoMutation>>,
    ) => {
      if (response.error) {
        dispatch(
          addUndo({
            icon: "warning",
            toastColor: "error",
            message:
              operationName === "undo"
                ? t`Unable to perform undo operation`
                : t`Unable to perform redo operation`,
          }),
        );
      } else if (!response.data) {
        dispatch(
          addUndo({
            icon: "warning",
            toastColor: "warning",
            message:
              operationName === "undo"
                ? t`Nothing to undo`
                : t`Nothing to redo`,
          }),
        );
      } else if (response.data?.outputs) {
        const operations = response.data?.outputs.reduce(
          (acc, output) => {
            if (output["action-type"] === "create") {
              acc.created.push(output.row);
            } else if (output["action-type"] === "update") {
              acc.updated.push(output.row);
            } else if (output["action-type"] === "delete") {
              acc.deleted.push(output.row);
            }

            return acc;
          },
          {
            created: [] as Record<string, RowValue>[],
            updated: [] as Record<string, RowValue>[],
            deleted: [] as Record<string, RowValue>[],
          },
        );

        if (operations.created.length > 0) {
          stateUpdateStrategy.onRowsCreated(operations.created);
        }
        if (operations.updated.length > 0) {
          stateUpdateStrategy.onRowsUpdated(operations.updated);
        }
        if (operations.deleted.length > 0) {
          stateUpdateStrategy.onRowsDeleted(operations.deleted);
        }
      }
    },
    [dispatch, stateUpdateStrategy],
  );
  const undo = useCallback(async () => {
    const response = await undoMutation({ tableId, scope });
    handleResponse("undo", response);
  }, [undoMutation, tableId, scope, handleResponse]);

  const redo = useCallback(async () => {
    const response = await redoMutation({ tableId, scope });
    handleResponse("redo", response);
  }, [redoMutation, tableId, scope, handleResponse]);

  const currentActionLabel = isUndoLoading
    ? t`Undoing actions...`
    : isRedoLoading
      ? t`Redoing actions...`
      : undefined;

  return { undo, redo, isUndoLoading, isRedoLoading, currentActionLabel };
}
