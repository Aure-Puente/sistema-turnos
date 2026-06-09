//Importaciones:
import React, { useState } from "react";
import {
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    CircularProgress,
    Box,
    } from "@mui/material";
    import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
    import { useNavigate } from "react-router-dom";
    import { signOut } from "firebase/auth";
    import { auth } from "../../firebase/firebaseConfig";

    //JSX:
    const Logout = () => {
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        try {
        setLoading(true);

        await signOut(auth);

        localStorage.removeItem("uid");
        localStorage.removeItem("email");
        localStorage.removeItem("rol");
        localStorage.removeItem("nombreCompleto");
        localStorage.removeItem("boxId");
        localStorage.removeItem("boxNombre");

        navigate("/login", { replace: true });
        } catch (error) {
        console.error("Error al cerrar sesión:", error);
        } finally {
        setLoading(false);
        setOpen(false);
        }
    };

    return (
        <>
        <Tooltip title="Cerrar sesión" arrow>
            <IconButton
            onClick={() => setOpen(true)}
            sx={{
                width: {
                xs: 42,
                sm: 44,
                },
                height: {
                xs: 42,
                sm: 44,
                },
                color: "primary.main",
                backgroundColor: "rgba(165, 4, 84, 0.08)",
                border: "1px solid rgba(165, 4, 84, 0.12)",
                borderRadius: "15px",
                transition: "all 0.18s ease",
                "&:hover": {
                backgroundColor: "rgba(165, 4, 84, 0.14)",
                },
                "& svg": {
                fontSize: {
                    xs: 23,
                    sm: 24,
                },
                },
            }}
            >
            <LogoutRoundedIcon />
            </IconButton>
        </Tooltip>

        <Dialog
            open={open}
            onClose={() => !loading && setOpen(false)}
            fullWidth
            maxWidth="xs"
            PaperProps={{
            sx: {
                borderRadius: {
                xs: "22px",
                sm: "26px",
                },
                width: "100%",
                boxShadow: "0 24px 70px rgba(15, 23, 42, 0.20)",
                border: "1px solid rgba(15, 23, 42, 0.08)",
                overflow: "hidden",
            },
            }}
            BackdropProps={{
            sx: {
                backgroundColor: "rgba(15, 23, 42, 0.32)",
                backdropFilter: "blur(3px)",
            },
            }}
        >
            <Box
            sx={{
                px: {
                xs: 2.5,
                sm: 3,
                },
                pt: {
                xs: 2.6,
                sm: 3,
                },
                pb: 1,
                textAlign: "center",
            }}
            >
            <Box
                sx={{
                width: 58,
                height: 58,
                borderRadius: "20px",
                backgroundColor: "rgba(165, 4, 84, 0.08)",
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 1.8,
                }}
            >
                <LogoutRoundedIcon sx={{ fontSize: 32 }} />
            </Box>

            <DialogTitle
                sx={{
                p: 0,
                color: "#111827",
                fontWeight: 850,
                fontSize: {
                    xs: "1.35rem",
                    sm: "1.45rem",
                },
                letterSpacing: "-0.3px",
                }}
            >
                Cerrar sesión
            </DialogTitle>

            <DialogContent
                sx={{
                p: 0,
                mt: 1,
                }}
            >
                <Typography
                sx={{
                    color: "#64748b",
                    fontSize: "0.98rem",
                    lineHeight: 1.5,
                    fontWeight: 500,
                }}
                >
                ¿Querés salir del panel?
                </Typography>
            </DialogContent>
            </Box>

            <DialogActions
            sx={{
                px: {
                xs: 2.5,
                sm: 3,
                },
                pb: {
                xs: 2.5,
                sm: 3,
                },
                pt: 2,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 1.2,
            }}
            >
            <Button
                onClick={() => setOpen(false)}
                disabled={loading}
                sx={{
                height: 46,
                borderRadius: "15px",
                fontWeight: 750,
                textTransform: "none",
                color: "#475569",
                backgroundColor: "#f1f5f9",
                "&:hover": {
                    backgroundColor: "#e2e8f0",
                },
                }}
            >
                Cancelar
            </Button>

            <Button
                onClick={handleLogout}
                variant="contained"
                disabled={loading}
                sx={{
                height: 46,
                borderRadius: "15px",
                fontWeight: 850,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                    boxShadow: "none",
                },
                "&.Mui-disabled": {
                    backgroundColor: "rgba(165, 4, 84, 0.45)",
                    color: "#ffffff",
                },
                }}
            >
                {loading ? (
                <CircularProgress size={22} color="inherit" />
                ) : (
                "Salir"
                )}
            </Button>
            </DialogActions>
        </Dialog>
        </>
    );
};

export default Logout;