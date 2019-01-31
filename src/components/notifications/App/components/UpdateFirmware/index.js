/* @flow */
import * as React from 'react';
import Notification from 'components/Notification';

import type { Props } from '../../Container';

export default (props: Props) => {
    const { selectedDevice } = props.wallet;
    const outdated = selectedDevice && selectedDevice.features && selectedDevice.firmware === 'outdated';
    if (!outdated) return null;
    return (
        <Notification
            key="update-firmware"
            type="warning"
            title="A new Trezor firmware update is available."
            message="Upgrade to access the newest features"
            actions={
                [{
                    label: 'Update',
                    callback: props.routerActions.gotoFirmwareUpdate,
                }]
            }
        />
    );
};