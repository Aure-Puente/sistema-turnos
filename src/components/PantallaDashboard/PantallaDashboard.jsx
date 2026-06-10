//Importaciones:
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Stack,
  Divider,
} from "@mui/material";

import TvRoundedIcon from "@mui/icons-material/TvRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import PersonOffRoundedIcon from "@mui/icons-material/PersonOffRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

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

const PantallaDashboard = () => {
  const [turnosLlamados, setTurnosLlamados] = useState([]);
  const [turnosEsperando, setTurnosEsperando] = useState([]);
  const [loadingLlamados, setLoadingLlamados] = useState(true);
  const [loadingEsperando, setLoadingEsperando] = useState(true);

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
        console.error("Error escuchando pantalla en dashboard:", error);
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
      .filter(
        (turno) => !turnosActivos.some((activo) => activo.id === turno.id)
      )
      .slice(0, 5);
  }, [turnosLlamados, turnosActivos]);

  const proximosTurnos = useMemo(
    () => turnosEsperando.slice(0, 5),
    [turnosEsperando]
  );

  const loading = loadingLlamados || loadingEsperando;

  const getEstadoLabel = (estado) => {
    if (estado === "atendiendo") return "En atención";
    if (estado === "ausente") return "Ausente";
    return "Llamado";
  };

  const getEstadoStyles = (estado) => {
    if (estado === "ausente") {
      return {
        color: "#92400e",
        backgroundColor: "rgba(245, 158, 11, 0.10)",
        borderColor: "rgba(245, 158, 11, 0.24)",
      };
    }

    if (estado === "atendiendo") {
      return {
        color: "#166534",
        backgroundColor: "rgba(22, 163, 74, 0.10)",
        borderColor: "rgba(22, 163, 74, 0.22)",
      };
    }

    return {
      color: "primary.main",
      backgroundColor: "rgba(165, 4, 84, 0.08)",
      borderColor: "rgba(165, 4, 84, 0.20)",
    };
  };

  const EmptyState = ({ icon, title, subtitle }) => (
    <Box
      sx={{
        flex: 1,
        borderRadius: "22px",
        backgroundColor: "#f8fafc",
        border: "1px solid rgba(15, 23, 42, 0.07)",
        p: { xs: 2.4, md: 3 },

        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",

        textAlign: "center",

        minHeight: 300,
        maxWidth: 620,
        width: "100%",

        mx: "auto",
      }}
      >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: "22px",
          backgroundColor: "rgba(165, 4, 84, 0.07)",
          color: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 1.6,
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          color: "#111827",
          fontWeight: 800,
          fontSize: { xs: "1.08rem", md: "1.18rem" },
          letterSpacing: "-0.2px",
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          color: "#64748b",
          mt: 0.7,
          maxWidth: 390,
          fontSize: "0.94rem",
          lineHeight: 1.45,
          fontWeight: 500,
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  );

  const TurnoRow = ({ turno, index, type = "called" }) => {
    const estadoStyle = getEstadoStyles(turno.estado);
    const isNext = type === "waiting" && index === 0;
    const isAusente = turno.estado === "ausente";

    return (
      <Box
        sx={{
          p: { xs: 1.6, md: 1.8 },
          borderRadius: "18px",
          border: isNext
            ? "1px solid rgba(165, 4, 84, 0.18)"
            : isAusente
            ? "1px solid rgba(245, 158, 11, 0.20)"
            : "1px solid rgba(15, 23, 42, 0.07)",
          backgroundColor: isNext
            ? "rgba(165, 4, 84, 0.045)"
            : isAusente
            ? "rgba(245, 158, 11, 0.055)"
            : "#f8fafc",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.4}
          sx={{ minWidth: 0 }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "14px",
              backgroundColor: isNext ? "primary.main" : "#ffffff",
              color: isNext ? "#ffffff" : "primary.main",
              border: isNext ? "none" : "1px solid rgba(165, 4, 84, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "0.9rem",
              flexShrink: 0,
            }}
          >
            {type === "waiting" ? index + 1 : turno.numero?.slice(0, 1) || "T"}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                color: isAusente
                  ? "#92400e"
                  : isNext
                  ? "primary.main"
                  : "#111827",
                fontSize: { xs: "1.3rem", md: "1.48rem" },
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: "-0.6px",
              }}
            >
              {turno.numero}
            </Typography>

            <Typography
              noWrap
              sx={{
                color: "#64748b",
                fontSize: "0.88rem",
                fontWeight: 500,
                mt: 0.6,
                maxWidth: {
                  xs: 180,
                  sm: 320,
                  lg: 180,
                  xl: 260,
                },
              }}
            >
              {type === "called"
                ? `DNI ${turno.dni || "-"}`
                : turno.tipoConsultaLabel || "Consulta"}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ textAlign: "right", flexShrink: 0 }}>
          {type === "called" ? (
            <>
              <Typography
                noWrap
                sx={{
                  color: "#111827",
                  fontSize: "0.95rem",
                  fontWeight: 750,
                  maxWidth: 130,
                  mb: 0.7,
                }}
              >
                {turno.boxNombre || "Box"}
              </Typography>

              <Chip
                size="small"
                icon={isAusente ? <PersonOffRoundedIcon /> : undefined}
                label={getEstadoLabel(turno.estado)}
                variant="outlined"
                sx={{
                  height: 28,
                  borderRadius: "999px",
                  fontWeight: 700,
                  color: estadoStyle.color,
                  backgroundColor: estadoStyle.backgroundColor,
                  borderColor: estadoStyle.borderColor,
                  "& .MuiChip-icon": {
                    color: estadoStyle.color,
                    fontSize: 16,
                  },
                }}
              />
            </>
          ) : (
            isNext && (
              <Chip
                size="small"
                label="Siguiente"
                sx={{
                  height: 28,
                  borderRadius: "999px",
                  fontWeight: 700,
                  color: "primary.main",
                  backgroundColor: "rgba(165, 4, 84, 0.09)",
                }}
              />
            )
          )}
        </Box>
      </Box>
    );
  };

  const TurnoActivoCard = ({ turno }) => {
    const estadoStyle = getEstadoStyles(turno.estado);
    const atendiendo = turno.estado === "atendiendo";

    return (
      <Box
        sx={{
          borderRadius: "22px",
          border: atendiendo
            ? "1px solid rgba(22, 163, 74, 0.25)"
            : "1px solid rgba(165, 4, 84, 0.18)",
          backgroundColor: atendiendo
            ? "rgba(22, 163, 74, 0.055)"
            : "rgba(165, 4, 84, 0.045)",
          p: { xs: 2, md: 2.4 },
          textAlign: "center",
          minHeight: 210,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Typography
          sx={{
            color: "primary.main",
            fontSize: { xs: "3.2rem", md: "4.2rem" },
            fontWeight: 850,
            lineHeight: 0.95,
            letterSpacing: "-2px",
          }}
        >
          {turno.numero}
        </Typography>

        <Stack
          direction="row"
          spacing={0.8}
          alignItems="center"
          justifyContent="center"
          sx={{ mt: 1.6, color: "#64748b" }}
        >
          <BadgeRoundedIcon sx={{ fontSize: 19 }} />

          <Typography
            sx={{
              color: "#475569",
              fontSize: "0.95rem",
              fontWeight: 700,
            }}
          >
            DNI {turno.dni || "-"}
          </Typography>
        </Stack>

        <Typography
          sx={{
            color: "#111827",
            fontSize: { xs: "1.15rem", md: "1.35rem" },
            fontWeight: 850,
            mt: 1.4,
            lineHeight: 1.15,
          }}
        >
          {turno.boxNombre || "Box asignado"}
        </Typography>

        <Typography
          noWrap
          sx={{
            color: "#64748b",
            fontSize: "0.9rem",
            mt: 0.6,
            fontWeight: 500,
          }}
        >
          {turno.tipoConsultaLabel || "Consulta"}
        </Typography>

        <Chip
          label={getEstadoLabel(turno.estado)}
          variant="outlined"
          sx={{
            mt: 1.6,
            height: 30,
            px: 1,
            borderRadius: "999px",
            fontWeight: 700,
            alignSelf: "center",
            ...estadoStyle,
          }}
        />
      </Box>
    );
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
          <Typography
            sx={{
              fontSize: { xs: "1.55rem", sm: "1.7rem", md: "1.9rem" },
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.12,
              letterSpacing: "-0.7px",
            }}
          >
            Pantalla en vivo
          </Typography>

          <Typography
            sx={{
              color: "#64748b",
              mt: 0.7,
              fontSize: { xs: "0.95rem", md: "1rem" },
              fontWeight: 500,
              lineHeight: 1.45,
            }}
          >
            Vista de llamados activos, últimos movimientos y próximos turnos.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            icon={<TvRoundedIcon />}
            label="Vista interna"
            variant="outlined"
            sx={{
              height: 34,
              borderRadius: "999px",
              fontWeight: 700,
              color: "#374151",
              borderColor: "rgba(15, 23, 42, 0.12)",
              backgroundColor: "#ffffff",
              "& .MuiChip-icon": {
                color: "primary.main",
                fontSize: 18,
              },
            }}
          />

          <Chip
            label={`${turnosActivos.length} activos`}
            variant="outlined"
            sx={{
              height: 34,
              borderRadius: "999px",
              fontWeight: 700,
              color: turnosActivos.length > 0 ? "primary.main" : "#64748b",
              borderColor:
                turnosActivos.length > 0
                  ? "rgba(165, 4, 84, 0.20)"
                  : "rgba(15, 23, 42, 0.12)",
              backgroundColor:
                turnosActivos.length > 0
                  ? "rgba(165, 4, 84, 0.04)"
                  : "#ffffff",
            }}
          />

          <Chip
            label={`${turnosEsperando.length} esperando`}
            variant="outlined"
            sx={{
              height: 34,
              borderRadius: "999px",
              fontWeight: 700,
              color: turnosEsperando.length > 0 ? "primary.main" : "#64748b",
              borderColor:
                turnosEsperando.length > 0
                  ? "rgba(165, 4, 84, 0.20)"
                  : "rgba(15, 23, 42, 0.12)",
              backgroundColor:
                turnosEsperando.length > 0
                  ? "rgba(165, 4, 84, 0.04)"
                  : "#ffffff",
            }}
          />
        </Stack>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 1.14fr) minmax(340px, 0.86fr)",
          },
          gap: {
            xs: 2,
            md: 2.5,
            lg: 3,
          },
          alignItems: "stretch",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            borderRadius: { xs: "22px", md: "26px" },
            border: "1px solid rgba(15, 23, 42, 0.08)",
            p: { xs: 2.2, sm: 2.6, md: 3.2 },
            minHeight: { xs: "auto", lg: 450 },
            backgroundColor: "#ffffff",
            boxShadow: "0 18px 45px rgba(15, 23, 42, 0.045)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 2.2 }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  color: "#111827",
                  fontSize: { xs: "1.22rem", md: "1.38rem" },
                  fontWeight: 800,
                  letterSpacing: "-0.3px",
                }}
              >
                Turnos activos
              </Typography>

              <Typography
                sx={{
                  color: "#64748b",
                  mt: 0.45,
                  fontSize: { xs: "0.92rem", md: "0.98rem" },
                  fontWeight: 500,
                  lineHeight: 1.45,
                }}
              >
                Turnos llamados o en atención en este momento.
              </Typography>
            </Box>

            <Box
              sx={{
                width: { xs: 46, md: 52 },
                height: { xs: 46, md: 52 },
                borderRadius: "18px",
                backgroundColor: "rgba(165, 4, 84, 0.08)",
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CampaignRoundedIcon sx={{ fontSize: { xs: 27, md: 31 } }} />
            </Box>
          </Stack>

          <Divider sx={{ borderColor: "rgba(15, 23, 42, 0.08)", mb: 2.5 }} />

          {loadingLlamados ? (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 260,
              }}
            >
              <CircularProgress />
            </Box>
          ) : turnosActivos.length === 0 ? (
            <EmptyState
              icon={<TvRoundedIcon sx={{ fontSize: 38 }} />}
              title="Aguardando llamados"
              subtitle="Cuando un box llame a un turno, aparecerá automáticamente en esta vista."
            />
          ) : (
            <Box
              sx={{
                flex: 1,
                display: "grid",
                gridTemplateColumns:
                  turnosActivos.length === 1
                    ? "1fr"
                    : {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                      },
                gap: 1.6,
                alignContent: "center",
              }}
            >
              {turnosActivos.map((turno) => (
                <TurnoActivoCard key={turno.id} turno={turno} />
              ))}
            </Box>
          )}
        </Paper>

        <Stack spacing={{ xs: 2, md: 2.5 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: { xs: "22px", md: "26px" },
              border: "1px solid rgba(15, 23, 42, 0.08)",
              p: { xs: 2.2, sm: 2.6, md: 3 },
              backgroundColor: "#ffffff",
              boxShadow: "0 18px 45px rgba(15, 23, 42, 0.045)",
            }}
          >
            <Stack
              direction="row"
              alignItems="flex-start"
              justifyContent="space-between"
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    color: "#111827",
                    fontSize: { xs: "1.15rem", md: "1.28rem" },
                    fontWeight: 800,
                    letterSpacing: "-0.2px",
                  }}
                >
                  Últimos llamados
                </Typography>

                <Typography
                  sx={{
                    color: "#64748b",
                    mt: 0.35,
                    fontSize: "0.9rem",
                    fontWeight: 500,
                  }}
                >
                  Movimientos recientes
                </Typography>
              </Box>

              <Chip
                label={`${turnosLlamados.length} registros`}
                variant="outlined"
                sx={{
                  height: 31,
                  borderRadius: "999px",
                  fontWeight: 700,
                  color: "#475569",
                  borderColor: "rgba(15, 23, 42, 0.12)",
                  backgroundColor: "#ffffff",
                  flexShrink: 0,
                }}
              />
            </Stack>

            <Divider sx={{ borderColor: "rgba(15, 23, 42, 0.08)", mb: 2 }} />

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : ultimosTurnos.length === 0 ? (
              <Box
                sx={{
                  borderRadius: "18px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid rgba(15, 23, 42, 0.07)",
                  p: 2.2,
                  textAlign: "center",
                }}
              >
                <Typography sx={{ color: "#111827", fontWeight: 750, mb: 0.5 }}>
                  Sin llamados recientes
                </Typography>

                <Typography
                  sx={{
                    color: "#64748b",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                  }}
                >
                  Los últimos turnos aparecerán aquí.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.2}>
                {ultimosTurnos.map((turno, index) => (
                  <TurnoRow
                    key={turno.id}
                    turno={turno}
                    index={index}
                    type="called"
                  />
                ))}
              </Stack>
            )}
          </Paper>

          <Paper
            elevation={0}
            sx={{
              borderRadius: { xs: "22px", md: "26px" },
              border: "1px solid rgba(15, 23, 42, 0.08)",
              p: { xs: 2.2, sm: 2.6, md: 3 },
              backgroundColor: "#ffffff",
              boxShadow: "0 18px 45px rgba(15, 23, 42, 0.045)",
            }}
          >
            <Stack
              direction="row"
              alignItems="flex-start"
              justifyContent="space-between"
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    color: "#111827",
                    fontSize: { xs: "1.15rem", md: "1.28rem" },
                    fontWeight: 800,
                    letterSpacing: "-0.2px",
                  }}
                >
                  Próximos turnos
                </Typography>

                <Typography
                  sx={{
                    color: "#64748b",
                    mt: 0.35,
                    fontSize: "0.9rem",
                    fontWeight: 500,
                  }}
                >
                  Ordenados por llegada
                </Typography>
              </Box>

              <Chip
                label={`${turnosEsperando.length} esperando`}
                variant="outlined"
                sx={{
                  height: 31,
                  borderRadius: "999px",
                  fontWeight: 700,
                  color: turnosEsperando.length > 0 ? "primary.main" : "#475569",
                  borderColor:
                    turnosEsperando.length > 0
                      ? "rgba(165, 4, 84, 0.20)"
                      : "rgba(15, 23, 42, 0.12)",
                  backgroundColor:
                    turnosEsperando.length > 0
                      ? "rgba(165, 4, 84, 0.04)"
                      : "#ffffff",
                  flexShrink: 0,
                }}
              />
            </Stack>

            <Divider sx={{ borderColor: "rgba(15, 23, 42, 0.08)", mb: 2 }} />

            {loadingEsperando ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : proximosTurnos.length === 0 ? (
              <Box
                sx={{
                  borderRadius: "18px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid rgba(15, 23, 42, 0.07)",
                  p: 2.2,
                  textAlign: "center",
                }}
              >
                <Typography sx={{ color: "#111827", fontWeight: 750, mb: 0.5 }}>
                  No hay turnos esperando
                </Typography>

                <Typography
                  sx={{
                    color: "#64748b",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                  }}
                >
                  La cola se actualizará automáticamente.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.2}>
                {proximosTurnos.map((turno, index) => (
                  <TurnoRow
                    key={turno.id}
                    turno={turno}
                    index={index}
                    type="waiting"
                  />
                ))}
              </Stack>
            )}
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
};

export default PantallaDashboard;