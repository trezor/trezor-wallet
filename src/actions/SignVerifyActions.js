/* @flow */
import TrezorConnect from 'trezor-connect';
import type {
    GetState, Dispatch, ThunkAction, AsyncAction,
} from 'flowtype';
import * as NOTIFICATION from 'actions/constants/notification';
import * as SIGN_VERIFY from './constants/signVerify';

export type SignVerifyAction = {
    type: typeof SIGN_VERIFY.SIGN_SUCCESS,
    signSignature: string
} | {
    type: typeof SIGN_VERIFY.CLEAR_SIGN,
} | {
    type: typeof SIGN_VERIFY.CLEAR_VERIFY,
} | {
    type: typeof SIGN_VERIFY.INPUT_CHANGE,
    name: string,
    value: string
} | {
    type: typeof SIGN_VERIFY.TOUCH,
    name: string,
}

const sign = (
    path: Array<number>,
    message: string,
    hex: boolean = false,
): AsyncAction => async (dispatch: Dispatch, getState: GetState): Promise<void> => {
    const selected = getState().wallet.selectedDevice;
    if (!selected) return;

    const response = await TrezorConnect.ethereumSignMessage({
        device: {
            path: selected.path,
            instance: selected.instance,
            state: selected.state,
        },
        path,
        hex,
        message,
        useEmptyPassphrase: selected.useEmptyPassphrase,
    });

    if (response && response.success) {
        dispatch({
            type: SIGN_VERIFY.SIGN_SUCCESS,
            signSignature: response.payload.signature,
        });
    } else {
        dispatch({
            type: NOTIFICATION.ADD,
            payload: {
                type: 'error',
                title: 'Sign error',
                message: response.payload.error,
                cancelable: true,
                actions: [{
                    label: 'Try again',
                    callback: () => {
                        dispatch(sign(path, message, hex));
                    },
                },
                ],
            },
        });
    }
};

const verify = (
    address: string,
    message: string,
    signature: string,
    hex: boolean = false,
): AsyncAction => async (dispatch: Dispatch, getState: GetState): Promise<void> => {
    const selected = getState().wallet.selectedDevice;
    if (!selected) return;

    const response = await TrezorConnect.ethereumVerifyMessage({
        device: {
            path: selected.path,
            instance: selected.instance,
            state: selected.state,
        },
        address,
        message,
        signature,
        hex,
        useEmptyPassphrase: selected.useEmptyPassphrase,
    });

    if (response && response.success) {
        dispatch({
            type: NOTIFICATION.ADD,
            payload: {
                type: 'success',
                title: 'Verify success',
                message: 'signature is valid',
                cancelable: true,
            },
        });
    } else {
        dispatch({
            type: NOTIFICATION.ADD,
            payload: {
                type: 'error',
                title: 'Verify error',
                message: response.payload.error,
                cancelable: true,
                actions: [
                    {
                        label: 'Try again',
                        callback: () => {
                            dispatch(verify(address, message, signature, hex));
                        },
                    },
                ],
            },
        });
    }
};

const inputChange = (name: string, value: string): ThunkAction => (dispatch: Dispatch): void => {
    dispatch({
        type: SIGN_VERIFY.INPUT_CHANGE,
        name,
        value,
    });
    dispatch({
        type: SIGN_VERIFY.TOUCH,
        name,
    });
};

const clearSign = (): ThunkAction => (dispatch: Dispatch): void => {
    dispatch({
        type: SIGN_VERIFY.CLEAR_SIGN,
    });
};

const clearVerify = (): ThunkAction => (dispatch: Dispatch): void => {
    dispatch({
        type: SIGN_VERIFY.CLEAR_VERIFY,
    });
};

export default {
    sign,
    verify,
    clearSign,
    clearVerify,
    inputChange,
};