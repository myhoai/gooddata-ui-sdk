// (C) 2019-2024 GoodData Corporation

import {
    AnalyticalWidgetType,
    IDashboardLayoutSize,
    IInsight,
    IInsightDefinition,
    IKpi,
    isDashboardWidget,
    ISettings,
    isInsight,
    isInsightWidget,
    isKpi,
    isKpiWidget,
    isKpiWithoutComparison,
    isWidget,
    IWidget,
    widgetType as getWidgetType,
    isVisualizationSwitcherWidget,
    IVisualizationSwitcherWidget,
    isDashboardLayout,
    IDashboardWidget,
    ScreenSize,
    IDashboardLayoutItem,
    IDashboardLayoutSizeByScreenSize,
} from "@gooddata/sdk-model";
import {
    fluidLayoutDescriptor,
    getInsightSizeInfo,
    INSIGHT_WIDGET_SIZE_INFO_DEFAULT,
    INSIGHT_WIDGET_SIZE_INFO_DEFAULT_LEGACY,
    INSIGHT_WIDGET_SIZE_INFO_NEW_DEFAULT,
    IVisualizationSizeInfo,
    KPI_WIDGET_SIZE_INFO_DEFAULT,
    KPI_WIDGET_SIZE_INFO_DEFAULT_LEGACY,
    RICH_TEXT_WIDGET_SIZE_INFO_DEFAULT,
    VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_DEFAULT,
    RICH_TEXT_WIDGET_SIZE_INFO_NEW_DEFAULT,
    VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_NEW_DEFAULT,
    DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT,
} from "@gooddata/sdk-ui-ext";

import { ObjRefMap } from "../metadata/objRefMap.js";
import {
    KPI_WITHOUT_COMPARISON_SIZE_INFO,
    KPI_WITH_COMPARISON_SIZE_INFO,
    GRID_ROW_HEIGHT_IN_PX,
} from "./constants.js";
import { ExtendedDashboardWidget } from "../../model/types/layoutTypes.js";

import { DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT } from "../dashboard/flexibleLayout/config.js";
import { invariant } from "ts-invariant";

/**
 * @internal
 */
export type MeasurableWidgetContent = IInsightDefinition | IKpi;

/**
 * @internal
 */
export function getSizeInfo(
    settings: ISettings,
    widgetType: AnalyticalWidgetType | ExtendedDashboardWidget["type"],
    widgetContent?: MeasurableWidgetContent,
): IVisualizationSizeInfo {
    if (widgetType === "kpi") {
        return getKpiSizeInfo(settings, widgetContent);
    } else if (widgetType === "richText") {
        return settings.enableDashboardFlexibleLayout
            ? RICH_TEXT_WIDGET_SIZE_INFO_NEW_DEFAULT
            : RICH_TEXT_WIDGET_SIZE_INFO_DEFAULT;
    } else if (widgetType === "IDashboardLayout") {
        return DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT;
    } else if (widgetType === "visualizationSwitcher" && !widgetContent) {
        return settings.enableDashboardFlexibleLayout
            ? VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_NEW_DEFAULT
            : VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_DEFAULT;
    }

    return getVisualizationSizeInfo(settings, widgetContent);
}

/**
 * @internal
 */
export function getInsightPlaceholderSizeInfo(settings: ISettings): IVisualizationSizeInfo {
    return getVisualizationSizeInfo(settings);
}

function getVisualizationSizeInfo(
    settings: ISettings,
    insight?: MeasurableWidgetContent,
): IVisualizationSizeInfo {
    let sizeInfo;
    if (isInsight(insight)) {
        sizeInfo = getInsightSizeInfo(insight, settings);
    }

    if (!sizeInfo) {
        if (!settings.enableKDWidgetCustomHeight) {
            return INSIGHT_WIDGET_SIZE_INFO_DEFAULT_LEGACY;
        }
        return settings.enableDashboardFlexibleLayout
            ? INSIGHT_WIDGET_SIZE_INFO_NEW_DEFAULT
            : INSIGHT_WIDGET_SIZE_INFO_DEFAULT;
    }
    return sizeInfo;
}

function getKpiSizeInfo(settings: ISettings, kpi?: MeasurableWidgetContent): IVisualizationSizeInfo {
    if (!settings.enableKDWidgetCustomHeight) {
        return KPI_WIDGET_SIZE_INFO_DEFAULT_LEGACY;
    }
    if (!isKpi(kpi)) {
        return KPI_WIDGET_SIZE_INFO_DEFAULT;
    }
    return isKpiWithoutComparison(kpi) ? KPI_WITHOUT_COMPARISON_SIZE_INFO : KPI_WITH_COMPARISON_SIZE_INFO;
}

/**
 * @internal
 */
export function getDashboardLayoutWidgetDefaultHeight(
    settings: ISettings,
    widgetType: AnalyticalWidgetType,
    widgetContent?: MeasurableWidgetContent, // undefined for placeholders
): number {
    const sizeInfo = getSizeInfo(settings, widgetType, widgetContent);
    return fluidLayoutDescriptor.toHeightInPx(sizeInfo.height.default!);
}

/**
 * @internal
 */
export function getDashboardLayoutWidgetMinGridHeight(
    settings: ISettings,
    widgetType: AnalyticalWidgetType,
    widgetContent?: MeasurableWidgetContent,
): number {
    const sizeInfo = getSizeInfo(settings, widgetType, widgetContent);
    return sizeInfo.height.min!;
}

/**
 * @internal
 */
export function getDashboardLayoutWidgetMaxGridHeight(
    settings: ISettings,
    widgetType: AnalyticalWidgetType,
    widgetContent?: MeasurableWidgetContent,
): number {
    const sizeInfo = getSizeInfo(settings, widgetType, widgetContent);
    return sizeInfo.height.max!;
}

/**
 * @internal
 */
export function getMinHeight(widgets: IWidget[], insightMap: ObjRefMap<IInsight>, defaultMin = 0): number {
    const mins: number[] = widgets.filter(isDashboardWidget).map((widget) => {
        let widgetContent: MeasurableWidgetContent | undefined;
        if (isKpiWidget(widget)) {
            widgetContent = widget.kpi;
        } else if (isInsightWidget(widget)) {
            widgetContent = insightMap.get(widget.insight);
        } else if (isVisualizationSwitcherWidget(widget) && widget.visualizations.length > 0) {
            return Math.max(
                ...getVisSwitcherHeightWidth(
                    widget,
                    widgetContent,
                    insightMap,
                    getDashboardLayoutWidgetMinGridHeight,
                ),
            );
        }

        return getDashboardLayoutWidgetMinGridHeight(
            { enableKDWidgetCustomHeight: true },
            getWidgetType(widget),
            widgetContent,
        );
    });
    return Math.max(defaultMin, ...mins);
}

const MAXIMUM_HEIGHT_OF_ROW_WITH_NESTED_WIDGETS = 2000;

/**
 * @internal
 */
export function getMaxHeight(widgets: IWidget[], insightMap: ObjRefMap<IInsight>): number {
    const containsNestedLayout = widgets.some(isDashboardLayout);
    if (containsNestedLayout) {
        return MAXIMUM_HEIGHT_OF_ROW_WITH_NESTED_WIDGETS;
    }

    const maxs: number[] = widgets.filter(isDashboardWidget).map((widget) => {
        let widgetContent: MeasurableWidgetContent | undefined;
        if (isKpiWidget(widget)) {
            widgetContent = widget.kpi;
        } else if (isInsightWidget(widget)) {
            widgetContent = insightMap.get(widget.insight);
        } else if (isVisualizationSwitcherWidget(widget) && widget.visualizations.length > 0) {
            return Math.min(
                ...getVisSwitcherHeightWidth(
                    widget,
                    widgetContent,
                    insightMap,
                    getDashboardLayoutWidgetMaxGridHeight,
                ),
            );
        }

        return getDashboardLayoutWidgetMaxGridHeight(
            { enableKDWidgetCustomHeight: true },
            getWidgetType(widget),
            widgetContent,
        );
    });
    return Math.min(...maxs);
}

/**
 * @internal
 */
export function getDashboardLayoutWidgetMinGridWidth(
    settings: ISettings,
    widgetType: AnalyticalWidgetType | ExtendedDashboardWidget["type"],
    widgetContent?: MeasurableWidgetContent, // undefined for placeholders
): number {
    const sizeInfo = getSizeInfo(settings, widgetType, widgetContent);
    return sizeInfo.width.min!;
}

type DashboardLayoutWidgetGridWidthHeight = (
    settings: ISettings,
    widgetType: AnalyticalWidgetType,
    widgetContent?: MeasurableWidgetContent,
) => number;

function getVisSwitcherHeightWidth(
    widget: IVisualizationSwitcherWidget,
    widgetContent: MeasurableWidgetContent | undefined,
    insightMap: ObjRefMap<IInsight>,
    fn: DashboardLayoutWidgetGridWidthHeight,
): number[] {
    const result: number[] = [];
    widget.visualizations.forEach((visualization) => {
        widgetContent = insightMap.get(visualization.insight);

        const heightWidth = fn({ enableKDWidgetCustomHeight: true }, getWidgetType(widget), widgetContent);

        result.push(heightWidth);
    });

    return result;
}

function getCurrentWidth(
    item: IDashboardLayoutItem<IDashboardWidget>,
    screen: ScreenSize,
): number | undefined {
    return determineWidthForScreen(screen, item.size);
}

/**
 * @internal
 */
export function getMinWidth(
    widget: IDashboardWidget,
    insightMap: ObjRefMap<IInsight>,
    screen: ScreenSize,
): number {
    let widgetContent: MeasurableWidgetContent | undefined;
    if (isKpiWidget(widget)) {
        widgetContent = widget.kpi;
    } else if (isInsightWidget(widget)) {
        widgetContent = insightMap.get(widget.insight);
    } else if (isVisualizationSwitcherWidget(widget) && widget.visualizations.length > 0) {
        return Math.max(
            ...getVisSwitcherHeightWidth(
                widget,
                widgetContent,
                insightMap,
                getDashboardLayoutWidgetMinGridWidth,
            ),
        );
    } else if (isDashboardLayout(widget)) {
        const emptyLayoutMinWidth = getDashboardLayoutWidgetMinGridWidth(
            { enableKDWidgetCustomHeight: true },
            widget.type,
        );

        return widget.sections.reduce((acc, section) => {
            return Math.max(
                acc,
                section.items.reduce((acc, item) => {
                    return Math.max(acc, getCurrentWidth(item, screen) ?? emptyLayoutMinWidth);
                }, emptyLayoutMinWidth),
            );
        }, emptyLayoutMinWidth);
    }

    const widgetType: AnalyticalWidgetType | ExtendedDashboardWidget["type"] = isWidget(widget)
        ? getWidgetType(widget)
        : widget.type;

    return getDashboardLayoutWidgetMinGridWidth(
        { enableKDWidgetCustomHeight: true },
        widgetType,
        widgetContent,
    );
}

/**
 * @internal
 */
export function calculateWidgetMinHeight(
    widget: ExtendedDashboardWidget,
    currentSize: IDashboardLayoutSize | undefined,
    insightMap: ObjRefMap<IInsight>,
    settings: ISettings,
): number | undefined {
    let widgetType: AnalyticalWidgetType;
    let insight: IInsight;
    let content: IInsight | IKpi;

    if (isWidget(widget)) {
        widgetType = getWidgetType(widget);
    }
    if (isInsightWidget(widget)) {
        insight = insightMap.get(widget.insight)!;
        content = insight;
    }
    if (isKpiWidget(widget)) {
        content = widget.kpi;
    }

    return currentSize
        ? getDashboardLayoutItemHeight(currentSize) ||
              (!currentSize.heightAsRatio
                  ? getDashboardLayoutWidgetDefaultHeight(settings, widgetType!, content!)
                  : undefined)
        : undefined;
}

export const getDashboardLayoutItemHeight = (size: IDashboardLayoutSize): number | undefined => {
    const { gridHeight } = size;
    if (gridHeight) {
        return getDashboardLayoutItemHeightForGrid(gridHeight);
    }

    return undefined;
};

export const getDashboardLayoutItemHeightForGrid = (gridHeight: number): number =>
    gridHeight * GRID_ROW_HEIGHT_IN_PX;

export const determineSizeForScreen = (
    screen: ScreenSize,
    layoutItemSize?: IDashboardLayoutSizeByScreenSize,
): IDashboardLayoutSize => {
    return {
        ...(layoutItemSize ? layoutItemSize[screen] : {}),
        gridWidth: determineWidthForScreen(screen, layoutItemSize),
    };
};

export const determineWidthForScreen = (
    screen: ScreenSize,
    layoutItemSize?: IDashboardLayoutSizeByScreenSize,
) => {
    // Determine if element has size set in metadata object for the current screen size
    const providedSizeForScreen = layoutItemSize ? layoutItemSize[screen] : undefined;
    // Use the provided size for the screen if it is known, otherwise determine the size for the current
    // screen if we at least know xl size from metadata object, otherwise expect the element to be root
    // element with that spans the full size.
    const itemSize =
        providedSizeForScreen ??
        implicitLayoutItemSizeFromXlSize(
            layoutItemSize?.xl ?? {
                gridWidth: DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT,
            },
        )[screen];
    // Expect element to be full size if we could not get the size for the current screen from the value above.
    return itemSize?.gridWidth ?? DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT;
};

/**
 * Derive dashboard layout size for all screens from dashboard layout size defined for xl screen.
 * We have only xl size saved in metadata, this will create additional screen sizes based on xl.
 *
 * @param xlSize - dashboard layout size for xl screen
 */
export function implicitLayoutItemSizeFromXlSize(
    xlSize: IDashboardLayoutSize,
): IDashboardLayoutSizeByScreenSize {
    const xlWidth = xlSize.gridWidth;
    const xlHeight = xlSize.gridHeight;
    const ratio = xlSize.heightAsRatio;

    switch (xlWidth) {
        case 0:
            return dashboardLayoutItemSizeForAllScreens(0, 0, 0, 0, 0, 0, 0);
        case 1:
            return dashboardLayoutItemSizeForAllScreens(ratio, xlHeight, xlWidth, xlWidth, 2, 6, 12);
        case 2:
            return dashboardLayoutItemSizeForAllScreens(ratio, xlHeight, xlWidth, xlWidth, 4, 6, 12);
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
            return dashboardLayoutItemSizeForAllScreens(ratio, xlHeight, xlWidth, xlWidth, 6, 12, 12);
        case 10:
            return dashboardLayoutItemSizeForAllScreens(ratio, xlHeight, xlWidth, xlWidth, 12, 12, 12);
        case 11:
            return dashboardLayoutItemSizeForAllScreens(ratio, xlHeight, xlWidth, xlWidth, 12, 12, 12);
        case 12:
            return dashboardLayoutItemSizeForAllScreens(ratio, xlHeight, xlWidth, xlWidth, 12, 12, 12);
        default:
            invariant(false, `Unsupported xlWidth: ${xlWidth}`);
    }
}

/**
 * Create dashboard layout item size for all screens,
 * with identical height, defined as ratio,
 * but different width, defined as grid items count.
 *
 * @param heightAsRatio - height as ratio to the width, defined in percents
 * @param gridHeight - height as number of grid rows
 * @param xl - width as grid items count for xl screen
 * @param lg - width as grid items count for lg screen
 * @param md - width as grid items count for md screen
 * @param sm - width as grid items count for sm screen
 * @param xs - width as grid items count for xs screen
 */
function dashboardLayoutItemSizeForAllScreens(
    heightAsRatio: number | undefined,
    gridHeight: number | undefined,
    xl: number,
    lg: number,
    md: number,
    sm: number,
    xs: number,
): IDashboardLayoutSizeByScreenSize {
    if (gridHeight) {
        return {
            xl: {
                gridWidth: xl,
                gridHeight,
            },
            lg: {
                gridWidth: lg,
                gridHeight,
            },
            md: {
                gridWidth: md,
                gridHeight,
            },
            sm: {
                gridWidth: sm,
                gridHeight,
            },
            xs: {
                gridWidth: xs,
                gridHeight,
            },
        };
    }
    return {
        xl: {
            gridWidth: xl,
            heightAsRatio,
        },
        lg: {
            gridWidth: lg,
            heightAsRatio,
        },
        md: {
            gridWidth: md,
            heightAsRatio,
        },
        sm: {
            gridWidth: sm,
            heightAsRatio,
        },
        xs: {
            gridWidth: xs,
            heightAsRatio,
        },
    };
}
