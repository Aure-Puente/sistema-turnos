//Importaciones:
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import MeetingRoomRoundedIcon from "@mui/icons-material/MeetingRoomRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PauseCircleRoundedIcon from "@mui/icons-material/PauseCircleRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import FiberManualRecordRoundedIcon from "@mui/icons-material/FiberManualRecordRounded";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

//JSX:
const getEstadoBox = (box, turnosActivos) => {
  if (box.estadoBox === "PAUSA") {
    return {
      label: "En pausa",
      tone: "warning",
      bg: "rgba(245, 158, 11, 0.065)",
      border: "rgba(245, 158, 11, 0.22)",
      iconBg: "rgba(245, 158, 11, 0.12)",
      iconColor: "#92400e",
      textColor: "#92400e",
      dotColor: "#f59e0b",
      icon: <PauseCircleRoundedIcon />,
      turno: null,
      description: "El operador pausó la atención.",
    };
  }

  const turno = turnosActivos.find((t) => t.boxId === box.boxId);

  if (!turno) {
    return {
      label: "Disponible",
      tone: "success",
      bg: "rgba(22, 163, 74, 0.055)",
      border: "rgba(22, 101, 52, 0.18)",
      iconBg: "rgba(22, 163, 74, 0.10)",
      iconColor: "#166534",
      textColor: "#166534",
      dotColor: "#22c55e",
      icon: <CheckCircleRoundedIcon />,
      turno: null,
      description: "Sin turno activo en este momento.",
    };
  }

  if (turno.estado === "atendiendo") {
    return {
      label: "Atendiendo",
      tone: "primary",
      bg: "rgba(165, 4, 84, 0.045)",
      border: "rgba(165, 4, 84, 0.16)",
      iconBg: "rgba(165, 4, 84, 0.08)",
      iconColor: "#a50454",
      textColor: "#a50454",
      dotColor: "#a50454",
      icon: <PlayArrowRoundedIcon />,
      turno,
      description: "Atendiendo un turno actualmente.",
    };
  }

  return {
    label: "Llamando",
    tone: "warning",
    bg: "rgba(245, 158, 11, 0.065)",
    border: "rgba(245, 158, 11, 0.22)",
    iconBg: "rgba(245, 158, 11, 0.12)",
    iconColor: "#92400e",
    textColor: "#92400e",
    dotColor: "#f59e0b",
    icon: <CampaignRoundedIcon />,
    turno,
    description: "Turno llamado, pendiente de atención.",
  };
};

const StatCard = ({ icon, label, value, tone = "default" }) => {
  const styles = {
    default: {
      color: "#475569",
      bg: "#ffffff",
      border: "rgba(15, 23, 42, 0.08)",
      iconBg: "rgba(15, 23, 42, 0.045)",
      iconColor: "#64748b",
    },
    primary: {
      color: "primary.main",
      bg: "#ffffff",
      border: "rgba(165, 4, 84, 0.14)",
      iconBg: "rgba(165, 4, 84, 0.075)",
      iconColor: "primary.main",
    },
    success: {
      color: "#166534",
      bg: "rgba(22, 163, 74, 0.055)",
      border: "rgba(22, 101, 52, 0.16)",
      iconBg: "rgba(22, 163, 74, 0.10)",
      iconColor: "#166534",
    },
    warning: {
      color: "#92400e",
      bg: "rgba(245, 158, 11, 0.065)",
      border: "rgba(245, 158, 11, 0.20)",
      iconBg: "rgba(245, 158, 11, 0.12)",
      iconColor: "#92400e",
    },
  };

  const current = styles[tone] || styles.default;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.8, md: 2 },
        borderRadius: "22px",
        border: `1px solid ${current.border}`,
        backgroundColor: current.bg,
        boxShadow: "0 14px 34px rgba(15, 23, 42, 0.035)",
      }}
    >
      <Stack direction="row" spacing={1.4} alignItems="center">
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: "15px",
            backgroundColor: current.iconBg,
            color: current.iconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            "& svg": {
              fontSize: 24,
            },
          }}
        >
          {icon}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              color: "#64748b",
              fontSize: "0.82rem",
              fontWeight: 650,
              lineHeight: 1.2,
              mb: 0.45,
            }}
          >
            {label}
          </Typography>

          <Typography
            sx={{
              color: "#111827",
              fontSize: { xs: "1.45rem", md: "1.6rem" },
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.5px",
            }}
          >
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

const Boxes = () => {
  const [boxes, setBoxes] = useState([]);
  const [turnosActivos, setTurnosActivos] = useState([]);
  const [loadingBoxes, setLoadingBoxes] = useState(true);
  const [loadingTurnos, setLoadingTurnos] = useState(true);
  const [error, setError] = useState("");

  const hoy = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    const q = query(collection(db, "usuarios"), where("rol", "==", "BOX"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBoxes(
          data.sort((a, b) =>
            String(a.boxNombre || "").localeCompare(String(b.boxNombre || ""))
          )
        );

        setLoadingBoxes(false);
      },
      (error) => {
        console.error("Error cargando boxes:", error);
        setError("No se pudieron cargar los boxes.");
        setLoadingBoxes(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "turnos"),
      where("fechaKey", "==", hoy),
      where("estado", "in", ["llamado", "atendiendo"])
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTurnosActivos(data);
        setLoadingTurnos(false);
      },
      (error) => {
        console.error("Error cargando turnos activos:", error);
        setError("No se pudo cargar el estado de los boxes.");
        setLoadingTurnos(false);
      }
    );

    return () => unsubscribe();
  }, [hoy]);

  const loading = loadingBoxes || loadingTurnos;

  const resumen = useMemo(() => {
    const estados = boxes.map((box) => getEstadoBox(box, turnosActivos));

    return {
      total: boxes.length,
      disponibles: estados.filter((estado) => estado.label === "Disponible")
        .length,
      atendiendo: estados.filter((estado) => estado.label === "Atendiendo")
        .length,
      llamando: estados.filter((estado) => estado.label === "Llamando").length,
      pausa: estados.filter((estado) => estado.label === "En pausa").length,
    };
  }, [boxes, turnosActivos]);

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
              Boxes de atención
            </Typography>

            <Chip
              icon={<FiberManualRecordRoundedIcon />}
              label="Tiempo real"
              variant="outlined"
              sx={{
                height: 32,
                borderRadius: "999px",
                fontWeight: 700,
                color: "#166534",
                borderColor: "rgba(22, 101, 52, 0.20)",
                backgroundColor: "rgba(22, 163, 74, 0.07)",
                "& .MuiChip-icon": {
                  color: "#22c55e",
                  fontSize: 14,
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
            Estado actual de cada box, operador asignado y turno activo.
          </Typography>
        </Box>

        <Chip
          icon={<MeetingRoomRoundedIcon />}
          label={`${boxes.length} boxes registrados`}
          variant="outlined"
          sx={{
            height: 34,
            borderRadius: "999px",
            fontWeight: 700,
            color: boxes.length > 0 ? "primary.main" : "#64748b",
            borderColor:
              boxes.length > 0
                ? "rgba(165, 4, 84, 0.20)"
                : "rgba(15, 23, 42, 0.12)",
            backgroundColor:
              boxes.length > 0 ? "rgba(165, 4, 84, 0.04)" : "#ffffff",
            "& .MuiChip-icon": {
              color: boxes.length > 0 ? "primary.main" : "#64748b",
              fontSize: 18,
            },
          }}
        />
      </Stack>

      {error && (
        <Alert
          severity="warning"
          sx={{
            borderRadius: "18px",
            mb: 2.4,
            border: "1px solid rgba(245, 158, 11, 0.20)",
            backgroundColor: "rgba(245, 158, 11, 0.08)",
            color: "#78350f",
            "& .MuiAlert-icon": {
              color: "#d97706",
            },
          }}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Paper
          elevation={0}
          sx={{
            borderRadius: "24px",
            border: "1px solid rgba(15, 23, 42, 0.08)",
            backgroundColor: "#ffffff",
            minHeight: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 18px 45px rgba(15, 23, 42, 0.04)",
          }}
        >
          <CircularProgress />
        </Paper>
      ) : boxes.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            borderRadius: "24px",
            border: "1px solid rgba(15, 23, 42, 0.08)",
            backgroundColor: "#ffffff",
            minHeight: 280,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            p: 3,
            boxShadow: "0 18px 45px rgba(15, 23, 42, 0.04)",
          }}
        >
          <Box>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "24px",
                backgroundColor: "rgba(165, 4, 84, 0.07)",
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <MeetingRoomRoundedIcon sx={{ fontSize: 40 }} />
            </Box>

            <Typography
              sx={{
                color: "#111827",
                fontSize: "1.2rem",
                fontWeight: 800,
                mb: 0.7,
              }}
            >
              No hay boxes registrados
            </Typography>

            <Typography
              sx={{
                color: "#64748b",
                fontSize: "0.95rem",
                fontWeight: 500,
                maxWidth: 420,
              }}
            >
              Todavía no hay usuarios con rol Box configurados en el sistema.
            </Typography>
          </Box>
        </Paper>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(5, minmax(0, 1fr))",
              },
              gap: { xs: 1.5, md: 2 },
              mb: { xs: 2.4, md: 3 },
            }}
          >
            <StatCard
              icon={<GroupsRoundedIcon />}
              label="Total"
              value={resumen.total}
              tone="default"
            />

            <StatCard
              icon={<CheckCircleRoundedIcon />}
              label="Disponibles"
              value={resumen.disponibles}
              tone="success"
            />

            <StatCard
              icon={<PlayArrowRoundedIcon />}
              label="Atendiendo"
              value={resumen.atendiendo}
              tone="primary"
            />

            <StatCard
              icon={<CampaignRoundedIcon />}
              label="Llamando"
              value={resumen.llamando}
              tone="warning"
            />

            <StatCard
              icon={<PauseCircleRoundedIcon />}
              label="En pausa"
              value={resumen.pausa}
              tone="warning"
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
              gap: { xs: 1.7, md: 2.2 },
            }}
          >
            {boxes.map((box) => {
              const estado = getEstadoBox(box, turnosActivos);

              return (
                <Paper
                  key={box.id}
                  elevation={0}
                  sx={{
                    borderRadius: { xs: "22px", md: "24px" },
                    border: `1px solid ${estado.border}`,
                    backgroundColor: "#ffffff",
                    boxShadow: "0 16px 38px rgba(15, 23, 42, 0.04)",
                    overflow: "hidden",
                    minHeight: { xs: "auto", md: 250 },
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box
                    sx={{
                      height: 5,
                      backgroundColor: estado.dotColor,
                      opacity: 0.85,
                    }}
                  />

                  <Box
                    sx={{
                      p: { xs: 2, md: 2.3 },
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={1.6}
                      sx={{ mb: 2 }}
                    >
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: "18px",
                          backgroundColor: estado.iconBg,
                          color: estado.iconColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          "& svg": {
                            fontSize: 30,
                          },
                        }}
                      >
                        <MeetingRoomRoundedIcon />
                      </Box>

                      <Chip
                        icon={estado.icon}
                        label={estado.label}
                        variant="outlined"
                        sx={{
                          height: 32,
                          borderRadius: "999px",
                          fontWeight: 700,
                          color: estado.textColor,
                          borderColor: estado.border,
                          backgroundColor: estado.bg,
                          "& .MuiChip-icon": {
                            color: estado.textColor,
                            fontSize: 17,
                          },
                        }}
                      />
                    </Stack>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        noWrap
                        sx={{
                          color: "#111827",
                          fontSize: { xs: "1.25rem", md: "1.42rem" },
                          fontWeight: 800,
                          lineHeight: 1.1,
                          letterSpacing: "-0.4px",
                        }}
                      >
                        {box.boxNombre || "Box sin nombre"}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={0.9}
                        alignItems="center"
                        sx={{ mt: 1 }}
                      >
                        <PersonRoundedIcon
                          sx={{
                            fontSize: 19,
                            color: "#94a3b8",
                            flexShrink: 0,
                          }}
                        />

                        <Typography
                          noWrap
                          sx={{
                            color: "#475569",
                            fontSize: "0.95rem",
                            fontWeight: 600,
                          }}
                        >
                          {box.nombreCompleto || "Operador sin nombre"}
                        </Typography>
                      </Stack>
                    </Box>

                    <Divider sx={{ my: 2, borderColor: "rgba(15, 23, 42, 0.08)" }} />

                    {estado.turno ? (
                      <Box
                        sx={{
                          p: { xs: 1.7, md: 1.9 },
                          borderRadius: "20px",
                          backgroundColor: "#f8fafc",
                          border: "1px solid rgba(15, 23, 42, 0.07)",
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          spacing={1.5}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{
                                color: "#64748b",
                                fontSize: "0.82rem",
                                fontWeight: 650,
                                mb: 0.55,
                              }}
                            >
                              Turno actual
                            </Typography>

                            <Typography
                              sx={{
                                color: "primary.main",
                                fontSize: { xs: "2rem", md: "2.25rem" },
                                fontWeight: 800,
                                lineHeight: 1,
                                letterSpacing: "-1px",
                              }}
                            >
                              {estado.turno.numero}
                            </Typography>

                            <Typography
                              noWrap
                              sx={{
                                color: "#475569",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                mt: 0.75,
                              }}
                            >
                              DNI {estado.turno.dni || "-"}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              width: 42,
                              height: 42,
                              borderRadius: "15px",
                              backgroundColor: "#ffffff",
                              border: "1px solid rgba(15, 23, 42, 0.08)",
                              color: estado.iconColor,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <ConfirmationNumberRoundedIcon sx={{ fontSize: 25 }} />
                          </Box>
                        </Stack>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          p: { xs: 1.6, md: 1.8 },
                          borderRadius: "18px",
                          backgroundColor: estado.bg,
                          border: `1px solid ${estado.border}`,
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#475569",
                            fontSize: "0.92rem",
                            fontWeight: 500,
                            lineHeight: 1.45,
                          }}
                        >
                          {estado.description}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </>
      )}
    </Box>
  );
};

export default Boxes;