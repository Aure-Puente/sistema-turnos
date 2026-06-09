import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Stack,
  Button,
  Alert,
} from "@mui/material";

import TvRoundedIcon from "@mui/icons-material/TvRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import PersonOffRoundedIcon from "@mui/icons-material/PersonOffRounded";

import { collection, onSnapshot, query, where } from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";

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

  const turnoPrincipal =
    turnosLlamados.find(
      (turno) => turno.estado === "llamado" || turno.estado === "atendiendo"
    ) || null;

  const ultimosTurnos = useMemo(() => {
    return turnosLlamados
      .filter((turno) => turno.id !== turnoPrincipal?.id)
      .slice(0, 5);
  }, [turnosLlamados, turnoPrincipal]);

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
            Pantalla en vivo
          </Typography>

          <Typography sx={{ color: "#6b7280", mt: 0.8 }}>
            Vista previa de la pantalla principal, últimos llamados y próximos
            turnos.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<OpenInNewRoundedIcon />}
          onClick={() => window.open("/pantalla", "_blank")}
          sx={{
            borderRadius: "14px",
            px: 3,
            py: 1.2,
            fontWeight: 800,
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          }}
        >
          Abrir pantalla grande
        </Button>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.2fr 1fr" },
          gap: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            borderRadius: "24px",
            border: "1px solid #ececef",
            p: { xs: 3, md: 4 },
            minHeight: 380,
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {loadingLlamados ? (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : turnoPrincipal ? (
            <Box sx={{ textAlign: "center" }}>
              <CampaignRoundedIcon
                sx={{ fontSize: 70, color: "primary.main", mb: 2 }}
              />

              <Typography
                sx={{
                  color: "#6b7280",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                Turno actual
              </Typography>

              <Typography
                sx={{
                  color: "primary.main",
                  fontSize: { xs: "4.5rem", md: "6rem" },
                  fontWeight: 950,
                  lineHeight: 0.95,
                  letterSpacing: "-3px",
                }}
              >
                {turnoPrincipal.numero}
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="center"
                sx={{
                  mt: 2,
                  color: "primary.main",
                }}
              >
                <BadgeRoundedIcon />

                <Typography
                  sx={{
                    color: "primary.main",
                    fontSize: "1.35rem",
                    fontWeight: 900,
                  }}
                >
                  DNI {turnoPrincipal.dni || "-"}
                </Typography>
              </Stack>

              <Typography
                sx={{
                  color: "#111827",
                  fontSize: { xs: "1.8rem", md: "2.4rem" },
                  fontWeight: 900,
                  mt: 2,
                }}
              >
                {turnoPrincipal.boxNombre || "Box asignado"}
              </Typography>

              <Typography sx={{ color: "#6b7280", fontSize: "1rem", mt: 1 }}>
                {turnoPrincipal.tipoConsultaLabel || "Consulta"}
              </Typography>

              <Chip
                label={getEstadoLabel(turnoPrincipal.estado)}
                color="primary"
                sx={{
                  mt: 2.5,
                  height: 40,
                  px: 1.5,
                  borderRadius: "999px",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                }}
              />
            </Box>
          ) : (
            <Box sx={{ textAlign: "center" }}>
              <TvRoundedIcon
                sx={{
                  fontSize: 72,
                  color: "primary.main",
                  mb: 2,
                  opacity: 0.9,
                }}
              />

              <Typography
                sx={{
                  color: "primary.main",
                  fontSize: "1.8rem",
                  fontWeight: 900,
                }}
              >
                Aguardando llamados
              </Typography>

              <Typography
                sx={{
                  color: "#6b7280",
                  mt: 1,
                  maxWidth: 520,
                  mx: "auto",
                }}
              >
                Cuando un box llame a un turno, aparecerá automáticamente en
                esta vista y en la pantalla grande.
              </Typography>
            </Box>
          )}
        </Paper>

        <Stack spacing={3}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: "24px",
              border: "1px solid #ececef",
              p: { xs: 3, md: 4 },
              backgroundColor: "#ffffff",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 2.5 }}
            >
              <Typography
                sx={{
                  color: "primary.main",
                  fontSize: "1.35rem",
                  fontWeight: 900,
                }}
              >
                Últimos llamados
              </Typography>

              <Chip
                label={`${turnosLlamados.length} registros`}
                variant="outlined"
                color="primary"
                sx={{ fontWeight: 800 }}
              />
            </Stack>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : ultimosTurnos.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: "14px" }}>
                Todavía no hay otros turnos llamados.
              </Alert>
            ) : (
              <Stack spacing={1.4}>
                {ultimosTurnos.map((turno) => (
                  <Box
                    key={turno.id}
                    sx={{
                      p: 2,
                      borderRadius: "18px",
                      border: "1px solid #ececef",
                      backgroundColor:
                        turno.estado === "ausente" ? "#fff7ed" : "#fafafa",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          color:
                            turno.estado === "ausente"
                              ? "#9a3412"
                              : "primary.main",
                          fontSize: "1.8rem",
                          fontWeight: 950,
                          lineHeight: 1,
                        }}
                      >
                        {turno.numero}
                      </Typography>

                      <Typography
                        sx={{
                          color: "#111827",
                          fontSize: "0.95rem",
                          mt: 0.6,
                          fontWeight: 800,
                        }}
                      >
                        DNI {turno.dni || "-"}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: "right" }}>
                      <Typography
                        sx={{
                          color: "#111827",
                          fontSize: "1.05rem",
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
                        color={
                          turno.estado === "ausente" ? "warning" : "primary"
                        }
                        variant={
                          turno.estado === "ausente" ? "outlined" : "filled"
                        }
                        sx={{ mt: 0.8, fontWeight: 700 }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>

          <Paper
            elevation={0}
            sx={{
              borderRadius: "24px",
              border: "1px solid #ececef",
              p: { xs: 3, md: 4 },
              backgroundColor: "#ffffff",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 2.5 }}
            >
              <Typography
                sx={{
                  color: "primary.main",
                  fontSize: "1.35rem",
                  fontWeight: 900,
                }}
              >
                Próximos turnos
              </Typography>

              <Chip
                label={`${turnosEsperando.length} esperando`}
                variant="outlined"
                color="primary"
                sx={{ fontWeight: 800 }}
              />
            </Stack>

            {loadingEsperando ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : proximosTurnos.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: "14px" }}>
                No hay turnos esperando.
              </Alert>
            ) : (
              <Stack spacing={1.4}>
                {proximosTurnos.map((turno, index) => (
                  <Box
                    key={turno.id}
                    sx={{
                      p: 2,
                      borderRadius: "18px",
                      border: "1px solid #ececef",
                      backgroundColor:
                        index === 0 ? "rgba(165, 4, 84, 0.06)" : "#fafafa",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          color: "primary.main",
                          fontSize: "1.8rem",
                          fontWeight: 950,
                          lineHeight: 1,
                        }}
                      >
                        {turno.numero}
                      </Typography>

                      <Typography
                        sx={{
                          color: "#111827",
                          fontSize: "0.95rem",
                          mt: 0.6,
                          fontWeight: 800,
                        }}
                      >
                        DNI {turno.dni || "-"}
                      </Typography>
                    </Box>

                    {index === 0 && (
                      <Chip
                        size="small"
                        label="Siguiente"
                        color="primary"
                        sx={{ fontWeight: 800 }}
                      />
                    )}
                  </Box>
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