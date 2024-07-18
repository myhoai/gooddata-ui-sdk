// (C) 2023-2024 GoodData Corporation
import { v4 as uuid } from "uuid";
import {
    DrillEventIntersectionElementHeader,
    IDrillEventIntersectionElement,
    IDrillIntersectionAttributeItem,
    isDrillIntersectionAttributeItem,
} from "@gooddata/sdk-ui";
import { areObjRefsEqual, ObjRef, IDashboardAttributeFilter } from "@gooddata/sdk-model";

/**
 *  For correct drill intersection that should be converted into AttributeFilters must be drill intersection:
 *  1. AttributeItem
 *  2. Not a date attribute
 */
function filterIntersection(
    intersection: DrillEventIntersectionElementHeader,
    dateDataSetsAttributesRefs: ObjRef[],
): boolean {
    const attributeItem = isDrillIntersectionAttributeItem(intersection) ? intersection : undefined;
    const ref = attributeItem?.attributeHeader?.formOf?.ref;

    return ref ? !dateDataSetsAttributesRefs.some((ddsRef) => areObjRefsEqual(ddsRef, ref)) : false;
}

export interface IConversionResult {
    attributeFilter: IDashboardAttributeFilter;
    primaryLabel?: ObjRef;
}

export function convertIntersectionToAttributeFilters(
    intersection: IDrillEventIntersectionElement[],
    dateDataSetsAttributesRefs: ObjRef[],
    backendSupportsElementUris: boolean,
    enableDuplicatedLabelValuesInAttributeFilter: boolean,
): IConversionResult[] {
    return intersection
        .map((i) => i.header)
        .filter((i: DrillEventIntersectionElementHeader) => filterIntersection(i, dateDataSetsAttributesRefs))
        .filter(isDrillIntersectionAttributeItem)
        .reduce((result, h: IDrillIntersectionAttributeItem) => {
            const ref = h.attributeHeader.ref;
            const elementValue =
                backendSupportsElementUris || enableDuplicatedLabelValuesInAttributeFilter
                    ? h.attributeHeaderItem.uri
                    : h.attributeHeaderItem.name;
            result.push({
                attributeFilter: {
                    attributeFilter: {
                        attributeElements: { uris: [elementValue] },
                        displayForm: ref,
                        negativeSelection: false,
                        localIdentifier: uuid(),
                    },
                },
                ...(enableDuplicatedLabelValuesInAttributeFilter
                    ? { primaryLabel: h.attributeHeader.primaryLabel }
                    : {}),
            });
            return result;
        }, [] as IConversionResult[]);
}
