/* @flow */
import * as React from 'react';
import styled from 'styled-components';

import { SCREEN_SIZE } from 'config/variables';

import OnlineStatus from './components/OnlineStatus';
import UpdateBridge from './components/UpdateBridge';
import UpdateFirmware from './components/UpdateFirmware';

import type { Props } from './Container';

const Wrapper = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    max-width: 1170px;
    width: 100%;
    margin: 0 auto;
    flex-direction: column;

    @media screen and (max-width: ${SCREEN_SIZE.LG}) {
        padding-left: 5px;
        padding-right: 5px;
    }
`;

const AppNotifications = (props: Props) => (
    <Wrapper>
        <OnlineStatus {...props} />
        <UpdateBridge {...props} />
        <UpdateFirmware {...props} />
    </Wrapper>
);

export default AppNotifications;