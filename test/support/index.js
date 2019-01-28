import 'babel-polyfill';
import './commands';
import { initSeedAllDevice } from 'trezor-bridge-communicator';

before(async () => {
    await initSeedAllDevice();
});