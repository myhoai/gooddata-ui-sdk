// (C) 2021-2022 GoodData Corporation

import {
    bucketSetTotals,
    defSetDimensions,
    defWithDimensions,
    emptyDef,
    IExecutionDefinition,
    MeasureGroupIdentifier,
    newBucket,
    newDefForBuckets,
    newDimension,
    newTotal,
    newTwoDimensional,
} from "@gooddata/sdk-model";
import { ReferenceMd } from "@gooddata/reference-workspace";

import { convertTotals } from "../TotalsConverter";

const TotalSum1 = newTotal("sum", "m1", "localAttr1");
const TotalSum2 = newTotal("sum", "m2", "localAttr1");
const TotalSum3 = newTotal("sum", "m3", "localAttr1");
const TotalMin1 = newTotal("min", "m1", "localAttr1");
const TotalMax2 = newTotal("max", "m2", "localAttr1");
const TotalNat1 = newTotal("nat", "m1", "localAttr1");
const TotalOtherDim = { ...TotalSum1, attributeIdentifier: "localAttr2" };

const Test0 = defWithDimensions(
    emptyDef("test"),
    newDimension(["localAttr1", "localAttr2"], []),
    newDimension([MeasureGroupIdentifier]),
);
const Test1 = defWithDimensions(
    emptyDef("test"),
    newDimension(["localAttr1", "localAttr2"], [TotalSum1]),
    newDimension([MeasureGroupIdentifier]),
);
const Test2 = defWithDimensions(
    emptyDef("test"),
    newDimension([MeasureGroupIdentifier, "localAttr2"]),
    newDimension(["localAttr1"], [TotalSum1]),
);
const Test3 = defWithDimensions(
    emptyDef("test"),
    newDimension(["localAttr1", "localAttr2"], [TotalSum1, TotalMin1]),
    newDimension(["localAttr3", MeasureGroupIdentifier]),
);
const Test4 = defWithDimensions(
    emptyDef("test"),
    newDimension(["localAttr1"], [TotalSum1, TotalSum2, TotalSum3]),
    newDimension(["localAttr3", MeasureGroupIdentifier]),
);
const Test5 = defWithDimensions(
    emptyDef("test"),
    newDimension(["localAttr1"], [TotalSum1, TotalSum2, TotalMin1, TotalMax2]),
    newDimension([MeasureGroupIdentifier]),
);
const Test6 = defWithDimensions(
    emptyDef("test"),
    newDimension(["localAttr1"], [TotalSum1]),
    newDimension([MeasureGroupIdentifier]),
    newDimension(["localAttr2"], [TotalOtherDim]),
);
const Test7 = defWithDimensions(
    emptyDef("test"),
    newDimension(["localAttr1", "localAttr2"], [TotalSum1, TotalOtherDim]),
    newDimension(["localAttr3", MeasureGroupIdentifier]),
);
const Test8 = defWithDimensions(
    emptyDef("test"),
    newDimension(["localAttr1", MeasureGroupIdentifier], [TotalSum1]),
    newDimension(["localAttr3"]),
);
const Test9 = defWithDimensions(
    emptyDef("test"),
    newDimension(["localAttr1"], [TotalSum1]),
    newDimension(["localAttr3"]),
);
const Test10 = defWithDimensions(
    emptyDef("test"),
    newDimension(["localAttr1", "localAttr2", MeasureGroupIdentifier], [TotalSum1]),
);
// Grand totals
const total = newTotal("sum", ReferenceMd.WinRate, ReferenceMd.Account.Name);
const columnTotal = newTotal("sum", ReferenceMd.WinRate, ReferenceMd.Department);
const Test11 = defSetDimensions(
    newDefForBuckets("test", [
        newBucket("measure", ReferenceMd.WinRate),
        bucketSetTotals(newBucket("attribute", ReferenceMd.Account.Name), [total]),
        bucketSetTotals(newBucket("columns", ReferenceMd.Department), [columnTotal]),
    ]),
    newTwoDimensional(
        [ReferenceMd.Account.Name, total],
        [ReferenceMd.Department, MeasureGroupIdentifier, columnTotal],
    ),
);
// Marginal totals
const subtotal = newTotal("sum", ReferenceMd.WinRate, ReferenceMd.ForecastCategory);
const columnSubTotal = newTotal("sum", ReferenceMd.WinRate, ReferenceMd.IsActive);
const Test12 = defSetDimensions(
    newDefForBuckets("test", [
        newBucket("measure", ReferenceMd.WinRate),
        bucketSetTotals(newBucket("attribute", ReferenceMd.Account.Name, ReferenceMd.ForecastCategory), [
            subtotal,
        ]),
        bucketSetTotals(newBucket("columns", ReferenceMd.Department, ReferenceMd.IsActive), [columnSubTotal]),
    ]),
    newTwoDimensional(
        [ReferenceMd.Account.Name, ReferenceMd.ForecastCategory, subtotal],
        [ReferenceMd.Department, ReferenceMd.IsActive, MeasureGroupIdentifier, columnSubTotal],
    ),
);

const Test13 = defWithDimensions(
    emptyDef("test"),
    newDimension(["localAttr1", "localAttr2"], [TotalNat1]),
    newDimension([MeasureGroupIdentifier]),
);

describe("convertTotals", () => {
    const Scenarios: Array<[string, IExecutionDefinition]> = [
        ["no totals", Test0],
        ["attributes in first dim and measure group in second dim", Test1],
        ["measure group and attribute in one dimension", Test2],
        ["two totals with different functions", Test3],
        ["three totals with the same function", Test4],
        ["multiple totals with various functions", Test5],
        ["three dimensions", Test6],
        ["subtotal", Test7],
        ["total on dimension with measure group", Test8],
        ["total without any measure group", Test9],
        ["total on single dimension result spec", Test10],
        ["two totals and grand total", Test11],
        ["two subtotals and marginal total", Test12],
    ];
    const ErrorScenarios: Array<[string, IExecutionDefinition]> = [["native total", Test13]];

    it.each(Scenarios)("should correctly convert %s", (_desc, def) => {
        expect(convertTotals(def)).toMatchSnapshot();
    });
    it.each(ErrorScenarios)("should fail on converting %s", (_desc, def) => {
        expect(() => convertTotals(def)).toThrowErrorMatchingSnapshot();
    });
});
