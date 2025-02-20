// (C) 2007-2019 GoodData Corporation

import { isNoDataError } from "@gooddata/sdk-backend-spi";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { mount, ReactWrapper } from "enzyme";
import React from "react";
import { IScenario, VisProps } from "../../src";
import { backendWithCapturing, ChartInteractions } from "./backendWithCapturing";
import omit from "lodash/omit";

function errorHandler(error: GoodDataSdkError) {
    if (isNoDataError(error.cause)) {
        /*
         * This is expected during tests, executions go against dummy backend that throws no data.
         */
        return;
    }

    console.error("Possibly unexpected exception during enzyme mount of the chart", error);
}

export type EffectivePropsExtractor = (wrapper: ReactWrapper) => any;

const immediateChildPropsExtractor: EffectivePropsExtractor = (wrapper: ReactWrapper): any => {
    return wrapper.childAt(0).props();
};

async function _mountChartAndCapture<T extends VisProps>(
    scenario: IScenario<T>,
    effectivePropsExtractor: EffectivePropsExtractor,
    normalize: boolean,
): Promise<ChartInteractions> {
    const [backend, promisedInteractions] = backendWithCapturing(normalize);
    const { propsFactory, component: Component, workspaceType } = scenario;

    const props = propsFactory(backend, workspaceType);
    const customErrorHandler = props.onError;

    if (!customErrorHandler) {
        /*
         * if scenario does not provide its own error handler, then provide one that reduces amount of error
         * logs in the console.
         */
        props.onError = errorHandler;
    }

    const wrapper = mount(<Component {...(props as any)} />);
    const interactions = await promisedInteractions;

    interactions.effectiveProps = effectivePropsExtractor(wrapper);

    if (!customErrorHandler) {
        // make sure error handler injected by this fun is not included in the captured props
        interactions.effectiveProps = omit(interactions.effectiveProps, "onError");
    }

    return interactions;
}

/**
 * Mounts component tested by the scenario and captures significant chart interactions with the rest of the world. Because the
 * chart rendering communicates with backend asynchronously, this function is also async. The returned
 * promise will be resolved as soon as the chart does first request to obtain a data view to visualize.
 *
 * @param scenario - test scenario for a component
 * @param effectivePropsExtractor - function to extract effective props that can be later user for assertions
 */
export async function mountChartAndCapture<T extends VisProps>(
    scenario: IScenario<T>,
    effectivePropsExtractor: EffectivePropsExtractor = immediateChildPropsExtractor,
): Promise<ChartInteractions> {
    return _mountChartAndCapture(scenario, effectivePropsExtractor, false);
}

/**
 * This is identical to {@link mountChartAndCapture} with single exception - the backend is decorated `withNormalization`.
 *
 * Meaning whatever execution definitions are captured represent state _after_ normalization.
 */
export async function mountChartAndCaptureNormalized<T extends VisProps>(
    scenario: IScenario<T>,
): Promise<ChartInteractions> {
    return _mountChartAndCapture(scenario, immediateChildPropsExtractor, true);
}
