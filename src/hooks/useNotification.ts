import { AppContext, SnackbarIconType } from 'contexts';
import { sendNotification } from 'functions/sendNotification';
import React from 'react';

export interface NotifyProps {
  message: string;
  title: string;
  type: SnackbarIconType;
}

const useNotification = () => {
  const { SnackbarContext } = React.useContext(AppContext);

  const notify = ({ message, title, type }: NotifyProps) => {
    sendNotification(message, title, type, SnackbarContext);
  };

  return { notify };
};

export default useNotification;
