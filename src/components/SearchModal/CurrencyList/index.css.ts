export const scrollbarStyle = styled([
  {
    scrollbarWidth: "thin",
    scrollbarColor: `transparent`,
    height: "100%",
    selectors: {
      "&::-webkit-scrollbar": {
        background: "transparent",
        width: "4px",
      },
      "&::-webkit-scrollbar-thumb": {
        background: `black`,
        borderRadius: "8px",
      },
    },
  },
]);
