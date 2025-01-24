const depCruiser = require("../../common/config/dep-cruiser/default.config");

options = {
    forbidden: [
        ...depCruiser.DefaultRules,
        ...depCruiser.DefaultSdkRules,
        ...depCruiser.PublicLibraryRules,

        depCruiser.isolatedSubmodule("constants", "src/presentation/constants"),
        depCruiser.isolatedSubmodule("localization", "src/presentation/localization"),
        depCruiser.moduleWithDependencies(
            "presentationComponents",
            "src/presentation/presentationComponents",
            ["src/presentation/export"],
        ),

        // TODO: RAIL-3611
        // depCruiser.moduleWithDependencies("_staging", "src/_staging",["src/types.ts"]),
        depCruiser.moduleWithDependencies("converters", "src/converters", ["src/types.ts"]),
        depCruiser.moduleWithDependencies("componentDefinition", "src/presentation/componentDefinition", [
            "src/model",
            "src/presentation/dashboardContexts/types.ts",
            "src/presentation/dragAndDrop/types.ts",
            "src/presentation/filterBar/types.ts",
            "src/presentation/widget/types.ts",
            "src/types.ts",
        ]),
        depCruiser.moduleWithDependencies(
            "dashboard",
            "src/presentation/dashboard/", // the trailing / is necessary here, otherwise dashboardContexts is matched as well
            [
                "src/_staging/*",
                "src/model",
                "src/presentation/constants",
                "src/presentation/dashboardContexts",
                "src/presentation/dialogs",
                "src/presentation/dragAndDrop",
                "src/presentation/dragAndDrop/types.ts",
                "src/presentation/dragAndDrop/draggableWidget/DraggableInsightListItem.tsx",
                "src/presentation/filterBar",
                "src/presentation/insightList",
                "src/presentation/kpiDeleteDialog",
                "src/presentation/layout",
                "src/presentation/localization",
                "src/presentation/scheduledEmail",
                "src/presentation/shareDialog",
                "src/presentation/deleteDialog",
                "src/presentation/widgetDeleteDialog",
                "src/presentation/cancelEditDialog",
                "src/presentation/saveAs",
                "src/presentation/alerting",
                "src/presentation/alerting/types.ts",
                "src/presentation/topBar",
                "src/presentation/toolbar",
                "src/presentation/widget",
                "src/presentation/componentDefinition",
                "src/presentation/componentDefinition/types.ts",
                "src/types.ts",
                "src/presentation/flexibleLayout/dragAndDrop/draggableWidget/useWidgetDragHoverHandlers.ts",
                "src/presentation/layout/dragAndDrop/draggableWidget/useWidgetDragHoverHandlers.ts",
                "src/presentation/layout/dragAndDrop/DragLayer.tsx",
                "src/presentation/flexibleLayout/dragAndDrop/DragLayer.tsx",
                "src/presentation/dragAndDrop/WrapCreatePanelItemWithDrag.tsx",
            ],
        ),
        depCruiser.moduleWithDependencies("dashboardContexts", "src/presentation/dashboardContexts", [
            "src/model",
            "src/presentation/componentDefinition/types.ts",
            "src/presentation/dashboard/DashboardSidebar/types.ts",
            "src/presentation/filterBar/types.ts",
            "src/presentation/layout/types.ts",
            "src/presentation/saveAs/types.ts",
            "src/presentation/alerting/types.ts",
            "src/presentation/scheduledEmail/types.ts",
            "src/presentation/shareDialog/types.ts",
            "src/presentation/topBar/types.ts",
            "src/presentation/toolbar/types.ts",
            "src/presentation/widget/types.ts",
            "src/presentation/dashboard/types.ts",
            "src/types.ts",
        ]),
        depCruiser.moduleWithDependencies("dialogs", "src/presentation/dialogs", [
            "src/_staging/*",
            "src/presentation/dashboardContexts",
            "src/types.ts",
        ]),
        depCruiser.moduleWithDependencies("dragAndDrop", "src/presentation/dragAndDrop", [
            "src/_staging/*",
            "src/model",
            "src/model/types/layoutTypes.ts",
            "src/types.ts",
            "src/presentation/componentDefinition",
            "src/presentation/componentDefinition/types.ts",
            "src/presentation/dashboard/DashboardSidebar/DraggableInsightList",
            "src/presentation/dashboardContexts",
            "src/presentation/filterBar",
            "src/presentation/filterBar/types.ts",
            "src/presentation/layout/*",
            "src/presentation/layout/constants.ts",
            "src/presentation/layout/DefaultDashboardLayoutRenderer/utils/sizing.ts",
            "src/presentation/widget/types.ts",
            "src/presentation/constants/*",
            "src/presentation/constants.ts",
            "src/widgets",
        ]),
        depCruiser.moduleWithDependencies("drill", "src/presentation/drill", [
            "src/_staging/*",
            "src/model",
            "src/presentation/constants",
            "src/presentation/types.ts",
            "src/presentation/localization",
            "src/types.ts",
            "src/converters",
            "src/presentation/widget/common/useWidgetFilters.ts",
            "src/presentation/widget/insight/configuration/DrillTargets/useInvalidFilteringParametersIdentifiers.ts",
        ]),
        depCruiser.moduleWithDependencies("filterBar", "src/presentation/filterBar", [
            "src/_staging/*",
            "src/model",
            "src/presentation/componentDefinition",
            "src/presentation/constants",
            "src/presentation/dashboardContexts",
            "src/presentation/dragAndDrop",
            "src/presentation/layout/dragAndDrop/Resize/BulletsBar/BulletsBar.tsx",
            "src/presentation/flexibleLayout/dragAndDrop/Resize/BulletsBar/BulletsBar.tsx",
            "src/presentation/localization",
            "src/presentation/widget/common/configuration/ConfigurationBubble.tsx",
            "src/model/store/meta/index.ts",
        ]),
        depCruiser.moduleWithDependencies("layout", "src/presentation/layout", [
            "src/_staging/*",
            "src/model",
            "src/presentation/componentDefinition",
            "src/presentation/constants",
            "src/presentation/constants.ts",
            "src/presentation/dashboardContexts",
            "src/presentation/dragAndDrop",
            "src/presentation/dragAndDrop/DragLayerPreview/types.ts",
            "src/presentation/dragAndDrop/Resize/useScrollCorrection.ts",
            "src/presentation/dragAndDrop/debug.ts",
            "src/presentation/dragAndDrop/types.ts",
            "src/presentation/flexibleLayout/dragAndDrop/DragLayerPreview/WidthResizerDragPreview.tsx",
            "src/presentation/flexibleLayout",
            "src/presentation/localization",
            "src/presentation/presentationComponents",
            "src/presentation/widget",
            "src/presentation/export",
            "src/types.ts",
            "src/widgets",
        ]),
        depCruiser.moduleWithDependencies("logUserInteraction", "src/logUserInteraction", ["src/model"]),
        depCruiser.moduleWithDependencies("model", "src/model", [
            "src/_staging/*",
            "src/converters",
            "src/widgets",
            "src/types.ts",
            "src/presentation/dragAndDrop/types.ts",
            "src/presentation/flexibleLayout/DefaultDashboardLayoutRenderer/utils/sizing.ts",
        ]),
        depCruiser.moduleWithDependencies("presentation", "src/presentation", [
            "src/_staging/*",
            "src/converters",
            "src/logUserInteraction",
            "src/model",
            "src/model/events/widget.ts",
            "src/model/types/layoutTypes.ts",
            "src/types.ts",
            "src/widgets",
            "src/model/store/meta/index.ts",
        ]),
        depCruiser.moduleWithDependencies("scheduledEmail", "src/presentation/scheduledEmail", [
            "src/_staging/*",
            "src/model",
            "src/presentation/dashboardContexts",
            "src/presentation/localization",
            "src/presentation/constants/*",
            "src/converters",
            "src/types.ts",
        ]),
        depCruiser.moduleWithDependencies("alerting", "src/presentation/alerting", [
            "src/_staging/*",
            "src/model",
            "src/presentation/dashboardContexts",
            "src/presentation/localization",
            "src/presentation/constants/*",
            "src/presentation/widget/*",
            "src/converters",
            "src/types.ts",
        ]),
        depCruiser.moduleWithDependencies("saveAs", "src/presentation/saveAs", [
            "src/model",
            "src/presentation/dashboardContexts",
            "src/presentation/localization",
            "src/presentation/constants/*",
        ]),
        depCruiser.moduleWithDependencies("topBar", "src/presentation/topBar", [
            "src/_staging/*",
            "src/model",
            "src/presentation/dashboardContexts",
            "src/presentation/localization",
            "src/presentation/constants/*",
            "src/presentation/componentDefinition",
            "src/types.ts",
        ]),
        depCruiser.moduleWithDependencies("widget", "src/presentation/widget", [
            "src/_staging/*",
            "src/converters",
            "src/logUserInteraction",
            "src/model",
            "src/model/events/widget.ts",
            "src/presentation/componentDefinition",
            "src/presentation/constants/*",
            "src/presentation/dashboardContexts",
            "src/presentation/dragAndDrop",
            "src/presentation/drill",
            "src/presentation/drill/DrillSelect/types.ts",
            "src/presentation/drill/DrillConfigPanel/*",
            "src/presentation/drill/types.ts",
            "src/presentation/insightList",
            "src/presentation/dashboardList",
            "src/presentation/localization",
            "src/presentation/presentationComponents",
            "src/presentation/export",
            "src/presentation/scheduledEmail/*",
            "src/types.ts",
            "src/widgets",
            "src/presentation/dashboard/components/DashboardScreenSizeContext.tsx",
            "src/presentation/layout/dragAndDrop/draggableWidget/EmptyDashboardDropZone.ts",
            "src/presentation/flexibleLayout/dragAndDrop/draggableWidget/EmptyDashboardDropZone.ts",
        ]),
    ],
    options: depCruiser.DefaultOptions,
};

module.exports = options;
