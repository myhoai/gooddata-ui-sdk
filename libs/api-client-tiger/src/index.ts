// (C) 2019-2024 GoodData Corporation
/**
 * This package provides low-level functions for communication with GoodData Cloud and GoodData.CN.
 *
 * @remarks
 * The package is used by `@gooddata/sdk-backend-tiger`, which you should use instead of directly using
 * `@gooddata/api-client-tiger` whenever possible.
 *
 * @packageDocumentation
 */
import { tigerClientFactory, ITigerClient } from "./client.js";
import {
    axios as defaultAxios,
    newAxios,
    setAxiosAuthorizationToken,
    setGlobalAuthorizationToken,
} from "./axios.js";

export {
    VisualizationObjectModelV1,
    VisualizationObjectModelV2,
    AnalyticalDashboardModelV1,
    AnalyticalDashboardModelV2,
    isAttributeHeader,
    isAfmObjectIdentifier,
    isAfmObjectLocalIdentifier,
    isResultAttributeHeader,
    isResultMeasureHeader,
    isResultTotalHeader,
    isVisualizationObjectsItem,
    isFilterContextData,
    isDashboardPluginsItem,
} from "./gd-tiger-model/index.js";

export { newAxios, setAxiosAuthorizationToken, setGlobalAuthorizationToken };

export type {
    AFM,
    AfmIdentifier as AfmModelIdentifier,
    AfmLocalIdentifier as AfmModelLocalIdentifier,
    AfmObjectIdentifierAttributeIdentifier as AfmModelObjectIdentifierAttributeIdentifier,
    AfmObjectIdentifierCore as AfmModelObjectIdentifierCore,
    AfmObjectIdentifierCoreIdentifier as AfmModelObjectIdentifierCoreIdentifier,
    AfmObjectIdentifierDataset as AfmModelObjectIdentifierDataset,
    AfmObjectIdentifierDatasetIdentifier as AfmModelObjectIdentifierDatasetIdentifier,
    AfmObjectIdentifierIdentifier as AfmModelObjectIdentifierIdentifier,
    AfmObjectIdentifierLabel as AfmModelObjectIdentifierLabel,
    AfmObjectIdentifierAttribute as AfmModelObjectIdentifierAttribute,
    AfmObjectIdentifierLabelIdentifier as AfmModelObjectIdentifierLabelIdentifier,
    AbsoluteDateFilter as AfmAbsoluteDateFilter,
    AbsoluteDateFilterAbsoluteDateFilter as AfmAbsoluteDateFilterAbsoluteDateFilter,
    AbstractMeasureValueFilter,
    AfmExecution,
    AfmExecutionResponse,
    AfmObjectIdentifier as AfmModelObjectIdentifier,
    AfmValidObjectsQuery,
    AfmValidObjectsResponse,
    ArithmeticMeasureDefinition as AfmArithmeticMeasureDefinition,
    ArithmeticMeasureDefinitionArithmeticMeasure as AfmArithmeticMeasureDefinitionArithmeticMeasure,
    AttributeExecutionResultHeader,
    AttributeFilter as AfmAttributeFilter,
    AttributeFilterElements as AfmAttributeFilterElements,
    AttributeHeaderOut,
    AttributeHeaderOutAttributeHeader,
    AttributeItem as AfmAttributeItem,
    AttributeResultHeader,
    ComparisonMeasureValueFilter as AfmComparisonMeasureValueFilter,
    ComparisonMeasureValueFilterComparisonMeasureValueFilter as AfmComparisonMeasureValueFilterComparisonMeasureValueFilter,
    DataColumnLocator,
    DataColumnLocators,
    DateFilter as AfmDateFilter,
    Dimension,
    DimensionHeader,
    Element,
    ElementsRequest,
    FilterBy,
    ElementsResponse,
    ExecutionLinks,
    ExecutionResponse,
    ExecutionResult,
    ExecutionResultGrandTotal,
    ExecutionResultHeader,
    ExecutionResultPaging,
    ExecutionSettings,
    FilterDefinition as AfmFilterDefinition,
    FilterDefinitionForSimpleMeasure as AfmFilterDefinitionForSimpleMeasure,
    HeaderGroup,
    InlineFilterDefinition as AfmInlineFilterDefinition,
    InlineFilterDefinitionInline as AfmInlineFilterDefinitionInline,
    InlineMeasureDefinition as AfmInlineMeasureDefinition,
    InlineMeasureDefinitionInline as AfmInlineMeasureDefinitionInline,
    MeasureDefinition as AfmMeasureDefinition,
    MeasureExecutionResultHeader,
    MeasureGroupHeaders,
    MeasureHeaderOut,
    MeasureItem as AfmMeasureItem,
    MeasureResultHeader,
    MeasureValueFilter,
    NegativeAttributeFilter as AfmNegativeAttributeFilter,
    NegativeAttributeFilterNegativeAttributeFilter as AfmNegativeAttributeFilterNegativeAttributeFilter,
    Paging,
    PopDataset as AfmPopDataset,
    PopMeasureDefinition as AfmPopMeasureDefinition,
    PopDatasetMeasureDefinition as AfmPopDatasetMeasureDefinition,
    PopDatasetMeasureDefinitionPreviousPeriodMeasure as AfmPopDatasetMeasureDefinitionPreviousPeriodMeasure,
    PopDate as AfmPopDate,
    PopDateMeasureDefinition as AfmPopDateMeasureDefinition,
    PopDateMeasureDefinitionOverPeriodMeasure as AfmPopDateMeasureDefinitionOverPeriodMeasure,
    PositiveAttributeFilter as AfmPositiveAttributeFilter,
    PositiveAttributeFilterPositiveAttributeFilter as AfmPositiveAttributeFilterPositiveAttributeFilter,
    RangeMeasureValueFilter as AfmRangeMeasureValueFilter,
    RangeMeasureValueFilterRangeMeasureValueFilter as AfmRangeMeasureValueFilterRangeMeasureValueFilter,
    RankingFilter as AfmRankingFilter,
    RankingFilterRankingFilter as AfmRankingFilterRankingFilter,
    RelativeDateFilter as AfmRelativeDateFilter,
    RelativeDateFilterRelativeDateFilter as AfmRelativeDateFilterRelativeDateFilter,
    ResultCacheMetadata,
    ResultDimension,
    ResultDimensionHeader,
    ResultSpec,
    SimpleMeasureDefinition as AfmSimpleMeasureDefinition,
    SimpleMeasureDefinitionMeasure as AfmSimpleMeasureDefinitionMeasure,
    SortKey,
    SortKeyAttribute,
    SortKeyAttributeAttribute,
    SortKeyTotal,
    SortKeyTotalTotal,
    SortKeyValue,
    SortKeyValueValue,
    TotalExecutionResultHeader,
    TotalResultHeader,
    ActionsApiInterface as AfmActionsApiInterface,
    ActionsApiComputeLabelElementsPostRequest,
    ActionsApiComputeReportRequest,
    ActionsApiComputeValidObjectsRequest,
    ActionsApiExplainAFMRequest,
    ActionsApiRetrieveResultRequest,
    ActionsApiRetrieveExecutionMetadataRequest,
    RestApiIdentifier,
    Total,
    TotalDimension,
    AttributeFormat,
    ActionsApiComputeValidDescendantsRequest,
    AfmValidDescendantsQuery,
    AfmValidDescendantsResponse,
    DependsOn,
    DependsOnDateFilter,
    ValidateByItem,
    ForecastRequest,
    ActionsApiForecastRequest,
    SmartFunctionResponse,
    ActionsApiForecastResultRequest,
    ForecastResult,
    ClusteringRequest,
    ClusteringResult,
    ActionsApiClusteringRequest,
    ActionsApiClusteringResultRequest,
    KeyDriversRequest,
    ActionsApiKeyDriverAnalysisRequest,
    KeyDriversResponse,
    ActionsApiKeyDriverAnalysisResultRequest,
    KeyDriversResult,
    KeyDriversDimension,
    AnomalyDetectionRequest,
    ActionsApiAnomalyDetectionRequest,
    ActionsApiAnomalyDetectionResultRequest,
    AnomalyDetectionResult,
    SearchRequest,
    ActionsApiAiSearchRequest,
    SearchResult,
    SearchResultObject,
    SearchRelationshipObject,
    RouteRequest,
    RouteResult,
    RouteResultUseCaseEnum,
    ActionsApiAiRouteRequest,
    CreatedVisualization,
    Metric,
    DimAttribute,
    DimAttributeTypeEnum,
    MetricTypeEnum,
    ChatRequest,
    ChatHistoryRequest,
    ChatHistoryRequestUserFeedbackEnum,
    ChatHistoryInteraction,
    ActionsApiAiChatRequest,
    ActionsApiAiChatHistoryRequest,
    ChatResult,
    ChatHistoryResult,
    FoundObjects,
    UserContext,
    CreatedVisualizations,
    ActiveObjectIdentification,
    AttributeNegativeFilter,
    AttributePositiveFilter,
    DateAbsoluteFilter,
    DateRelativeFilter,
} from "./generated/afm-rest-api/api.js";
export {
    AfmObjectIdentifierAttributeIdentifierTypeEnum as AfmModelObjectIdentifierAttributeIdentifierTypeEnum,
    AfmObjectIdentifierCoreIdentifierTypeEnum as AfmModelObjectIdentifierCoreIdentifierTypeEnum,
    AfmObjectIdentifierDatasetIdentifierTypeEnum as AfmModelObjectIdentifierDatasetIdentifierTypeEnum,
    AfmObjectIdentifierIdentifierTypeEnum as AfmModelObjectIdentifierIdentifierTypeEnum,
    AfmObjectIdentifierLabelIdentifierTypeEnum as AfmModelObjectIdentifierLabelIdentifierTypeEnum,
    AfmValidObjectsQueryTypesEnum,
    ArithmeticMeasureDefinitionArithmeticMeasureOperatorEnum as AfmArithmeticMeasureDefinitionArithmeticMeasureOperatorEnum,
    AttributeHeaderOutAttributeHeaderGranularityEnum,
    ComparisonMeasureValueFilterComparisonMeasureValueFilterOperatorEnum as AfmComparisonMeasureValueFilterComparisonMeasureValueFilterOperatorEnum,
    FilterByLabelTypeEnum,
    ElementsRequestSortOrderEnum,
    DateRelativeFilterGranularityEnum,
    RangeMeasureValueFilterRangeMeasureValueFilterOperatorEnum as AfmRangeMeasureValueFilterRangeMeasureValueFilterOperatorEnum,
    RankingFilterRankingFilterOperatorEnum as AfmRankingFilterRankingFilterOperatorEnum,
    RelativeDateFilterRelativeDateFilterGranularityEnum as AfmRelativeDateFilterRelativeDateFilterGranularityEnum,
    SimpleMeasureDefinitionMeasureAggregationEnum as AfmSimpleMeasureDefinitionMeasureAggregationEnum,
    SortKeyTotalTotalDirectionEnum,
    SortKeyValueValueDirectionEnum,
    SortKeyAttributeAttributeDirectionEnum,
    SortKeyAttributeAttributeSortTypeEnum,
    ActionsApiAxiosParamCreator as AfmActionsApiAxiosParamCreator,
    ActionsApiFp as AfmActionsApiFp,
    ActionsApiFactory as AfmActionsApiFactory,
    ActionsApi as AfmActionsApi,
    TotalFunctionEnum,
    ElementsResponseGranularityEnum,
    AttributeHeaderOutAttributeHeaderValueTypeEnum,
    KeyDriversRequestSortDirectionEnum,
    KeyDriversDimensionGranularityEnum,
    KeyDriversDimensionValueTypeEnum,
    SearchRequestObjectTypesEnum,
    CreatedVisualizationVisualizationTypeEnum,
    MetricAggFunctionEnum,
} from "./generated/afm-rest-api/api.js";
export type {
    ActionsApiInterface as AuthActionsApiInterface,
    ActionsApiProcessInvitationRequest,
    Invitation,
} from "./generated/auth-json-api/api.js";
export { ActionsApiFactory as AuthActionsApiFactory } from "./generated/auth-json-api/api.js";
export type { ConfigurationParameters } from "./generated/auth-json-api/configuration.js";
export { Configuration } from "./generated/auth-json-api/configuration.js";
export * from "./generated/metadata-json-api/api.js";
export type {
    ActionsApiCreatePdfExportRequest,
    ActionsApiGetExportedFileRequest,
    ActionsApiGetMetadataRequest,
    ActionsApiCreateTabularExportRequest,
    ActionsApiGetTabularExportRequest,
    ExportResponse,
} from "./generated/export-json-api/api.js";

export type {
    ActionsApiGetDataSourceSchemataRequest,
    ActionsApiScanDataSourceRequest,
    ActionsApiTestDataSourceDefinitionRequest,
    ActionsApiTestDataSourceRequest,
    DataSourceSchemata,
    DeclarativeColumn as ScanModelDeclarativeColumn,
    DeclarativeTable as ScanModelDeclarativeTable,
    DeclarativeTables as ScanModelDeclarativeTables,
    ScanRequest,
    ScanResultPdm,
    TableWarning,
    TestDefinitionRequest,
    TestQueryDuration,
    TestResponse,
    ColumnWarning,
    DataSourceParameter,
    TestRequest,
    ScanSqlResponse,
    ActionsApiScanSqlRequest,
    SqlColumn as ScanApiSqlColumn,
    ScanSqlRequest,
    ActionsApiColumnStatisticsRequest,
    ColumnStatisticsResponse,
    ColumnStatistic,
    Histogram,
    Frequency,
    ColumnStatisticWarning,
    ColumnStatisticsRequest,
    SqlQuery,
    Table,
    HistogramBucket,
    HistogramProperties,
    FrequencyBucket,
    FrequencyProperties,
} from "./generated/scan-json-api/api.js";
export {
    DeclarativeColumnDataTypeEnum as ScanModelDeclarativeColumnDataTypeEnum,
    TestDefinitionRequestTypeEnum,
    SqlColumnDataTypeEnum as ScanApiSqlColumnDataTypeEnum,
    ColumnStatisticTypeEnum,
    ColumnStatisticsRequestStatisticsEnum,
} from "./generated/scan-json-api/api.js";

export type {
    ActionsApiAnalyzeCsvRequest,
    ActionsApiDeleteFilesRequest,
    ActionsApiImportCsvRequest,
    ActionsApiListFilesRequest,
    ActionsApiReadCsvFileManifestsRequest,
    ActionsApiStagingUploadRequest,
    AnalyzeCsvRequest,
    AnalyzeCsvRequestItem,
    AnalyzeCsvRequestItemConfig,
    AnalyzeCsvResponse,
    AnalyzeCsvResponseColumn,
    AnalyzeCsvResponseConfig,
    CacheRemovalInterval,
    CacheUsageData,
    CsvConvertOptions,
    CsvConvertOptionsColumnType,
    CsvManifestBody,
    CsvParseOptions,
    CsvReadOptions,
    DeleteFilesRequest,
    GdStorageFile,
    ImportCsvRequest,
    ImportCsvResponse,
    ImportCsvRequestTable,
    ImportCsvRequestTableSource,
    ImportCsvRequestTableSourceConfig,
    OrganizationCacheSettings,
    OrganizationCacheUsage,
    OrganizationCurrentCacheUsage,
    ReadCsvFileManifestsRequest,
    ReadCsvFileManifestsRequestItem,
    ReadCsvFileManifestsResponse,
    UploadFileResponse,
    WorkspaceCacheSettings,
    WorkspaceCacheUsage,
    WorkspaceCurrentCacheUsage,
} from "./generated/result-json-api/api.js";
export { GdStorageFileTypeEnum } from "./generated/result-json-api/api.js";

export * from "./client.js";

export { jsonApiHeaders, JSON_API_HEADER_VALUE, ValidateRelationsHeader } from "./constants.js";

export type {
    MetadataGetEntitiesResult,
    MetadataGetEntitiesFn,
    MetadataGetEntitiesOptions,
    MetadataGetEntitiesParams,
    MetadataGetEntitiesThemeParams,
    MetadataGetEntitiesColorPaletteParams,
    MetadataGetEntitiesWorkspaceParams,
    MetadataGetEntitiesUserParams,
} from "./metadataUtilities.js";
export { MetadataUtilities } from "./metadataUtilities.js";

export type {
    OrganizationGetEntitiesResult,
    OrganizationGetEntitiesSupportingIncludedResult,
    OrganizationGetEntitiesFn,
    OrganizationGetEntitiesParams,
} from "./organizationUtilities.js";
export { OrganizationUtilities } from "./organizationUtilities.js";

export { ActionsUtilities } from "./actionsUtilities.js";

const defaultTigerClient: ITigerClient = tigerClientFactory(defaultAxios);

export default defaultTigerClient;
