// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { injectIntl } from "react-intl";
import { IAnalyticalBackend, Element } from "@gooddata/sdk-backend-spi";

import { IntlWrapper } from "../../base/translations/IntlWrapper";
import { AttributeDropdown as AttributeDropdownNew } from "./AttributeDropdown/AttributeDropdown";

export interface IAttributeFilterProps {
    backend: IAnalyticalBackend;
    workspace: string;
    identifier: string;

    onApply: (selectedItems: Element[], isInverted: boolean) => void;
    fullscreenOnMobile?: boolean;
    locale?: string;
    FilterLoading?: React.ComponentType;
    FilterError?: React.ComponentType<{ error?: any }>;
}

interface IAttributeFilterState {
    title: string;
    isLoading: boolean;
    error?: any;
}

const DefaultFilterLoading = injectIntl(({ intl }) => {
    return (
        <button className="gd-button gd-button-secondary gd-button-small icon-right icon disabled s-button-loading">
            {intl.formatMessage({ id: "gs.filter.loading" })}
        </button>
    );
});

const DefaultFilterError = injectIntl(({ intl }) => {
    const text = intl.formatMessage({ id: "gs.filter.error" });
    return <div className="gd-message error">{text}</div>;
});

/**
 * AttributeFilter is a component that renders a dropdown populated with attribute values
 * for specified attribute display form.
 */
export class AttributeFilter extends React.PureComponent<IAttributeFilterProps, IAttributeFilterState> {
    public static defaultProps: Partial<IAttributeFilterProps> = {
        locale: "en-US",
        FilterLoading: DefaultFilterLoading,
        FilterError: DefaultFilterError,
        fullscreenOnMobile: false,
    };

    public state: IAttributeFilterState = {
        title: "",
        error: null,
        isLoading: false,
    };

    private getBackend = () => {
        return this.props.backend.withTelemetry("AttributeFilter", this.props);
    };

    public componentDidMount(): void {
        this.loadAttributeTitle();
    }

    public componentDidUpdate(prevProps: IAttributeFilterProps): void {
        const needsNewTitleLoad =
            prevProps.identifier !== this.props.identifier || prevProps.workspace !== this.props.workspace;

        if (needsNewTitleLoad) {
            this.loadAttributeTitle(true);
        }
    }

    private loadAttributeTitle = async (force = false) => {
        if (!force && this.state.isLoading) {
            return;
        }

        const { identifier, workspace } = this.props;

        this.setState({ error: null, isLoading: true });

        try {
            const displayForm = await this.getBackend()
                .workspace(workspace)
                .metadata()
                .getAttributeDisplayForm(identifier);

            console.log("AAA", displayForm);

            this.setState({ title: displayForm.title, error: null, isLoading: false });
        } catch (error) {
            this.setState({ title: "", error, isLoading: false });
        }
    };

    public render() {
        const { locale, workspace, identifier, backend, onApply, FilterError, FilterLoading } = this.props;
        const { title, error, isLoading } = this.state;
        return (
            <IntlWrapper locale={locale}>
                {isLoading ? (
                    <FilterLoading />
                ) : error ? (
                    <FilterError error={error} />
                ) : (
                    <AttributeDropdownNew
                        identifier={identifier}
                        backend={backend}
                        workspace={workspace}
                        onApply={onApply}
                        title={title}
                    />
                )}
            </IntlWrapper>
        );
    }
}
