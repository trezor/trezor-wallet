/* @flow */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import colors from 'config/colors';
import { H2 } from 'components/Heading';
import ReactJson from 'react-json-view';
import Icon from 'components/Icon';
import P from 'components/Paragraph';

import * as LogActions from 'actions/LogActions';
import icons from 'config/icons';
import type { State, Dispatch } from 'flowtype';

type OwnProps = {||};
type StateProps = {|
    log: $ElementType<State, 'log'>,
|};

type DispatchProps = {|
    toggle: typeof LogActions.toggle
|};

type Props = {| ...OwnProps, ...StateProps, ...DispatchProps |};

const Wrapper = styled.div`
    position: relative;
    color: ${colors.INFO_PRIMARY};
    background: ${colors.INFO_SECONDARY};
    padding: 24px;
    display: flex;
    flex-direction: column;
    text-align: left;
    width: 100%;
`;

const Click = styled.div`
    cursor: pointer;
    position: absolute;
    top: 0;
    right: 0;
    padding-right: inherit;
    padding-top: inherit;
    color: inherit;
    transition: opacity 0.3s;

    &:active,
    &:hover {
        opacity: 0.6;
        color: inherit;
    }
`;

const StyledParagraph = styled(P)`
    margin: 10px 0;
`;

const LogWrapper = styled.div`
    background: white;
    padding: 25px;
    height: 300px;
    overflow: scroll;
`;

const Log = (props: Props) => {
    if (!props.log.opened) return null;
    return (
        <Wrapper>
            <Click onClick={props.toggle}>
                <Icon size={24} color={colors.INFO_PRIMARY} icon={icons.CLOSE} />
            </Click>
            <H2>Log</H2>
            <StyledParagraph isSmaller>Attention: The log contains your XPUBs. Anyone with your XPUBs can see your account history.</StyledParagraph>
            <LogWrapper>
                <ReactJson src={props.log.entries} />
            </LogWrapper>
        </Wrapper>
    );
};

Log.propTypes = {
    log: PropTypes.array.isRequired,
    toggle: PropTypes.func.isRequired,
};

export default connect<Props, OwnProps, StateProps, DispatchProps, State, Dispatch>(
    (state: State): StateProps => ({
        log: state.log,
    }),
    (dispatch: Dispatch): DispatchProps => ({
        toggle: bindActionCreators(LogActions.toggle, dispatch),
    }),
)(Log);