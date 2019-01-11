/* @flow */

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import SignVerifyActions from 'actions/SignVerifyActions';
import type { State, Dispatch } from 'flowtype';
import Component from './index';

type OwnProps = {||};

export type Error = {
    inputName: string,
    message: ?string,
};

export type StateProps = {|
    wallet: $ElementType<State, 'wallet'>,
    selectedAccount: $ElementType<State, 'selectedAccount'>,
    signVerify: $ElementType<State, 'signVerify'>,
|};

export type DispatchProps = {|
    signVerifyActions: typeof SignVerifyActions,
|};

export type Props = {| ...OwnProps, ...StateProps, ...DispatchProps |};

const mapStateToProps = (state: State): StateProps => ({
    wallet: state.wallet,
    selectedAccount: state.selectedAccount,
    signVerify: state.signVerify,
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    signVerifyActions: bindActionCreators(SignVerifyActions, dispatch),
});

export default connect<Props, OwnProps, StateProps, DispatchProps, State, Dispatch>(mapStateToProps, mapDispatchToProps)(Component);