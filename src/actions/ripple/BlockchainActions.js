/* @flow */

import TrezorConnect from 'trezor-connect';
import * as BLOCKCHAIN from 'actions/constants/blockchain';
import * as PENDING from 'actions/constants/pendingTx';
import * as AccountsActions from 'actions/AccountsActions';
import { mergeAccount, enhanceTransaction } from 'utils/accountUtils';
import { observeChanges } from 'reducers/utils';

import type { BlockchainNotification } from 'trezor-connect';
import type {
    Dispatch,
    GetState,
    PromiseAction,
    PayloadAction,
    Network,
    BlockchainFeeLevel,
} from 'flowtype';

export const subscribe = (network: string): PromiseAction<void> => async (
    dispatch: Dispatch,
    getState: GetState
) => {
    const accounts = getState()
        .accounts.filter(a => a.network === network)
        .map(a => ({ descriptor: a.descriptor }));
    await TrezorConnect.blockchainSubscribe({
        accounts,
        coin: network,
    });
};

// Get current known fee
// Use default values from appConfig.json if it wasn't downloaded from blockchain yet
// update them later, after onBlockMined event
export const getFeeLevels = (network: Network): PayloadAction<Array<BlockchainFeeLevel>> => (
    dispatch: Dispatch,
    getState: GetState
): Array<BlockchainFeeLevel> => {
    const blockchain = getState().blockchain.find(b => b.shortcut === network.shortcut);
    if (!blockchain || blockchain.feeLevels.length < 1) {
        return network.fee.levels.map(level => ({
            name: level.name,
            value: level.value,
        }));
    }
    return blockchain.feeLevels;
};

export const onBlockMined = (network: Network): PromiseAction<void> => async (
    dispatch: Dispatch,
    getState: GetState
): Promise<void> => {
    const blockchain = getState().blockchain.find(b => b.shortcut === network.shortcut);
    if (!blockchain) return; // flowtype fallback

    // if last update was more than 5 minutes ago
    const now = new Date().getTime();
    if (blockchain.feeTimestamp < now - 300000) {
        const feeRequest = await TrezorConnect.blockchainEstimateFee({
            request: {
                feeLevels: 'smart',
            },
            coin: network.shortcut,
        });
        if (feeRequest.success && observeChanges(blockchain.feeLevels, feeRequest.payload)) {
            // check if downloaded fee levels are different
            dispatch({
                type: BLOCKCHAIN.UPDATE_FEE,
                shortcut: network.shortcut,
                feeLevels: feeRequest.payload.levels.map(l => ({
                    name: 'Normal',
                    value: l.feePerUnit,
                })),
            });
        }
    }

    // TODO: check for blockchain rollbacks here!

    const accounts = getState().accounts.filter(a => a.network === network.shortcut);
    if (accounts.length === 0) return;

    const bundle = accounts.map(a => ({ descriptor: a.descriptor, coin: network.shortcut }));
    const response = await TrezorConnect.getAccountInfo({ bundle });

    if (!response.success) return;

    response.payload.forEach((info, i) => {
        dispatch(
            AccountsActions.update(mergeAccount(info, accounts[i], network, blockchain.block))
        );
    });
};

export const onNotification = (
    payload: BlockchainNotification,
    network: Network
): PromiseAction<void> => async (dispatch: Dispatch, getState: GetState): Promise<void> => {
    const { descriptor, tx } = payload.notification;
    const account = getState().accounts.find(a => a.descriptor === descriptor);
    const blockchain = getState().blockchain.find(b => b.shortcut === network.shortcut);
    if (!account || !blockchain) return;

    if (!tx.blockHeight) {
        dispatch({
            type: PENDING.ADD,
            payload: enhanceTransaction(account, tx, network),
        });
    } else {
        dispatch({
            type: PENDING.TX_RESOLVED,
            hash: tx.txid,
        });
    }

    const response = await TrezorConnect.getAccountInfo({
        descriptor: account.descriptor,
        coin: account.network,
    });

    if (!response.success) return;

    dispatch(
        AccountsActions.update(mergeAccount(response.payload, account, network, blockchain.block))
    );
};
