// (C) 2021-2023 GoodData Corporation
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import compact from "lodash/compact";

import { ConfirmDialogBase } from "../../ConfirmDialogBase";

import { ContentDivider } from "./ContentDivider";
import { ShareGranteeContent } from "./ShareGranteeContent";
import { IShareGranteeBaseProps } from "./types";
import { SharedObjectUnderLenientControl } from "./SharedObjectUnderLenientControl";
import { SharedObjectLockControl } from "./SharedObjectLockControl";

/**
 * @internal
 */
export const ShareGranteeBase: React.FC<IShareGranteeBaseProps> = (props) => {
    const {
        isLoading,
        isLockedNow,
        isUnderLenientControlNow,
        grantees,
        sharedObject,
        isDirty,
        currentUserPermissions,
        onCancel,
        onSubmit,
        onGranteeDelete,
        onGranularGranteeChange,
        onAddGranteeButtonClick,
        onLockChange,
        onUnderLenientControlChange,
    } = props;
    const {
        owner,
        isLeniencyControlSupported,
        isLockingSupported,
        areGranularPermissionsSupported,
        isMetadataObjectLockingSupported,
        isLocked,
    } = sharedObject;

    const intl = useIntl();

    const granteeList = useMemo(() => {
        return compact([owner, ...grantees]);
    }, [grantees, owner]);

    const dialogLabels = useMemo(() => {
        return {
            headline: intl.formatMessage({ id: "shareDialog.share.grantee.title" }),
            cancelButtonText: intl.formatMessage({ id: "cancel" }),
            submitButtonText: intl.formatMessage({ id: "save" }),
        };
    }, [intl]);

    return (
        <ConfirmDialogBase
            className="gd-share-dialog s-gd-share-grantees"
            displayCloseButton={true}
            isPositive={true}
            isSubmitDisabled={!isDirty}
            headline={dialogLabels.headline}
            cancelButtonText={dialogLabels.cancelButtonText}
            submitButtonText={dialogLabels.submitButtonText}
            onCancel={onCancel}
            onSubmit={onSubmit}
        >
            <ShareGranteeContent
                currentUserPermissions={currentUserPermissions}
                isDashboardLocked={isLocked}
                isLoading={isLoading}
                grantees={granteeList}
                areGranularPermissionsSupported={areGranularPermissionsSupported}
                onAddGrantee={onAddGranteeButtonClick}
                onDelete={onGranteeDelete}
                onChange={onGranularGranteeChange}
            />
            <ContentDivider />
            <SharedObjectUnderLenientControl
                isUnderLenientControl={isUnderLenientControlNow}
                isLeniencyControlSupported={isLeniencyControlSupported}
                onUnderLenientControlChange={onUnderLenientControlChange}
            />
            {isMetadataObjectLockingSupported && (
                <SharedObjectLockControl
                    isLocked={isLockedNow}
                    isLockingSupported={isLockingSupported}
                    onLockChange={onLockChange}
                />
            )}
        </ConfirmDialogBase>
    );
};
