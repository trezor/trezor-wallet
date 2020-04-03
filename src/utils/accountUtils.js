/* @flow */
import { toDecimalAmount } from 'utils/formatUtils';
import type { AccountInfo, AccountTransaction } from 'trezor-connect';
import type { Account, Transaction, Network, TrezorDevice } from 'flowtype';

// Merge fresh AccountInfo into existing Account
export const mergeAccount = (
    info: AccountInfo,
    account: Account,
    network: Network,
    block: number
): Account => {
    if (account.networkType === 'ethereum') {
        const nonce = info.misc && info.misc.nonce ? info.misc.nonce : '0';
        return {
            networkType: 'ethereum',
            ...account,
            balance: toDecimalAmount(info.balance, network.decimals),
            availableBalance: toDecimalAmount(info.availableBalance, network.decimals),
            block,
            transactions: info.history.total,
            empty: account.empty,
            nonce,
        };
    }

    if (account.networkType === 'ripple') {
        const sequence = info.misc && info.misc.sequence ? info.misc.sequence : 0;
        const reserve = info.misc && info.misc.reserve ? info.misc.reserve : '0';
        return {
            ...account,
            balance: toDecimalAmount(info.balance, network.decimals),
            availableBalance: toDecimalAmount(info.availableBalance, network.decimals),
            block,
            empty: info.empty,

            networkType: 'ripple',
            sequence,
            reserve: toDecimalAmount(reserve || '0', network.decimals),
        };
    }

    return account;
};

type EnhanceAccountOptions = {
    index: number,
    network: Network,
    device: TrezorDevice,
    imported?: boolean,
    block?: number,
};

// Create Account from AccountInfo
export const enhanceAccount = (account: AccountInfo, options: EnhanceAccountOptions): Account => {
    if (options.network.type === 'ethereum') {
        const nonce = account.misc && account.misc.nonce ? account.misc.nonce : '0';
        return {
            imported: !!options.imported,
            index: options.index,
            network: options.network.shortcut,
            deviceID: options.device.id || '0',
            deviceState: options.device.state || '0',
            accountPath: account.path,
            descriptor: account.descriptor,

            balance: toDecimalAmount(account.balance, options.network.decimals),
            availableBalance: toDecimalAmount(account.availableBalance, options.network.decimals),
            block: options.block || 0,
            transactions: account.history.total,
            empty: account.empty,

            networkType: 'ethereum',
            nonce,
        };
    }

    const sequence = account.misc && account.misc.sequence ? account.misc.sequence : 0;
    const reserve = account.misc && account.misc.reserve ? account.misc.reserve : '0';
    return {
        imported: !!options.imported,
        index: options.index,
        network: options.network.shortcut,
        deviceID: options.device.id || '0',
        deviceState: options.device.state || '0',
        accountPath: account.path,
        descriptor: account.descriptor,

        balance: toDecimalAmount(account.balance, options.network.decimals),
        availableBalance: toDecimalAmount(account.availableBalance, options.network.decimals),
        block: options.block || 0,
        transactions: 0,
        empty: account.empty,

        networkType: 'ripple',
        sequence,
        reserve: toDecimalAmount(reserve, options.network.decimals),
    };
};

export const enhanceTransaction = (
    account: Account,
    tx: AccountTransaction,
    network: Network
): Transaction => {
    return {
        ...tx,
        descriptor: account.descriptor,
        deviceState: account.deviceState,
        network: account.network,
        amount: toDecimalAmount(tx.amount, network.decimals),
        fee: toDecimalAmount(tx.fee, network.decimals),
    };
};
