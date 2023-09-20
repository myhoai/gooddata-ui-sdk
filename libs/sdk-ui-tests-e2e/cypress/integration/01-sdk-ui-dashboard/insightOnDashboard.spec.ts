// (C) 2023 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { Widget } from "../../tools/widget";
import { EditMode } from "../../tools/editMode";
import { InsightsCatalog } from "../../tools/insightsCatalog";
import { DateFilter } from "../../tools/dateFilter";
import { Dashboard } from "../../tools/dashboards";
import { WidgetConfiguration } from "../../tools/widgetConfiguration";

const dashboard = new Dashboard();
const editMode = new EditMode();
const widget = new Widget(0);
const secondWidget = new Widget(1);
const widgetConfiguration = new WidgetConfiguration(0);
const secondWidgetConfiguration = new WidgetConfiguration(1);
const insightCatalog = new InsightsCatalog();

const DATASET_CREATED = "Created";
const DATASET_SNAPSHOT = "Snapshot";
const DATASET_CLOSED = "Closed";

describe("Insights on dashboard", () => {
    beforeEach(() => {
        Navigation.visit("dashboard/insight");
        editMode.isInEditMode(false).edit().isInEditMode();
    });

    //CL-10262: Save&Publish button is enabled right when selecting insight
    it("should disable save button if having no change", { tags: ["checklist_integrated_tiger"] }, () => {
        widget.waitChartLoaded().getChart();
        editMode.saveButtonEnabled(false);
    });

    it("has insight placeholder title", { tags: ["checklist_integrated_tiger"] }, () => {
        insightCatalog.waitForCatalogLoad();
        widget
            .waitChartLoaded()
            .getTitle()
            .then(($el) => {
                widget.hasPlaceholderTitle($el.text());
            });
    });

    it("shows a message if there is no data match", { tags: ["checklist_integrated_tiger"] }, () => {
        insightCatalog
            .waitForCatalogReload()
            .searchText('<a href="http://www.w3schools.com">Go!</a>')
            .hasNoDataMessage()
            .clearSearch();
    });

    it("should keep the panel after clearing search", { tags: ["checklist_integrated_bear"] }, () => {
        insightCatalog
            .waitForCatalogReload()
            .clickTab("all")
            .searchText("no data")
            .clearSearch()
            .tabIsActive("all", true);
    });

    it("Should show no data message if insight has no data", { tags: ["checklist_integrated_tiger"] }, () => {
        new DateFilter().open().selectRelativePreset("this-week").apply();
        widget.waitChartLoaded().getChart().hasNoDataForFilter();
    });

    it("(SEPARATE) can rename an existing insight", { tags: ["checklist_integrated_tiger"] }, () => {
        widget.waitChartLoaded();
        cy.fixture("widgetName").then((data) => {
            data.forEach((result: { widgetName: string }) => {
                widget.setTitle(result.widgetName).hasTitle(result.widgetName);
            });
        });

        editMode.save();
        widget.waitChartLoaded().hasTitle("<button>hello</button>");
    });

    //Cover ticket: RAIL-4783
    it(
        "Dashboard should be displayed well after drag and drop new insight",
        { tags: ["checklist_integrated_bear"] },
        () => {
            dashboard.getWidget(0).addBefore("ColumnChart");
            new WidgetConfiguration(0).openInteractions().hasInteractions(true);
        },
    );
});

describe("Date filtering on insight", () => {
    beforeEach(() => {
        Navigation.visit("dashboard/dashboard-date-filtering-on-insight-scenario");
        editMode.isInEditMode(false).edit().isInEditMode();
    });

    it(
        "remember last setting after selecting another insight",
        { tags: ["checklist_integrated_tiger_temp"] },
        () => {
            widget.waitChartLoaded();

            widgetConfiguration.open().openConfiguration().selectDateDataset(DATASET_CREATED);

            secondWidget.hasTitle("Column with two measures by date");
            secondWidgetConfiguration.open();

            widgetConfiguration.open().openConfiguration().hasDatasetSelected(DATASET_CREATED);
        },
    );

    it("disable date filter", { tags: ["checklist_integrated_tiger_temp"] }, () => {
        widget.waitChartLoaded();
        widgetConfiguration
            .open()
            .openConfiguration()
            .isDateDatasetDropdownExist(true)
            .disableDateFilter()
            .isDateDatasetDropdownExist(false);
    });

    it("enable date filter", { tags: ["checklist_integrated_tiger_temp"] }, () => {
        widget.waitChartLoaded();
        widgetConfiguration
            .open()
            .openConfiguration()
            .disableDateFilter()
            .isDateDatasetDropdownExist(false)
            .enableDateFilter()
            .isDateDatasetDropdownExist(true);
    });

    it("change filter on added insight", { tags: ["checklist_integrated_tiger_temp"] }, () => {
        widget.waitChartLoaded();
        widgetConfiguration.open().openConfiguration().selectDateDataset(DATASET_CREATED);

        widget
            .waitChartLoaded()
            .getChart()
            .getDataLabelValues()
            .should("deep.equal", ["$4,108,360.80", "$2,267,528.48", "$3,461,373.87"]);
    });
});

describe("Date filter with editmode", () => {
    beforeEach(() => {
        Navigation.visit("dashboard/dashboard-date-filtering-on-insight-scenario");
        editMode.isInEditMode(false).edit().isInEditMode();
    });

    it("remember date filter after saving", { tags: ["checklist_integrated_tiger_temp"] }, () => {
        secondWidget.waitChartLoaded();
        secondWidgetConfiguration
            .open()
            .openConfiguration()
            .disableDateFilter()
            .isDateDatasetDropdownExist(false);

        secondWidget.waitChartLoaded();

        editMode.save().isInEditMode(false).edit().isInEditMode();

        secondWidgetConfiguration
            .open()
            .openConfiguration()
            .isDateDatasetDropdownExist(false)
            .enableDateFilter()
            .selectDateDataset(DATASET_SNAPSHOT)
            .isDateDatasetDropdownExist();

        secondWidget.waitChartLoaded();

        editMode.save().isInEditMode(false).edit().isInEditMode();

        secondWidgetConfiguration
            .open()
            .openConfiguration()
            .hasDatasetSelected(DATASET_SNAPSHOT)
            .isDateDatasetDropdownExist();
    });

    afterEach(() => {
        Navigation.visit("dashboard/dashboard-date-filtering-on-insight-scenario");
        editMode.isInEditMode(false).edit().isInEditMode();
        widget.waitChartLoaded;
        secondWidgetConfiguration
            .open()
            .openConfiguration()
            .enableDateFilter()
            .selectDateDataset(DATASET_CLOSED);
        editMode.save();
    });
});
