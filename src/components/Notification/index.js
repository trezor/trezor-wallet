/* @flow */
import * as React from 'react';
import styled from 'styled-components';
import { getPrimaryColor, getSecondaryColor, getIcon } from 'utils/notification';
import Icon from 'components/Icon';
import icons from 'config/icons';
import colors from 'config/colors';
import { FONT_WEIGHT, FONT_SIZE } from 'config/variables';

import * as NotificationActions from 'actions/NotificationActions';
import Loader from 'components/Loader';
import type { CallbackAction } from 'reducers/NotificationReducer';

import NotificationButton from './components/NotificationButton';

type Props = {
    type: string,
    cancelable?: boolean;
    title: string;
    className?: string;
    message?: ?string;
    actions?: Array<CallbackAction>;
    isActionInProgress?: boolean;
    close?: typeof NotificationActions.close,
    loading?: boolean
};

const StyledNotification = styled.div`
    display: flex;
    width: 100%;
    background: ${colors.WHITE};
    margin: 10px 0px;
    box-shadow: 0px 0px 6px 1px rgba(0,0,0,0.2);
    border-left: 4px solid ${props => getPrimaryColor(props.type)};
    border-radius: 4px;
    padding: 6px 12px;

    & + & {
        margin-top: 0px;
    }
`;

const Column = styled.div`
    display: flex;
    width: 100%;
    flex-direction: column;
    justify-content: center;
`;

const Body = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    text-align: left;
    align-items: center;
    padding: 6px 0px;
    background: ${props => getSecondaryColor(props.type)};
`;

const Header = styled.div`
    display: flex;
    width: 100%;
    align-items: center;
    padding: 6px 0px;
    border-top-left-radius: 4px; 
    border-top-right-radius: 4px; 
    color: ${props => getPrimaryColor(props.type)};
`;

const Message = styled.div`
    font-size: ${FONT_SIZE.SMALL};
    color: ${colors.TEXT_SECONDARY};
    padding-right: 5px;
`;

const Title = styled.div`
    font-weight: ${FONT_WEIGHT.MEDIUM};
`;

const CloseClick = styled.div`
    margin-left: auto;
    cursor: pointer;
`;

const StyledIcon = styled(Icon)`
    min-width: 20px;
`;

const IconWrapper = styled.div`
    min-width: 30px;
    padding-right: 12px;
    display: flex;
    align-items: center;
    flex: 1 0 auto;
`;

const AdditionalContent = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    flex: 1;
`;

const ActionContent = styled.div`
    display: flex;
    justify-content: right;
    align-items: flex-end;
`;

const Notification = (props: Props): React$Element<string> => {
    const close: Function = typeof props.close === 'function' ? props.close : () => {}; // TODO: add default close action

    return (
        <StyledNotification className={props.className} type={props.type}>
            <IconWrapper>
                <StyledIcon
                    color={getPrimaryColor(props.type)}
                    icon={getIcon(props.type)}
                    size={48}
                />
            </IconWrapper>
            <Column>
                <Header type={props.type}>
                    {props.loading && <Loader size={24} /> }
                    <Title>{ props.title }</Title>
                    {props.cancelable && (
                        <CloseClick onClick={() => close()}>
                            <Icon
                                color={colors.TEXT_SECONDARY}
                                hoverColor={colors.TEXT_PRIMARY}
                                icon={icons.CLOSE}
                                size={20}
                            />
                        </CloseClick>
                    )}
                </Header>
                { (props.message || (props.actions || []).length > 0) ? (
                    <Body>
                        { props.message ? <Message>{props.message}</Message> : '' }
                        <AdditionalContent>
                            {props.actions && props.actions.length > 0 && (
                                <ActionContent>
                                    {props.actions.map(action => (
                                        <NotificationButton
                                            key={action.label}
                                            type={props.type}
                                            isLoading={props.isActionInProgress}
                                            onClick={() => { close(); action.callback(); }}
                                        >{action.label}
                                        </NotificationButton>
                                    ))}
                                </ActionContent>
                            )}
                        </AdditionalContent>
                    </Body>
                ) : null }
            </Column>
        </StyledNotification>
    );
};

export default Notification;