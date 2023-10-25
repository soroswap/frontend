export const getCurrentTimePlusOneHour = () => {
  // Get the current time in milliseconds
  const now = Date.now();

  // Add one hour (3600000 milliseconds)
  const oneHourLater = now + 3600000;

  return oneHourLater;
};
