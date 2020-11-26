// (C) 2020 GoodData Corporation
import { IWorkspaceDashboardsService, IListedDashboard, NotSupported } from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { convertAnalyticalDashboardToListItems } from "../../../convertors/fromBackend/AnalyticalDashboardConverter";
import { objRefToIdentifier } from "../../../utils/api";
import { AnalyticalDashboards } from "@gooddata/api-client-tiger";

export class TigerWorkspaceDashboards implements IWorkspaceDashboardsService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    // Public methods

    public getDashboards = async (): Promise<IListedDashboard[]> => {
        const result = await this.authCall((sdk) => {
            return sdk.workspaceModel.getEntities(
                {
                    entity: "analyticalDashboards",
                    workspaceId: this.workspace,
                },
                {
                    headers: { Accept: "application/vnd.gooddata.api+json" },
                },
            );
        });
        return convertAnalyticalDashboardToListItems(result.data as AnalyticalDashboards);
    };

    public getDashboard = async () => {
        throw new NotSupported("Not supported");
    };

    public createDashboard = async () => {
        throw new NotSupported("Not supported");
    };

    public updateDashboard = async () => {
        throw new NotSupported("Not supported");
    };

    public deleteDashboard = async (ref: ObjRef): Promise<void> => {
        const id = await objRefToIdentifier(ref, this.authCall);

        await this.authCall((sdk) =>
            sdk.workspaceModel.deleteEntity({
                entity: "analyticalDashboards",
                id: id,
                workspaceId: this.workspace,
            }),
        );
    };

    public exportDashboardToPdf = async () => {
        throw new NotSupported("Not supported");
    };

    public createScheduledMail = async () => {
        throw new NotSupported("Not supported");
    };

    public getScheduledMailsCountForDashboard = async () => {
        throw new NotSupported("Not supported");
    };

    public getAllWidgetAlertsForCurrentUser = async () => {
        throw new NotSupported("Not supported");
    };

    public getDashboardWidgetAlertsForCurrentUser = async () => {
        throw new NotSupported("Not supported");
    };

    public getWidgetAlertsCountForWidgets = async () => {
        throw new NotSupported("Not supported");
    };

    public createWidgetAlert = async () => {
        throw new NotSupported("Not supported");
    };

    public updateWidgetAlert = async () => {
        throw new NotSupported("Not supported");
    };

    public deleteWidgetAlert = async () => {
        throw new NotSupported("Not supported");
    };

    public deleteWidgetAlerts = async () => {
        throw new NotSupported("Not supported");
    };

    public getWidgetReferencedObjects = async () => {
        throw new NotSupported("Not supported");
    };

    public getResolvedFiltersForWidget = async () => {
        throw new NotSupported("Not supported");
    };
}
