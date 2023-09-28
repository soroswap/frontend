import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';

import reducer from './reducer';

const PERSISTED_KEYS: string[] = ['user', 'transactions', 'signatures', 'lists'];

const store = configureStore({
  reducer,
});

setupListeners(store.dispatch);

export default store;
