// (C) 2023-2024 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { DashboardContext } from "../../types/commonTypes.js";
import { AddDrillDownForInsightWidget } from "../../commands/index.js";
import { DashboardInsightWidgetDrillDownAdded, insightWidgetDrillDownAdded } from "../../events/insight.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { layoutActions } from "../../store/layout/index.js";
import { existBlacklistHierarchyPredicate } from "../../utils/attributeHierarchyUtils.js";
import { selectAllCatalogAttributeHierarchies } from "../../store/catalog/catalogSelectors.js";
import { getHierarchyRef } from "@gooddata/sdk-model";

export function* addDrillDownForInsightWidgetHandler(
    ctx: DashboardContext,
    cmd: AddDrillDownForInsightWidget,
): SagaIterator<DashboardInsightWidgetDrillDownAdded> {
    const {
        payload: { attributeIdentifier, drillDownIdentifier, drillDownAttributeHierarchyRef },
        correlationId,
    } = cmd;
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const insightWidget = validateExistingInsightWidget(widgets, cmd, ctx);
    const { ref: widgetRef, ignoredDrillDownHierarchies: currentBlacklistHierarchies } = insightWidget;

    const hierarchies: ReturnType<typeof selectAllCatalogAttributeHierarchies> = yield select(
        selectAllCatalogAttributeHierarchies,
    );

    const hierarchy = hierarchies.find((hierarchy) => {
        const hierarchyRef = getHierarchyRef(hierarchy);
        return hierarchyRef === drillDownAttributeHierarchyRef;
    });

    const updatedInsightDrills = insightWidget.drills.filter(
        (drill) => drill.localIdentifier !== drillDownIdentifier,
    );

    yield put(
        layoutActions.replaceWidgetDrills({
            ref: insightWidget.ref,
            drillDefinitions: updatedInsightDrills,
            undo: {
                cmd,
            },
        }),
    );

    const newBlacklistHierarchies =
        currentBlacklistHierarchies && hierarchy
            ? currentBlacklistHierarchies.filter(
                  (ref) => !existBlacklistHierarchyPredicate(ref, hierarchy, attributeIdentifier),
              )
            : [];

    yield put(
        layoutActions.replaceWidgetBlacklistHierarchies({
            ref: widgetRef,
            blacklistHierarchies: newBlacklistHierarchies,
            undo: {
                cmd,
            },
        }),
    );

    return insightWidgetDrillDownAdded(
        ctx,
        widgetRef,
        drillDownAttributeHierarchyRef,
        attributeIdentifier,
        correlationId,
    );
}
