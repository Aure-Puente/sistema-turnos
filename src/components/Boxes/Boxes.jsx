import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import MeetingRoomRoundedIcon from "@mui/icons-material/MeetingRoomRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const getEstadoBox = (box, turnosActivos) => {
  const turno = turnosActivos.find((t) => t.boxId === box.boxId);

  if (!turno) {
    return {
      label: "Disponible",
      color: "success",
      bg: "#f0fdf4",
      border: "#bbf7d0",
      icon: <CheckCircleRoundedIcon />,
      turno: null,
    };
  }

  if (turno.estado === "atendiendo") {
    return {
      label: "Atendiendo",
      color: "primary",
      bg: "rgba(165, 4, 84, 0.06)",
      border: "rgba(165, 4, 84, 0.18)",
      icon: <PlayArrowRoundedIcon />,
      turno,
    };
  }

  return {
    label: "Llamando",
    color: "warning",
    bg: "#fff7ed",
    border: "#fed7aa",
    icon: <CampaignRoundedIcon />,
    turno,
  };
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
            Boxes de atención
          </Typography>

          <Typography sx={{ color: "#6b7280", mt: 0.8 }}>
            Estado actual de los boxes registrados en el sistema.
          </Typography>
        </Box>

        <Chip
          label={`${boxes.length} boxes registrados`}
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 800 }}
        />
      </Stack>

      {error && (
        <Alert severity="warning" sx={{ borderRadius: "14px", mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Paper
          elevation={0}
          sx={{
            borderRadius: "24px",
            border: "1px solid #ececef",
            backgroundColor: "#ffffff",
            minHeight: 260,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Paper>
      ) : boxes.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: "14px" }}>
          Todavía no hay usuarios con rol BOX registrados.
        </Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          {boxes.map((box) => {
            const estado = getEstadoBox(box, turnosActivos);

            return (
              <Paper
                key={box.id}
                elevation={0}
                sx={{
                  borderRadius: "26px",
                  border: `1px solid ${estado.border}`,
                  backgroundColor: estado.bg,
                  p: 3,
                  minHeight: 240,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Box
                      sx={{
                        width: 58,
                        height: 58,
                        borderRadius: "18px",
                        backgroundColor: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "primary.main",
                        border: "1px solid #ececef",
                      }}
                    >
                      <MeetingRoomRoundedIcon sx={{ fontSize: 34 }} />
                    </Box>

                    <Chip
                      icon={estado.icon}
                      label={estado.label}
                      color={estado.color}
                      sx={{ fontWeight: 800 }}
                    />
                  </Stack>

                  <Box>
                    <Typography
                      sx={{
                        color: "primary.main",
                        fontSize: "1.6rem",
                        fontWeight: 950,
                        lineHeight: 1.1,
                      }}
                    >
                      {box.boxNombre || "Box sin nombre"}
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                      <PersonRoundedIcon sx={{ fontSize: 20, color: "#6b7280" }} />

                      <Typography
                        sx={{
                          color: "#374151",
                          fontSize: "1rem",
                          fontWeight: 700,
                        }}
                      >
                        {box.nombreCompleto || "Operador sin nombre"}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>

                {estado.turno ? (
                  <Box
                    sx={{
                      mt: 2.5,
                      p: 2,
                      borderRadius: "18px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #ececef",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#6b7280",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        mb: 0.5,
                      }}
                    >
                      Turno actual
                    </Typography>

                    <Typography
                      sx={{
                        color: "primary.main",
                        fontSize: "2rem",
                        fontWeight: 950,
                        lineHeight: 1,
                      }}
                    >
                      {estado.turno.numero}
                    </Typography>

                    <Typography
                      sx={{
                        color: "#374151",
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        mt: 0.8,
                      }}
                    >
                      DNI {estado.turno.dni || "-"}
                    </Typography>
                  </Box>
                ) : (
                  <Typography
                    sx={{
                      mt: 2.5,
                      color: "#6b7280",
                      fontWeight: 700,
                    }}
                  >
                    Sin turno activo en este momento.
                  </Typography>
                )}
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default Boxes;