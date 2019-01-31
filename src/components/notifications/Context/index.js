/* @flow */
import * as React from 'react';
import styled from 'styled-components';

import StaticNotifications from './components/Static';
import AccountNotifications from './components/Account';
import ActionNotifications from './components/Action';

import type { Props } from './Container';

const Wrapper = styled.div`
    width: 100%;
    padding: 10px 25px 5px 25px;

    &:empty {
        padding: 0px; /* don't render padding when there is no child/notification in the wrapper */
    }
`;

const ContextNotifications = (props: Props) => (
    <Wrapper>
        <StaticNotifications {...props} />
        <AccountNotifications {...props} />
        <ActionNotifications {...props} />
    </Wrapper>
);

export default ContextNotifications;