//Importaciones:
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
} from "@mui/material";

import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import PersonOffRoundedIcon from "@mui/icons-material/PersonOffRounded";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

import logoHorizontal from "../../assets/images/logo-horizontal.png";
import logo from "../../assets/images/logo.png";

//JSX:
const ordenarPorUltimoMovimiento = (turnos) => {
  return [...turnos].sort((a, b) => {
    const fechaA = new Date(
      a.ausenteAt || a.finalizadoAt || a.llamadoAt || a.createdAtDate || 0
    );
    const fechaB = new Date(
      b.ausenteAt || b.finalizadoAt || b.llamadoAt || b.createdAtDate || 0
    );
    return fechaB - fechaA;
  });
};

const ordenarPorCreacionAsc = (turnos) => {
  return [...turnos].sort(
    (a, b) => new Date(a.createdAtDate || 0) - new Date(b.createdAtDate || 0)
  );
};

const getEstadoLabel = (estado) => {
  if (estado === "atendiendo") return "En atención";
  if (estado === "ausente") return "Ausente";
  return "Llamado";
};

const Pantalla = () => {
  const [turnosLlamados, setTurnosLlamados] = useState([]);
  const [turnosEsperando, setTurnosEsperando] = useState([]);
  const [loadingLlamados, setLoadingLlamados] = useState(true);
  const [loadingEsperando, setLoadingEsperando] = useState(true);
  const [horaActual, setHoraActual] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setHoraActual(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const hoy = new Date().toISOString().split("T")[0];

    const q = query(
      collection(db, "turnos"),
      where("fechaKey", "==", hoy),
      where("estado", "in", ["llamado", "atendiendo", "ausente"])
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTurnosLlamados(ordenarPorUltimoMovimiento(data));
        setLoadingLlamados(false);
      },
      (error) => {
        console.error("Error escuchando turnos llamados:", error);
        setLoadingLlamados(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const hoy = new Date().toISOString().split("T")[0];

    const q = query(
      collection(db, "turnos"),
      where("fechaKey", "==", hoy),
      where("estado", "==", "esperando")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTurnosEsperando(ordenarPorCreacionAsc(data));
        setLoadingEsperando(false);
      },
      (error) => {
        console.error("Error escuchando próximos turnos:", error);
        setLoadingEsperando(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const turnosActivos = useMemo(() => {
    return turnosLlamados
      .filter(
        (turno) => turno.estado === "llamado" || turno.estado === "atendiendo"
      )
      .slice(0, 6);
  }, [turnosLlamados]);

  const ultimosTurnos = useMemo(() => {
    return turnosLlamados
      .filter((turno) => !turnosActivos.some((activo) => activo.id === turno.id))
      .slice(0, 3);
  }, [turnosLlamados, turnosActivos]);

  const proximosTurnos = useMemo(
    () => turnosEsperando.slice(0, 6),
    [turnosEsperando]
  );

  const loading = loadingLlamados || loadingEsperando;

  const horaFormateada = horaActual.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f7f7f8 0%, #ffffff 45%, #f4edf1 100%)",
        p: { xs: 3, md: 5 },
        display: "flex",
        flexDirection: "column",
        gap: 4,
        overflow: "hidden",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          borderRadius: "28px",
          px: { xs: 3, md: 5 },
          py: { xs: 2.5, md: 3 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 3,
        }}
      >
        <Box
          component="img"
          src={logoHorizontal}
          alt="Logo"
          sx={{
            width: { xs: 230, md: 340 },
            maxHeight: 95,
            objectFit: "contain",
          }}
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            color: "primary.main",
          }}
        >
          <AccessTimeRoundedIcon sx={{ fontSize: { xs: 34, md: 46 } }} />

          <Typography
            sx={{
              fontSize: { xs: "2rem", md: "3rem" },
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            {horaFormateada}
          </Typography>
        </Box>
      </Paper>

      <Box
        sx={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.45fr 1fr" },
          gap: 4,
          minHeight: 0,
        }}
      >
        <Paper
          elevation={5}
          sx={{
            borderRadius: "34px",
            p: { xs: 4, md: 5 },
            backgroundColor: "#ffffff",
            minHeight: { xs: 420, md: "100%" },
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            sx={{
              color: "primary.main",
              fontSize: { xs: "2rem", md: "2.7rem" },
              fontWeight: 950,
              mb: 3,
              textAlign: "center",
            }}
          >
            Turnos llamados
          </Typography>

          {loadingLlamados ? (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={70} />
            </Box>
          ) : turnosActivos.length > 0 ? (
            <Box
              sx={{
                flex: 1,
                display: "grid",
                gridTemplateColumns:
                  turnosActivos.length === 1
                    ? "1fr"
                    : { xs: "1fr", md: "repeat(2, 1fr)" },
                gap: 3,
                alignContent: "center",
              }}
            >
              {turnosActivos.map((turno) => {
                const esAtendiendo = turno.estado === "atendiendo";

                return (
                  <Box
                    key={turno.id}
                    sx={{
                      borderRadius: "30px",
                      border: esAtendiendo
                        ? "2px solid rgba(22, 163, 74, 0.35)"
                        : "2px solid rgba(165, 4, 84, 0.18)",
                      backgroundColor: esAtendiendo
                        ? "rgba(22, 163, 74, 0.06)"
                        : "rgba(165, 4, 84, 0.05)",
                      p: { xs: 3, md: 4 },
                      textAlign: "center",
                    }}
                  >
                    <CampaignRoundedIcon
                      sx={{
                        fontSize: { xs: 54, md: 72 },
                        color: esAtendiendo ? "#16a34a" : "primary.main",
                        mb: 1.5,
                      }}
                    />

                    <Typography
                      sx={{
                        color: "primary.main",
                        fontSize:
                          turnosActivos.length === 1
                            ? { xs: "6rem", md: "9rem" }
                            : { xs: "4rem", md: "5.7rem" },
                        fontWeight: 950,
                        lineHeight: 0.9,
                        letterSpacing: "-4px",
                      }}
                    >
                      {turno.numero}
                    </Typography>

                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1.2,
                        backgroundColor: "#ffffff",
                        color: "primary.main",
                        border: "1px solid rgba(165, 4, 84, 0.18)",
                        borderRadius: "999px",
                        px: 2.5,
                        py: 1,
                        mt: 2.4,
                      }}
                    >
                      <BadgeRoundedIcon sx={{ fontSize: { xs: 24, md: 32 } }} />

                      <Typography
                        sx={{
                          fontSize: { xs: "1.35rem", md: "1.9rem" },
                          fontWeight: 900,
                          lineHeight: 1,
                        }}
                      >
                        DNI {turno.dni || "-"}
                      </Typography>
                    </Box>

                    <Typography
                      sx={{
                        color: "#111827",
                        fontSize:
                          turnosActivos.length === 1
                            ? { xs: "2.4rem", md: "3.7rem" }
                            : { xs: "1.7rem", md: "2.4rem" },
                        fontWeight: 950,
                        mt: 2,
                        lineHeight: 1.1,
                      }}
                    >
                      {turno.boxNombre || "Box asignado"}
                    </Typography>

                    <Chip
                      label={getEstadoLabel(turno.estado)}
                      color={esAtendiendo ? "success" : "primary"}
                      sx={{
                        mt: 2,
                        height: 44,
                        borderRadius: "999px",
                        fontSize: "1.05rem",
                        fontWeight: 800,
                        px: 1.5,
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                textAlign: "center",
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="Logo"
                sx={{ width: { xs: 110, md: 150 }, opacity: 0.9 }}
              />

              <Typography
                sx={{
                  color: "primary.main",
                  fontSize: { xs: "2.2rem", md: "3rem" },
                  fontWeight: 900,
                }}
              >
                Aguardando llamados
              </Typography>

              <Typography
                sx={{
                  color: "#6b7280",
                  fontSize: { xs: "1.25rem", md: "1.6rem" },
                  maxWidth: 600,
                }}
              >
                Los turnos aparecerán en pantalla cuando sean llamados por un
                box de atención.
              </Typography>
            </Box>
          )}
        </Paper>

        <Box
          sx={{
            display: "grid",
            gridTemplateRows: "1.35fr 0.55fr",
            gap: 3,
            minHeight: 0,
          }}
        >
          <Paper
            elevation={4}
            sx={{
              borderRadius: "34px",
              p: { xs: 3, md: 4 },
              backgroundColor: "#ffffff",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              border: "1px solid rgba(165, 4, 84, 0.10)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 2,
                mb: 2.5,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    color: "primary.main",
                    fontSize: { xs: "1.9rem", md: "2.35rem" },
                    fontWeight: 950,
                    lineHeight: 1,
                  }}
                >
                  Próximos turnos
                </Typography>

                <Typography
                  sx={{
                    color: "#6b7280",
                    fontSize: { xs: "1rem", md: "1.1rem" },
                    fontWeight: 700,
                    mt: 0.8,
                  }}
                >
                  Prepararse para ser atendidos
                </Typography>
              </Box>

              <Chip
                label={`${turnosEsperando.length} esperando`}
                color="primary"
                sx={{
                  height: 38,
                  borderRadius: "999px",
                  fontSize: "0.95rem",
                  fontWeight: 900,
                  px: 1,
                }}
              />
            </Box>

            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 1.8,
                overflow: "hidden",
              }}
            >
              {loadingEsperando ? (
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <CircularProgress size={46} />
                </Box>
              ) : proximosTurnos.length === 0 ? (
                <Box
                  sx={{
                    flex: 1,
                    borderRadius: "24px",
                    backgroundColor: "#fafafa",
                    border: "1px dashed rgba(15, 23, 42, 0.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    p: 3,
                  }}
                >
                  <Typography
                    sx={{
                      color: "#6b7280",
                      fontSize: "1.25rem",
                      fontWeight: 800,
                    }}
                  >
                    No hay turnos en espera.
                  </Typography>
                </Box>
              ) : (
                proximosTurnos.map((turno, index) => {
                  const siguiente = index === 0;

                  return (
                    <Box
                      key={turno.id}
                      sx={{
                        border: siguiente
                          ? "2px solid rgba(165, 4, 84, 0.22)"
                          : "1px solid #ececef",
                        borderRadius: "24px",
                        px: { xs: 2, md: 2.5 },
                        py: { xs: 1.8, md: 2.2 },
                        backgroundColor: siguiente
                          ? "rgba(165, 4, 84, 0.075)"
                          : "#fafafa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            color: "primary.main",
                            fontSize: siguiente
                              ? { xs: "2.1rem", md: "2.7rem" }
                              : { xs: "1.75rem", md: "2.15rem" },
                            fontWeight: 950,
                            lineHeight: 1,
                          }}
                        >
                          {turno.numero}
                        </Typography>

                        <Typography
                          sx={{
                            color: "#6b7280",
                            fontSize: siguiente ? "1rem" : "0.92rem",
                            fontWeight: 800,
                            mt: 0.45,
                          }}
                        >
                          DNI {turno.dni || "-"}
                        </Typography>
                      </Box>

                      {siguiente && (
                        <Chip
                          label="Siguiente"
                          color="primary"
                          sx={{
                            height: 38,
                            borderRadius: "999px",
                            fontSize: "0.95rem",
                            fontWeight: 900,
                          }}
                        />
                      )}
                    </Box>
                  );
                })
              )}
            </Box>
          </Paper>

          <Paper
            elevation={4}
            sx={{
              borderRadius: "34px",
              p: { xs: 2.2, md: 3 },
              backgroundColor: "#ffffff",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              opacity: 0.92,
            }}
          >
            <Typography
              sx={{
                color: "#6b7280",
                fontSize: { xs: "1.15rem", md: "1.35rem" },
                fontWeight: 900,
                mb: 1.4,
              }}
            >
              Últimos llamados
            </Typography>

            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 1.1,
                overflow: "hidden",
              }}
            >
              {!loading && ultimosTurnos.length === 0 ? (
                <Typography sx={{ color: "#94a3b8", fontSize: "1rem", mt: 1 }}>
                  Sin llamados recientes.
                </Typography>
              ) : (
                ultimosTurnos.map((turno) => (
                  <Box
                    key={turno.id}
                    sx={{
                      border: "1px solid #ececef",
                      borderRadius: "18px",
                      p: { xs: 1.3, md: 1.6 },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1.5,
                      backgroundColor:
                        turno.estado === "ausente" ? "#fff7ed" : "#fafafa",
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          color:
                            turno.estado === "ausente"
                              ? "#9a3412"
                              : "primary.main",
                          fontSize: { xs: "1.35rem", md: "1.65rem" },
                          fontWeight: 950,
                          lineHeight: 1,
                        }}
                      >
                        {turno.numero}
                      </Typography>

                      <Typography
                        sx={{
                          color: "#64748b",
                          fontSize: "0.8rem",
                          fontWeight: 800,
                          mt: 0.4,
                        }}
                      >
                        DNI {turno.dni || "-"}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: "right" }}>
                      <Typography
                        sx={{
                          color: "#111827",
                          fontSize: "0.92rem",
                          fontWeight: 900,
                        }}
                      >
                        {turno.boxNombre || "Box"}
                      </Typography>

                      <Chip
                        size="small"
                        icon={
                          turno.estado === "ausente" ? (
                            <PersonOffRoundedIcon />
                          ) : undefined
                        }
                        label={getEstadoLabel(turno.estado)}
                        color={turno.estado === "ausente" ? "warning" : "primary"}
                        variant={turno.estado === "ausente" ? "outlined" : "filled"}
                        sx={{
                          mt: 0.5,
                          height: 24,
                          fontSize: "0.72rem",
                          fontWeight: 800,
                        }}
                      />
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Pantalla;