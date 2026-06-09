import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";

import LoginRoundedIcon from "@mui/icons-material/LoginRounded";

import { useNavigate } from "react-router-dom";

import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../../firebase/firebaseConfig";

import logoHorizontal from "../../assets/images/logo-horizontal.png";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (campo, valor) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.email.trim()) {
      setError("Ingrese su correo electrónico.");
      return;
    }

    if (!form.password.trim()) {
      setError("Ingrese su contraseña.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      const uid = userCredential.user.uid;

      const userRef = doc(db, "usuarios", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setError("El usuario no tiene un perfil configurado en el sistema.");
        return;
      }

      const userData = userSnap.data();

      if (userData.estado !== "ACTIVO") {
        setError("El usuario se encuentra inactivo.");
        return;
      }

      localStorage.setItem("uid", uid);
      localStorage.setItem("email", userCredential.user.email || "");
      localStorage.setItem("rol", userData.rol || "");
      localStorage.setItem("nombreCompleto", userData.nombreCompleto || "");
      localStorage.setItem("boxId", userData.boxId || "");
      localStorage.setItem("boxNombre", userData.boxNombre || "");

      navigate("/dashboard");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);

      if (error.code === "auth/invalid-credential") {
        setError("Correo o contraseña incorrectos.");
      } else if (error.code === "auth/user-not-found") {
        setError("No existe un usuario con ese correo.");
      } else if (error.code === "auth/wrong-password") {
        setError("La contraseña es incorrecta.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Demasiados intentos. Intente nuevamente más tarde.");
      } else {
        setError("No se pudo iniciar sesión. Intente nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f7f7f8 0%, #ffffff 45%, #f4edf1 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Paper
        elevation={5}
        sx={{
          width: "100%",
          maxWidth: 500,
          borderRadius: "30px",
          p: { xs: 4, md: 5 },
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box
            component="img"
            src={logoHorizontal}
            alt="Logo"
            sx={{
              width: 260,
              maxHeight: 90,
              objectFit: "contain",
              mb: 3,
            }}
          />

          <LoginRoundedIcon
            sx={{
              fontSize: 56,
              color: "primary.main",
              mb: 1,
            }}
          />

          <Typography
            variant="h4"
            sx={{
              color: "primary.main",
              fontWeight: 900,
              mb: 1,
            }}
          >
            Iniciar sesión
          </Typography>

          <Typography sx={{ color: "#6b7280" }}>
            Accedé al panel interno del sistema de turnos
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleLogin}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {error && (
              <Alert severity="error" sx={{ borderRadius: "14px" }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Correo electrónico"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                height: 58,
                borderRadius: "16px",
                fontSize: "1rem",
                fontWeight: 800,
                mt: 1,
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "none",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={26} color="inherit" />
              ) : (
                "Ingresar"
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;