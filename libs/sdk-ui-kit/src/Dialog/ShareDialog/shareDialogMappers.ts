// (C) 2021-2023 GoodData Corporation
import {
    areObjRefsEqual,
    IUser,
    ObjRef,
    IWorkspaceUser,
    ShareStatus,
    AccessGranteeDetail,
    isUserAccess,
    isUserGroupAccess,
    IGranularAccessGrantee,
    IAvailableUserAccessGrantee,
    IAvailableUserGroupAccessGrantee,
    IUserAccess,
    IGranularUserAccess,
    IUserGroupAccess,
    IGranularUserGroupAccess,
    isGranularUserAccess,
    isGranularUserGroupAccess,
} from "@gooddata/sdk-model";
import { typesUtils } from "@gooddata/util";

import {
    GranteeItem,
    IGranteeGroup,
    IGranteeGroupAll,
    IGranteeUser,
    IGranteeInactiveOwner,
    isGranteeGroupAll,
    isGranteeUserInactive,
    GranteeStatus,
    IAffectedSharedObject,
    isGranteeUser,
    isGranularGrantee,
    IGranularGranteeUser,
    IGranularGranteeGroup,
} from "./ShareDialogBase/types";
import { GranteeGroupAll, InactiveOwner, getAppliedGrantees, hasGroupAll } from "./ShareDialogBase/utils";
import { ISharedObject } from "./types";

const mapUserStatusToGranteeStatus = (status: "ENABLED" | "DISABLED"): GranteeStatus => {
    if (status === "DISABLED") {
        return "Inactive";
    }

    return "Active";
};

/**
 * @internal
 */
export const mapWorkspaceUserToGrantee = (
    user: IAvailableUserAccessGrantee,
    currentUserRef: ObjRef,
): IGranteeUser => {
    return {
        type: "user",
        id: user.ref,
        name: user.name,
        email: user.email,
        isOwner: false,
        isCurrentUser: areObjRefsEqual(user.ref, currentUserRef),
        status: mapUserStatusToGranteeStatus(user.status),
    };
};

/**
 * @internal
 */
export const mapWorkspaceUserGroupToGrantee = (
    userGroup: IAvailableUserGroupAccessGrantee,
): IGranteeGroup => {
    return {
        id: userGroup.ref,
        type: "group",
        name: userGroup.name,
    };
};

/**
 * @internal
 */
export const mapUserFullName = (user: IUser | IWorkspaceUser): string => {
    if (user.fullName) {
        return user.fullName;
    }

    return `${user.firstName} ${user.lastName}`;
};

/**
 * @internal
 */
export const mapOwnerToGrantee = (user: IUser, currentUserRef: ObjRef): IGranteeUser => {
    return {
        type: "user",
        id: user.ref,
        name: mapUserFullName(user),
        email: user.email,
        isOwner: true,
        isCurrentUser: areObjRefsEqual(user.ref, currentUserRef),
        status: "Active",
    };
};

/**
 * @internal
 */
export const mapUserToInactiveOwner = (): IGranteeInactiveOwner => {
    return InactiveOwner;
};

/**
 * @internal
 */
export const mapShareStatusToGroupAll = (shareStatus: ShareStatus): IGranteeGroupAll | undefined => {
    if (shareStatus === "public") {
        return GranteeGroupAll;
    }
};

/**
 * @internal
 */
export const mapGranteesToGranularAccessGrantees = (
    grantees: GranteeItem[],
    added?: boolean,
): IGranularAccessGrantee[] => {
    const guard = typesUtils.combineGuards(isGranteeGroupAll, isGranteeUserInactive);
    return grantees
        .filter((g) => !guard(g))
        .map((g) => {
            if (isGranularGrantee(g)) {
                return {
                    type: g.type,
                    granteeRef: g.id,
                    permissions: g.permissions,
                    inheritedPermissions: g.inheritedPermissions,
                };
            } else {
                const type = isGranteeUser(g) ? "granularUser" : "granularGroup";
                return {
                    type,
                    granteeRef: g.id,
                    // When grantee is not granular, we need to insert some dummy permission when adding access.
                    permissions: added ? ["VIEW"] : [],
                    inheritedPermissions: [],
                };
            }
        });
};

/**
 * @internal
 */
export const mapUserAccessToGrantee = (userAccess: IUserAccess, currentUserRef: ObjRef): IGranteeUser => {
    const { user, type } = userAccess;

    return {
        type,
        id: user.ref,
        name: mapUserFullName(user),
        email: user.email,
        isOwner: false,
        isCurrentUser: areObjRefsEqual(user.ref, currentUserRef),
        status: mapUserStatusToGranteeStatus(user.status),
    };
};

/**
 * @internal
 */
export const mapUserGroupAccessToGrantee = (userGroupAccess: IUserGroupAccess): IGranteeGroup => {
    const { userGroup, type } = userGroupAccess;

    return {
        type,
        id: userGroup.ref,
        name: userGroup.name,
    };
};

/**
 * @internal
 */
export const mapGranularUserAccessToGrantee = (
    userAccess: IGranularUserAccess,
    currentUserRef: ObjRef,
): IGranularGranteeUser => {
    const { user, type, permissions, inheritedPermissions } = userAccess;

    return {
        type,
        id: user.ref,
        name: mapUserFullName(user),
        email: user.email,
        isOwner: false,
        isCurrentUser: areObjRefsEqual(user.ref, currentUserRef),
        status: mapUserStatusToGranteeStatus(user.status),
        permissions,
        inheritedPermissions,
    };
};

/**
 * @internal
 */
export const mapGranularUserGroupAccessToGrantee = (
    userGroupAccess: IGranularUserGroupAccess,
): IGranularGranteeGroup => {
    const { userGroup, type, permissions, inheritedPermissions } = userGroupAccess;

    return {
        type,
        id: userGroup.ref,
        name: userGroup.name,
        permissions,
        inheritedPermissions,
    };
};

export const mapAccessGranteeDetailToGrantee = (
    accessGranteeDetail: AccessGranteeDetail,
    currentUserRef: ObjRef,
): GranteeItem => {
    if (isUserAccess(accessGranteeDetail)) {
        return mapUserAccessToGrantee(accessGranteeDetail, currentUserRef);
    } else if (isUserGroupAccess(accessGranteeDetail)) {
        return mapUserGroupAccessToGrantee(accessGranteeDetail);
    } else if (isGranularUserAccess(accessGranteeDetail)) {
        return mapGranularUserAccessToGrantee(accessGranteeDetail, currentUserRef);
    } else if (isGranularUserGroupAccess(accessGranteeDetail)) {
        return mapGranularUserGroupAccessToGrantee(accessGranteeDetail);
    }
};

/**
 * @internal
 */
export const mapGranteesToShareStatus = (
    grantees: GranteeItem[],
    granteesToAdd: GranteeItem[],
    granteesToDelete: GranteeItem[],
): ShareStatus => {
    const appliedGrantees = getAppliedGrantees(grantees, granteesToAdd, granteesToDelete);

    if (hasGroupAll(appliedGrantees)) {
        return "public";
    }

    if (appliedGrantees.length > 0) {
        return "shared";
    }

    return "private";
};

/**
 * @internal
 */
export const mapSharedObjectToAffectedSharedObject = (
    sharedObject: ISharedObject,
    owner: IGranteeUser | IGranteeInactiveOwner,
    isLockingSupported: boolean,
    isLeniencyControlSupported: boolean,
    areGranularPermissionsSupported = false,
    isMetadataObjectLockingSupported = true,
): IAffectedSharedObject => {
    const { ref, shareStatus, isLocked, isUnderStrictControl } = sharedObject;
    return {
        ref,
        shareStatus,
        owner,
        isLocked: !!isLocked,
        isUnderLenientControl: !isUnderStrictControl,
        isLockingSupported,
        isLeniencyControlSupported,
        areGranularPermissionsSupported,
        isMetadataObjectLockingSupported,
    };
};
