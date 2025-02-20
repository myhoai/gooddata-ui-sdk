// (C) 2007-2022 GoodData Corporation
import { ICellRendererParams } from "@ag-grid-community/all-modules";
import { isSomeTotal } from "../data/dataSourceUtils";
import escape from "lodash/escape";
import { VALUE_CLASS } from "../base/constants";
import { IGridTotalsRow } from "../data/resultTypes";
import { agColId } from "../structure/tableDescriptorTypes";

function hasTotalForCurrentColumn(params: ICellRendererParams): boolean {
    const row = params.data as IGridTotalsRow;

    if (!row?.calculatedForColumns || !params.colDef) {
        return false;
    }

    const colId = agColId(params.colDef);

    return row.calculatedForColumns.some((col) => col === colId);
}

/**
 * Returns common implementation of cell renderer used for normal cells, sticky header cells and totals.
 *
 * TODO: Consider to use custom pinnerRowCellRenderer in order to reduce number of conditionals
 */
export function createCellRenderer(): (params: ICellRendererParams) => string {
    return (params: ICellRendererParams): string => {
        const isRowTotalOrSubtotal = isSomeTotal(params.data?.type);
        const isActiveRowTotal = isRowTotalOrSubtotal && hasTotalForCurrentColumn(params);
        const formattedValue =
            isRowTotalOrSubtotal && !isActiveRowTotal && !params.value
                ? "" // inactive row total cells should be really empty (no "-") when they have no value (RAIL-1525)
                : escape(params.formatValue!(params.value));
        const className = params.node.rowPinned === "top" ? "gd-sticky-header-value" : VALUE_CLASS;

        return `<span class="${className}">${formattedValue || ""}</span>`;
    };
}
