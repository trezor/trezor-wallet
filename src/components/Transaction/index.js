/* @flow */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { SCREEN_SIZE } from 'config/variables';
import { Link, colors } from 'trezor-ui-components';

import type { Transaction, Network } from 'flowtype';

type Props = {
    tx: Transaction,
    network: Network,
};

const Wrapper = styled.div`
    border-bottom: 1px solid ${colors.DIVIDER};
    padding: 14px 0;
    display: flex;
    flex-direction: row;
    word-break: break-all;

    &:last-child {
        border-bottom: 0px;
    }

    @media screen and (max-width: ${SCREEN_SIZE.SM}) {
        flex-direction: column;
    }
`;

const Addresses = styled.div`
    flex: 1 1 auto;
`;

const Address = styled.div`
    word-break: break-all;
    padding: 2px 0px;
    &:first-child {
        padding-top: 0px;
    }
    &:last-child {
        padding-bottom: 0px;
    }
`;

const Date = styled(Link)`
    font-size: 12px;
    line-height: 18px;
    padding-right: 8px;
    border-bottom: 0px;
    flex: 0 1 auto;
    word-break: normal;
`;

const TransactionHash = styled(Date)`
    word-break: break-all;
`;

const Value = styled.div`
    flex: 1 1 auto;
    padding-left: 8px;
    white-space: nowrap;
    text-align: right;
    color: ${colors.GREEN_SECONDARY};

    &.sent {
        color: ${colors.ERROR_PRIMARY};
    }
`;

const Amount = styled.div`
    border: 1px;
`;

const Fee = styled.div`
    border: 1px;
`;

const TransactionItem = ({ tx, network }: Props) => {
    const url = `${network.explorer.tx}${tx.txid}`;
    const date = typeof tx.blockTime === 'number' ? tx.blockTime : undefined; // TODO: format date
    const addresses = tx.targets.reduce((arr, item) => arr.concat(item.addresses), []);

    const operation = tx.type === 'sent' ? '-' : '+';
    const amount =
        tx.tokens.length > 0 ? (
            tx.tokens.map(t => (
                <Amount key={t.symbol}>
                    {operation}
                    {t.amount} {t.symbol}
                </Amount>
            ))
        ) : (
            <Amount>
                {operation}
                {tx.amount} {network.symbol}
            </Amount>
        );
    const fee =
        tx.tokens.length > 0 && tx.type === 'sent' ? `${tx.fee} ${network.symbol}` : undefined;

    return (
        <Wrapper>
            {date && (
                <Date href={url} isGray>
                    {date}
                </Date>
            )}
            <Addresses>
                {addresses.map(addr => (
                    <Address key={addr}>{addr}</Address>
                ))}
                {!tx.blockHeight && (
                    <TransactionHash href={url} isGray>
                        Transaction hash: {tx.txid}
                    </TransactionHash>
                )}
            </Addresses>
            <Value className={tx.type}>
                {amount}
                {fee && (
                    <Fee>
                        {operation}
                        {fee}
                    </Fee>
                )}
            </Value>
        </Wrapper>
    );
};

TransactionItem.propTypes = {
    tx: PropTypes.object.isRequired,
    network: PropTypes.object.isRequired,
};

export default TransactionItem;
