/* @flow */

import TrezorConnect from 'trezor-connect';
import * as DISCOVERY from 'actions/constants/discovery';
import { enhanceAccount } from 'utils/accountUtils';
import type { PromiseAction, Dispatch, GetState, TrezorDevice, Network, Account } from 'flowtype';
import type { Discovery } from 'reducers/DiscoveryReducer';

export type DiscoveryStartAction = {
    type: typeof DISCOVERY.START,
    networkType: 'ethereum',
    network: Network,
    device: TrezorDevice,
};

export const begin = (
    device: TrezorDevice,
    network: Network
): PromiseAction<DiscoveryStartAction> => async (): Promise<DiscoveryStartAction> => ({
    type: DISCOVERY.START,
    networkType: 'ethereum',
    network,
    device,
});

export const discoverAccount = (
    device: TrezorDevice,
    discoveryProcess: Discovery
): PromiseAction<Account> => async (dispatch: Dispatch, getState: GetState): Promise<Account> => {
    const { config } = getState().localStorage;
    const network = config.networks.find(c => c.shortcut === discoveryProcess.network);
    if (!network) throw new Error('Discovery network not found');

    const { accountIndex } = discoveryProcess;
    const path = network.bip44.slice(0).replace('a', accountIndex.toString());

    const response = await TrezorConnect.getAccountInfo({
        device: {
            path: device.path,
            instance: device.instance,
            state: device.state,
        },
        path,
        // details: 'tokenBalances', TODO: load ERC20
        pageSize: 1,
        keepSession: true, // acquire and hold session
        useEmptyPassphrase: device.useEmptyPassphrase,
        coin: network.shortcut,
    });

    // handle TREZOR response error
    if (!response.success) {
        throw new Error(response.payload.error);
    }

    return enhanceAccount(response.payload, {
        index: discoveryProcess.accountIndex,
        network,
        device,
    });
};
