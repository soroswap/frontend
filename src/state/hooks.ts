import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

// import store from './index'

// export const useAppDispatch = () => useDispatch<typeof store.dispatch>()
export const useAppDispatch = () => useDispatch<any>()
// export const useAppSelector: TypedUseSelectorHook<ReturnType<typeof store.getState>> = useSelector
export const useAppSelector: TypedUseSelectorHook<any> = useSelector
