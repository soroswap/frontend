import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch<any>();
export const useAppSelector: TypedUseSelectorHook<any> = useSelector;
