//Importaciones:
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Fade,
  Alert,
  CircularProgress,
  LinearProgress,
} from "@mui/material";

import TouchAppRoundedIcon from "@mui/icons-material/TouchAppRounded";
import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import DirectionsCarFilledRoundedIcon from "@mui/icons-material/DirectionsCarFilledRounded";
import HealthAndSafetyRoundedIcon from "@mui/icons-material/HealthAndSafetyRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

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
import logoHorizontal from "../../assets/images/logo-totem.png";

//JSX:
const consultas = [
  {
    value: "poliza",
    label: "Consulta sobre póliza",
    description: "Información, vigencia o datos de su póliza",
    icon: <DescriptionRoundedIcon />,
  },
  {
    value: "siniestro",
    label: "Denuncia de siniestro",
    description: "Accidentes, reclamos o seguimiento",
    icon: <SupportAgentRoundedIcon />,
  },
  {
    value: "automotor",
    label: "Seguro automotor",
    description: "Consultas relacionadas con vehículos",
    icon: <DirectionsCarFilledRoundedIcon />,
  },
  {
    value: "salud",
    label: "Seguro de salud",
    description: "Cobertura médica y consultas de salud",
    icon: <HealthAndSafetyRoundedIcon />,
  },
  {
    value: "administrativa",
    label: "Gestión administrativa",
    description: "Trámites, documentación o atención general",
    icon: <AssignmentIndRoundedIcon />,
  },
  {
    value: "pagos",
    label: "Pagos y cobranzas",
    description: "Cuotas, comprobantes o consultas de pago",
    icon: <PaymentsRoundedIcon />,
  },
];

const INACTIVITY_TIME = 25000;

const Totem = () => {
  const [step, setStep] = useState("bienvenida");
  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [turnoGenerado, setTurnoGenerado] = useState(null);

  const resetTotem = () => {
    setStep("bienvenida");
    setDni("");
    setError("");
    setTurnoGenerado(null);
    setLoading(false);
  };

  useEffect(() => {
    if (step === "bienvenida" || turnoGenerado || loading) return;

    const timer = setTimeout(() => {
      resetTotem();
    }, INACTIVITY_TIME);

    return () => clearTimeout(timer);
  }, [step, dni, turnoGenerado, loading]);

  useEffect(() => {
    if (!turnoGenerado) return;

    const timer = setTimeout(() => {
      resetTotem();
    }, 7000);

    return () => clearTimeout(timer);
  }, [turnoGenerado]);

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

  const handleContinuarDni = () => {
    setError("");

    if (!dni.trim()) {
      setError("Por favor, ingrese su documento.");
      return;
    }

    if (dni.trim().length < 7) {
      setError("El documento ingresado no parece válido.");
      return;
    }

    setStep("motivo");
  };

  const handleCrearTurno = async (consultaValue) => {
    try {
      setError("");

      if (!dni.trim()) {
        setStep("dni");
        setError("Por favor, ingrese su documento.");
        return;
      }

      setLoading(true);

      const ahora = new Date();

      const consultaSeleccionada = consultas.find(
        (item) => item.value === consultaValue
      );

      const numeroTurno = await generarNumeroTurno();

      await addDoc(collection(db, "turnos"), {
        numero: numeroTurno,
        dni: dni.trim(),
        tipoConsulta: consultaValue,
        tipoConsultaLabel: consultaSeleccionada?.label || consultaValue,

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

      setStep("confirmacion");
    } catch (error) {
      console.error("Error al sacar turno:", error);
      setError("Ocurrió un error al generar el turno. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const Header = () => (
    <Box
      sx={{
        width: "100%",
        px: { xs: 3, md: 7 },
        py: { xs: 2.4, md: 3.4 },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        borderBottom: "1px solid rgba(15, 23, 42, 0.07)",
        background:
          "linear-gradient(90deg, rgba(255,255,255,0.98), rgba(255,255,255,0.78))",
      }}
    >
      <Box
        component="img"
        src={logoHorizontal}
        alt="Logo"
        sx={{
          width: { xs: 230, md: 350 },
          maxHeight: 95,
          objectFit: "contain",
        }}
      />

      <Box
        component="img"
        src={logo}
        alt="Logo Icon"
        sx={{
          width: { xs: 54, md: 74 },
          height: { xs: 54, md: 74 },
          objectFit: "contain",
          opacity: 0.9,
        }}
      />
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        background:
          "radial-gradient(circle at top left, rgba(124, 24, 74, 0.11), transparent 34%), radial-gradient(circle at bottom right, rgba(124, 24, 74, 0.08), transparent 30%), linear-gradient(135deg, #f8fafc 0%, #ffffff 42%, #f4edf1 100%)",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
        p: { xs: 2, md: 3 },
      }}
    >
      <Fade in timeout={450}>
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            minHeight: { xs: "calc(100vh - 32px)", md: "calc(100vh - 48px)" },
            borderRadius: { xs: "28px", md: "40px" },
            overflow: "hidden",
            border: "1px solid rgba(124, 24, 74, 0.10)",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            boxShadow: "0 24px 70px rgba(15, 23, 42, 0.10)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {step !== "bienvenida" && <Header />}

          {step === "bienvenida" && (
            <Box
              onClick={() => {
                setError("");
                setStep("dni");
              }}
              sx={{
                flex: 1,
                minHeight: { xs: "calc(100vh - 32px)", md: "calc(100vh - 48px)" },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: { xs: 3, md: 8 },
                py: { xs: 5, md: 8 },
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                color: "#ffffff",
                background:
                  "linear-gradient(145deg, rgba(124, 24, 74, 0.98), rgba(87, 18, 55, 0.99))",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  width: 440,
                  height: 440,
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  top: -150,
                  right: -130,
                }}
              />

              <Box
                sx={{
                  position: "absolute",
                  width: 260,
                  height: 260,
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.07)",
                  bottom: -90,
                  left: -80,
                }}
              />

              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0.16,
                  backgroundImage:
                    "radial-gradient(circle at 20px 20px, rgba(255,255,255,0.35) 2px, transparent 0)",
                  backgroundSize: "42px 42px",
                }}
              />

              <Box
                sx={{
                  position: "relative",
                  zIndex: 1,
                  width: "100%",
                  maxWidth: 1100,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box
                  component="img"
                  src={logoHorizontal}
                  alt="Logo"
                  sx={{
                    width: { xs: 260, md: 440 },
                    maxHeight: 140,
                    objectFit: "contain",
                    mb: { xs: 5, md: 7 },
                    filter: "brightness(0) invert(1)",
                  }}
                />

                <Box
                  sx={{
                    width: { xs: 128, md: 170 },
                    height: { xs: 128, md: 170 },
                    borderRadius: "46px",
                    backgroundColor: "rgba(255,255,255,0.13)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    boxShadow: "0 20px 45px rgba(0,0,0,0.12)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: { xs: 4, md: 5 },
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <TouchAppRoundedIcon
                    sx={{ fontSize: { xs: 88, md: 118 } }}
                  />
                </Box>

                <Typography
                  sx={{
                    fontWeight: 950,
                    fontSize: { xs: "3.4rem", md: "6.2rem" },
                    lineHeight: 0.95,
                    letterSpacing: { xs: "-2px", md: "-5px" },
                    mb: { xs: 2.5, md: 3 },
                  }}
                >
                  Bienvenido
                </Typography>

                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.82)",
                    fontSize: { xs: "1.6rem", md: "2.35rem" },
                    fontWeight: 650,
                    lineHeight: 1.25,
                    maxWidth: 900,
                    mb: { xs: 5, md: 6 },
                  }}
                >
                  Para sacar un turno de atención, tocá la pantalla para
                  comenzar.
                </Typography>

                <Button
                  variant="contained"
                  size="large"
                  startIcon={<TouchAppRoundedIcon />}
                  sx={{
                    height: { xs: 92, md: 116 },
                    borderRadius: "34px",
                    px: { xs: 5, md: 8 },
                    fontSize: { xs: "1.6rem", md: "2.05rem" },
                    fontWeight: 950,
                    textTransform: "none",
                    color: "primary.main",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 24px 50px rgba(0,0,0,0.18)",
                    "&:hover": {
                      backgroundColor: "#ffffff",
                      boxShadow: "0 24px 50px rgba(0,0,0,0.18)",
                    },
                    "& .MuiButton-startIcon svg": {
                      fontSize: { xs: 42, md: 54 },
                    },
                  }}
                >
                  Tocar para comenzar
                </Button>
              </Box>
            </Box>
          )}

          {step === "dni" && (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: { xs: 3, md: 8 },
                py: { xs: 5, md: 7 },
              }}
            >
              <Box sx={{ width: "100%", maxWidth: 980, textAlign: "center" }}>
                <Typography
                  sx={{
                    color: "#111827",
                    fontWeight: 900,
                    fontSize: { xs: "2.9rem", md: "5.2rem" },
                    lineHeight: 1,
                    letterSpacing: { xs: "-1.5px", md: "-4px" },
                    mb: 2,
                  }}
                >
                  Ingresá tu DNI
                </Typography>

                <Typography
                  sx={{
                    color: "#64748b",
                    fontSize: { xs: "1.3rem", md: "1.85rem" },
                    fontWeight: 650,
                    mb: { xs: 3, md: 5 },
                  }}
                >
                  Escribí tu documento para continuar con el turno.
                </Typography>

                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      borderRadius: "22px",
                      mb: 3,
                      fontSize: { xs: "1.1rem", md: "1.35rem" },
                      textAlign: "left",
                      "& .MuiAlert-icon": { fontSize: 34 },
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  autoFocus
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                  placeholder="DNI"
                  disabled={loading}
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    maxLength: 10,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: { xs: 125, md: 165 },
                      borderRadius: "38px",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 22px 52px rgba(15, 23, 42, 0.10)",
                      "& fieldset": {
                        borderColor: "rgba(165, 4, 84, 0.55)",
                        borderWidth: 3,
                      },
                      "&:hover fieldset": {
                        borderColor: "primary.main",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "primary.main",
                        borderWidth: 4,
                      },
                    },
                    "& .MuiOutlinedInput-input": {
                      height: "100%",
                      boxSizing: "border-box",
                      textAlign: "center",
                      fontSize: { xs: "4rem", md: "6.5rem" },
                      fontWeight: 950,
                      letterSpacing: { xs: "5px", md: "8px" },
                      color: "#111827",
                      padding: "0 32px",
                      lineHeight: 1,
                    },
                    "& .MuiOutlinedInput-input::placeholder": {
                      color: "#94a3b8",
                      opacity: 0.75,
                      fontSize: { xs: "2.4rem", md: "3.5rem" },
                      letterSpacing: "0px",
                      fontWeight: 700,
                    },
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleContinuarDni}
                  disabled={loading}
                  sx={{
                    height: { xs: 92, md: 116 },
                    borderRadius: "34px",
                    mt: { xs: 3, md: 4 },
                    fontSize: { xs: "1.5rem", md: "2.1rem" },
                    fontWeight: 950,
                    textTransform: "none",
                    boxShadow: "0 24px 52px rgba(124, 24, 74, 0.25)",
                  }}
                >
                  Continuar
                </Button>

                <Button
                  startIcon={<ArrowBackRoundedIcon />}
                  onClick={resetTotem}
                  sx={{
                    mt: 2.5,
                    borderRadius: "999px",
                    px: 3,
                    py: 1.2,
                    color: "#64748b",
                    fontSize: { xs: "1rem", md: "1.15rem" },
                    fontWeight: 800,
                    textTransform: "none",
                  }}
                >
                  Volver al inicio
                </Button>
              </Box>
            </Box>
          )}

          {step === "motivo" && (
            <Box
              sx={{
                flex: 1,
                px: { xs: 3, md: 7 },
                py: { xs: 3, md: 5 },
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}>
                <Typography
                  sx={{
                    color: "#111827",
                    fontWeight: 900,
                    fontSize: { xs: "2.3rem", md: "4.2rem" },
                    lineHeight: 1,
                    letterSpacing: { xs: "-1px", md: "-3px" },
                    mb: 1.2,
                  }}
                >
                  Seleccioná el motivo
                </Typography>

                <Typography
                  sx={{
                    color: "#64748b",
                    fontSize: { xs: "1.2rem", md: "1.55rem" },
                    fontWeight: 600,
                  }}
                >
                  Tocá una opción para generar tu turno.
                </Typography>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    borderRadius: "22px",
                    mb: 3,
                    fontSize: { xs: "1.05rem", md: "1.25rem" },
                    "& .MuiAlert-icon": { fontSize: 32 },
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box
                sx={{
                  flex: 1,
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: { xs: 2, md: 2.8 },
                  alignContent: "center",
                }}
              >
                {consultas.map((item) => (
                  <Button
                    key={item.value}
                    onClick={() => handleCrearTurno(item.value)}
                    disabled={loading}
                    sx={{
                      minHeight: { xs: 145, md: 190 },
                      p: { xs: 2.5, md: 3.2 },
                      borderRadius: "34px",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      textAlign: "left",
                      textTransform: "none",
                      border: "1px solid rgba(15, 23, 42, 0.10)",
                      backgroundColor: "#ffffff",
                      color: "#111827",
                      boxShadow: "0 16px 36px rgba(15, 23, 42, 0.07)",
                      transition: "all 0.18s ease",
                      "&:hover": {
                        backgroundColor: "rgba(124, 24, 74, 0.06)",
                        borderColor: "primary.main",
                        transform: "translateY(-2px)",
                        boxShadow: "0 22px 46px rgba(124, 24, 74, 0.13)",
                      },
                      "&.Mui-disabled": {
                        opacity: 0.7,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        display: "flex",
                        gap: { xs: 2, md: 3 },
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          flexShrink: 0,
                          width: { xs: 76, md: 96 },
                          height: { xs: 76, md: 96 },
                          borderRadius: "28px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(124, 24, 74, 0.09)",
                          color: "primary.main",
                          "& svg": {
                            fontSize: { xs: 44, md: 58 },
                          },
                        }}
                      >
                        {item.icon}
                      </Box>

                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: { xs: "1.35rem", md: "2rem" },
                            fontWeight: 900,
                            lineHeight: 1.1,
                            color: "#111827",
                            mb: 1,
                          }}
                        >
                          {item.label}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: { xs: "1rem", md: "1.25rem" },
                            color: "#64748b",
                            fontWeight: 600,
                            lineHeight: 1.25,
                          }}
                        >
                          {item.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Button>
                ))}
              </Box>

              <Box sx={{ textAlign: "center", mt: 3 }}>
                <Button
                  startIcon={<ArrowBackRoundedIcon />}
                  onClick={() => {
                    setError("");
                    setStep("dni");
                  }}
                  disabled={loading}
                  sx={{
                    borderRadius: "999px",
                    px: 3,
                    py: 1.2,
                    color: "#64748b",
                    fontSize: { xs: "1rem", md: "1.15rem" },
                    fontWeight: 800,
                    textTransform: "none",
                  }}
                >
                  Volver al DNI
                </Button>
              </Box>
            </Box>
          )}

          {step === "confirmacion" && turnoGenerado && (
            <Box
              sx={{
                flex: 1,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: { xs: 3, md: 8 },
                py: { xs: 4, md: 6 },
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 920,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: { xs: 120, md: 150 },
                    height: { xs: 120, md: 150 },
                    borderRadius: "42px",
                    background:
                      "linear-gradient(135deg, rgba(124, 24, 74, 0.12), rgba(124, 24, 74, 0.05))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "primary.main",
                    mb: { xs: 3, md: 4 },
                  }}
                >
                  <CheckCircleRoundedIcon
                    sx={{ fontSize: { xs: 84, md: 106 } }}
                  />
                </Box>

                <Typography
                  sx={{
                    color: "#475569",
                    fontSize: { xs: "1.45rem", md: "1.95rem" },
                    fontWeight: 700,
                    mb: 1.5,
                  }}
                >
                  Turno generado correctamente
                </Typography>

                <Typography
                  sx={{
                    color: "primary.main",
                    fontWeight: 900,
                    fontSize: { xs: "6.8rem", md: "11rem" },
                    lineHeight: 0.9,
                    letterSpacing: { xs: "-4px", md: "-7px" },
                    mb: { xs: 2, md: 3 },
                  }}
                >
                  {turnoGenerado.numero}
                </Typography>

                <Box
                  sx={{
                    px: { xs: 2.4, md: 3.2 },
                    py: { xs: 1.3, md: 1.6 },
                    borderRadius: "999px",
                    backgroundColor: "rgba(124, 24, 74, 0.08)",
                    color: "primary.main",
                    fontSize: { xs: "1.1rem", md: "1.35rem" },
                    fontWeight: 800,
                    mb: { xs: 3, md: 4 },
                  }}
                >
                  {turnoGenerado.consulta}
                </Box>

                <Box
                  sx={{
                    width: "100%",
                    maxWidth: 700,
                    borderRadius: "30px",
                    border: "1px solid rgba(15, 23, 42, 0.08)",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 18px 44px rgba(15, 23, 42, 0.08)",
                    overflow: "hidden",
                    mb: 2.4,
                  }}
                >
                  <Box sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 2.4, md: 3 } }}>
                    <Typography
                      sx={{
                        color: "#111827",
                        fontSize: { xs: "1.25rem", md: "1.55rem" },
                        fontWeight: 850,
                        mb: 0.8,
                      }}
                    >
                      Aguarde a ser llamado
                    </Typography>

                    <Typography
                      sx={{
                        color: "#64748b",
                        fontSize: { xs: "1rem", md: "1.2rem" },
                        fontWeight: 600,
                        lineHeight: 1.45,
                      }}
                    >
                      Su número aparecerá en la pantalla principal cuando sea su
                      turno.
                    </Typography>
                  </Box>

                  <LinearProgress
                    sx={{
                      height: 7,
                      backgroundColor: "rgba(124, 24, 74, 0.08)",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: "primary.main",
                      },
                    }}
                  />
                </Box>

                <Button
                  variant="text"
                  onClick={resetTotem}
                  sx={{
                    borderRadius: "999px",
                    px: 3,
                    py: 1,
                    color: "#64748b",
                    fontWeight: 800,
                    textTransform: "none",
                    fontSize: "1.05rem",
                  }}
                >
                  Finalizar
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Fade>
    </Box>
  );
};

export default Totem;