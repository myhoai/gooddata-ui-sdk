// (C) 2020-2025 GoodData Corporation
import React, { useCallback, useState } from "react";
import {
    idRef,
    IInsight,
    insightTitle,
    IInsightWidget,
    IInsightWidgetDescriptionConfiguration,
} from "@gooddata/sdk-model";
import {
    FullScreenOverlay,
    Overlay,
    OverlayController,
    OverlayControllerProvider,
    RichText,
    UiIcon,
    useMediaQuery,
} from "@gooddata/sdk-ui-kit";
import { ILocale, OnLoadingChanged } from "@gooddata/sdk-ui";
import cx from "classnames";

import { DOWNLOADER_ID } from "../../../../../_staging/fileUtils/downloadFile.js";
import { useInsightExport } from "../../../common/index.js";
import { OnDrillDownSuccess, WithDrillSelect } from "../../../../drill/index.js";
import { IntlWrapper } from "../../../../localization/index.js";
import { useDashboardComponentsContext } from "../../../../dashboardContexts/index.js";
import { useWidgetExecutionsHandler } from "../../../../../model/index.js";
import { ThemedLoadingEqualizer } from "../../../../presentationComponents/index.js";
import { DASHBOARD_HEADER_OVERLAYS_Z_INDEX } from "../../../../constants/index.js";

import { DrillDialog } from "./DrillDialog.js";
import { DrillDialogInsight } from "./DrillDialogInsight.js";
import { getTitleWithBreadcrumbs } from "./getTitleWithBreadcrumbs.js";
import { useIntl } from "react-intl";

// Header z-index start at  6000 so we need force all overlays z-indexes start at 6000 to be above header
const overlayController = OverlayController.getInstance(DASHBOARD_HEADER_OVERLAYS_Z_INDEX);

/**
 * @internal
 */
export interface InsightDrillDialogProps {
    enableDrillDescription: boolean;
    locale: ILocale;
    breadcrumbs: string[];
    widget: IInsightWidget;
    insight: IInsight;
    onDrillDown?: OnDrillDownSuccess;
    onClose: () => void;
    onBackButtonClick: () => void;
}

const overlayIgnoredClasses = [
    ".s-sort-direction-arrow",
    ".gd-export-dialog",
    ".options-menu-export-xlsx",
    ".options-menu-export-csv",
    `#${DOWNLOADER_ID}`,
];

const defaultDescriptionConfig: IInsightWidgetDescriptionConfiguration = {
    source: "insight",
    includeMetrics: false,
    visible: true,
};

const getInsightWidgetDescription = (
    descriptionConfig: IInsightWidgetDescriptionConfiguration,
    widgetDescription: string | undefined,
    insightDescription: string | undefined,
): string | undefined => {
    if (!descriptionConfig.visible) {
        return undefined;
    }

    const useInsightDescription = descriptionConfig.source === "insight";
    return useInsightDescription ? insightDescription : widgetDescription;
};

const DRILL_MODAL_EXECUTION_PSEUDO_REF = idRef("@@GDC_DRILL_MODAL");

export const InsightDrillDialog = (props: InsightDrillDialogProps): JSX.Element => {
    const {
        widget,
        locale,
        breadcrumbs,
        insight,
        enableDrillDescription,
        onClose,
        onBackButtonClick,
        onDrillDown,
    } = props;

    const isMobileDevice = useMediaQuery("mobileDevice");

    const [isLoading, setIsLoading] = useState(false);

    const executionsHandler = useWidgetExecutionsHandler(DRILL_MODAL_EXECUTION_PSEUDO_REF);

    const { ErrorComponent, LoadingComponent } = useDashboardComponentsContext({
        /**
         * There is a need to use Loading spinner instead of "Running three dots" loader while drill is loading.
         * If no custom loading component is provided, LoadingComponent defaults to Loading spinner.
         */
        LoadingComponent: ThemedLoadingEqualizer,
    });

    const handleLoadingChanged = useCallback<OnLoadingChanged>(({ isLoading }) => {
        setIsLoading(isLoading);
        executionsHandler.onLoadingChanged({ isLoading });
    }, []);

    const baseInsightTitle = insightTitle(insight);

    const { exportCSVEnabled, exportXLSXEnabled, onExportCSV, onExportXLSX } = useInsightExport({
        title: getTitleWithBreadcrumbs(baseInsightTitle, breadcrumbs),
        widgetRef: DRILL_MODAL_EXECUTION_PSEUDO_REF,
        insight,
    });

    const OverlayComponent = isMobileDevice ? FullScreenOverlay : Overlay;

    const [isOpen, setIsOpen] = useState(false);
    const descriptionConfig = widget.configuration?.description ?? defaultDescriptionConfig;
    const description = getInsightWidgetDescription(
        descriptionConfig,
        widget.description,
        insight.insight.summary,
    );

    return (
        <OverlayControllerProvider overlayController={overlayController}>
            <OverlayComponent
                className="gd-drill-modal-overlay"
                isModal
                closeOnEscape
                closeOnOutsideClick
                ignoreClicksOnByClass={overlayIgnoredClasses}
                onClose={onClose}
                positionType="fixed"
            >
                <IntlWrapper locale={locale}>
                    <DrillDialog
                        insightTitle={baseInsightTitle}
                        isBackButtonVisible={breadcrumbs.length > 1}
                        onBackButtonClick={onBackButtonClick}
                        onCloseDialog={onClose}
                        breadcrumbs={breadcrumbs}
                        exportAvailable={exportXLSXEnabled || exportCSVEnabled}
                        exportXLSXEnabled={exportXLSXEnabled}
                        exportCSVEnabled={exportCSVEnabled}
                        enableDrillDescription={enableDrillDescription}
                        onExportXLSX={onExportXLSX}
                        onExportCSV={onExportCSV}
                        isLoading={isLoading}
                    >
                        <WithDrillSelect
                            widgetRef={widget.ref}
                            insight={props.insight}
                            onDrillDownSuccess={onDrillDown}
                        >
                            {({ onDrill }) => {
                                return description && enableDrillDescription ? (
                                    <div className="drill-dialog-insight-container">
                                        <InsightDrillDialogDescriptionContent
                                            isOpen={isOpen}
                                            isMobileDevice={isMobileDevice}
                                            description={description}
                                        />
                                        <div className="drill-dialog-insight-container-insight">
                                            <InsightDrillDialogDescriptionButton
                                                isOpen={isOpen}
                                                isMobileDevice={isMobileDevice}
                                                setIsOpen={setIsOpen}
                                            />
                                            <DrillDialogInsight
                                                {...props}
                                                onDrill={onDrill}
                                                onLoadingChanged={handleLoadingChanged}
                                                onError={executionsHandler.onError}
                                                pushData={executionsHandler.onPushData}
                                                ErrorComponent={ErrorComponent}
                                                LoadingComponent={LoadingComponent}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <DrillDialogInsight
                                        {...props}
                                        onDrill={onDrill}
                                        onLoadingChanged={handleLoadingChanged}
                                        onError={executionsHandler.onError}
                                        pushData={executionsHandler.onPushData}
                                        ErrorComponent={ErrorComponent}
                                        LoadingComponent={LoadingComponent}
                                    />
                                );
                            }}
                        </WithDrillSelect>
                    </DrillDialog>
                </IntlWrapper>
            </OverlayComponent>
        </OverlayControllerProvider>
    );
};

interface InsightDrillDialogDescriptionButtonProps {
    isMobileDevice: boolean;
    isOpen: boolean;
    setIsOpen: (fn: (open: boolean) => boolean) => void;
}

function InsightDrillDialogDescriptionButton({
    isOpen,
    isMobileDevice,
    setIsOpen,
}: InsightDrillDialogDescriptionButtonProps) {
    const { formatMessage } = useIntl();

    return (
        <div
            className={cx("drill-dialog-insight-container-button", {
                "drill-dialog-insight-container-button--open": isOpen,
                "drill-dialog-insight-container-button--mobile": isMobileDevice,
            })}
            onClick={() => setIsOpen((open) => !open)}
            aria-label={formatMessage({ id: "widget.options.description" })}
        >
            <UiIcon type="question" size={20} />
        </div>
    );
}

interface InsightDrillDialogDescriptionContentProps {
    isMobileDevice: boolean;
    isOpen: boolean;
    description: string;
}

function InsightDrillDialogDescriptionContent({
    isOpen,
    isMobileDevice,
    description,
}: InsightDrillDialogDescriptionContentProps) {
    return (
        <div
            className={cx("drill-dialog-insight-container-description", {
                "drill-dialog-insight-container-description--open": isOpen,
                "drill-dialog-insight-container-description--mobile": isMobileDevice,
            })}
        >
            <div className="drill-dialog-insight-container-description-content">
                <RichText value={description} renderMode="view" />
            </div>
        </div>
    );
}
