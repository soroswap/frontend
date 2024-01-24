import React from 'react';

export interface UseBooleanReturnProps {
  value: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
  setValue: (value: boolean) => void;
}

const useBoolean = (): UseBooleanReturnProps => {
  const [value, setValue] = React.useState(false);
  const toggle = () => setValue((prev) => !prev);
  const setTrue = () => setValue(true);
  const setFalse = () => setValue(false);

  return {
    value,
    toggle,
    setTrue,
    setFalse,
    setValue,
  };
};

export default useBoolean;
