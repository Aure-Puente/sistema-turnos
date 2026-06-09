//Importaciones:
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import PauseCircleRoundedIcon from "@mui/icons-material/PauseCircleRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import PersonOffRoundedIcon from "@mui/icons-material/PersonOffRounded";
import MeetingRoomRoundedIcon from "@mui/icons-material/MeetingRoomRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

//JSX:
const calcularSegundos = (inicio, fin) => {
  if (!inicio || !fin) return null;
  return Math.max(
    0,
    Math.floor((fin.getTime() - new Date(inicio).getTime()) / 1000)
  );
};

const formatearTiempo = (segundos) => {
  if (segundos === null || segundos === undefined) return "-";

  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;

  if (min <= 0) return `${seg}s`;

  return `${min}m ${seg}s`;
};

const ordenarAscPorFecha = (items) => {
  return [...items].sort(
    (a, b) => new Date(a.createdAtDate) - new Date(b.createdAtDate)
  );
};

const ordenarDescPorFecha = (items) => {
  return [...items].sort((a, b) => {
    const fechaA = new Date(a.llamadoAt || a.createdAtDate);
    const fechaB = new Date(b.llamadoAt || b.createdAtDate);
    return fechaB - fechaA;
  });
};

const Turnos = () => {
  const boxId = localStorage.getItem("boxId") || "box-1";
  const boxNombre = localStorage.getItem("boxNombre") || "Box 1";
  const operadorId = localStorage.getItem("uid") || "";
  const operadorNombre = localStorage.getItem("nombreCompleto") || "Operador";

  const [turnosEsperando, setTurnosEsperando] = useState([]);
  const [turnoActual, setTurnoActual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accionLoading, setAccionLoading] = useState(false);
  const [enPausa, setEnPausa] = useState(false);
  const [error, setError] = useState("");

  const hoy = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    const cargarEstadoBox = async () => {
      try {
        if (!operadorId) return;

        const usuarioRef = doc(db, "usuarios", operadorId);
        const usuarioSnap = await getDoc(usuarioRef);

        if (usuarioSnap.exists()) {
          const usuarioData = usuarioSnap.data();
          setEnPausa(usuarioData.estadoBox === "PAUSA");
        }
      } catch (error) {
        console.error("Error cargando estado del box:", error);
      }
    };

    cargarEstadoBox();
  }, [operadorId]);

  useEffect(() => {
    const q = query(
      collection(db, "turnos"),
      where("fechaKey", "==", hoy),
      where("estado", "==", "esperando")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }));

        setTurnosEsperando(ordenarAscPorFecha(data));
        setLoading(false);
      },
      (error) => {
        console.error("Error escuchando turnos esperando:", error);
        setError("No se pudieron cargar los turnos en espera.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [hoy]);

  useEffect(() => {
    const q = query(
      collection(db, "turnos"),
      where("fechaKey", "==", hoy),
      where("boxId", "==", boxId),
      where("estado", "in", ["llamado", "atendiendo"])
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setTurnoActual(null);
          return;
        }

        const data = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }));

        setTurnoActual(ordenarDescPorFecha(data)[0]);
      },
      (error) => {
        console.error("Error escuchando turno actual:", error);
        setError("No se pudo cargar el turno actual.");
      }
    );

    return () => unsubscribe();
  }, [boxId, hoy]);

  const handleLlamarSiguiente = async () => {
    try {
      setError("");

      if (enPausa) {
        setError("No podés llamar turnos mientras el box está en pausa.");
        return;
      }

      if (turnoActual) {
        setError("Primero resolvé el turno actual antes de llamar otro.");
        return;
      }

      setAccionLoading(true);

      const q = query(
        collection(db, "turnos"),
        where("fechaKey", "==", hoy),
        where("estado", "==", "esperando")
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError("No hay turnos esperando en este momento.");
        return;
      }

      const turnosOrdenados = snapshot.docs.sort((a, b) => {
        return (
          new Date(a.data().createdAtDate) - new Date(b.data().createdAtDate)
        );
      });

      const turnoDoc = turnosOrdenados[0];
      const turno = turnoDoc.data();
      const ahora = new Date();

      const tiempoEsperaSegundos = calcularSegundos(turno.createdAtDate, ahora);

      await updateDoc(doc(db, "turnos", turnoDoc.id), {
        estado: "llamado",
        boxId,
        boxNombre,
        operadorId,
        operadorNombre,
        llamadoAt: ahora.toISOString(),
        tiempoEsperaSegundos,
      });
    } catch (error) {
      console.error("Error llamando siguiente turno:", error);
      setError("No se pudo llamar al siguiente turno.");
    } finally {
      setAccionLoading(false);
    }
  };

  const handleIniciarAtencion = async () => {
    try {
      setError("");

      if (!turnoActual) return;

      setAccionLoading(true);

      const ahora = new Date();

      await updateDoc(doc(db, "turnos", turnoActual.id), {
        estado: "atendiendo",
        atendidoAt: ahora.toISOString(),
      });
    } catch (error) {
      console.error("Error iniciando atención:", error);
      setError("No se pudo iniciar la atención.");
    } finally {
      setAccionLoading(false);
    }
  };

  const handleNoSePresento = async () => {
    try {
      setError("");

      if (!turnoActual) return;

      setAccionLoading(true);

      const ahora = new Date();

      const tiempoTotalSegundos = calcularSegundos(
        turnoActual.createdAtDate,
        ahora
      );

      await updateDoc(doc(db, "turnos", turnoActual.id), {
        estado: "ausente",
        ausenteAt: ahora.toISOString(),
        finalizadoAt: ahora.toISOString(),
        tiempoTotalSegundos,
        observacionCierre: "No se presentó",
      });
    } catch (error) {
      console.error("Error marcando ausente:", error);
      setError("No se pudo marcar el turno como ausente.");
    } finally {
      setAccionLoading(false);
    }
  };

  const handleFinalizarAtencion = async () => {
    try {
      setError("");

      if (!turnoActual) return;

      setAccionLoading(true);

      const ahora = new Date();

      const tiempoAtencionSegundos = calcularSegundos(
        turnoActual.atendidoAt || turnoActual.llamadoAt,
        ahora
      );

      const tiempoTotalSegundos = calcularSegundos(
        turnoActual.createdAtDate,
        ahora
      );

      await updateDoc(doc(db, "turnos", turnoActual.id), {
        estado: "finalizado",
        finalizadoAt: ahora.toISOString(),
        tiempoAtencionSegundos,
        tiempoTotalSegundos,
      });
    } catch (error) {
      console.error("Error finalizando atención:", error);
      setError("No se pudo finalizar la atención.");
    } finally {
      setAccionLoading(false);
    }
  };

  const handleTogglePausa = async () => {
    try {
      setError("");

      if (turnoActual) {
        setError("No podés pausar el box mientras tenés un turno activo.");
        return;
      }

      if (!operadorId) {
        setError("No se pudo identificar el usuario del box.");
        return;
      }

      setAccionLoading(true);

      const nuevoEnPausa = !enPausa;
      const nuevoEstadoBox = nuevoEnPausa ? "PAUSA" : "DISPONIBLE";
      const ahora = new Date();

      await updateDoc(doc(db, "usuarios", operadorId), {
        estadoBox: nuevoEstadoBox,
        pausadoAt: nuevoEnPausa ? ahora.toISOString() : null,
        disponibleAt: !nuevoEnPausa ? ahora.toISOString() : null,
      });

      setEnPausa(nuevoEnPausa);
    } catch (error) {
      console.error("Error cambiando estado de pausa:", error);
      setError("No se pudo cambiar el estado del box.");
    } finally {
      setAccionLoading(false);
    }
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
            Gestión de turnos
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
            Llamá, atendé y resolvé los turnos asignados a tu box.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          sx={{
            justifyContent: { xs: "flex-start", md: "flex-end" },
          }}
        >
          <Chip
            icon={<MeetingRoomRoundedIcon />}
            label={boxNombre}
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
            label={enPausa ? "Box en pausa" : "Disponible"}
            variant="outlined"
            sx={{
              height: 34,
              borderRadius: "999px",
              fontWeight: 700,
              color: enPausa ? "#92400e" : "#166534",
              borderColor: enPausa
                ? "rgba(217, 119, 6, 0.28)"
                : "rgba(22, 101, 52, 0.24)",
              backgroundColor: enPausa
                ? "rgba(245, 158, 11, 0.08)"
                : "rgba(22, 163, 74, 0.08)",
            }}
          />
        </Stack>
      </Stack>

      {error && (
        <Alert
          severity="warning"
          sx={{
            borderRadius: "18px",
            mb: 2.5,
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

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 1.18fr) minmax(340px, 0.82fr)",
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
            backgroundColor: "#ffffff",
            boxShadow: "0 18px 45px rgba(15, 23, 42, 0.045)",
            p: { xs: 2.2, sm: 2.6, md: 3.2 },
            minHeight: { xs: "auto", lg: 460 },
            overflow: "hidden",
          }}
        >
          <Stack spacing={{ xs: 2.2, md: 2.7 }}>
            <Stack
              direction="row"
              alignItems="flex-start"
              justifyContent="space-between"
              spacing={2}
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
                  Turno actual
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
                  Se mostrará en la pantalla principal cuando sea llamado.
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

            <Divider sx={{ borderColor: "rgba(15, 23, 42, 0.08)" }} />

            {turnoActual ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: { xs: 1, md: 1.5 },
                }}
              >
                <Typography
                  sx={{
                    color: "primary.main",
                    fontSize: {
                      xs: "3.8rem",
                      sm: "4.5rem",
                      md: "5.2rem",
                      xl: "5.7rem",
                    },
                    fontWeight: 800,
                    lineHeight: 0.95,
                    letterSpacing: { xs: "-2px", md: "-3px" },
                  }}
                >
                  {turnoActual.numero}
                </Typography>

                <Typography
                  sx={{
                    color: "#111827",
                    fontSize: { xs: "1.16rem", md: "1.38rem" },
                    fontWeight: 750,
                    mt: 1.7,
                    lineHeight: 1.2,
                  }}
                >
                  {turnoActual.tipoConsultaLabel || "Consulta"}
                </Typography>

                <Typography
                  sx={{
                    color: "#64748b",
                    fontSize: "0.94rem",
                    fontWeight: 600,
                    mt: 0.7,
                  }}
                >
                  DNI {turnoActual.dni || "-"}
                </Typography>

                <Stack
                  direction="row"
                  justifyContent="center"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mt: 2.2 }}
                >
                  <Chip
                    label={
                      turnoActual.estado === "atendiendo"
                        ? "En atención"
                        : "Llamado"
                    }
                    sx={{
                      height: 32,
                      borderRadius: "999px",
                      fontWeight: 700,
                      color: "#ffffff",
                      backgroundColor: "primary.main",
                    }}
                  />

                  <Chip
                    icon={<AccessTimeRoundedIcon />}
                    label={`Espera: ${formatearTiempo(
                      turnoActual.tiempoEsperaSegundos
                    )}`}
                    variant="outlined"
                    sx={{
                      height: 32,
                      borderRadius: "999px",
                      fontWeight: 700,
                      color: "#475569",
                      borderColor: "rgba(15, 23, 42, 0.12)",
                      "& .MuiChip-icon": {
                        color: "#64748b",
                        fontSize: 17,
                      },
                    }}
                  />
                </Stack>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.2}
                  justifyContent="center"
                  sx={{ mt: { xs: 3, md: 3.4 } }}
                >
                  {turnoActual.estado === "llamado" && (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<PlayArrowRoundedIcon />}
                        onClick={handleIniciarAtencion}
                        disabled={accionLoading}
                        sx={{
                          minHeight: 50,
                          borderRadius: "16px",
                          px: 2.6,
                          fontWeight: 800,
                          textTransform: "none",
                          boxShadow: "0 12px 26px rgba(165, 4, 84, 0.18)",
                          "&:hover": {
                            boxShadow: "0 12px 26px rgba(165, 4, 84, 0.18)",
                          },
                          "&.Mui-disabled": {
                            backgroundColor: "#e5e7eb",
                            color: "#9ca3af",
                            boxShadow: "none",
                          },
                        }}
                      >
                        Iniciar atención
                      </Button>

                      <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<PersonOffRoundedIcon />}
                        onClick={handleNoSePresento}
                        disabled={accionLoading}
                        sx={{
                          minHeight: 50,
                          borderRadius: "16px",
                          px: 2.6,
                          fontWeight: 750,
                          textTransform: "none",
                          backgroundColor: "#ffffff",
                          "&.Mui-disabled": {
                            borderColor: "#e5e7eb",
                            color: "#9ca3af",
                            backgroundColor: "#ffffff",
                          },
                        }}
                      >
                        No se presentó
                      </Button>
                    </>
                  )}

                  {turnoActual.estado === "atendiendo" && (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<DoneRoundedIcon />}
                      onClick={handleFinalizarAtencion}
                      disabled={accionLoading}
                      sx={{
                        minHeight: 52,
                        borderRadius: "16px",
                        px: 3,
                        fontWeight: 800,
                        textTransform: "none",
                        boxShadow: "0 12px 26px rgba(165, 4, 84, 0.18)",
                        "&:hover": {
                          boxShadow: "0 12px 26px rgba(165, 4, 84, 0.18)",
                        },
                        "&.Mui-disabled": {
                          backgroundColor: "#e5e7eb",
                          color: "#9ca3af",
                          boxShadow: "none",
                        },
                      }}
                    >
                      Finalizar atención
                    </Button>
                  )}
                </Stack>
              </Box>
            ) : (
              <Box
                sx={{
                  minHeight: { xs: 230, md: 255 },
                  borderRadius: "22px",
                  background:
                    "linear-gradient(135deg, rgba(248, 250, 252, 0.95), rgba(255, 255, 255, 0.95))",
                  border: "1px dashed rgba(100, 116, 139, 0.30)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  p: { xs: 2.2, md: 3 },
                }}
              >
                <Box
                  sx={{
                    width: 74,
                    height: 74,
                    borderRadius: "24px",
                    backgroundColor: "rgba(165, 4, 84, 0.07)",
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <ConfirmationNumberRoundedIcon sx={{ fontSize: 42 }} />
                </Box>

                <Typography
                  sx={{
                    color: "#111827",
                    fontSize: { xs: "1.25rem", md: "1.4rem" },
                    fontWeight: 800,
                  }}
                >
                  No hay turno activo
                </Typography>

                <Typography
                  sx={{
                    color: "#64748b",
                    mt: 0.8,
                    maxWidth: 360,
                    lineHeight: 1.45,
                    fontWeight: 500,
                  }}
                >
                  Cuando estés listo, llamá al siguiente turno disponible.
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                pt: turnoActual ? { xs: 1.2, md: 1.5 } : 0,
                mt: turnoActual ? { xs: 1, md: 1.2 } : 0,
                borderTop: turnoActual
                  ? "1px solid rgba(15, 23, 42, 0.08)"
                  : "none",
              }}
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<CampaignRoundedIcon />}
                  onClick={handleLlamarSiguiente}
                  disabled={accionLoading || enPausa || Boolean(turnoActual)}
                  sx={{
                    height: { xs: 54, md: 56 },
                    borderRadius: "17px",
                    fontWeight: 800,
                    textTransform: "none",
                    boxShadow: "0 14px 28px rgba(165, 4, 84, 0.18)",
                    "&:hover": {
                      boxShadow: "0 14px 28px rgba(165, 4, 84, 0.18)",
                    },
                    "&.Mui-disabled": {
                      backgroundColor: "#e5e7eb",
                      color: "#9ca3af",
                      boxShadow: "none",
                    },
                  }}
                >
                  {accionLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Llamar siguiente"
                  )}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color={enPausa ? "success" : "warning"}
                  startIcon={
                    enPausa ? (
                      <RestartAltRoundedIcon />
                    ) : (
                      <PauseCircleRoundedIcon />
                    )
                  }
                  onClick={handleTogglePausa}
                  disabled={accionLoading || Boolean(turnoActual)}
                  sx={{
                    height: { xs: 54, md: 56 },
                    borderRadius: "17px",
                    fontWeight: 750,
                    textTransform: "none",
                    backgroundColor: "#ffffff",
                    "&.Mui-disabled": {
                      borderColor: "#e5e7eb",
                      color: "#9ca3af",
                      backgroundColor: "#ffffff",
                    },
                  }}
                >
                  {enPausa ? "Volver disponible" : "Pausar box"}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            borderRadius: { xs: "22px", md: "26px" },
            border: "1px solid rgba(15, 23, 42, 0.08)",
            backgroundColor: "#ffffff",
            boxShadow: "0 18px 45px rgba(15, 23, 42, 0.045)",
            p: { xs: 2.2, sm: 2.6, md: 3.2 },
            minHeight: { xs: "auto", lg: 460 },
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
                  fontSize: { xs: "1.18rem", md: "1.32rem" },
                  fontWeight: 800,
                  letterSpacing: "-0.2px",
                }}
              >
                Cola de espera
              </Typography>

              <Typography
                sx={{
                  color: "#64748b",
                  mt: 0.4,
                  fontSize: "0.92rem",
                  fontWeight: 500,
                }}
              >
                Próximos turnos disponibles
              </Typography>
            </Box>

            <Chip
              label={`${turnosEsperando.length} esperando`}
              variant="outlined"
              sx={{
                height: 32,
                borderRadius: "999px",
                fontWeight: 700,
                color: "primary.main",
                borderColor: "rgba(165, 4, 84, 0.20)",
                backgroundColor: "rgba(165, 4, 84, 0.04)",
                flexShrink: 0,
              }}
            />
          </Stack>

          <Divider sx={{ borderColor: "rgba(15, 23, 42, 0.08)", mb: 2 }} />

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 5,
                flex: 1,
              }}
            >
              <CircularProgress />
            </Box>
          ) : turnosEsperando.length === 0 ? (
            <Box
              sx={{
                borderRadius: "20px",
                backgroundColor: "#f8fafc",
                border: "1px solid rgba(15, 23, 42, 0.07)",
                p: 2.4,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  color: "#111827",
                  fontWeight: 750,
                  mb: 0.5,
                }}
              >
                No hay turnos esperando
              </Typography>

              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: "0.92rem",
                  fontWeight: 500,
                }}
              >
                La cola se actualizará automáticamente.
              </Typography>
            </Box>
          ) : (
            <Stack
              spacing={1.2}
              sx={{
                flex: 1,
                overflowY: "auto",
                pr: { lg: 0.5 },
                maxHeight: {
                  xs: "none",
                  lg: "calc(100vh - 250px)",
                },
              }}
            >
              {turnosEsperando.slice(0, 8).map((turno, index) => (
                <Box
                  key={turno.id}
                  sx={{
                    p: { xs: 1.6, md: 1.8 },
                    borderRadius: "18px",
                    border:
                      index === 0
                        ? "1px solid rgba(165, 4, 84, 0.18)"
                        : "1px solid rgba(15, 23, 42, 0.07)",
                    backgroundColor:
                      index === 0 ? "rgba(165, 4, 84, 0.045)" : "#f8fafc",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1.5,
                    transition: "all 0.18s ease",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.4}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "14px",
                        backgroundColor:
                          index === 0 ? "primary.main" : "#ffffff",
                        color: index === 0 ? "#ffffff" : "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "0.86rem",
                        border:
                          index === 0
                            ? "none"
                            : "1px solid rgba(165, 4, 84, 0.12)",
                        flexShrink: 0,
                      }}
                    >
                      {index + 1}
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          color: index === 0 ? "primary.main" : "#111827",
                          fontSize: { xs: "1.35rem", md: "1.5rem" },
                          fontWeight: 800,
                          lineHeight: 1,
                          letterSpacing: "-0.7px",
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
                          maxWidth: { xs: 170, sm: 260, lg: 180, xl: 260 },
                        }}
                      >
                        {turno.tipoConsultaLabel || "Consulta"}
                      </Typography>
                    </Box>
                  </Stack>

                  {index === 0 && (
                    <Chip
                      label="Siguiente"
                      sx={{
                        height: 28,
                        borderRadius: "999px",
                        fontWeight: 700,
                        color: "primary.main",
                        backgroundColor: "rgba(165, 4, 84, 0.09)",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Turnos;