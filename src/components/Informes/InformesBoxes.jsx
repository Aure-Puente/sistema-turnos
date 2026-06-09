//Importaciones:
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PersonOffRoundedIcon from "@mui/icons-material/PersonOffRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { db } from "../../firebase/firebaseConfig";

//JSX:
dayjs.locale("es");

const COLORS = ["#a50454", "#16a34a", "#f59e0b", "#64748b", "#2563eb"];

const average = (values) => {
  const valid = values.filter(
    (v) => v !== null && v !== undefined && !Number.isNaN(v)
  );

  if (!valid.length) return null;

  return valid.reduce((acc, value) => acc + value, 0) / valid.length;
};

const formatSeconds = (seconds) => {
  if (seconds === null || seconds === undefined) return "-";

  const min = Math.floor(seconds / 60);
  const seg = Math.round(seconds % 60);

  if (min <= 0) return `${seg}s`;

  return `${min}m ${seg}s`;
};

const groupCount = (items, keyGetter) => {
  const map = {};

  items.forEach((item) => {
    const key = keyGetter(item) || "Sin datos";
    map[key] = (map[key] || 0) + 1;
  });

  return Object.entries(map)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value);
};

const getFechaKey = (date) => {
  if (!date) return "";
  return dayjs(date).format("YYYY-MM-DD");
};

const getConsultaLabel = (turno) => {
  return turno.tipoConsultaLabel || turno.tipoConsulta || "Sin datos";
};

const StatCard = ({ icon, title, value, subtitle }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: { xs: "20px", md: "22px" },
        border: "1px solid rgba(15, 23, 42, 0.08)",
        backgroundColor: "#ffffff",
        boxShadow: "0 14px 34px rgba(15, 23, 42, 0.04)",
        p: { xs: 2, md: 2.3 },
        minHeight: { xs: 128, md: 138 },
      }}
    >
      <Stack direction="row" spacing={1.7} alignItems="flex-start">
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: "16px",
            backgroundColor: "rgba(165, 4, 84, 0.075)",
            color: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            "& svg": {
              fontSize: 26,
            },
          }}
        >
          {icon}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              color: "#64748b",
              fontSize: "0.86rem",
              fontWeight: 650,
              mb: 0.6,
              lineHeight: 1.25,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              color: "#111827",
              fontSize: { xs: "1.65rem", md: "1.75rem" },
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.6px",
            }}
          >
            {value}
          </Typography>

          {subtitle && (
            <Typography
              sx={{
                color: "#64748b",
                fontSize: "0.82rem",
                mt: 0.9,
                lineHeight: 1.35,
                fontWeight: 500,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
};

const ChartCard = ({ title, subtitle, children }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: { xs: "22px", md: "26px" },
        border: "1px solid rgba(15, 23, 42, 0.08)",
        backgroundColor: "#ffffff",
        boxShadow: "0 18px 45px rgba(15, 23, 42, 0.045)",
        p: { xs: 2.2, sm: 2.6, md: 3 },
        minHeight: { xs: 330, md: 355 },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography
          sx={{
            color: "#111827",
            fontSize: { xs: "1.12rem", md: "1.25rem" },
            fontWeight: 800,
            letterSpacing: "-0.2px",
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            sx={{
              color: "#64748b",
              fontSize: "0.9rem",
              mt: 0.4,
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      <Box sx={{ width: "100%", height: { xs: 245, md: 260 }, flex: 1 }}>
        {children}
      </Box>
    </Paper>
  );
};

const EmptyCard = ({ title, subtitle }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "24px",
        border: "1px solid rgba(15, 23, 42, 0.08)",
        backgroundColor: "#ffffff",
        minHeight: 280,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        p: 3,
      }}
    >
      <Box>
        <Box
          sx={{
            width: 70,
            height: 70,
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
          <AssessmentRoundedIcon sx={{ fontSize: 38 }} />
        </Box>

        <Typography
          sx={{
            color: "#111827",
            fontWeight: 800,
            fontSize: "1.2rem",
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            color: "#64748b",
            fontSize: "0.95rem",
            fontWeight: 500,
            mt: 0.7,
            maxWidth: 380,
          }}
        >
          {subtitle}
        </Typography>
      </Box>
    </Paper>
  );
};

const InformesBoxes = () => {
  const boxId = localStorage.getItem("boxId") || "";
  const boxNombre = localStorage.getItem("boxNombre") || "Mi box";

  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [fechaSeleccionada, setFechaSeleccionada] = useState(dayjs());
  const [motivoSeleccionado, setMotivoSeleccionado] = useState("todos");

  useEffect(() => {
    if (!boxId) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "turnos"), where("boxId", "==", boxId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTurnos(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error cargando informes del box:", error);
        setError("No se pudieron cargar los informes.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [boxId]);

  const fechaKey = useMemo(
    () => getFechaKey(fechaSeleccionada),
    [fechaSeleccionada]
  );

  const filtrosActivos = useMemo(() => {
    const hoyKey = dayjs().format("YYYY-MM-DD");
    return fechaKey !== hoyKey || motivoSeleccionado !== "todos";
  }, [fechaKey, motivoSeleccionado]);

  const handleQuitarFiltros = () => {
    setFechaSeleccionada(dayjs());
    setMotivoSeleccionado("todos");
  };

  const turnosPorFecha = useMemo(() => {
    return turnos.filter((turno) => turno.fechaKey === fechaKey);
  }, [turnos, fechaKey]);

  const motivosDisponibles = useMemo(() => {
    const values = Array.from(
      new Set(turnosPorFecha.map((turno) => getConsultaLabel(turno)))
    ).filter(Boolean);

    return values.sort((a, b) => a.localeCompare(b));
  }, [turnosPorFecha]);

  const turnosFiltrados = useMemo(() => {
    if (motivoSeleccionado === "todos") return turnosPorFecha;

    return turnosPorFecha.filter(
      (turno) => getConsultaLabel(turno) === motivoSeleccionado
    );
  }, [turnosPorFecha, motivoSeleccionado]);

  const stats = useMemo(() => {
    const total = turnosFiltrados.length;

    const finalizados = turnosFiltrados.filter(
      (turno) => turno.estado === "finalizado"
    ).length;

    const ausentes = turnosFiltrados.filter(
      (turno) => turno.estado === "ausente"
    ).length;

    const activos = turnosFiltrados.filter((turno) =>
      ["esperando", "llamado", "atendiendo"].includes(turno.estado)
    ).length;

    const promedioEspera = average(
      turnosFiltrados.map((turno) => turno.tiempoEsperaSegundos)
    );

    const promedioAtencion = average(
      turnosFiltrados.map((turno) => turno.tiempoAtencionSegundos)
    );

    return {
      total,
      finalizados,
      ausentes,
      activos,
      promedioEspera,
      promedioAtencion,
    };
  }, [turnosFiltrados]);

  const estadosData = useMemo(() => {
    return [
      {
        name: "Atendidos",
        value: turnosFiltrados.filter((t) => t.estado === "finalizado").length,
      },
      {
        name: "Ausentes",
        value: turnosFiltrados.filter((t) => t.estado === "ausente").length,
      },
      {
        name: "Activos",
        value: turnosFiltrados.filter((t) =>
          ["esperando", "llamado", "atendiendo"].includes(t.estado)
        ).length,
      },
    ].filter((item) => item.value > 0);
  }, [turnosFiltrados]);

  const consultasData = useMemo(() => {
    return groupCount(turnosFiltrados, (turno) => getConsultaLabel(turno));
  }, [turnosFiltrados]);

  const hasData = turnosFiltrados.length > 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
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
                Mis informes
              </Typography>

              <Chip
                icon={<AssessmentRoundedIcon />}
                label={`${stats.total} turnos filtrados`}
                variant="outlined"
                sx={{
                  height: 32,
                  borderRadius: "999px",
                  fontWeight: 700,
                  color: stats.total > 0 ? "primary.main" : "#64748b",
                  borderColor:
                    stats.total > 0
                      ? "rgba(165, 4, 84, 0.20)"
                      : "rgba(15, 23, 42, 0.12)",
                  backgroundColor:
                    stats.total > 0 ? "rgba(165, 4, 84, 0.04)" : "#ffffff",
                  "& .MuiChip-icon": {
                    color: stats.total > 0 ? "primary.main" : "#64748b",
                    fontSize: 17,
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
              Estadísticas de atención del {boxNombre}.
            </Typography>
          </Box>
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

        <Paper
          elevation={0}
          sx={{
            borderRadius: { xs: "22px", md: "26px" },
            border: "1px solid rgba(15, 23, 42, 0.08)",
            backgroundColor: "#ffffff",
            boxShadow: "0 18px 45px rgba(15, 23, 42, 0.04)",
            p: { xs: 2.2, sm: 2.5, md: 2.8 },
            mb: { xs: 2.4, md: 3 },
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", lg: "center" }}
            spacing={2}
          >
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: "15px",
                    backgroundColor: "rgba(165, 4, 84, 0.07)",
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FilterAltRoundedIcon sx={{ fontSize: 24 }} />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      color: "#111827",
                      fontWeight: 800,
                      fontSize: { xs: "1.08rem", md: "1.18rem" },
                    }}
                  >
                    Filtros
                  </Typography>

                  <Typography
                    sx={{
                      color: "#64748b",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      mt: 0.2,
                    }}
                  >
                    Seleccioná un día y un motivo de atención.
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.4}
              sx={{
                width: { xs: "100%", lg: "auto" },
                minWidth: { lg: 650 },
              }}
            >
              <DatePicker
                label="Día"
                value={fechaSeleccionada}
                onChange={(newValue) => {
                  setFechaSeleccionada(newValue || dayjs());
                  setMotivoSeleccionado("todos");
                }}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    InputProps: {
                      startAdornment: (
                        <CalendarMonthRoundedIcon
                          sx={{
                            color: "#64748b",
                            fontSize: 20,
                            mr: 1,
                          }}
                        />
                      ),
                    },
                    sx: {
                      minWidth: { xs: "100%", sm: 210 },
                      "& .MuiOutlinedInput-root": {
                        height: 46,
                        borderRadius: "16px",
                        backgroundColor: "#ffffff",
                      },
                      "& .MuiInputLabel-root": {
                        fontWeight: 600,
                        color: "#64748b",
                      },
                    },
                  },
                }}
              />

              <FormControl
                fullWidth
                size="small"
                sx={{
                  minWidth: { xs: "100%", sm: 260 },
                  "& .MuiOutlinedInput-root": {
                    height: 46,
                    borderRadius: "16px",
                    backgroundColor: "#ffffff",
                  },
                  "& .MuiInputLabel-root": {
                    fontWeight: 600,
                    color: "#64748b",
                  },
                }}
              >
                <InputLabel>Motivo</InputLabel>

                <Select
                  label="Motivo"
                  value={motivoSeleccionado}
                  onChange={(e) => setMotivoSeleccionado(e.target.value)}
                  startAdornment={
                    <CategoryRoundedIcon
                      sx={{
                        color: "#64748b",
                        fontSize: 20,
                        mr: 1,
                      }}
                    />
                  }
                >
                  <MenuItem value="todos">Todos los motivos</MenuItem>

                  {motivosDisponibles.map((motivo) => (
                    <MenuItem key={motivo} value={motivo}>
                      {motivo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                startIcon={<RestartAltRoundedIcon />}
                onClick={handleQuitarFiltros}
                disabled={!filtrosActivos}
                sx={{
                  height: 46,
                  borderRadius: "16px",
                  px: 2.2,
                  minWidth: { xs: "100%", sm: 150 },
                  textTransform: "none",
                  fontWeight: 750,
                  color: filtrosActivos ? "primary.main" : "#94a3b8",
                  borderColor: filtrosActivos
                    ? "rgba(165, 4, 84, 0.24)"
                    : "rgba(15, 23, 42, 0.10)",
                  backgroundColor: filtrosActivos
                    ? "rgba(165, 4, 84, 0.035)"
                    : "#ffffff",
                  "&:hover": {
                    borderColor: "primary.main",
                    backgroundColor: "rgba(165, 4, 84, 0.06)",
                  },
                  "&.Mui-disabled": {
                    color: "#94a3b8",
                    borderColor: "rgba(15, 23, 42, 0.10)",
                    backgroundColor: "#ffffff",
                  },
                }}
              >
                Quitar filtros
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {loading ? (
          <Paper
            elevation={0}
            sx={{
              borderRadius: "24px",
              border: "1px solid rgba(15, 23, 42, 0.08)",
              backgroundColor: "#ffffff",
              minHeight: 300,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 18px 45px rgba(15, 23, 42, 0.04)",
            }}
          >
            <CircularProgress />
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
                gap: { xs: 1.6, md: 2 },
                mb: { xs: 2.4, md: 3 },
              }}
            >
              <StatCard
                icon={<GroupsRoundedIcon />}
                title="Turnos totales"
                value={stats.total}
                subtitle="Según filtros aplicados"
              />

              <StatCard
                icon={<CheckCircleRoundedIcon />}
                title="Atendidos"
                value={stats.finalizados}
                subtitle="Personas atendidas"
              />

              <StatCard
                icon={<PersonOffRoundedIcon />}
                title="Ausentes"
                value={stats.ausentes}
                subtitle="No se presentaron"
              />

              <StatCard
                icon={<AccessTimeRoundedIcon />}
                title="Espera promedio"
                value={formatSeconds(stats.promedioEspera)}
                subtitle="Hasta el llamado"
              />

              <StatCard
                icon={<AccessTimeRoundedIcon />}
                title="Atención promedio"
                value={formatSeconds(stats.promedioAtencion)}
                subtitle="Duración promedio"
              />
            </Box>

            {!hasData ? (
              <EmptyCard
                title="No hay datos para estos filtros"
                subtitle="Probá seleccionando otro día o cambiando el motivo de atención."
              />
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    lg: "minmax(0, 0.85fr) minmax(0, 1.15fr)",
                  },
                  gap: { xs: 2, md: 3 },
                }}
              >
                <ChartCard
                  title="Estados de mis turnos"
                  subtitle="Distribución de turnos atendidos, ausentes y activos."
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={estadosData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={88}
                        innerRadius={48}
                        paddingAngle={3}
                      >
                        {estadosData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                  title="Motivos más atendidos"
                  subtitle="Cantidad de turnos según tipo de consulta."
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={consultasData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(100, 116, 139, 0.18)"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        tick={{
                          fill: "#64748b",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(100, 116, 139, 0.22)" }}
                        interval={0}
                        angle={consultasData.length > 3 ? -14 : 0}
                        textAnchor={consultasData.length > 3 ? "end" : "middle"}
                        height={consultasData.length > 3 ? 58 : 34}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{
                          fill: "#64748b",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                        tickLine={false}
                        axisLine={false}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="value"
                        name="Turnos"
                        fill="#a50454"
                        radius={[10, 10, 0, 0]}
                        maxBarSize={56}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Box>
            )}
          </>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default InformesBoxes;