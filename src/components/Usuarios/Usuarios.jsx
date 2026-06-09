import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";

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
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db, firebaseConfig } from "../../firebase/firebaseConfig";

const getSecondaryAuth = () => {
  const secondaryApp =
    getApps().find((app) => app.name === "Secondary") ||
    initializeApp(firebaseConfig, "Secondary");

  return getAuth(secondaryApp);
};

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [open, setOpen] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [loadingCrear, setLoadingCrear] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    nombreCompleto: "",
    email: "",
    password: "",
    rol: "BOX",
    boxId: "",
    boxNombre: "",
    estado: "ACTIVO",
  });

  const cargarUsuarios = async () => {
    try {
      setLoadingUsuarios(true);

      const q = query(collection(db, "usuarios"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

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
            ? form.boxId.trim() || form.boxNombre.trim().toLowerCase().replace(/\s+/g, "-")
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

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: { xs: "1.7rem", md: "2rem" },
              fontWeight: 900,
              color: "primary.main",
              lineHeight: 1.1,
            }}
          >
            Usuarios
          </Typography>

          <Typography sx={{ color: "#6b7280", mt: 0.8 }}>
            Creá y administrá usuarios con rol de administrador o box.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<PersonAddAltRoundedIcon />}
          onClick={() => {
            setError("");
            setSuccess("");
            setOpen(true);
          }}
          sx={{
            borderRadius: "14px",
            px: 3,
            py: 1.2,
            fontWeight: 800,
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          }}
        >
          Nuevo usuario
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ borderRadius: "14px", mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ borderRadius: "14px", mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          borderRadius: "24px",
          border: "1px solid #ececef",
          backgroundColor: "#ffffff",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <PeopleRoundedIcon sx={{ color: "primary.main" }} />

            <Typography
              sx={{
                fontSize: "1.25rem",
                fontWeight: 900,
                color: "#111827",
              }}
            >
              Usuarios registrados
            </Typography>
          </Stack>
        </Box>

        <Divider />

        {loadingUsuarios ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : usuarios.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography sx={{ color: "#6b7280", fontWeight: 600 }}>
              Todavía no hay usuarios registrados.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5} sx={{ p: 2 }}>
            {usuarios.map((usuario) => (
              <Box
                key={usuario.id}
                sx={{
                  p: 2.2,
                  borderRadius: "18px",
                  border: "1px solid #ececef",
                  backgroundColor: "#fafafa",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", md: "center" },
                  flexDirection: { xs: "column", md: "row" },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      color: "#111827",
                      fontSize: "1.05rem",
                    }}
                  >
                    {usuario.nombreCompleto}
                  </Typography>

                  <Typography sx={{ color: "#6b7280", fontSize: "0.95rem" }}>
                    {usuario.email}
                  </Typography>

                  {usuario.rol === "BOX" && usuario.boxNombre && (
                    <Typography
                      sx={{
                        color: "#6b7280",
                        fontSize: "0.9rem",
                        mt: 0.5,
                      }}
                    >
                      {usuario.boxNombre}
                    </Typography>
                  )}
                </Box>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip
                    label={usuario.rol}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 800 }}
                  />

                  <Chip
                    label={usuario.estado || "ACTIVO"}
                    color={usuario.estado === "ACTIVO" ? "success" : "default"}
                    variant="outlined"
                    sx={{ fontWeight: 800 }}
                  />
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      <Dialog
        open={open}
        onClose={() => !loadingCrear && setOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "24px",
            p: 1,
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
          Crear nuevo usuario
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2.3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Nombre completo"
              value={form.nombreCompleto}
              onChange={(e) => handleChange("nombreCompleto", e.target.value)}
              disabled={loadingCrear}
            />

            <TextField
              fullWidth
              label="Correo electrónico"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={loadingCrear}
            />

            <TextField
              fullWidth
              label="Contraseña temporal"
              type="password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              disabled={loadingCrear}
            />

            <TextField
              select
              fullWidth
              label="Rol"
              value={form.rol}
              onChange={(e) => handleChange("rol", e.target.value)}
              disabled={loadingCrear}
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
                />

                <TextField
                  fullWidth
                  label="ID del box opcional"
                  placeholder="Ejemplo: box-1"
                  value={form.boxId}
                  onChange={(e) => handleChange("boxId", e.target.value)}
                  disabled={loadingCrear}
                  helperText="Si lo dejás vacío, se genera automáticamente desde el nombre del box."
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
            >
              <MenuItem value="ACTIVO">Activo</MenuItem>
              <MenuItem value="INACTIVO">Inactivo</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setOpen(false)}
            disabled={loadingCrear}
            sx={{ fontWeight: 700 }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={handleCrearUsuario}
            disabled={loadingCrear}
            sx={{
              borderRadius: "12px",
              fontWeight: 800,
              minWidth: 150,
              boxShadow: "none",
              "&:hover": { boxShadow: "none" },
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