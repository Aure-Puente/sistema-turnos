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
import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import DirectionsCarFilledRoundedIcon from "@mui/icons-material/DirectionsCarFilledRounded";
import HealthAndSafetyRoundedIcon from "@mui/icons-material/HealthAndSafetyRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
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

const Totem = () => {
  const [dni, setDni] = useState("");
  const [consulta, setConsulta] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [turnoGenerado, setTurnoGenerado] = useState(null);

  useEffect(() => {
    if (!turnoGenerado) return;

    const timer = setTimeout(() => {
      setTurnoGenerado(null);
      setError("");
    }, 6500);

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

  const handleFinalizar = () => {
    setTurnoGenerado(null);
    setError("");
  };

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
        p: {
          xs: 2,
          md: 3,
        },
      }}
    >
      <Fade in timeout={450}>
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            minHeight: {
              xs: "calc(100vh - 32px)",
              md: "calc(100vh - 48px)",
            },
            borderRadius: {
              xs: "28px",
              md: "40px",
            },
            overflow: "hidden",
            border: "1px solid rgba(124, 24, 74, 0.10)",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            boxShadow: "0 24px 70px rgba(15, 23, 42, 0.10)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              width: "100%",
              px: {
                xs: 3,
                md: 6,
              },
              py: {
                xs: 2.4,
                md: 3.2,
              },
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
                width: {
                  xs: 210,
                  md: 310,
                },
                maxHeight: 90,
                objectFit: "contain",
              }}
            />

            <Box
              component="img"
              src={logo}
              alt="Logo Icon"
              sx={{
                width: {
                  xs: 48,
                  md: 64,
                },
                height: {
                  xs: 48,
                  md: 64,
                },
                objectFit: "contain",
                opacity: 0.9,
              }}
            />
          </Box>

          {turnoGenerado ? (
            <Box
              sx={{
                flex: 1,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: {
                  xs: 3,
                  md: 8,
                },
                py: {
                  xs: 4,
                  md: 6,
                },
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
                    width: {
                      xs: 104,
                      md: 124,
                    },
                    height: {
                      xs: 104,
                      md: 124,
                    },
                    borderRadius: "34px",
                    background:
                      "linear-gradient(135deg, rgba(124, 24, 74, 0.12), rgba(124, 24, 74, 0.05))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "primary.main",
                    mb: {
                      xs: 3,
                      md: 4,
                    },
                  }}
                >
                  <CheckCircleRoundedIcon
                    sx={{
                      fontSize: {
                        xs: 74,
                        md: 88,
                      },
                    }}
                  />
                </Box>

                <Typography
                  sx={{
                    color: "#475569",
                    fontSize: {
                      xs: "1.35rem",
                      md: "1.75rem",
                    },
                    fontWeight: 600,
                    mb: 1.5,
                  }}
                >
                  Turno generado correctamente
                </Typography>

                <Typography
                  sx={{
                    color: "primary.main",
                    fontWeight: 800,
                    fontSize: {
                      xs: "6.2rem",
                      md: "10rem",
                    },
                    lineHeight: 0.9,
                    letterSpacing: {
                      xs: "-4px",
                      md: "-7px",
                    },
                    mb: {
                      xs: 2,
                      md: 3,
                    },
                  }}
                >
                  {turnoGenerado.numero}
                </Typography>

                <Box
                  sx={{
                    px: {
                      xs: 2.2,
                      md: 3,
                    },
                    py: {
                      xs: 1.2,
                      md: 1.5,
                    },
                    borderRadius: "999px",
                    backgroundColor: "rgba(124, 24, 74, 0.08)",
                    color: "primary.main",
                    fontSize: {
                      xs: "1.05rem",
                      md: "1.25rem",
                    },
                    fontWeight: 700,
                    mb: {
                      xs: 3,
                      md: 4,
                    },
                  }}
                >
                  {turnoGenerado.consulta}
                </Box>

                <Box
                  sx={{
                    width: "100%",
                    maxWidth: 680,
                    borderRadius: "28px",
                    border: "1px solid rgba(15, 23, 42, 0.08)",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 18px 44px rgba(15, 23, 42, 0.08)",
                    overflow: "hidden",
                    mb: 2.4,
                  }}
                >
                  <Box
                    sx={{
                      px: {
                        xs: 2.5,
                        md: 4,
                      },
                      py: {
                        xs: 2.4,
                        md: 3,
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#111827",
                        fontSize: {
                          xs: "1.15rem",
                          md: "1.4rem",
                        },
                        fontWeight: 750,
                        mb: 0.8,
                      }}
                    >
                      Aguarde a ser llamado
                    </Typography>

                    <Typography
                      sx={{
                        color: "#64748b",
                        fontSize: {
                          xs: "1rem",
                          md: "1.12rem",
                        },
                        fontWeight: 500,
                        lineHeight: 1.45,
                      }}
                    >
                      Su número aparecerá en la pantalla principal cuando sea su
                      turno.
                    </Typography>
                  </Box>

                  <LinearProgress
                    sx={{
                      height: 6,
                      backgroundColor: "rgba(124, 24, 74, 0.08)",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: "primary.main",
                      },
                    }}
                  />
                </Box>

                <Button
                  variant="text"
                  onClick={handleFinalizar}
                  sx={{
                    borderRadius: "999px",
                    px: 3,
                    py: 1,
                    color: "#64748b",
                    fontWeight: 700,
                    textTransform: "none",
                    fontSize: "1rem",
                    "&:hover": {
                      backgroundColor: "rgba(15, 23, 42, 0.04)",
                      color: "primary.main",
                    },
                  }}
                >
                  Finalizar
                </Button>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  lg: "0.9fr 1.1fr",
                },
                gap: {
                  xs: 3,
                  lg: 5,
                },
                px: {
                  xs: 3,
                  md: 6,
                  lg: 7,
                },
                py: {
                  xs: 3,
                  md: 5,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: {
                    xs: 2.5,
                    md: 3,
                  },
                }}
              >
                <Box>
                  <Typography
                    variant="h1"
                    sx={{
                      color: "#111827",
                      fontWeight: 800,
                      fontSize: {
                        xs: "2.65rem",
                        sm: "3.35rem",
                        md: "4.2rem",
                        lg: "4.8rem",
                      },
                      lineHeight: 0.98,
                      letterSpacing: {
                        xs: "-1.5px",
                        md: "-3px",
                      },
                      mb: 2,
                    }}
                  >
                    Sacá tu turno
                  </Typography>

                  <Typography
                    sx={{
                      color: "#64748b",
                      fontSize: {
                        xs: "1.1rem",
                        md: "1.32rem",
                      },
                      lineHeight: 1.4,
                      maxWidth: 620,
                      fontWeight: 500,
                    }}
                  >
                    Ingresá tu documento, elegí el motivo de atención y obtené
                    tu número para ser llamado.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: "100%",
                    maxWidth: 620,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  {error && (
                    <Alert
                      severity="error"
                      sx={{
                        borderRadius: "18px",
                        fontSize: {
                          xs: "1rem",
                          md: "1.08rem",
                        },
                        "& .MuiAlert-icon": {
                          fontSize: 28,
                        },
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
                    disabled={loading}
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                    }}
                    InputLabelProps={{
                      sx: {
                        fontSize: {
                          xs: "1.05rem",
                          md: "1.15rem",
                        },
                        fontWeight: 650,
                      },
                    }}
                    InputProps={{
                      sx: {
                        borderRadius: "24px",
                        fontSize: {
                          xs: "1.5rem",
                          md: "1.8rem",
                        },
                        height: {
                          xs: 82,
                          md: 94,
                        },
                        backgroundColor: "#ffffff",
                        px: 1.4,
                        fontWeight: 700,
                        boxShadow: "0 14px 32px rgba(15, 23, 42, 0.06)",
                        "& fieldset": {
                          borderColor: "rgba(15, 23, 42, 0.12)",
                        },
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                        "&.Mui-focused fieldset": {
                          borderWidth: 2,
                        },
                      },
                    }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleSacarTurno}
                    disabled={loading}
                    sx={{
                      height: {
                        xs: 84,
                        md: 96,
                      },
                      borderRadius: "26px",
                      fontSize: {
                        xs: "1.3rem",
                        md: "1.52rem",
                      },
                      fontWeight: 800,
                      textTransform: "none",
                      mt: 1,
                      boxShadow: "0 18px 36px rgba(124, 24, 74, 0.22)",
                      "&:hover": {
                        boxShadow: "0 18px 36px rgba(124, 24, 74, 0.22)",
                      },
                      "&.Mui-disabled": {
                        backgroundColor: "rgba(124, 24, 74, 0.45)",
                        color: "#ffffff",
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={36} color="inherit" />
                    ) : (
                      "Confirmar turno"
                    )}
                  </Button>

                  <Typography
                    sx={{
                      textAlign: "center",
                      color: "#94a3b8",
                      fontSize: {
                        xs: "0.95rem",
                        md: "1rem",
                      },
                      fontWeight: 550,
                      mt: 0.5,
                    }}
                  >
                    Atención presencial por orden de llegada
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 2,
                  minHeight: 0,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      color: "#111827",
                      fontSize: {
                        xs: "1.32rem",
                        md: "1.7rem",
                      },
                      fontWeight: 750,
                      mb: 0.5,
                    }}
                  >
                    ¿Qué trámite necesitás realizar?
                  </Typography>

                  <Typography
                    sx={{
                      color: "#64748b",
                      fontSize: {
                        xs: "1rem",
                        md: "1.12rem",
                      },
                      fontWeight: 500,
                    }}
                  >
                    Tocá una opción para seleccionarla.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "1fr 1fr",
                    },
                    gap: {
                      xs: 1.45,
                      md: 1.8,
                    },
                  }}
                >
                  {consultas.map((item) => {
                    const selected = consulta === item.value;

                    return (
                      <Button
                        key={item.value}
                        onClick={() => setConsulta(item.value)}
                        disabled={loading}
                        sx={{
                          minHeight: {
                            xs: 112,
                            md: 128,
                          },
                          p: {
                            xs: 1.8,
                            md: 2.1,
                          },
                          borderRadius: "26px",
                          justifyContent: "flex-start",
                          alignItems: "stretch",
                          textAlign: "left",
                          textTransform: "none",
                          border: selected
                            ? "2px solid"
                            : "1px solid rgba(15, 23, 42, 0.10)",
                          borderColor: selected
                            ? "primary.main"
                            : "rgba(15, 23, 42, 0.10)",
                          backgroundColor: selected
                            ? "rgba(124, 24, 74, 0.08)"
                            : "#ffffff",
                          color: "#111827",
                          boxShadow: selected
                            ? "0 18px 38px rgba(124, 24, 74, 0.15)"
                            : "0 12px 26px rgba(15, 23, 42, 0.055)",
                          transition: "all 0.18s ease",
                          "&:hover": {
                            backgroundColor: selected
                              ? "rgba(124, 24, 74, 0.10)"
                              : "#ffffff",
                            borderColor: "primary.main",
                            transform: "translateY(-2px)",
                            boxShadow: selected
                              ? "0 18px 38px rgba(124, 24, 74, 0.17)"
                              : "0 16px 34px rgba(15, 23, 42, 0.09)",
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
                            gap: {
                              xs: 1.4,
                              md: 1.7,
                            },
                            alignItems: "flex-start",
                          }}
                        >
                          <Box
                            sx={{
                              flexShrink: 0,
                              width: {
                                xs: 52,
                                md: 58,
                              },
                              height: {
                                xs: 52,
                                md: 58,
                              },
                              borderRadius: "18px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: selected
                                ? "primary.main"
                                : "rgba(124, 24, 74, 0.08)",
                              color: selected ? "#ffffff" : "primary.main",
                              "& svg": {
                                fontSize: {
                                  xs: 30,
                                  md: 34,
                                },
                              },
                            }}
                          >
                            {item.icon}
                          </Box>

                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontSize: {
                                  xs: "1rem",
                                  md: "1.16rem",
                                },
                                fontWeight: 760,
                                lineHeight: 1.15,
                                color: selected ? "primary.main" : "#111827",
                                mb: 0.7,
                              }}
                            >
                              {item.label}
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: {
                                  xs: "0.88rem",
                                  md: "0.96rem",
                                },
                                color: "#64748b",
                                fontWeight: 500,
                                lineHeight: 1.25,
                              }}
                            >
                              {item.description}
                            </Typography>
                          </Box>
                        </Box>
                      </Button>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          )}
        </Paper>
      </Fade>
    </Box>
  );
};

export default Totem;