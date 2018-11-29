/* @flow */
import * as ACCOUNT from 'actions/constants/account';
import * as SEND from 'actions/constants/send';
import * as WEB3 from 'actions/constants/web3';

import type {
    Dispatch,
    GetState,
    State as ReducersState,
    Action,
    ThunkAction,
} from 'flowtype';
import type { State as EthereumState } from 'reducers/SendFormEthereumReducer';
import type { State as RippleState } from 'reducers/SendFormRippleReducer';
import type { Account } from 'reducers/AccountsReducer';

import * as EthereumSendFormActions from './ethereum/SendFormActions';
import * as RippleSendFormActions from './ripple/SendFormActions';

export type SendTxAction = {
    type: typeof SEND.TX_COMPLETE,
    //networkType: 'ethereum',
    account: Account,
    selectedCurrency: string,
    amount: string,
    total: string,
    tx: any,
    nonce: number,
    txid: string,
    txData: any,
}

export type SendFormAction = {
    type: typeof SEND.INIT | typeof SEND.VALIDATION | typeof SEND.CHANGE,
    networkType: 'ethereum',
    state: EthereumState,
} | {
    type: typeof SEND.INIT | typeof SEND.VALIDATION | typeof SEND.CHANGE,
    networkType: 'ripple',
    state: RippleState,
} | {
    type: typeof SEND.TOGGLE_ADVANCED | typeof SEND.TX_SENDING | typeof SEND.TX_ERROR,
} | SendTxAction;


// list of all actions which has influence on "sendForm" reducer
// other actions will be ignored
const actions = [
    ACCOUNT.UPDATE_SELECTED_ACCOUNT,
    WEB3.GAS_PRICE_UPDATED,
    ...Object.values(SEND).filter(v => typeof v === 'string'),
];

/*
* Called from WalletService
*/
export const observe = (prevState: ReducersState, action: Action): ThunkAction => (dispatch: Dispatch, getState: GetState): void => {
    // ignore not listed actions
    if (actions.indexOf(action.type) < 0) return;

    const currentState = getState();
    // do not proceed if it's not "send" url
    if (!currentState.router.location.state.send) return;

    const { network } = currentState.selectedAccount;
    if (!network) return;

    switch (network.type) {
        case 'ethereum':
            dispatch(EthereumSendFormActions.observe(prevState, action));
            break;
        case 'ripple':
            dispatch(RippleSendFormActions.observe(prevState, action));
            break;
        default: break;
    }
};
