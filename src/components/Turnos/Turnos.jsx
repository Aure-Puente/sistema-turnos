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

import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";

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
          new Date(a.data().createdAtDate) -
          new Date(b.data().createdAtDate)
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
            Gestión de turnos
          </Typography>

          <Typography sx={{ color: "#6b7280", mt: 0.8 }}>
            Llamá, atendé, finalizá o marcá ausente al turno asignado.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            label={boxNombre}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 800 }}
          />

          <Chip
            label={enPausa ? "En pausa" : "Disponible"}
            color={enPausa ? "warning" : "success"}
            variant="outlined"
            sx={{ fontWeight: 800 }}
          />
        </Stack>
      </Stack>

      {error && (
        <Alert severity="warning" sx={{ borderRadius: "14px", mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.25fr 1fr" },
          gap: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            borderRadius: "24px",
            border: "1px solid #ececef",
            backgroundColor: "#ffffff",
            p: { xs: 3, md: 4 },
            minHeight: 420,
          }}
        >
          <Stack spacing={3}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  sx={{
                    color: "primary.main",
                    fontSize: "1.4rem",
                    fontWeight: 900,
                  }}
                >
                  Turno actual
                </Typography>

                <Typography sx={{ color: "#6b7280", mt: 0.5 }}>
                  Este turno se muestra en la pantalla principal.
                </Typography>
              </Box>

              <CampaignRoundedIcon
                sx={{ color: "primary.main", fontSize: 42 }}
              />
            </Stack>

            <Divider />

            {turnoActual ? (
              <Box sx={{ textAlign: "center", py: 2 }}>
                <Typography
                  sx={{
                    color: "primary.main",
                    fontSize: { xs: "4.5rem", md: "6rem" },
                    fontWeight: 950,
                    lineHeight: 0.95,
                    letterSpacing: "-3px",
                  }}
                >
                  {turnoActual.numero}
                </Typography>

                <Typography
                  sx={{
                    color: "#111827",
                    fontSize: { xs: "1.4rem", md: "1.8rem" },
                    fontWeight: 900,
                    mt: 2,
                  }}
                >
                  {turnoActual.tipoConsultaLabel || "Consulta"}
                </Typography>

                <Typography
                  sx={{
                    color: "#6b7280",
                    fontSize: "1rem",
                    fontWeight: 700,
                    mt: 0.8,
                  }}
                >
                  DNI {turnoActual.dni || "-"}
                </Typography>

                <Stack
                  direction="row"
                  justifyContent="center"
                  spacing={1}
                  flexWrap="wrap"
                  sx={{ mt: 2 }}
                >
                  <Chip
                    label={
                      turnoActual.estado === "atendiendo"
                        ? "En atención"
                        : "Llamado"
                    }
                    color="primary"
                    sx={{ fontWeight: 800 }}
                  />

                  <Chip
                    label={`Espera: ${formatearTiempo(
                      turnoActual.tiempoEsperaSegundos
                    )}`}
                    variant="outlined"
                    sx={{ fontWeight: 800 }}
                  />
                </Stack>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  justifyContent="center"
                  sx={{ mt: 4 }}
                >
                  {turnoActual.estado === "llamado" && (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<PlayArrowRoundedIcon />}
                        onClick={handleIniciarAtencion}
                        disabled={accionLoading}
                        sx={{
                          borderRadius: "14px",
                          px: 3,
                          py: 1.3,
                          fontWeight: 900,
                          boxShadow: "none",
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
                          borderRadius: "14px",
                          px: 3,
                          py: 1.3,
                          fontWeight: 900,
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
                        borderRadius: "14px",
                        px: 3,
                        py: 1.3,
                        fontWeight: 900,
                        boxShadow: "none",
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
                  minHeight: 260,
                  borderRadius: "22px",
                  backgroundColor: "#fafafa",
                  border: "1px dashed #d1d5db",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  p: 3,
                }}
              >
                <ConfirmationNumberRoundedIcon
                  sx={{ fontSize: 76, color: "primary.main", mb: 2 }}
                />

                <Typography
                  sx={{
                    color: "primary.main",
                    fontSize: "1.5rem",
                    fontWeight: 900,
                  }}
                >
                  No hay turno activo
                </Typography>

                <Typography sx={{ color: "#6b7280", mt: 1 }}>
                  Llamá al siguiente turno cuando estés disponible.
                </Typography>
              </Box>
            )}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<CampaignRoundedIcon />}
                onClick={handleLlamarSiguiente}
                disabled={accionLoading || enPausa || Boolean(turnoActual)}
                sx={{
                  height: 58,
                  borderRadius: "16px",
                  fontWeight: 900,
                  boxShadow: "none",
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
                onClick={() => setEnPausa((prev) => !prev)}
                disabled={accionLoading || Boolean(turnoActual)}
                sx={{
                  height: 58,
                  borderRadius: "16px",
                  fontWeight: 900,
                }}
              >
                {enPausa ? "Volver disponible" : "Pausar box"}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            borderRadius: "24px",
            border: "1px solid #ececef",
            backgroundColor: "#ffffff",
            p: { xs: 3, md: 4 },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Typography
              sx={{
                color: "primary.main",
                fontSize: "1.35rem",
                fontWeight: 900,
              }}
            >
              Cola de espera
            </Typography>

            <Chip
              label={`${turnosEsperando.length} esperando`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 800 }}
            />
          </Stack>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress />
            </Box>
          ) : turnosEsperando.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: "14px" }}>
              No hay turnos esperando.
            </Alert>
          ) : (
            <Stack spacing={1.5}>
              {turnosEsperando.slice(0, 8).map((turno, index) => (
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
                        fontSize: "1.7rem",
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
                        fontWeight: 600,
                        mt: 0.6,
                      }}
                    >
                      {turno.tipoConsultaLabel || "Consulta"}
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
              ))}
            </Stack>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Turnos;