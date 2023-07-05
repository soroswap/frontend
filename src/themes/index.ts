import { PaletteMode, createTheme } from "@mui/material";

export const theme = (mode: PaletteMode) => {
  console.log("🚀 « mode:", mode);
  const isDark = mode === "dark";
  console.log("🚀 « isDark:", isDark);

  const newTheme = createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? "#323232" : "#F4F3F4",
      },
      background: {
        default: isDark ? "#323232" : "#f3f4f3",
        paper: isDark ? "#323232" : "#f3f4f3",
      },
    },
  });

  return newTheme;
};
