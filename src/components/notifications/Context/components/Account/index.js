/* @flow */
import * as React from 'react';
import { Notification } from 'trezor-ui-components';
import l10nMessages from './index.messages';

import type { Props } from '../../index';

// There could be only one account notification
export default (props: Props) => {
    const { network, notification } = props.selectedAccount;
    if (!network || !notification) return null;
    const blockchain = props.blockchain.find(b => b.shortcut === network.shortcut);

    if (notification.type === 'backend') {
        // special case: backend is down
        // TODO: this is a different component with "auto resolve" button
        const inProgress = blockchain && blockchain.connecting;
        const status = inProgress
            ? l10nMessages.TR_RECONNECTING
            : l10nMessages.TR_CONNECT_TO_BACKEND;
        return (
            <Notification
                variant="error"
                title={notification.title}
                message={notification.message}
                isActionInProgress={inProgress}
                actions={[
                    {
                        label: props.intl.formatMessage(status),
                        callback: async () => {
                            if (!inProgress) props.blockchainReconnect(network.shortcut);
                        },
                    },
                ]}
            />
        );
    }
    return (
        <Notification
            variant={notification.variant}
            title={notification.title}
            message={notification.message}
        />
    );
};
