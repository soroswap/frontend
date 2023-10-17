import { combineReducers } from 'redux';
import burn from './burn/reducer';
import mint from './mint/reducer';
import user from './user/reducer';

const appReducer = combineReducers({
  mint,
  user,
  burn,
});

export type AppState = ReturnType<typeof appReducer>;

export default appReducer;
