//Importaciones:
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import MeetingRoomRoundedIcon from "@mui/icons-material/MeetingRoomRounded";
import AlternateEmailRoundedIcon from "@mui/icons-material/AlternateEmailRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import { initializeApp, getApps } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db, firebaseConfig } from "../../firebase/firebaseConfig";

//JSX:
const getSecondaryAuth = () => {
  const secondaryApp =
    getApps().find((app) => app.name === "Secondary") ||
    initializeApp(firebaseConfig, "Secondary");

  return getAuth(secondaryApp);
};

const getInitials = (name = "Usuario") => {
  const parts = name.trim().split(" ").filter(Boolean).slice(0, 2);

  if (!parts.length) return "U";

  return parts.map((part) => part[0]?.toUpperCase()).join("");
};

const getRolLabel = (rol) => {
  return rol === "ADMIN" ? "Administrador" : "Box";
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    fontSize: "0.96rem",
    "& fieldset": {
      borderColor: "rgba(15, 23, 42, 0.12)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(165, 4, 84, 0.32)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "primary.main",
      borderWidth: 2,
    },
  },
  "& .MuiInputLabel-root": {
    color: "#64748b",
    fontWeight: 600,
  },
  "& .MuiFormHelperText-root": {
    color: "#64748b",
    fontWeight: 500,
    lineHeight: 1.35,
  },
};

//JSX:
const Usuarios = () => {
  const uidActual = localStorage.getItem("uid");

  const [usuarios, setUsuarios] = useState([]);
  const [open, setOpen] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [loadingCrear, setLoadingCrear] = useState(false);
  const [loadingEstadoId, setLoadingEstadoId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    nombreCompleto: "",
    email: "",
    password: "",
    rol: "BOX",
    boxId: "",
    boxNombre: "",
    estado: "ACTIVO",
  });

  const usuariosActivos = useMemo(() => {
    return usuarios.filter((usuario) => usuario.estado === "ACTIVO").length;
  }, [usuarios]);

  const usuariosInactivos = useMemo(() => {
    return usuarios.filter((usuario) => usuario.estado !== "ACTIVO").length;
  }, [usuarios]);

  const cargarUsuarios = async () => {
    try {
      setLoadingUsuarios(true);

      const q = query(collection(db, "usuarios"));
      const snapshot = await getDocs(q);

      const data = snapshot.docs
        .map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }))
        .sort((a, b) =>
          String(a.nombreCompleto || "").localeCompare(
            String(b.nombreCompleto || "")
          )
        );

      setUsuarios(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoadingUsuarios(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleChange = (campo, valor) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const resetForm = () => {
    setForm({
      nombreCompleto: "",
      email: "",
      password: "",
      rol: "BOX",
      boxId: "",
      boxNombre: "",
      estado: "ACTIVO",
    });
    setShowPassword(false);
  };

  const handleCloseModal = () => {
    if (loadingCrear) return;

    setOpen(false);
    resetForm();
  };

  const handleCrearUsuario = async () => {
    try {
      setError("");
      setSuccess("");

      if (!form.nombreCompleto.trim()) {
        setError("Ingrese el nombre completo.");
        return;
      }

      if (!form.email.trim()) {
        setError("Ingrese el correo electrónico.");
        return;
      }

      if (form.password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        return;
      }

      if (form.rol === "BOX" && !form.boxNombre.trim()) {
        setError("Ingrese el nombre del box. Ejemplo: Box 1.");
        return;
      }

      setLoadingCrear(true);

      const secondaryAuth = getSecondaryAuth();

      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        form.email.trim(),
        form.password
      );

      const uid = userCredential.user.uid;

      const usuarioData = {
        uid,
        nombreCompleto: form.nombreCompleto.trim(),
        email: form.email.trim(),
        rol: form.rol,
        estado: form.estado,

        boxId:
          form.rol === "BOX"
            ? form.boxId.trim() ||
              form.boxNombre.trim().toLowerCase().replace(/\s+/g, "-")
            : "",
        boxNombre: form.rol === "BOX" ? form.boxNombre.trim() : "",

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "usuarios", uid), usuarioData);
      await signOut(secondaryAuth);

      setSuccess("Usuario creado correctamente.");
      setOpen(false);
      resetForm();
      await cargarUsuarios();
    } catch (error) {
      console.error("Error creando usuario:", error);

      if (error.code === "auth/email-already-in-use") {
        setError("Ya existe un usuario con ese correo electrónico.");
      } else if (error.code === "auth/invalid-email") {
        setError("El correo electrónico no es válido.");
      } else if (error.code === "auth/weak-password") {
        setError("La contraseña es demasiado débil.");
      } else {
        setError("No se pudo crear el usuario.");
      }
    } finally {
      setLoadingCrear(false);
    }
  };

  const handleCambiarEstado = async (usuario) => {
    try {
      setError("");
      setSuccess("");

      if (usuario.id === uidActual) {
        setError("No podés cambiar el estado de tu propio usuario.");
        return;
      }

      const nuevoEstado = usuario.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";

      setLoadingEstadoId(usuario.id);

      await updateDoc(doc(db, "usuarios", usuario.id), {
        estado: nuevoEstado,
        updatedAt: serverTimestamp(),
      });

      setSuccess(
        nuevoEstado === "ACTIVO"
          ? "Usuario activado correctamente."
          : "Usuario inactivado correctamente."
      );

      await cargarUsuarios();
    } catch (error) {
      console.error("Error cambiando estado:", error);
      setError("No se pudo cambiar el estado del usuario.");
    } finally {
      setLoadingEstadoId(null);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1480,
        mx: "auto",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        sx={{ mb: { xs: 2.5, md: 3 } }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.2}
          >
            <Typography
              sx={{
                fontSize: { xs: "1.55rem", sm: "1.7rem", md: "1.9rem" },
                fontWeight: 800,
                color: "#111827",
                lineHeight: 1.12,
                letterSpacing: "-0.7px",
              }}
            >
              Usuarios
            </Typography>

            <Chip
              icon={<PeopleRoundedIcon />}
              label={`${usuarios.length} registrados`}
              variant="outlined"
              sx={{
                height: 32,
                borderRadius: "999px",
                fontWeight: 700,
                color: usuarios.length > 0 ? "primary.main" : "#64748b",
                borderColor:
                  usuarios.length > 0
                    ? "rgba(165, 4, 84, 0.20)"
                    : "rgba(15, 23, 42, 0.12)",
                backgroundColor:
                  usuarios.length > 0 ? "rgba(165, 4, 84, 0.04)" : "#ffffff",
                "& .MuiChip-icon": {
                  color: usuarios.length > 0 ? "primary.main" : "#64748b",
                  fontSize: 17,
                },
              }}
            />
          </Stack>

          <Typography
            sx={{
              color: "#64748b",
              mt: 0.7,
              fontSize: { xs: "0.95rem", md: "1rem" },
              fontWeight: 500,
              lineHeight: 1.45,
            }}
          >
            Creá usuarios y gestioná el acceso al sistema.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<PersonAddAltRoundedIcon />}
          onClick={() => {
            setError("");
            setSuccess("");
            resetForm();
            setOpen(true);
          }}
          sx={{
            height: 46,
            borderRadius: "16px",
            px: 2.4,
            fontWeight: 800,
            textTransform: "none",
            boxShadow: "0 12px 26px rgba(165, 4, 84, 0.16)",
            "&:hover": {
              boxShadow: "0 12px 26px rgba(165, 4, 84, 0.16)",
            },
          }}
        >
          Nuevo usuario
        </Button>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{
            borderRadius: "18px",
            mb: 2.2,
            border: "1px solid rgba(239, 68, 68, 0.20)",
            backgroundColor: "rgba(239, 68, 68, 0.06)",
          }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{
            borderRadius: "18px",
            mb: 2.2,
            border: "1px solid rgba(22, 163, 74, 0.20)",
            backgroundColor: "rgba(22, 163, 74, 0.07)",
          }}
        >
          {success}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(3, minmax(0, 1fr))",
          },
          gap: { xs: 1.5, md: 2 },
          mb: { xs: 2.4, md: 3 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 2.2 },
            borderRadius: "22px",
            border: "1px solid rgba(15, 23, 42, 0.08)",
            backgroundColor: "#ffffff",
            boxShadow: "0 14px 34px rgba(15, 23, 42, 0.04)",
          }}
        >
          <Typography
            sx={{
              color: "#64748b",
              fontSize: "0.86rem",
              fontWeight: 650,
              mb: 0.6,
            }}
          >
            Total de usuarios
          </Typography>

          <Typography
            sx={{
              color: "#111827",
              fontSize: { xs: "1.65rem", md: "1.75rem" },
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            {usuarios.length}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 2.2 },
            borderRadius: "22px",
            border: "1px solid rgba(22, 101, 52, 0.14)",
            backgroundColor: "rgba(22, 163, 74, 0.055)",
            boxShadow: "0 14px 34px rgba(15, 23, 42, 0.035)",
          }}
        >
          <Typography
            sx={{
              color: "#166534",
              fontSize: "0.86rem",
              fontWeight: 650,
              mb: 0.6,
            }}
          >
            Activos
          </Typography>

          <Typography
            sx={{
              color: "#111827",
              fontSize: { xs: "1.65rem", md: "1.75rem" },
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            {usuariosActivos}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 2.2 },
            borderRadius: "22px",
            border: "1px solid rgba(100, 116, 139, 0.14)",
            backgroundColor: "#ffffff",
            boxShadow: "0 14px 34px rgba(15, 23, 42, 0.035)",
          }}
        >
          <Typography
            sx={{
              color: "#64748b",
              fontSize: "0.86rem",
              fontWeight: 650,
              mb: 0.6,
            }}
          >
            Inactivos
          </Typography>

          <Typography
            sx={{
              color: "#111827",
              fontSize: { xs: "1.65rem", md: "1.75rem" },
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            {usuariosInactivos}
          </Typography>
        </Paper>
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: { xs: "22px", md: "26px" },
          border: "1px solid rgba(15, 23, 42, 0.08)",
          backgroundColor: "#ffffff",
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.045)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: { xs: 2.2, sm: 2.6, md: 3 },
            borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.4}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "16px",
                backgroundColor: "rgba(165, 4, 84, 0.075)",
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <PeopleRoundedIcon sx={{ fontSize: 26 }} />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: { xs: "1.1rem", md: "1.22rem" },
                  fontWeight: 800,
                  color: "#111827",
                  lineHeight: 1.2,
                }}
              >
                Usuarios registrados
              </Typography>

              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  mt: 0.25,
                }}
              >
                Administradores y boxes habilitados en el sistema.
              </Typography>
            </Box>
          </Stack>
        </Box>

        {loadingUsuarios ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 260,
            }}
          >
            <CircularProgress />
          </Box>
        ) : usuarios.length === 0 ? (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              minHeight: 240,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box>
              <PeopleRoundedIcon
                sx={{
                  fontSize: 54,
                  color: "primary.main",
                  opacity: 0.8,
                  mb: 1.5,
                }}
              />

              <Typography
                sx={{
                  color: "#111827",
                  fontWeight: 800,
                  fontSize: "1.15rem",
                }}
              >
                Todavía no hay usuarios registrados
              </Typography>

              <Typography
                sx={{
                  color: "#64748b",
                  fontWeight: 500,
                  mt: 0.6,
                }}
              >
                Creá el primer usuario para comenzar.
              </Typography>
            </Box>
          </Box>
        ) : (
          <Stack spacing={1.3} sx={{ p: { xs: 1.6, md: 2 } }}>
            {usuarios.map((usuario) => {
              const activo = usuario.estado === "ACTIVO";
              const esUsuarioActual = usuario.id === uidActual;
              const rolLabel = getRolLabel(usuario.rol);
              const initials = getInitials(usuario.nombreCompleto);

              return (
                <Box
                  key={usuario.id}
                  sx={{
                    p: { xs: 1.7, sm: 1.9, md: 2 },
                    borderRadius: "20px",
                    border: activo
                      ? "1px solid rgba(15, 23, 42, 0.08)"
                      : "1px solid rgba(100, 116, 139, 0.14)",
                    backgroundColor: activo ? "#ffffff" : "#f8fafc",
                    opacity: activo ? 1 : 0.76,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", md: "center" },
                    flexDirection: { xs: "column", md: "row" },
                    gap: 2,
                    transition: "all 0.18s ease",
                    "&:hover": {
                      borderColor: activo
                        ? "rgba(165, 4, 84, 0.16)"
                        : "rgba(100, 116, 139, 0.18)",
                      boxShadow: activo
                        ? "0 12px 28px rgba(15, 23, 42, 0.045)"
                        : "none",
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.4}
                    alignItems="center"
                    sx={{ minWidth: 0 }}
                  >
                    <Avatar
                      sx={{
                        width: 46,
                        height: 46,
                        bgcolor: activo ? "primary.main" : "#94a3b8",
                        color: "#ffffff",
                        fontWeight: 800,
                        fontSize: "0.92rem",
                        boxShadow: activo
                          ? "0 10px 22px rgba(165, 4, 84, 0.16)"
                          : "none",
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </Avatar>

                    <Box sx={{ minWidth: 0 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.8}
                        sx={{ mb: 0.4 }}
                      >
                        <Tooltip title={usuario.nombreCompleto || ""} arrow>
                          <Typography
                            noWrap
                            sx={{
                              fontWeight: 800,
                              color: "#111827",
                              fontSize: "1rem",
                              maxWidth: { xs: 220, sm: 360, md: 280, lg: 430 },
                              lineHeight: 1.2,
                            }}
                          >
                            {usuario.nombreCompleto}
                          </Typography>
                        </Tooltip>

                        {esUsuarioActual && (
                          <Chip
                            label="Vos"
                            size="small"
                            sx={{
                              height: 22,
                              borderRadius: "999px",
                              fontSize: "0.68rem",
                              fontWeight: 750,
                              color: "primary.main",
                              backgroundColor: "rgba(165, 4, 84, 0.075)",
                            }}
                          />
                        )}
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={0.8}
                        alignItems="center"
                        sx={{ minWidth: 0 }}
                      >
                        <AlternateEmailRoundedIcon
                          sx={{
                            color: "#94a3b8",
                            fontSize: 17,
                            flexShrink: 0,
                          }}
                        />

                        <Tooltip title={usuario.email || ""} arrow>
                          <Typography
                            noWrap
                            sx={{
                              color: "#64748b",
                              fontSize: "0.9rem",
                              fontWeight: 500,
                              maxWidth: { xs: 230, sm: 430, md: 380 },
                            }}
                          >
                            {usuario.email}
                          </Typography>
                        </Tooltip>
                      </Stack>

                      {usuario.rol === "BOX" && usuario.boxNombre && (
                        <Typography
                          sx={{
                            color: "#64748b",
                            fontSize: "0.86rem",
                            fontWeight: 500,
                            mt: 0.45,
                          }}
                        >
                          {usuario.boxNombre}
                        </Typography>
                      )}
                    </Box>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{
                      justifyContent: { xs: "flex-start", md: "flex-end" },
                      alignItems: "center",
                    }}
                  >
                    <Chip
                      icon={
                        usuario.rol === "ADMIN" ? (
                          <AdminPanelSettingsRoundedIcon />
                        ) : (
                          <MeetingRoomRoundedIcon />
                        )
                      }
                      label={rolLabel}
                      variant="outlined"
                      sx={{
                        height: 32,
                        borderRadius: "999px",
                        fontWeight: 700,
                        color:
                          usuario.rol === "ADMIN"
                            ? "primary.main"
                            : "#475569",
                        borderColor:
                          usuario.rol === "ADMIN"
                            ? "rgba(165, 4, 84, 0.20)"
                            : "rgba(15, 23, 42, 0.12)",
                        backgroundColor:
                          usuario.rol === "ADMIN"
                            ? "rgba(165, 4, 84, 0.04)"
                            : "#ffffff",
                        "& .MuiChip-icon": {
                          color:
                            usuario.rol === "ADMIN"
                              ? "primary.main"
                              : "#64748b",
                          fontSize: 17,
                        },
                      }}
                    />

                    <Chip
                      icon={
                        activo ? (
                          <CheckCircleRoundedIcon />
                        ) : (
                          <BlockRoundedIcon />
                        )
                      }
                      label={activo ? "Activo" : "Inactivo"}
                      variant="outlined"
                      sx={{
                        height: 32,
                        borderRadius: "999px",
                        fontWeight: 700,
                        color: activo ? "#166534" : "#64748b",
                        borderColor: activo
                          ? "rgba(22, 101, 52, 0.20)"
                          : "rgba(100, 116, 139, 0.18)",
                        backgroundColor: activo
                          ? "rgba(22, 163, 74, 0.08)"
                          : "#ffffff",
                        "& .MuiChip-icon": {
                          color: activo ? "#166534" : "#64748b",
                          fontSize: 17,
                        },
                      }}
                    />

                    <Button
                      size="small"
                      variant={activo ? "outlined" : "contained"}
                      color={activo ? "warning" : "success"}
                      disabled={loadingEstadoId === usuario.id || esUsuarioActual}
                      onClick={() => handleCambiarEstado(usuario)}
                      sx={{
                        height: 34,
                        borderRadius: "12px",
                        fontWeight: 750,
                        textTransform: "none",
                        minWidth: 116,
                        boxShadow: "none",
                        "&:hover": {
                          boxShadow: "none",
                        },
                        "&.Mui-disabled": {
                          color: "#94a3b8",
                          borderColor: "rgba(15, 23, 42, 0.10)",
                          backgroundColor: "#f8fafc",
                        },
                      }}
                    >
                      {loadingEstadoId === usuario.id ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : activo ? (
                        "Inactivar"
                      ) : (
                        "Activar"
                      )}
                    </Button>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </Paper>

      <Dialog
        open={open}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: { xs: "22px", sm: "26px" },
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
        <DialogTitle
          sx={{
            px: { xs: 2.4, sm: 3 },
            pt: { xs: 2.4, sm: 3 },
            pb: 1.5,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: "18px",
                backgroundColor: "rgba(165, 4, 84, 0.08)",
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <PersonAddAltRoundedIcon sx={{ fontSize: 29 }} />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  color: "#111827",
                  fontWeight: 800,
                  fontSize: { xs: "1.25rem", sm: "1.38rem" },
                  lineHeight: 1.2,
                  letterSpacing: "-0.3px",
                }}
              >
                Crear nuevo usuario
              </Typography>

              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: "0.92rem",
                  fontWeight: 500,
                  mt: 0.25,
                }}
              >
                Definí los datos de acceso y el rol.
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent
          sx={{
            px: { xs: 2.4, sm: 3 },
            pt: 1.2,
            pb: 1,
          }}
        >
          <Stack spacing={2} sx={{ mt: 0.6 }}>
            <TextField
              fullWidth
              label="Nombre completo"
              value={form.nombreCompleto}
              onChange={(e) => handleChange("nombreCompleto", e.target.value)}
              disabled={loadingCrear}
              sx={inputSx}
            />

            <TextField
              fullWidth
              label="Correo electrónico"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={loadingCrear}
              sx={inputSx}
            />

            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              disabled={loadingCrear}
              sx={inputSx}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        disabled={loadingCrear}
                        edge="end"
                        aria-label={
                          showPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                        sx={{
                          color: "#64748b",
                          "&:hover": {
                            backgroundColor: "rgba(165, 4, 84, 0.08)",
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

            <TextField
              select
              fullWidth
              label="Rol"
              value={form.rol}
              onChange={(e) => handleChange("rol", e.target.value)}
              disabled={loadingCrear}
              sx={inputSx}
            >
              <MenuItem value="BOX">Box</MenuItem>
              <MenuItem value="ADMIN">Administrador</MenuItem>
            </TextField>

            {form.rol === "BOX" && (
              <>
                <TextField
                  fullWidth
                  label="Nombre del box"
                  placeholder="Ejemplo: Box 1"
                  value={form.boxNombre}
                  onChange={(e) => handleChange("boxNombre", e.target.value)}
                  disabled={loadingCrear}
                  sx={inputSx}
                />

                <TextField
                  fullWidth
                  label="ID del box opcional"
                  placeholder="Ejemplo: box-1"
                  value={form.boxId}
                  onChange={(e) => handleChange("boxId", e.target.value)}
                  disabled={loadingCrear}
                  helperText="Si lo dejás vacío, se genera automáticamente desde el nombre del box."
                  sx={inputSx}
                />
              </>
            )}

            <TextField
              select
              fullWidth
              label="Estado"
              value={form.estado}
              onChange={(e) => handleChange("estado", e.target.value)}
              disabled={loadingCrear}
              sx={inputSx}
            >
              <MenuItem value="ACTIVO">Activo</MenuItem>
              <MenuItem value="INACTIVO">Inactivo</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2.4, sm: 3 },
            pb: { xs: 2.4, sm: 3 },
            pt: 1.4,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
            },
            gap: 1.2,
          }}
        >
          <Button
            onClick={handleCloseModal}
            disabled={loadingCrear}
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
            variant="contained"
            onClick={handleCrearUsuario}
            disabled={loadingCrear}
            sx={{
              height: 46,
              borderRadius: "15px",
              fontWeight: 800,
              textTransform: "none",
              boxShadow: "0 12px 26px rgba(165, 4, 84, 0.16)",
              "&:hover": {
                boxShadow: "0 12px 26px rgba(165, 4, 84, 0.16)",
              },
              "&.Mui-disabled": {
                backgroundColor: "rgba(165, 4, 84, 0.45)",
                color: "#ffffff",
              },
            }}
          >
            {loadingCrear ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Crear usuario"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Usuarios;