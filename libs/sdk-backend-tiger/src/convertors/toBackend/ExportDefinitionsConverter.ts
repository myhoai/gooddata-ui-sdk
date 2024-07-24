// (C) 2020-2024 GoodData Corporation
import {
    JsonApiAnalyticalDashboardLinkageTypeEnum,
    JsonApiExportDefinitionInDocument,
    JsonApiExportDefinitionOutWithLinksTypeEnum,
    JsonApiExportDefinitionPostOptionalIdDocument,
    JsonApiVisualizationObjectLinkageTypeEnum,
    TabularExportRequest,
    VisualExportRequest,
} from "@gooddata/api-client-tiger";
import {
    IExportDefinitionRequestPayload,
    IExportDefinitionMetadataObjectDefinition,
    isExportDefinitionDashboardRequestPayload,
} from "@gooddata/sdk-model";

export const convertExportDefinitionMdObjectDefinition = (
    exportDefinition: IExportDefinitionMetadataObjectDefinition,
): JsonApiExportDefinitionPostOptionalIdDocument => {
    const { title, description, tags, requestPayload } = exportDefinition;

    const relationships = isExportDefinitionDashboardRequestPayload(requestPayload)
        ? {
              analyticalDashboard: {
                  data: {
                      id: requestPayload.content.dashboard,
                      type: JsonApiAnalyticalDashboardLinkageTypeEnum.ANALYTICAL_DASHBOARD,
                  },
              },
          }
        : {
              visualizationObject: {
                  data: {
                      id: requestPayload.content.visualizationObject,
                      type: JsonApiVisualizationObjectLinkageTypeEnum.VISUALIZATION_OBJECT,
                  },
              },
          };

    return {
        data: {
            type: JsonApiExportDefinitionOutWithLinksTypeEnum.EXPORT_DEFINITION,
            attributes: {
                title,
                description,
                tags,
                requestPayload: convertExportDefinitionRequestPayload(requestPayload),
            },
            relationships,
        },
    };
};

const convertExportDefinitionRequestPayload = (
    exportRequest: IExportDefinitionRequestPayload,
): TabularExportRequest | VisualExportRequest => {
    if (isExportDefinitionDashboardRequestPayload(exportRequest)) {
        const { filters, dashboard } = exportRequest.content;
        const metadataObj = exportRequest.content.filters ? { metadata: { filters } } : {};

        return {
            fileName: exportRequest.fileName,
            dashboardId: dashboard,
            ...metadataObj,
        };
    }

    const { mergeHeaders, orientation } = exportRequest.settings ?? {};
    const { visualizationObject, filters, widget, dashboard } = exportRequest.content;

    return {
        fileName: exportRequest.fileName,
        format: exportRequest.format,
        visualizationObject,
        visualizationObjectCustomFilters: filters,
        settings: {
            ...(mergeHeaders ? { mergeHeaders } : {}),
            ...(orientation ? { pdfPageSize: orientation } : {}),
        },
        metadata: {
            dashboard,
            widget,
        },
    };
};

export const convertExportDefinitionMdObject = (
    exportDefinition: IExportDefinitionMetadataObjectDefinition,
    identifier: string,
): JsonApiExportDefinitionInDocument => {
    const postDefinition = convertExportDefinitionMdObjectDefinition(exportDefinition);

    return {
        data: {
            ...postDefinition.data,
            id: identifier,
        },
    };
};
