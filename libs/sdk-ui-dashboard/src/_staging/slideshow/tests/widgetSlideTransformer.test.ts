// (C) 2025 GoodData Corporation
import { describe, it, expect } from "vitest";
import { switcherSlideTransformer } from "../switcherSlideTransformer";
import { IDashboardLayoutItem } from "@gooddata/sdk-model";
import { widgetSlideTransformer } from "../widgetSlideTransformer";

const widget1 = {
    size: {
        xl: {
            gridWidth: 4,
            gridHeight: 4,
        },
    },
    type: "IDashboardLayoutItem",
    widget: {
        type: "insight",
        insight: { type: "insight", identifier: "test1" },
        ref: { type: "insight", identifier: "test1" },
        identifier: "test1",
        drills: [],
    },
};

describe("WidgetSlideTransformer", () => {
    it("always transform", () => {
        const data = widgetSlideTransformer(widget1 as IDashboardLayoutItem);

        expect(data).toEqual([
            {
                items: [
                    {
                        ...widget1,
                        size: {
                            xl: {
                                gridHeight: 22,
                                gridWidth: 12,
                            },
                        },
                    },
                ],
                type: "IDashboardLayoutSection",
            },
        ]);
    });
});
