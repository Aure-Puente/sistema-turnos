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
        <Tooltip title="Cerrar sesión">
            <IconButton
            onClick={() => setOpen(true)}
            sx={{
                color: "primary.main",
                backgroundColor: "rgba(165, 4, 84, 0.08)",
                borderRadius: "12px",
                "&:hover": {
                backgroundColor: "rgba(165, 4, 84, 0.14)",
                },
            }}
            >
            <LogoutRoundedIcon />
            </IconButton>
        </Tooltip>

        <Dialog
            open={open}
            onClose={() => !loading && setOpen(false)}
            PaperProps={{
            sx: {
                borderRadius: "22px",
                p: 1,
                width: "100%",
                maxWidth: 420,
            },
            }}
        >
            <DialogTitle
            sx={{
                fontWeight: 900,
                color: "primary.main",
                pb: 1,
            }}
            >
            Cerrar sesión
            </DialogTitle>

            <DialogContent>
            <Typography sx={{ color: "#6b7280" }}>
                ¿Seguro que querés cerrar la sesión actual?
            </Typography>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
                onClick={() => setOpen(false)}
                disabled={loading}
                sx={{ fontWeight: 700 }}
            >
                Cancelar
            </Button>

            <Button
                onClick={handleLogout}
                variant="contained"
                disabled={loading}
                sx={{
                borderRadius: "12px",
                fontWeight: 800,
                minWidth: 130,
                boxShadow: "none",
                "&:hover": {
                    boxShadow: "none",
                },
                }}
            >
                {loading ? (
                <CircularProgress size={22} color="inherit" />
                ) : (
                "Cerrar sesión"
                )}
            </Button>
            </DialogActions>
        </Dialog>
        </>
    );
};

export default Logout;