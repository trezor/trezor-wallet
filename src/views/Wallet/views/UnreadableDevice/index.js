/* @flow */

import React from 'react';
import styled from 'styled-components';
import Notification from 'components/Notification';

const Wrapper = styled.div`
    padding: 10px 25px 5px 25px;
`;

const UnreadableDevice = () => (
    <Wrapper>
        <Notification
            title="Unreadable device"
            message="Please install bridge"
            type="error"
            cancelable={false}
        />
    </Wrapper>
);

export default UnreadableDevice;
