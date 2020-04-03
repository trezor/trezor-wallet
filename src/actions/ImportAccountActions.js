/* @flow */

import * as ACCOUNT from 'actions/constants/account';
import * as IMPORT from 'actions/constants/importAccount';
import * as NOTIFICATION from 'actions/constants/notification';
import type { AsyncAction, Account, TrezorDevice, Network, Dispatch, GetState } from 'flowtype';
import * as LocalStorageActions from 'actions/LocalStorageActions';
import TrezorConnect from 'trezor-connect';
import { enhanceAccount } from 'utils/accountUtils';

export type ImportAccountAction =
    | {
          type: typeof IMPORT.START,
      }
    | {
          type: typeof IMPORT.SUCCESS,
      }
    | {
          type: typeof IMPORT.FAIL,
          error: ?string,
      };

const findIndex = (accounts: Array<Account>, network: Network, device: TrezorDevice): number => {
    return accounts.filter(
        a => a.imported === true && a.network === network.shortcut && a.deviceID === device.id
    ).length;
};

export const importAddress = (
    address: string,
    network: Network,
    device: ?TrezorDevice
): AsyncAction => async (dispatch: Dispatch, getState: GetState): Promise<void> => {
    if (!device || !device.features) return;

    dispatch({
        type: IMPORT.START,
    });

    const response = await TrezorConnect.getAccountInfo({
        descriptor: address,
        coin: network.shortcut,
    });

    // handle TREZOR response error
    if (!response.success) {
        dispatch({
            type: IMPORT.FAIL,
            error: response.payload.error,
        });

        dispatch({
            type: NOTIFICATION.ADD,
            payload: {
                variant: 'error',
                title: 'Import account error',
                message: response.payload.error,
                cancelable: true,
            },
        });

        return;
    }

    const index = findIndex(getState().accounts, network, device);
    const account = enhanceAccount(response.payload, {
        imported: true,
        index,
        network,
        device,
    });

    dispatch({
        type: ACCOUNT.CREATE,
        payload: account,
    });
    dispatch({
        type: IMPORT.SUCCESS,
    });
    dispatch(LocalStorageActions.setImportedAccount(account));
    dispatch({
        type: NOTIFICATION.ADD,
        payload: {
            variant: 'success',
            title: 'The account has been successfully imported',
            cancelable: true,
        },
    });
};
