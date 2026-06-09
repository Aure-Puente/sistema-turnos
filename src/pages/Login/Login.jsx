//Importaciones:
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
} from "@mui/material";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import MeetingRoomRoundedIcon from "@mui/icons-material/MeetingRoomRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";
import logoHorizontal from "../../assets/images/logo-horizontal.png";

//JSX:
const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  const textFieldSx = {
    "& .MuiOutlinedInput-root": {
      height: {
        xs: 58,
        md: 60,
      },
      borderRadius: "18px",
      backgroundColor: "#ffffff",
      fontSize: "1rem",
      boxShadow: "0 10px 26px rgba(15, 23, 42, 0.045)",
      "& fieldset": {
        borderColor: "rgba(15, 23, 42, 0.12)",
      },
      "&:hover fieldset": {
        borderColor: "primary.main",
      },
      "&.Mui-focused fieldset": {
        borderColor: "primary.main",
        borderWidth: 2,
      },
    },
    "& .MuiInputLabel-root": {
      fontWeight: 600,
      color: "#64748b",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "primary.main",
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        background:
          "radial-gradient(circle at top left, rgba(124, 24, 74, 0.13), transparent 34%), radial-gradient(circle at bottom right, rgba(124, 24, 74, 0.09), transparent 30%), linear-gradient(135deg, #f8fafc 0%, #ffffff 45%, #f4edf1 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: {
          xs: 2,
          sm: 3,
          md: 3,
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: {
            xs: 460,
            md: 980,
            lg: 1060,
          },
          minHeight: {
            xs: "auto",
            md: "min(660px, calc(100vh - 48px))",
          },
          maxHeight: {
            md: "calc(100vh - 48px)",
          },
          borderRadius: {
            xs: "26px",
            md: "38px",
          },
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "0.92fr 1fr",
          },
          border: "1px solid rgba(124, 24, 74, 0.10)",
          backgroundColor: "rgba(255,255,255,0.96)",
          boxShadow: "0 24px 70px rgba(15, 23, 42, 0.12)",
        }}
      >
        <Box
          sx={{
            display: {
              xs: "none",
              md: "flex",
            },
            flexDirection: "column",
            justifyContent: "space-between",
            p: {
              md: 4,
              lg: 5.5,
            },
            background:
              "linear-gradient(145deg, rgba(124, 24, 74, 0.97), rgba(87, 18, 55, 0.98))",
            color: "#ffffff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              width: 320,
              height: 320,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.08)",
              top: -120,
              right: -110,
            }}
          />

          <Box
            sx={{
              position: "absolute",
              width: 190,
              height: 190,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.07)",
              bottom: -70,
              left: -70,
            }}
          />

          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.3,
                mb: {
                  md: 3.5,
                  lg: 4.5,
                },
              }}
            >
              <Box
                sx={{
                  width: {
                    md: 46,
                    lg: 50,
                  },
                  height: {
                    md: 46,
                    lg: 50,
                  },
                  borderRadius: "17px",
                  backgroundColor: "rgba(255,255,255,0.13)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 14px 28px rgba(0,0,0,0.10)",
                }}
              >
                <LoginRoundedIcon
                  sx={{
                    fontSize: {
                      md: 28,
                      lg: 30,
                    },
                  }}
                />
              </Box>

              <Typography
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.8,
                  py: 0.8,
                  borderRadius: "999px",
                  backgroundColor: "rgba(255,255,255,0.13)",
                  fontWeight: 700,
                  fontSize: "0.92rem",
                }}
              >
                <ConfirmationNumberRoundedIcon sx={{ fontSize: 21 }} />
                Sistema de turnos
              </Typography>
            </Box>

            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: "-1.8px",
                mb: 2,
                fontSize: {
                  md: "2.8rem",
                  lg: "3.35rem",
                },
              }}
            >
              Panel interno de atención
            </Typography>

            <Typography
              sx={{
                color: "rgba(255,255,255,0.78)",
                fontSize: {
                  md: "1rem",
                  lg: "1.08rem",
                },
                lineHeight: 1.55,
                maxWidth: 430,
                fontWeight: 400,
              }}
            >
              Acceso para operadores y administradores del sistema de turnos,
              boxes de atención, llamados y gestión interna.
            </Typography>
          </Box>

          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                p: {
                  md: 1.8,
                  lg: 2.1,
                },
                borderRadius: "22px",
                backgroundColor: "rgba(255,255,255,0.11)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
              }}
            >
              <MeetingRoomRoundedIcon
                sx={{
                  fontSize: {
                    md: 30,
                    lg: 34,
                  },
                  mb: 1,
                }}
              />

              <Typography sx={{ fontWeight: 750, mb: 0.5 }}>
                Boxes
              </Typography>

              <Typography
                sx={{
                  fontSize: {
                    md: "0.82rem",
                    lg: "0.88rem",
                  },
                  color: "rgba(255,255,255,0.72)",
                  lineHeight: 1.35,
                }}
              >
                Gestión por puesto de atención.
              </Typography>
            </Box>

            <Box
              sx={{
                p: {
                  md: 1.8,
                  lg: 2.1,
                },
                borderRadius: "22px",
                backgroundColor: "rgba(255,255,255,0.11)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
              }}
            >
              <ShieldRoundedIcon
                sx={{
                  fontSize: {
                    md: 30,
                    lg: 34,
                  },
                  mb: 1,
                }}
              />

              <Typography sx={{ fontWeight: 750, mb: 0.5 }}>
                Acceso seguro
              </Typography>

              <Typography
                sx={{
                  fontSize: {
                    md: "0.82rem",
                    lg: "0.88rem",
                  },
                  color: "rgba(255,255,255,0.72)",
                  lineHeight: 1.35,
                }}
              >
                Usuarios internos autorizados.
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            p: {
              xs: 3,
              sm: 4,
              md: 4.5,
              lg: 5.5,
            },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            overflow: "auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              mb: {
                xs: 3,
                md: 3.2,
              },
            }}
          >
            <Box
              component="img"
              src={logoHorizontal}
              alt="Logo"
              sx={{
                width: {
                  xs: 210,
                  sm: 245,
                  md: 255,
                },
                maxHeight: 86,
                objectFit: "contain",
              }}
            />

            <Box
              sx={{
                width: {
                  xs: 52,
                  md: 64,
                },
                height: {
                  xs: 52,
                  md: 64,
                },
                borderRadius: {
                  xs: "18px",
                  md: "22px",
                },
                backgroundColor: "rgba(124, 24, 74, 0.10)",
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AdminPanelSettingsRoundedIcon
                sx={{
                  fontSize: {
                    xs: 31,
                    md: 38,
                  },
                }}
              />
            </Box>
          </Box>

          <Divider
            sx={{
              mb: {
                xs: 3,
                md: 3.2,
              },
              borderColor: "rgba(15, 23, 42, 0.08)",
            }}
          />

          <Box
            sx={{
              mb: {
                xs: 3,
                md: 3.2,
              },
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: "#111827",
                fontWeight: 800,
                mb: 1,
                letterSpacing: "-0.8px",
                fontSize: {
                  xs: "1.85rem",
                  sm: "2rem",
                  md: "2.2rem",
                },
              }}
            >
              Iniciar sesión
            </Typography>

            <Typography
              sx={{
                color: "#64748b",
                fontSize: {
                  xs: "0.98rem",
                  md: "1.04rem",
                },
                lineHeight: 1.5,
                fontWeight: 400,
                maxWidth: 460,
              }}
            >
              Ingresá con tu cuenta para acceder al panel de administración de
              turnos y boxes de atención.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleLogin}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.2 }}>
              {error && (
                <Alert
                  severity="error"
                  sx={{
                    borderRadius: "18px",
                    fontSize: "0.95rem",
                    alignItems: "center",
                    "& .MuiAlert-icon": {
                      fontSize: 26,
                    },
                  }}
                >
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
                autoComplete="email"
                sx={textFieldSx}
              />

              <TextField
                fullWidth
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                sx={textFieldSx}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          disabled={loading}
                          edge="end"
                          aria-label={
                            showPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
                          }
                          sx={{
                            color: "#64748b",
                            mr: 0.5,
                            width: 42,
                            height: 42,
                            "&:hover": {
                              backgroundColor: "rgba(124, 24, 74, 0.08)",
                              color: "primary.main",
                            },
                          }}
                        >
                          {showPassword ? (
                            <VisibilityOffRoundedIcon />
                          ) : (
                            <VisibilityRoundedIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  height: {
                    xs: 60,
                    md: 62,
                  },
                  borderRadius: "20px",
                  fontSize: "1.05rem",
                  fontWeight: 800,
                  mt: 0.8,
                  textTransform: "none",
                  boxShadow: "0 16px 34px rgba(124, 24, 74, 0.22)",
                  "&:hover": {
                    boxShadow: "0 16px 34px rgba(124, 24, 74, 0.22)",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "rgba(124, 24, 74, 0.45)",
                    color: "#ffffff",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={27} color="inherit" />
                ) : (
                  "Ingresar al panel"
                )}
              </Button>

              <Typography
                sx={{
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: "0.88rem",
                  fontWeight: 500,
                  mt: 0.8,
                  lineHeight: 1.4,
                }}
              >
                Acceso exclusivo para personal autorizado.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;