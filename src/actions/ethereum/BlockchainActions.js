/* @flow */

import TrezorConnect from 'trezor-connect';
import BigNumber from 'bignumber.js';
import * as PENDING from 'actions/constants/pendingTx';
import * as AccountsActions from 'actions/AccountsActions';
import * as Web3Actions from 'actions/Web3Actions';
import { mergeAccount, enhanceTransaction } from 'utils/accountUtils';
import { namehash } from 'utils/ethUtils';
import * as dotCrypto from 'actions/constants/dotCrypto';
import type { Dispatch, GetState, PromiseAction, Network } from 'flowtype';
import type { BlockchainNotification } from 'trezor-connect';
import type { Token } from 'reducers/TokensReducer';
import type { NetworkToken } from 'reducers/LocalStorageReducer';

export const getTokenInfo = (input: string, network: string): PromiseAction<NetworkToken> => async (
    dispatch: Dispatch
): Promise<NetworkToken> => dispatch(Web3Actions.getTokenInfo(input, network));

export const getTokenBalance = (token: Token): PromiseAction<string> => async (
    dispatch: Dispatch
): Promise<string> => dispatch(Web3Actions.getTokenBalance(token));

export const getGasPrice = (
    network: string,
    defaultGasPrice: number
): PromiseAction<BigNumber> => async (dispatch: Dispatch): Promise<BigNumber> => {
    try {
        const gasPrice = await dispatch(Web3Actions.getCurrentGasPrice(network));
        return gasPrice === '0' ? new BigNumber(defaultGasPrice) : new BigNumber(gasPrice);
    } catch (error) {
        console.error(error);
        return new BigNumber(defaultGasPrice);
    }
};

const estimateProxy: Array<Promise<string>> = [];
export const estimateGasLimit = (
    network: string,
    data: string,
    value: string,
    gasPrice: string
): PromiseAction<string> => async (dispatch: Dispatch): Promise<string> => {
    // Since this method could be called multiple times in short period of time
    // check for pending calls in proxy and if there more than two (first is current running and the second is waiting for result of first)
    // TODO: should reject second call immediately?
    if (estimateProxy.length > 0) {
        // wait for proxy result (but do not process it)
        await estimateProxy[0];
    }

    const call = dispatch(
        Web3Actions.estimateGasLimit(network, {
            to: '',
            data,
            value,
            gasPrice,
        })
    );
    // add current call to proxy
    estimateProxy.push(call);
    // wait for result
    const result = await call;
    // remove current call from proxy
    estimateProxy.splice(0, 1);
    // return result
    return result;
};

export const subscribe = (network: string): PromiseAction<void> => async (
    dispatch: Dispatch,
    getState: GetState
): Promise<void> => {
    const accounts = getState()
        .accounts.filter(a => a.network === network)
        .map(a => ({ descriptor: a.descriptor }));
    const response = await TrezorConnect.blockchainSubscribe({
        accounts,
        coin: network,
    });
    if (!response.success) return;
    // init web3 instance if not exists
    await dispatch(Web3Actions.initWeb3(network));
};

export const onBlockMined = (network: Network): PromiseAction<void> => async (
    dispatch: Dispatch,
    getState: GetState
): Promise<void> => {
    // TODO: handle rollback,
    // check latest saved transaction blockhash against blockhheight

    // try to resolve pending transactions
    await dispatch(Web3Actions.resolvePendingTransactions(network.shortcut));

    await dispatch(Web3Actions.updateGasPrice(network.shortcut));

    const accounts = getState().accounts.filter(a => a.network === network.shortcut);
    if (accounts.length === 0) return;
    const blockchain = getState().blockchain.find(b => b.shortcut === network.shortcut);
    if (!blockchain) return; // flowtype fallback

    // find out which account changed
    const bundle = accounts.map(a => ({ descriptor: a.descriptor, coin: network.shortcut }));
    const response = await TrezorConnect.getAccountInfo({ bundle });

    if (!response.success) return;

    response.payload.forEach((info, i) => {
        dispatch(
            AccountsActions.update(mergeAccount(info, accounts[i], network, blockchain.block))
        );
        dispatch(Web3Actions.updateAccountTokens(accounts[i]));
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
    dispatch({
        type: PENDING.ADD,
        payload: enhanceTransaction(account, tx, network),
    });

    const response = await TrezorConnect.getAccountInfo({
        descriptor: account.descriptor,
        coin: account.network,
    });

    if (!response.success) return;

    dispatch(
        AccountsActions.update(mergeAccount(response.payload, account, network, blockchain.block))
    );
};

export const onError = (network: string): PromiseAction<void> => async (
    dispatch: Dispatch
): Promise<void> => {
    dispatch(Web3Actions.disconnect(network));
};

export const resolveDomain = (domain: string, ticker: string): PromiseAction<void> => async (
    dispatch: Dispatch
): Promise<string> => {
    const instance = await dispatch(Web3Actions.initWeb3('eth'));
    const ProxyReader = new instance.web3.eth.Contract(
        dotCrypto.ProxyReader.abi,
        dotCrypto.ProxyReader.address
    );
    const node = namehash(domain);
    return ProxyReader.methods
        .get(`crypto.${ticker}.address`, node)
        .call()
        .catch(() => '');
};
