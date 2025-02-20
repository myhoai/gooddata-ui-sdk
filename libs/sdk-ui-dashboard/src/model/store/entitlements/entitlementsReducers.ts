// (C) 2023 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { ResolvedEntitlements } from "../../types/commonTypes";
import { EntitlementsState } from "./entitlementsState";

type EntitlementsReducer<A extends Action> = CaseReducer<EntitlementsState, A>;

const setEntitlements: EntitlementsReducer<PayloadAction<ResolvedEntitlements>> = (state, action) => {
    state.entitlements = action.payload;
};

export const entitlementsReducers = {
    setEntitlements,
};
