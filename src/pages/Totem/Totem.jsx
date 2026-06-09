import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Fade,
  Alert,
  CircularProgress,
} from "@mui/material";

import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import DirectionsCarFilledRoundedIcon from "@mui/icons-material/DirectionsCarFilledRounded";
import HealthAndSafetyRoundedIcon from "@mui/icons-material/HealthAndSafetyRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";

import logo from "../../assets/images/logo.png";
import logoHorizontal from "../../assets/images/logo-horizontal.png";

const consultas = [
  {
    value: "poliza",
    label: "Consulta sobre póliza",
    icon: <DescriptionRoundedIcon />,
  },
  {
    value: "siniestro",
    label: "Denuncia de siniestro",
    icon: <SupportAgentRoundedIcon />,
  },
  {
    value: "automotor",
    label: "Seguro automotor",
    icon: <DirectionsCarFilledRoundedIcon />,
  },
  {
    value: "salud",
    label: "Seguro de salud",
    icon: <HealthAndSafetyRoundedIcon />,
  },
  {
    value: "administrativa",
    label: "Gestión administrativa",
    icon: <AssignmentIndRoundedIcon />,
  },
];

const Totem = () => {
  const [dni, setDni] = useState("");
  const [consulta, setConsulta] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [turnoGenerado, setTurnoGenerado] = useState(null);

  const generarNumeroTurno = async () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const q = query(
      collection(db, "turnos"),
      where("createdAtDate", ">=", hoy.toISOString()),
      where("createdAtDate", "<", manana.toISOString())
    );

    const snapshot = await getDocs(q);
    const cantidadTurnosHoy = snapshot.size + 1;

    return `A${String(cantidadTurnosHoy).padStart(3, "0")}`;
  };

  const handleSacarTurno = async () => {
    try {
      setError("");

      if (!dni.trim()) {
        setError("Por favor, ingrese su documento.");
        return;
      }

      if (dni.trim().length < 7) {
        setError("El documento ingresado no parece válido.");
        return;
      }

      if (!consulta) {
        setError("Por favor, seleccione el tipo de consulta.");
        return;
      }

      setLoading(true);

      const ahora = new Date();

      const consultaSeleccionada = consultas.find(
        (item) => item.value === consulta
      );

      const numeroTurno = await generarNumeroTurno();

      await addDoc(collection(db, "turnos"), {
        numero: numeroTurno,
        dni: dni.trim(),
        tipoConsulta: consulta,
        tipoConsultaLabel: consultaSeleccionada?.label || consulta,

        estado: "esperando",

        boxId: null,
        boxNombre: null,
        operadorId: null,
        operadorNombre: null,

        fechaKey: ahora.toISOString().split("T")[0],

        createdAt: serverTimestamp(),
        createdAtDate: ahora.toISOString(),

        llamadoAt: null,
        atendidoAt: null,
        finalizadoAt: null,

        tiempoEsperaSegundos: null,
        tiempoAtencionSegundos: null,
        tiempoTotalSegundos: null,
      });

      setTurnoGenerado({
        numero: numeroTurno,
        consulta: consultaSeleccionada?.label,
      });

      setDni("");
      setConsulta("");
    } catch (error) {
      console.error("Error al sacar turno:", error);
      setError("Ocurrió un error al generar el turno. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoTurno = () => {
    setTurnoGenerado(null);
    setError("");
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
        p: {
          xs: 2,
          md: 4,
        },
      }}
    >
      <Fade in timeout={500}>
        <Paper
          elevation={5}
          sx={{
            width: "100%",
            maxWidth: 760,
            borderRadius: "32px",
            p: {
              xs: 4,
              md: 7,
            },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: {
              xs: 3,
              md: 4,
            },
            backgroundColor: "#ffffff",
          }}
        >
          <Box
            component="img"
            src={logoHorizontal}
            alt="Logo"
            sx={{
              width: {
                xs: 240,
                md: 330,
              },
              maxHeight: 110,
              objectFit: "contain",
            }}
          />

          {turnoGenerado ? (
            <Box
              sx={{
                width: "100%",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3.5,
              }}
            >
              <CheckCircleRoundedIcon
                sx={{
                  fontSize: {
                    xs: 86,
                    md: 100,
                  },
                  color: "primary.main",
                }}
              />

              <Box>
                <Typography
                  sx={{
                    color: "#6b7280",
                    fontSize: {
                      xs: "1.25rem",
                      md: "1.45rem",
                    },
                    mb: 1.5,
                  }}
                >
                  Su turno fue generado correctamente
                </Typography>

                <Typography
                  sx={{
                    color: "primary.main",
                    fontWeight: 900,
                    fontSize: {
                      xs: "4.8rem",
                      md: "6.5rem",
                    },
                    lineHeight: 1,
                    letterSpacing: "-2px",
                  }}
                >
                  {turnoGenerado.numero}
                </Typography>

                <Typography
                  sx={{
                    color: "#374151",
                    fontSize: {
                      xs: "1.2rem",
                      md: "1.35rem",
                    },
                    mt: 2,
                    fontWeight: 500,
                  }}
                >
                  {turnoGenerado.consulta}
                </Typography>
              </Box>

              <Alert
                severity="info"
                sx={{
                  width: "100%",
                  borderRadius: "16px",
                  textAlign: "left",
                  fontSize: "1rem",
                }}
              >
                Aguarde a ser llamado en la pantalla principal.
              </Alert>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleNuevoTurno}
                sx={{
                  height: 76,
                  borderRadius: "22px",
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: "none",
                  },
                }}
              >
                Sacar otro turno
              </Button>
            </Box>
          ) : (
            <>
              <Box textAlign="center">
                <Typography
                  variant="h3"
                  sx={{
                    color: "primary.main",
                    fontWeight: 900,
                    fontSize: {
                      xs: "2.2rem",
                      md: "3.1rem",
                    },
                    mb: 1.3,
                    letterSpacing: "-0.5px",
                  }}
                >
                  Sistema de Turnos
                </Typography>

                <Typography
                  sx={{
                    color: "#6b7280",
                    fontSize: {
                      xs: "1.08rem",
                      md: "1.25rem",
                    },
                  }}
                >
                  Ingrese sus datos para obtener un turno de atención
                </Typography>
              </Box>

              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      borderRadius: "16px",
                      fontSize: "1rem",
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  label="Documento"
                  variant="outlined"
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                  placeholder="Ingrese su DNI"
                  size="medium"
                  disabled={loading}
                  InputLabelProps={{
                    sx: {
                      fontSize: "1.05rem",
                    },
                  }}
                  InputProps={{
                    sx: {
                      borderRadius: "18px",
                      fontSize: "1.35rem",
                      height: 76,
                      backgroundColor: "#ffffff",
                      px: 1,
                    },
                  }}
                />

                <TextField
                  select
                  fullWidth
                  label="Tipo de consulta"
                  value={consulta}
                  onChange={(e) => setConsulta(e.target.value)}
                  disabled={loading}
                  InputLabelProps={{
                    sx: {
                      fontSize: "1.05rem",
                    },
                  }}
                  InputProps={{
                    sx: {
                      borderRadius: "18px",
                      fontSize: "1.25rem",
                      height: 76,
                      backgroundColor: "#ffffff",
                      px: 1,
                    },
                  }}
                  SelectProps={{
                    sx: {
                      height: 76,
                      display: "flex",
                      alignItems: "center",
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                        height: "76px",
                        paddingTop: "0 !important",
                        paddingBottom: "0 !important",
                        fontSize: "1.25rem",
                      },
                    },
                  }}
                >
                  {consultas.map((item) => (
                    <MenuItem
                      key={item.value}
                      value={item.value}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        py: 2.2,
                        fontSize: "1.15rem",
                      }}
                    >
                      <Box
                        sx={{
                          color: "primary.main",
                          display: "flex",
                          alignItems: "center",
                          lineHeight: 0,
                          "& svg": {
                            fontSize: 30,
                          },
                        }}
                      >
                        {item.icon}
                      </Box>

                      {item.label}
                    </MenuItem>
                  ))}
                </TextField>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleSacarTurno}
                  disabled={loading}
                  sx={{
                    height: 82,
                    borderRadius: "22px",
                    fontSize: "1.35rem",
                    fontWeight: 800,
                    mt: 1,
                    boxShadow: "none",
                    "&:hover": {
                      boxShadow: "none",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={32} color="inherit" />
                  ) : (
                    "Sacar turno"
                  )}
                </Button>
              </Box>

              <Box
                component="img"
                src={logo}
                alt="Logo Icon"
                sx={{
                  width: 72,
                  opacity: 0.92,
                  mt: 1,
                }}
              />
            </>
          )}
        </Paper>
      </Fade>
    </Box>
  );
};

export default Totem;