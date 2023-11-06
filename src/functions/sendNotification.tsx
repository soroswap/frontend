import { SnackbarContextType, SnackbarIconType } from 'contexts';

export const sendNotification = (
  message: string,
  title: string,
  type: SnackbarIconType,
  SnackbarContext: SnackbarContextType,
) => {
  const { setOpenSnackbar, setSnackbarMessage, setSnackbarTitle, setSnackbarType } =
    SnackbarContext;

  try {
    setSnackbarMessage(message);
    setSnackbarTitle(title);
    setSnackbarType(type);
    setOpenSnackbar(true);
  } catch (error) {}
};
