//Tema:
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
        main: "#a50454",
        light: "#c43b7c",
        dark: "#73003a",
        contrastText: "#ffffff",
        },

        background: {
        default: "#f7f7f8",
        paper: "#ffffff",
        },
    },

    typography: {
        fontFamily: `"Roboto", "Arial", sans-serif`,

        h3: {
        fontWeight: 700,
        },

        h4: {
        fontWeight: 700,
        },

        button: {
        textTransform: "none",
        fontWeight: 600,
        },
    },

    shape: {
        borderRadius: 14,
    },
});

export default theme;