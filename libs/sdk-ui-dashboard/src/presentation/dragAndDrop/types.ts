// (C) 2022 GoodData Corporation

import { IDashboardAttributeFilter, ObjRef } from "@gooddata/sdk-model";

/**
 * @internal
 */
export type DraggableContentItemType =
    | "attributeFilter"
    | "attributeFilter-placeholder"
    | "insightListItem"
    | "widget"
    | "custom";

/**
 * @internal
 */
export type DraggableInternalItemType = "internal-width-resizer" | "internal-height-resizer";
/**
 * @internal
 */
export function isDraggableInternalItemType(type: string): type is DraggableInternalItemType {
    return type === "internal-width-resizer" || type === "internal-height-resizer";
}

/**
 * @internal
 */
export type DraggableItemType = DraggableContentItemType | DraggableInternalItemType;

/**
 * @internal
 */
export type AttributeFilterDraggableItem = {
    type: "attributeFilter";
    filter: IDashboardAttributeFilter;
    filterIndex: number;
};

/**
 * @internal
 */
export function isAttributeFilterDraggableItem(item: any): item is AttributeFilterDraggableItem {
    return item.type === "attributeFilter";
}

/**
 * @internal
 */
export type AttributeFilterPlaceholderDraggableItem = {
    type: "attributeFilter-placeholder";
};

/**
 * @internal
 */
export function isAttributeFilterPlaceholderDraggableItem(
    item: any,
): item is AttributeFilterPlaceholderDraggableItem {
    return item.type === "attributeFilter-placeholder";
}

/**
 * @internal
 */
export type InsightDraggableListItem = {
    type: "insightListItem";
    insightRef: ObjRef;
};

/**
 * @internal
 */
export function isInsightDraggableListItem(item: any): item is InsightDraggableListItem {
    return item.type === "insightListItem";
}

/**
 * @internal
 */
export type CustomDraggableItem = {
    type: "custom";
    [key: string]: any;
};

/**
 * @internal
 */
export type WidgetDraggableItem = {
    type: "widget";
    widget: never;
};

/**
 * @internal
 */
export type DraggableContentItem =
    | AttributeFilterDraggableItem
    | AttributeFilterPlaceholderDraggableItem
    | InsightDraggableListItem
    | CustomDraggableItem
    | WidgetDraggableItem;

/**
 * @internal
 */
export type DraggableInternalItem = HeightResizerDragItem;

/**
 * @internal
 */
export type DraggableItem = DraggableContentItem | DraggableInternalItem;

/**
 * @internal
 */
export type DraggableItemTypeMapping = DraggableItemComponentTypeMapping & DraggableItemInternalTypeMapping;

/**
 * @internal
 */
export type DraggableItemComponentTypeMapping = {
    attributeFilter: AttributeFilterDraggableItem;
    "attributeFilter-placeholder": AttributeFilterPlaceholderDraggableItem;
    insightListItem: InsightDraggableListItem;
    custom: CustomDraggableItem;
    widget: WidgetDraggableItem;
};

/**
 * @internal
 */
export interface HeightResizerDragItem {
    type: "internal-height-resizer";
    sectionIndex: number;
    itemIndexes: number[];
    widgetHeights: number[];
    initialScrollTop: number;
    minLimit: number;
    maxLimit: number;
}

/**
 * @internal
 */
export interface WidthResizerDragItem {
    type: "internal-height-resizer";
}

/**
 * @internal
 */
export type DraggableItemInternalTypeMapping = {
    "internal-width-resizer": WidthResizerDragItem;
    "internal-height-resizer": HeightResizerDragItem;
};

/**
 * @internal
 */
export type CustomDashboardAttributeFilterPlaceholderComponentProps = {
    disabled: boolean;
};

/**
 * @internal
 */
export type CustomDashboardAttributeFilterPlaceholderComponent =
    React.ComponentType<CustomDashboardAttributeFilterPlaceholderComponentProps>;

/**
 * @internal
 */
export type CustomDashboardInsightListItemComponentProps = {
    isLocked?: boolean;
    title?: string;
    updated?: string;
    type?: string;
    className?: string;
};

/**
 * @internal
 */
export type CustomDashboardInsightListItemComponent =
    React.ComponentType<CustomDashboardInsightListItemComponentProps>;
