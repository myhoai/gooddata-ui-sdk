// (C) 2019-2025 GoodData Corporation
import { useState } from "react";
import {
    IAutomationMetadataObjectDefinition,
    IExportDefinitionMetadataObjectDefinition,
    IAutomationRecipient,
    FilterContextItem,
    IExportDefinitionVisualizationObjectSettings,
    isExportDefinitionVisualizationObjectRequestPayload,
    isExportDefinitionDashboardRequestPayload,
    IInsight,
    IAutomationMetadataObject,
    IFilter,
    INotificationChannelMetadataObject,
    isAutomationUserRecipient,
    isWidget,
    isAutomationExternalUserRecipient,
    isAutomationUnknownUserRecipient,
} from "@gooddata/sdk-model";
import parseISO from "date-fns/parseISO/index.js";
import { getUserTimezone } from "../utils/timezone.js";
import {
    useDashboardSelector,
    selectDashboardTitle,
    selectDashboardId,
    ExtendedDashboardWidget,
    selectCurrentUser,
    selectTimezone,
    selectUsers,
    selectEnableExternalRecipients,
} from "../../../../model/index.js";
import { normalizeTime } from "@gooddata/sdk-ui-kit";
import { WidgetAttachmentType } from "../types.js";
import { toModifiedISOStringWithTimezone } from "../../DefaultScheduledEmailManagementDialog/utils.js";
import {
    areAutomationsEqual,
    convertCurrentUserToAutomationRecipient,
    convertCurrentUserToWorkspaceUser,
    getAutomationVisualizationFilters,
    isCsvVisualizationAutomation,
    isCsvVisualizationExportDefinition,
    isDashboardAutomation,
    isXlsxVisualizationAutomation,
    isXlsxVisualizationExportDefinition,
} from "../../../../_staging/automation/index.js";
import { invariant } from "ts-invariant";
import { useIntl } from "react-intl";
import { useScheduleValidation } from "./useScheduleValidation.js";
import { isEmail } from "../utils/validate.js";

export interface IUseEditScheduledEmailProps {
    scheduledExportToEdit?: IAutomationMetadataObject;
    notificationChannels: INotificationChannelMetadataObject[];
    maxAutomationsRecipients: number;

    // In case we are editing widget scheduled export
    widget?: ExtendedDashboardWidget;
    insight?: IInsight;
    widgetFilters?: IFilter[];

    // In case we are editing dashboard scheduled export
    dashboardFilters?: FilterContextItem[];
}

export function useEditScheduledEmail(props: IUseEditScheduledEmailProps) {
    const {
        scheduledExportToEdit,
        notificationChannels,
        insight,
        widget,
        dashboardFilters,
        widgetFilters,
        maxAutomationsRecipients,
    } = props;
    const intl = useIntl();
    const [isCronValid, setIsCronValid] = useState(true);
    const [warningMessage, setWarningMessage] = useState<string | undefined>(undefined);
    const isWidget = !!widget && !!insight;

    // Dashboard
    const dashboardId = useDashboardSelector(selectDashboardId);
    const dashboardTitle = useDashboardSelector(selectDashboardTitle);
    const timezone = useDashboardSelector(selectTimezone);

    const areDashboardFiltersChanged = !!dashboardFilters;

    const currentUser = useDashboardSelector(selectCurrentUser);
    const users = useDashboardSelector(selectUsers);
    const defaultUser = convertCurrentUserToWorkspaceUser(users ?? [], currentUser);

    const defaultRecipient = convertCurrentUserToAutomationRecipient(users ?? [], currentUser);
    const enabledExternalRecipients = useDashboardSelector(selectEnableExternalRecipients);

    const firstChannel = notificationChannels[0]?.id;

    const [editedAutomation, setEditedAutomation] = useState<IAutomationMetadataObjectDefinition>(
        scheduledExportToEdit ??
            newAutomationMetadataObjectDefinition(
                isWidget
                    ? {
                          timezone,
                          dashboardId: dashboardId!,
                          notificationChannel: firstChannel,
                          insight,
                          widget,
                          recipient: defaultRecipient,
                          widgetFilters,
                      }
                    : {
                          timezone,
                          dashboardId: dashboardId!,
                          notificationChannel: firstChannel,
                          title: dashboardTitle,
                          recipient: defaultRecipient,
                          dashboardFilters,
                      },
            ),
    );

    const [originalAutomation] = useState(editedAutomation);

    const onTitleChange = (value: string) => setEditedAutomation((s) => ({ ...s, title: value }));

    const onRecurrenceChange = (cronExpression: string, startDate: Date | null, isValid: boolean) => {
        setIsCronValid(isValid);
        setEditedAutomation((s) => ({
            ...s,
            schedule: {
                ...(s.schedule ?? {}),
                cron: cronExpression,
                firstRun: toModifiedISOStringWithTimezone(startDate ?? new Date(), timezone),
            },
        }));
    };

    const onDestinationChange = (notificationChannelId: string): void => {
        const previousNotificationChannel = notificationChannels.find(
            (channel) => editedAutomation.notificationChannel === channel.id,
        );
        const selectedNotificationChannel = notificationChannels.find(
            (channel) => notificationChannelId === channel.id,
        );

        /**
         * When allowed recipients are changed from "ALL" to "CREATOR", show warning message
         */
        const showWarningMessage =
            selectedNotificationChannel?.allowedRecipients === "creator" &&
            previousNotificationChannel?.allowedRecipients !== "creator";
        setWarningMessage(
            showWarningMessage
                ? intl.formatMessage({ id: "dialogs.schedule.email.destinationWarning" })
                : undefined,
        );

        /**
         * Reset recipients when new notification channel only allows the author/creator
         */
        const updatedRecipients =
            selectedNotificationChannel?.allowedRecipients === "creator"
                ? { recipients: [defaultRecipient] }
                : {};

        setEditedAutomation((s) => ({
            ...s,
            ...updatedRecipients,
            notificationChannel: notificationChannelId,
        }));
    };

    const onRecipientsChange = (updatedRecipients: IAutomationRecipient[]): void => {
        setEditedAutomation((s) => ({
            ...s,
            recipients: updatedRecipients,
        }));
    };

    const onSubjectChange = (value: string | number): void => {
        setEditedAutomation((s) => ({
            ...s,
            details: {
                ...(s.details ?? {}),
                subject: value as string,
            },
        }));
    };

    const onMessageChange = (value: string): void => {
        setEditedAutomation((s) => ({
            ...s,
            details: {
                ...(s.details ?? {}),
                message: value,
            },
        }));
    };

    const onDashboardAttachmentsChange = (
        dashboardSelected: boolean,
        dashboardFilters?: FilterContextItem[],
    ): void => {
        if (dashboardSelected) {
            const dashboardExportDefinition = newDashboardExportDefinitionMetadataObjectDefinition({
                dashboardId: dashboardId!,
                dashboardTitle,
                dashboardFilters,
            });
            const dashboardExportDefinitionExists = isDashboardAutomation(editedAutomation);
            const updatedExportDefinitions = dashboardExportDefinitionExists
                ? editedAutomation.exportDefinitions?.map((exportDefinition) =>
                      isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload)
                          ? dashboardExportDefinition
                          : exportDefinition,
                  )
                : [...(editedAutomation.exportDefinitions ?? []), dashboardExportDefinition];

            setEditedAutomation((s) => ({
                ...s,
                exportDefinitions: updatedExportDefinitions,
            }));
        } else {
            setEditedAutomation((s) => ({
                ...s,
                exportDefinitions: s.exportDefinitions?.filter(
                    (exportDefinition) =>
                        !isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload),
                ),
            }));
        }
    };

    const onWidgetAttachmentsChange = (
        selected: boolean,
        format: WidgetAttachmentType,
        widgetFilters?: IFilter[],
    ): void => {
        const automationTypeGuard =
            format === "CSV" ? isCsvVisualizationAutomation : isXlsxVisualizationAutomation;
        const exportDefinitionTypeGuard =
            format === "CSV" ? isCsvVisualizationExportDefinition : isXlsxVisualizationExportDefinition;

        invariant(isWidget, "Widget or insight is missing in scheduling dialog context.");

        if (selected) {
            const newExportDefinition = newWidgetExportDefinitionMetadataObjectDefinition({
                insight,
                widget,
                dashboardId: dashboardId!,
                format,
                scheduledExportToEdit,
                widgetFilters,
            });

            const exportDefinitionExists = automationTypeGuard(editedAutomation);
            const updatedExportDefinitions = exportDefinitionExists
                ? editedAutomation.exportDefinitions?.map((exportDefinition) =>
                      exportDefinitionTypeGuard(exportDefinition) ? newExportDefinition : exportDefinition,
                  )
                : [...(editedAutomation.exportDefinitions ?? []), newExportDefinition];

            setEditedAutomation((s) => ({
                ...s,
                exportDefinitions: updatedExportDefinitions,
            }));
        } else {
            setEditedAutomation((s) => ({
                ...s,
                exportDefinitions: s.exportDefinitions?.filter(
                    (exportDefinition) => !exportDefinitionTypeGuard(exportDefinition),
                ),
            }));
        }
    };

    const onWidgetAttachmentsSettingsChange = ({
        mergeHeaders,
    }: IExportDefinitionVisualizationObjectSettings) => {
        setEditedAutomation((s) => ({
            ...s,
            exportDefinitions: s.exportDefinitions?.map((exportDefinition) => {
                if (
                    isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload) &&
                    exportDefinition.requestPayload.format === "XLSX"
                ) {
                    return {
                        ...exportDefinition,
                        requestPayload: {
                            ...exportDefinition.requestPayload,
                            settings: {
                                ...exportDefinition.requestPayload?.settings,
                                mergeHeaders,
                            },
                        },
                    };
                } else {
                    return exportDefinition;
                }
            }),
        }));
    };

    const isDashboardExportSelected =
        editedAutomation.exportDefinitions?.some((exportDefinition) =>
            isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload),
        ) ?? true;

    const isCsvExportSelected =
        editedAutomation.exportDefinitions?.some((exportDefinition) => {
            if (isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload)) {
                return exportDefinition.requestPayload.format === "CSV";
            }

            return false;
        }) ?? false;

    const isXlsxExportSelected =
        editedAutomation.exportDefinitions?.some((exportDefinition) => {
            if (isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload)) {
                return exportDefinition.requestPayload.format === "XLSX";
            }

            return false;
        }) ?? false;

    const settings = {
        mergeHeaders:
            editedAutomation.exportDefinitions?.some((exportDefinition) => {
                if (isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload)) {
                    return exportDefinition.requestPayload.settings?.mergeHeaders;
                }

                return false;
            }) ?? true,
    };

    const startDate = parseISO(
        editedAutomation.schedule?.firstRun ?? normalizeTime(new Date(), undefined, 60).toISOString(),
    );

    const selectedNotificationChannel = notificationChannels.find(
        (channel) => channel.id === editedAutomation.notificationChannel,
    );
    const allowExternalRecipients =
        selectedNotificationChannel?.allowedRecipients === "external" && enabledExternalRecipients;
    const allowOnlyLoggedUserRecipients = selectedNotificationChannel?.allowedRecipients === "creator";

    const { isValid: isOriginalAutomationValid } = useScheduleValidation(originalAutomation);
    const validationErrorMessage = !isOriginalAutomationValid
        ? intl.formatMessage({ id: "dialogs.schedule.email.widgetError" })
        : undefined;

    const hasAttachments = !!editedAutomation.exportDefinitions?.length;
    const hasRecipients = (editedAutomation.recipients?.length ?? 0) > 0;
    const hasValidExternalRecipients = allowExternalRecipients
        ? true
        : !editedAutomation.recipients?.some(isAutomationExternalUserRecipient);
    const hasValidCreatorRecipient = allowOnlyLoggedUserRecipients
        ? editedAutomation.recipients?.length === 1 &&
          editedAutomation.recipients[0].id === defaultRecipient.id
        : true;
    const hasNoUnknownRecipients = !editedAutomation.recipients?.some(isAutomationUnknownUserRecipient);
    const hasDestination = !!editedAutomation.notificationChannel;
    const respectsRecipientsLimit = (editedAutomation.recipients?.length ?? 0) <= maxAutomationsRecipients;
    const hasFilledEmails =
        selectedNotificationChannel?.destinationType === "smtp"
            ? editedAutomation.recipients?.every((recipient) =>
                  isAutomationUserRecipient(recipient) ? isEmail(recipient.email ?? "") : true,
              )
            : true;

    const isValid =
        isCronValid &&
        hasRecipients &&
        respectsRecipientsLimit &&
        hasAttachments &&
        hasDestination &&
        hasValidExternalRecipients &&
        hasValidCreatorRecipient &&
        hasNoUnknownRecipients &&
        hasFilledEmails;

    const isSubmitDisabled =
        !isValid || (scheduledExportToEdit && areAutomationsEqual(originalAutomation, editedAutomation));

    return {
        defaultUser,
        areDashboardFiltersChanged,
        originalAutomation,
        editedAutomation,
        isCronValid,
        notificationChannels,
        warningMessage,
        isDashboardExportSelected,
        isCsvExportSelected,
        isXlsxExportSelected,
        settings,
        startDate,
        allowOnlyLoggedUserRecipients,
        allowExternalRecipients,
        validationErrorMessage,
        isSubmitDisabled,
        onTitleChange,
        onRecurrenceChange,
        onDestinationChange,
        onRecipientsChange,
        onSubjectChange,
        onMessageChange,
        onDashboardAttachmentsChange,
        onWidgetAttachmentsChange,
        onWidgetAttachmentsSettingsChange,
    };
}

function newDashboardExportDefinitionMetadataObjectDefinition({
    dashboardId,
    dashboardTitle,
    dashboardFilters,
}: {
    dashboardId: string;
    dashboardTitle: string;
    dashboardFilters?: FilterContextItem[];
}): IExportDefinitionMetadataObjectDefinition {
    const filtersObj = dashboardFilters ? { filters: dashboardFilters } : {};

    return {
        type: "exportDefinition",
        title: dashboardTitle,
        requestPayload: {
            type: "dashboard",
            fileName: dashboardTitle,
            format: "PDF",
            content: {
                dashboard: dashboardId,
                ...filtersObj,
            },
        },
    };
}

function newWidgetExportDefinitionMetadataObjectDefinition({
    insight,
    widget,
    dashboardId,
    format,
    widgetFilters,
    scheduledExportToEdit,
}: {
    insight: IInsight;
    widget: ExtendedDashboardWidget;
    dashboardId: string;
    format: WidgetAttachmentType;
    widgetFilters?: IFilter[];
    scheduledExportToEdit?: IAutomationMetadataObject | IAutomationMetadataObjectDefinition;
}): IExportDefinitionMetadataObjectDefinition {
    const widgetTitle = isWidget(widget) ? widget?.title : widget?.identifier;
    const existingScheduleFilters = [...(getAutomationVisualizationFilters(scheduledExportToEdit) ?? [])];

    // in case of editing widget schedule, we never overwrite already stored filters
    const allFilters = scheduledExportToEdit ? existingScheduleFilters : widgetFilters ?? [];

    const filtersObj = allFilters.length > 0 ? { filters: allFilters } : {};
    const settingsObj = format === "XLSX" ? { settings: { mergeHeaders: true } } : {};

    return {
        type: "exportDefinition",
        title: widgetTitle,
        requestPayload: {
            type: "visualizationObject",
            fileName: widgetTitle,
            format: format,
            content: {
                visualizationObject: insight.insight.identifier,
                widget: widget.identifier,
                dashboard: dashboardId,
                ...filtersObj,
            },
            ...settingsObj,
        },
    };
}

function newAutomationMetadataObjectDefinition({
    timezone,
    dashboardId,
    notificationChannel,
    title,
    insight,
    widget,
    recipient,
    dashboardFilters,
    widgetFilters,
}: {
    timezone?: string;
    dashboardId: string;
    notificationChannel: string;
    title?: string;
    insight?: IInsight;
    widget?: ExtendedDashboardWidget;
    recipient: IAutomationRecipient;
    dashboardFilters?: FilterContextItem[];
    widgetFilters?: IFilter[];
}): IAutomationMetadataObjectDefinition {
    const firstRun = parseISO(new Date().toISOString());
    const normalizedFirstRun = normalizeTime(firstRun, undefined, 60);
    const cron = getDefaultCronExpression(normalizedFirstRun);
    const exportDefinition =
        widget && insight
            ? newWidgetExportDefinitionMetadataObjectDefinition({
                  insight,
                  widget,
                  dashboardId,
                  format: "XLSX", // default checked format
                  widgetFilters,
              })
            : newDashboardExportDefinitionMetadataObjectDefinition({
                  dashboardId,
                  dashboardTitle: title ?? "",
                  dashboardFilters,
              });

    const automation: IAutomationMetadataObjectDefinition = {
        type: "automation",
        title: undefined,
        description: undefined,
        tags: [],
        schedule: {
            firstRun: toModifiedISOStringWithTimezone(
                normalizedFirstRun,
                timezone ?? getUserTimezone().identifier,
            ),
            timezone: timezone ?? getUserTimezone().identifier,
            cron,
        },
        details: {
            message: "",
            subject: "",
        },
        exportDefinitions: [{ ...exportDefinition }],
        recipients: [recipient],
        notificationChannel,
        dashboard: dashboardId,
    };

    return automation;
}

export function getDefaultCronExpression(date: Date) {
    return `0 0 ${date.getHours()} ? * *`;
}
