import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Fade,
} from "@mui/material";

import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import PersonOffRoundedIcon from "@mui/icons-material/PersonOffRounded";

import { collection, onSnapshot, query, where } from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";

import logoHorizontal from "../../assets/images/logo-horizontal.png";
import logo from "../../assets/images/logo.png";

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

  const turnoPrincipal =
    turnosLlamados.find(
      (turno) => turno.estado === "llamado" || turno.estado === "atendiendo"
    ) || null;

  const ultimosTurnos = useMemo(() => {
    return turnosLlamados
      .filter((turno) => turno.id !== turnoPrincipal?.id)
      .slice(0, 4);
  }, [turnosLlamados, turnoPrincipal]);

  const proximosTurnos = useMemo(
    () => turnosEsperando.slice(0, 4),
    [turnosEsperando]
  );

  const loading = loadingLlamados || loadingEsperando;

  const horaFormateada = horaActual.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const getEstadoLabel = (estado) => {
    if (estado === "atendiendo") return "En atención";
    if (estado === "ausente") return "Ausente";
    return "Llamado";
  };

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
            p: { xs: 4, md: 6 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            backgroundColor: "#ffffff",
            minHeight: { xs: 420, md: "100%" },
          }}
        >
          {loadingLlamados ? (
            <CircularProgress size={70} />
          ) : turnoPrincipal ? (
            <Fade in timeout={400} key={turnoPrincipal.id}>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3.5,
                }}
              >
                <CampaignRoundedIcon
                  sx={{
                    fontSize: { xs: 90, md: 120 },
                    color: "primary.main",
                  }}
                />

                <Typography
                  sx={{
                    color: "#6b7280",
                    fontSize: { xs: "1.8rem", md: "2.4rem" },
                    fontWeight: 700,
                  }}
                >
                  Turno llamado
                </Typography>

                <Typography
                  sx={{
                    color: "primary.main",
                    fontSize: { xs: "6rem", md: "9rem" },
                    fontWeight: 950,
                    lineHeight: 0.9,
                    letterSpacing: "-4px",
                  }}
                >
                  {turnoPrincipal.numero}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1.5,
                    backgroundColor: "rgba(165, 4, 84, 0.08)",
                    color: "primary.main",
                    border: "1px solid rgba(165, 4, 84, 0.18)",
                    borderRadius: "999px",
                    px: 3,
                    py: 1.2,
                  }}
                >
                  <BadgeRoundedIcon sx={{ fontSize: { xs: 30, md: 38 } }} />

                  <Typography
                    sx={{
                      fontSize: { xs: "1.8rem", md: "2.4rem" },
                      fontWeight: 900,
                      lineHeight: 1,
                    }}
                  >
                    DNI {turnoPrincipal.dni || "-"}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      color: "#111827",
                      fontSize: { xs: "2.4rem", md: "3.8rem" },
                      fontWeight: 900,
                      lineHeight: 1.1,
                    }}
                  >
                    {turnoPrincipal.boxNombre || "Box asignado"}
                  </Typography>

                  <Chip
                    label={getEstadoLabel(turnoPrincipal.estado)}
                    color="primary"
                    sx={{
                      mt: 2,
                      height: 48,
                      borderRadius: "999px",
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      px: 2,
                    }}
                  />
                </Box>
              </Box>
            </Fade>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
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
            gridTemplateRows: "1fr 0.8fr",
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
            }}
          >
            <Typography
              sx={{
                color: "primary.main",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 900,
                mb: 2.5,
              }}
            >
              Últimos llamados
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.8,
                overflow: "hidden",
              }}
            >
              {!loading && ultimosTurnos.length === 0 ? (
                <Typography sx={{ color: "#6b7280", fontSize: "1.15rem", mt: 1 }}>
                  Todavía no hay otros turnos llamados.
                </Typography>
              ) : (
                ultimosTurnos.map((turno) => (
                  <Box
                    key={turno.id}
                    sx={{
                      border: "1px solid #ececef",
                      borderRadius: "22px",
                      p: { xs: 2, md: 2.4 },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
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
                          fontSize: { xs: "2rem", md: "2.5rem" },
                          fontWeight: 950,
                          lineHeight: 1,
                        }}
                      >
                        {turno.numero}
                      </Typography>

                      <Typography
                        sx={{
                          color: "#111827",
                          fontSize: { xs: "0.95rem", md: "1.1rem" },
                          fontWeight: 800,
                          mt: 0.6,
                        }}
                      >
                        DNI {turno.dni || "-"}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: "right" }}>
                      <Typography
                        sx={{
                          color: "#111827",
                          fontSize: { xs: "1.2rem", md: "1.55rem" },
                          fontWeight: 900,
                        }}
                      >
                        {turno.boxNombre || "Box"}
                      </Typography>

                      <Chip
                        icon={
                          turno.estado === "ausente" ? (
                            <PersonOffRoundedIcon />
                          ) : undefined
                        }
                        label={getEstadoLabel(turno.estado)}
                        color={turno.estado === "ausente" ? "warning" : "primary"}
                        variant={turno.estado === "ausente" ? "outlined" : "filled"}
                        sx={{
                          mt: 0.8,
                          fontWeight: 800,
                        }}
                      />
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Paper>

          <Paper
            elevation={4}
            sx={{
              borderRadius: "34px",
              p: { xs: 3, md: 4 },
              backgroundColor: "#ffffff",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <Typography
              sx={{
                color: "primary.main",
                fontSize: { xs: "1.7rem", md: "2rem" },
                fontWeight: 900,
                mb: 2,
              }}
            >
              Próximos turnos
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                overflow: "hidden",
              }}
            >
              {loadingEsperando ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={34} />
                </Box>
              ) : proximosTurnos.length === 0 ? (
                <Typography sx={{ color: "#6b7280", fontSize: "1.05rem" }}>
                  No hay turnos en espera.
                </Typography>
              ) : (
                proximosTurnos.map((turno, index) => (
                  <Box
                    key={turno.id}
                    sx={{
                      border: "1px solid #ececef",
                      borderRadius: "18px",
                      px: 2,
                      py: 1.5,
                      backgroundColor:
                        index === 0 ? "rgba(165, 4, 84, 0.06)" : "#fafafa",
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
                          fontSize: { xs: "1.55rem", md: "1.9rem" },
                          fontWeight: 950,
                          lineHeight: 1,
                        }}
                      >
                        {turno.numero}
                      </Typography>

                      <Typography
                        sx={{
                          color: "#6b7280",
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          mt: 0.4,
                        }}
                      >
                        DNI {turno.dni || "-"}
                      </Typography>
                    </Box>

                    {index === 0 && (
                      <Chip
                        label="Siguiente"
                        color="primary"
                        sx={{ fontWeight: 800 }}
                      />
                    )}
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