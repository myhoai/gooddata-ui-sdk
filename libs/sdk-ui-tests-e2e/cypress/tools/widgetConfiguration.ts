// (C) 2021-2022 GoodData Corporation

import { getTestClassByTitle } from "../support/commands/tools/classes";

import { Widget } from "./widget";
import {
    DashboardName,
    InsightTitle,
    splitCamelCaseToWords,
    isDashboardName,
    getInsightSelectorFromInsightTitle,
} from "./insightsCatalog";

export type InteractionType = "measure" | "attribute";
export class WidgetConfiguration {
    constructor(private widgetIndex: number) {}

    getElement() {
        return cy.get(".s-gd-configuration-bubble");
    }

    open() {
        new Widget(this.widgetIndex)
            .getElement()
            .click()
            .find(".dash-item-action")
            .first()
            .click({ force: true });
        this.getElement().should("be.visible");
        return this;
    }

    openOnKPI() {
        new Widget(this.widgetIndex).getElement().click("top");
        this.getElement().should("be.visible");
        return this;
    }

    close() {
        this.getElement().find(".s-configuration-panel-header-close-button").click();
        this.getElement().should("not.exist");
        return this;
    }

    hasInteractions(expected = true) {
        this.getElement()
            .contains("Interactions")
            .should(expected ? "exist" : "not.exist");
        return this;
    }

    openInteractions() {
        this.getElement().contains("Interactions").click();
        this.getElement().find(".s-drill-config-panel").should("be.visible");
        return this;
    }

    closeInteractions() {
        this.getElement().contains("Interactions").click();
        this.getElement().find(".s-drill-config-panel").should("not.exist");
        return this;
    }

    addInteraction(itemName: string, itemType: InteractionType) {
        const itemSelector = `.s-drill-${itemType}-selector-item`;

        this.getElement().find(".s-drill-config-panel .s-add_interaction").click();
        cy.get(`.s-drill-item-selector-dropdown ${itemSelector}`).contains(itemName).click();
        return this;
    }

    openConfiguration() {
        this.getElement().contains("Configuration").click();
        this.getElement().find(".s-viz-filters-headline").should("be.visible");
        return this;
    }

    editInsight() {
        this.getElement().contains("Edit").click();
        return this;
    }

    closeConfiguration() {
        this.getElement().contains("Configuration").click();
        this.getElement().find(".s-viz-filters-headline").should("not.exist");
        return this;
    }

    getListFilterItem() {
        const result = [] as string[];
        this.getElement()
            .find(".s-attribute-filter-by-item")
            .each(($li) => {
                return result.push($li.text());
            });
        return cy.wrap(result);
    }

    isFilterItemVisible(attributeName: string, expected = true) {
        this.getElement()
            .find(".s-viz-filters-panel .s-attribute-filter-by-item")
            .contains(attributeName)
            .should(expected ? "exist" : "not.exist");
        return this;
    }

    toggleAttributeFilter(attributeName: string) {
        this.getElement()
            .find(".s-viz-filters-panel .s-attribute-filter-by-item")
            .contains(attributeName)
            .click();
        return this;
    }

    toggleDateFilter() {
        this.getElement().find(".s-date-filter-by-item").click();
        return this;
    }

    toggleHideTitle() {
        this.getElement().find(".s-hide-title-configuration .input-checkbox").click();
        return this;
    }

    clickLoadedDateDatasetButton() {
        this.getElement()
            .find(".s-date-dataset-button")
            .should("not.contain.text", "Loading")
            .click({ scrollBehavior: false });
        return this;
    }

    selectDateDataset(datasetName: string) {
        this.clickLoadedDateDatasetButton();
        cy.get(".configuration-dropdown.dataSets-list").find(".gd-list-item").contains(datasetName).click();
        return this;
    }

    hasDatasetSelected(datasetName: string) {
        this.clickLoadedDateDatasetButton();
        cy.get(".configuration-dropdown.dataSets-list")
            .find(".gd-list-item")
            .contains(datasetName)
            .parent(".gd-list-item")
            .should("have.class", "is-selected");
        return this;
    }

    hasDateFilterOptionDisabled(expect = true) {
        this.getElement()
            .find(".s-date-filter-checkbox")
            .should(expect ? "be.disabled" : "not.be.disabled");
        return this;
    }

    hasInteractionsCount(count: number) {
        cy.get(".s-drill-config-item").should("have.length", count);
    }

    getDrillConfigItem(itemName: string) {
        return new DrillConfigItem(itemName);
    }

    checkEdit() {
        cy.contains("Edit").click();
        cy.getIframeBody("#adOverlay").find(".gd-table-component").should("be.visible");
        cy.getIframeBody("#adOverlay")
            .find(".s-cancel-edit-from-kd")
            .should("not.have.class", "disabled")
            .click();
        return this;
    }

    deleteDashboardItem() {
        cy.get(".s-delete-insight-item").click();
        cy.get(".s-dash-item").should("have.length", 14);
        return this;
    }

    switchWidgetDescriptionMode(mode: string) {
        this.getElement().find(".s-description-config-dropdown-button").click();
        cy.get(`.s-${mode}`).click();
        return this;
    }

    hasDescriptionField(text: string) {
        this.getElement().find(".gd-input-field").should("have.text", text);
        return this;
    }

    setDescriptionField(text: string) {
        this.getElement().find(".gd-input-field").clear().type(text);
        return this;
    }
}

type DrillType = "Drill into insight" | "Drill into dashboard" | "Drill into URL";

class DrillConfigItem {
    constructor(private itemName: string) {}

    getElement() {
        const selector = getTestClassByTitle(this.itemName, "drill-config-item-");
        cy.get(selector).contains("Loading…").should("not.exist");
        return cy.get(selector);
    }

    chooseAction(drillType: DrillType) {
        this.getElement().find(".s-drill-config-panel-target-button").click({ force: true });
        cy.get(".s-drill-config-panel-target-type-open").contains(drillType).click({ force: true });
        return this;
    }

    chooseTargetInsight(insightName: InsightTitle) {
        this.getElement().find(".s-visualization-button-target-insight").click();

        cy.get(".s-open-visualizations input").type(splitCamelCaseToWords(insightName));
        cy.get(".s-open-visualizations .s-isLoading").should("exist");
        cy.get(".s-open-visualizations .s-isLoading").should("not.exist");

        cy.wait(200);
        cy.get(
            `.s-open-visualizations .gd-visualizations-list-item${getInsightSelectorFromInsightTitle(
                insightName,
            )}`,
        )
            .should("exist")
            .click();

        return this;
    }

    chooseTargetDashboard(dashboardName: DashboardName) {
        this.getElement().find(".s-dashboards-dropdown-button").click({ force: true });

        cy.get(".dropdown-body .gd-input").type(splitCamelCaseToWords(dashboardName));
        cy.wait(200);
        cy.get(".s-dashboards-dropdown-body .gd-list-item")
            .contains(splitCamelCaseToWords(dashboardName))
            .click();

        return this;
    }

    remove() {
        this.getElement().find(".s-drill-config-item-delete").click();
    }

    clickTargetUrlButton() {
        this.getElement().find(".s-drill-to-url-button").click();
        return this;
    }

    openCustomUrlEditor() {
        this.clickTargetUrlButton();
        cy.get(".s-drill-to-custom-url-button").click();
        return this;
    }

    hasDateFilterTransferWarning(expected = true) {
        this.getElement()
            .find(".s-drill-config-date-filter-warning")
            .should(expected ? "exist" : "not.exist");
        return this;
    }

    hasDashboardTarget(target: DashboardName | string) {
        this.getElement()
            .find(".s-drill-config-panel-target-button")
            .should("contain.text", "Drill into dashboard");
        this.getElement()
            .find(".s-dashboards-dropdown-button")
            .should("contain.text", isDashboardName(target) ? splitCamelCaseToWords(target) : target);
        return this;
    }

    hasInsightTarget(target: InsightTitle) {
        this.getElement()
            .find(".s-drill-config-panel-target-button")
            .should("contain.text", "Drill into insight");
        this.getElement()
            .find(".s-visualization-button-target-insight")
            .should("contain.text", splitCamelCaseToWords(target));
        return this;
    }

    hasWarning(warning: string) {
        this.getElement().find(".s-drill-config-target-warning").should("contain.text", warning);
        return this;
    }
}

export class DrillConfigItemDrillToUrlDropdown {
    getElement() {
        return cy.get(".s-gd-drill-to-url-body");
    }

    getDrillToAttributeItemElement(attributeName: string) {
        return this.getElement()
            .find(".s-drill-to-attribute-url-option")
            .contains(attributeName)
            .parent(".s-drill-to-attribute-url-option");
    }

    selectDrillToAttributeUrl(attributeName: string) {
        this.getDrillToAttributeItemElement(attributeName).click();
        return this;
    }

    drillToAttributeSelected(attributeName: string) {
        this.getDrillToAttributeItemElement(attributeName).should("have.class", "is-selected");
        return this;
    }

    hasDrillToCustomUrlOption(url: string) {
        this.getElement().find(".s-drill-to-custom-url-option").contains(url.slice(0, 50)).should("exist");
    }
}
