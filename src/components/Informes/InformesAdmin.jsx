//Importaciones:
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PersonOffRoundedIcon from "@mui/icons-material/PersonOffRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
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
  Line,
  LineChart,
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

const estadoLabels = {
  esperando: "En espera",
  llamado: "Llamado",
  atendiendo: "En atención",
  finalizado: "Finalizado",
  ausente: "Ausente",
};

const formatSeconds = (seconds) => {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) {
    return "-";
  }

  const min = Math.floor(seconds / 60);
  const seg = Math.round(seconds % 60);

  if (min <= 0) return `${seg}s`;

  return `${min}m ${seg}s`;
};

const average = (values) => {
  const validValues = values.filter(
    (value) => value !== null && value !== undefined && !Number.isNaN(value)
  );

  if (validValues.length === 0) return null;

  return validValues.reduce((acc, value) => acc + value, 0) / validValues.length;
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

const groupAverage = (items, keyGetter, valueGetter) => {
  const map = {};

  items.forEach((item) => {
    const key = keyGetter(item) || "Sin datos";
    const value = valueGetter(item);

    if (value === null || value === undefined || Number.isNaN(value)) return;

    if (!map[key]) {
      map[key] = {
        total: 0,
        count: 0,
      };
    }

    map[key].total += value;
    map[key].count += 1;
  });

  return Object.entries(map)
    .map(([name, data]) => ({
      name,
      segundos: Math.round(data.total / data.count),
      minutos: Number((data.total / data.count / 60).toFixed(1)),
    }))
    .sort((a, b) => b.minutos - a.minutos);
};

const getFechaKey = (date) => {
  if (!date) return dayjs().format("YYYY-MM-DD");
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
        minHeight: { xs: 330, md: 360 },
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

      <Box sx={{ width: "100%", height: { xs: 245, md: 270 }, flex: 1 }}>
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
        boxShadow: "0 18px 45px rgba(15, 23, 42, 0.04)",
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
            maxWidth: 420,
          }}
        >
          {subtitle}
        </Typography>
      </Box>
    </Paper>
  );
};

const selectSx = {
  "& .MuiOutlinedInput-root": {
    height: 46,
    borderRadius: "16px",
    backgroundColor: "#ffffff",
  },
  "& .MuiInputLabel-root": {
    fontWeight: 600,
    color: "#64748b",
  },
};

const axisTick = {
  fill: "#64748b",
  fontSize: 12,
  fontWeight: 500,
};

const InformesAdmin = () => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [fechaDesde, setFechaDesde] = useState(dayjs());
  const [fechaHasta, setFechaHasta] = useState(dayjs());
  const [filters, setFilters] = useState({
    boxId: "TODOS",
    tipoConsulta: "TODOS",
    estado: "TODOS",
  });

  const fechaDesdeKey = useMemo(() => getFechaKey(fechaDesde), [fechaDesde]);
  const fechaHastaKey = useMemo(() => getFechaKey(fechaHasta), [fechaHasta]);

  useEffect(() => {
    const q = query(
      collection(db, "turnos"),
      where("fechaKey", ">=", fechaDesdeKey),
      where("fechaKey", "<=", fechaHastaKey)
    );

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
        console.error("Error cargando informes:", error);
        setError("No se pudieron cargar los informes.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [fechaDesdeKey, fechaHastaKey]);

  const boxesOptions = useMemo(() => {
    const boxes = turnos
      .filter((turno) => turno.boxId || turno.boxNombre)
      .map((turno) => ({
        boxId: turno.boxId || turno.boxNombre,
        boxNombre: turno.boxNombre || turno.boxId,
      }));

    const unique = new Map();

    boxes.forEach((box) => {
      unique.set(box.boxId, box);
    });

    return Array.from(unique.values()).sort((a, b) =>
      String(a.boxNombre).localeCompare(String(b.boxNombre))
    );
  }, [turnos]);

  const consultasOptions = useMemo(() => {
    return Array.from(new Set(turnos.map(getConsultaLabel).filter(Boolean))).sort(
      (a, b) => a.localeCompare(b)
    );
  }, [turnos]);

  const turnosFiltrados = useMemo(() => {
    return turnos.filter((turno) => {
      const matchBox =
        filters.boxId === "TODOS" ||
        turno.boxId === filters.boxId ||
        turno.boxNombre === filters.boxId;

      const consulta = getConsultaLabel(turno);

      const matchConsulta =
        filters.tipoConsulta === "TODOS" || consulta === filters.tipoConsulta;

      const matchEstado =
        filters.estado === "TODOS" || turno.estado === filters.estado;

      return matchBox && matchConsulta && matchEstado;
    });
  }, [turnos, filters]);

  const filtrosActivos = useMemo(() => {
    const hoy = dayjs().format("YYYY-MM-DD");

    return (
      fechaDesdeKey !== hoy ||
      fechaHastaKey !== hoy ||
      filters.boxId !== "TODOS" ||
      filters.tipoConsulta !== "TODOS" ||
      filters.estado !== "TODOS"
    );
  }, [fechaDesdeKey, fechaHastaKey, filters]);

  const stats = useMemo(() => {
    const total = turnosFiltrados.length;

    const finalizados = turnosFiltrados.filter(
      (turno) => turno.estado === "finalizado"
    ).length;

    const ausentes = turnosFiltrados.filter(
      (turno) => turno.estado === "ausente"
    ).length;

    const esperando = turnosFiltrados.filter(
      (turno) => turno.estado === "esperando"
    ).length;

    const activos = turnosFiltrados.filter((turno) =>
      ["llamado", "atendiendo"].includes(turno.estado)
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
      esperando,
      activos,
      promedioEspera,
      promedioAtencion,
    };
  }, [turnosFiltrados]);

  const estadosData = useMemo(() => {
    return groupCount(
      turnosFiltrados,
      (turno) => estadoLabels[turno.estado] || turno.estado || "Sin estado"
    ).filter((item) => item.value > 0);
  }, [turnosFiltrados]);

  const turnosPorBoxData = useMemo(() => {
    return groupCount(
      turnosFiltrados.filter((turno) => turno.boxNombre || turno.boxId),
      (turno) => turno.boxNombre || turno.boxId
    );
  }, [turnosFiltrados]);

  const turnosPorConsultaData = useMemo(() => {
    return groupCount(turnosFiltrados, getConsultaLabel);
  }, [turnosFiltrados]);

  const turnosPorDiaData = useMemo(() => {
    return groupCount(turnosFiltrados, (turno) => turno.fechaKey)
      .sort((a, b) => new Date(a.name) - new Date(b.name))
      .map((item) => ({
        fecha: dayjs(item.name).format("DD/MM"),
        turnos: item.value,
      }));
  }, [turnosFiltrados]);

  const tiempoAtencionPorBoxData = useMemo(() => {
    return groupAverage(
      turnosFiltrados,
      (turno) => turno.boxNombre || turno.boxId,
      (turno) => turno.tiempoAtencionSegundos
    );
  }, [turnosFiltrados]);

  const tiempoEsperaPorConsultaData = useMemo(() => {
    return groupAverage(
      turnosFiltrados,
      getConsultaLabel,
      (turno) => turno.tiempoEsperaSegundos
    );
  }, [turnosFiltrados]);

  const hasData = turnosFiltrados.length > 0;

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleQuitarFiltros = () => {
    setFechaDesde(dayjs());
    setFechaHasta(dayjs());
    setFilters({
      boxId: "TODOS",
      tipoConsulta: "TODOS",
      estado: "TODOS",
    });
  };

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
                Informes administrativos
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
              Métricas generales de atención, tiempos, boxes, consultas y
              ausencias.
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
                    Definí el rango, box, consulta y estado.
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(6, minmax(0, 1fr))",
                },
                gap: 1.4,
                width: {
                  xs: "100%",
                  lg: "min(100%, 920px)",
                },
              }}
            >
              <DatePicker
                label="Desde"
                value={fechaDesde}
                onChange={(newValue) => setFechaDesde(newValue || dayjs())}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    sx: {
                      minWidth: 0,
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

              <DatePicker
                label="Hasta"
                value={fechaHasta}
                onChange={(newValue) => setFechaHasta(newValue || dayjs())}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    sx: {
                      minWidth: 0,
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

              <FormControl fullWidth size="small" sx={selectSx}>
                <InputLabel>Box</InputLabel>

                <Select
                  label="Box"
                  value={filters.boxId}
                  onChange={(e) => handleFilterChange("boxId", e.target.value)}
                >
                  <MenuItem value="TODOS">Todos</MenuItem>

                  {boxesOptions.map((box) => (
                    <MenuItem key={box.boxId} value={box.boxId}>
                      {box.boxNombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" sx={selectSx}>
                <InputLabel>Consulta</InputLabel>

                <Select
                  label="Consulta"
                  value={filters.tipoConsulta}
                  onChange={(e) =>
                    handleFilterChange("tipoConsulta", e.target.value)
                  }
                >
                  <MenuItem value="TODOS">Todas</MenuItem>

                  {consultasOptions.map((consulta) => (
                    <MenuItem key={consulta} value={consulta}>
                      {consulta}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" sx={selectSx}>
                <InputLabel>Estado</InputLabel>

                <Select
                  label="Estado"
                  value={filters.estado}
                  onChange={(e) => handleFilterChange("estado", e.target.value)}
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="esperando">En espera</MenuItem>
                  <MenuItem value="llamado">Llamado</MenuItem>
                  <MenuItem value="atendiendo">En atención</MenuItem>
                  <MenuItem value="finalizado">Finalizado</MenuItem>
                  <MenuItem value="ausente">Ausente</MenuItem>
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
                  px: 1.8,
                  textTransform: "none",
                  fontWeight: 750,
                  whiteSpace: "nowrap",
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
            </Box>
          </Stack>
        </Paper>

        {loading ? (
          <Paper
            elevation={0}
            sx={{
              borderRadius: "24px",
              border: "1px solid rgba(15, 23, 42, 0.08)",
              backgroundColor: "#ffffff",
              minHeight: 340,
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
                  lg: "repeat(3, minmax(0, 1fr))",
                  xl: "repeat(6, minmax(0, 1fr))",
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
                title="Finalizados"
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
                icon={<PendingActionsRoundedIcon />}
                title="Espera / activos"
                value={`${stats.esperando} / ${stats.activos}`}
                subtitle="Pendientes y en atención"
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
                subtitle="Probá modificando el rango de fechas, el box, la consulta o el estado."
              />
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    lg: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: { xs: 2, md: 3 },
                }}
              >
                <ChartCard
                  title="Estados de turnos"
                  subtitle="Distribución según estado actual o final."
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
                  title="Turnos por box"
                  subtitle="Cantidad de turnos gestionados por cada box."
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={turnosPorBoxData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(100, 116, 139, 0.18)"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        tick={axisTick}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(100, 116, 139, 0.22)" }}
                        interval={0}
                        angle={turnosPorBoxData.length > 3 ? -14 : 0}
                        textAnchor={
                          turnosPorBoxData.length > 3 ? "end" : "middle"
                        }
                        height={turnosPorBoxData.length > 3 ? 58 : 34}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={axisTick}
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

                <ChartCard
                  title="Consultas más frecuentes"
                  subtitle="Cantidad de turnos por tipo de consulta."
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={turnosPorConsultaData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(100, 116, 139, 0.18)"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        tick={axisTick}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(100, 116, 139, 0.22)" }}
                        interval={0}
                        angle={turnosPorConsultaData.length > 3 ? -14 : 0}
                        textAnchor={
                          turnosPorConsultaData.length > 3 ? "end" : "middle"
                        }
                        height={turnosPorConsultaData.length > 3 ? 58 : 34}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={axisTick}
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

                <ChartCard
                  title="Turnos por día"
                  subtitle="Evolución diaria dentro del rango seleccionado."
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={turnosPorDiaData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(100, 116, 139, 0.18)"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="fecha"
                        tick={axisTick}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(100, 116, 139, 0.22)" }}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={axisTick}
                        tickLine={false}
                        axisLine={false}
                      />

                      <Tooltip />

                      <Line
                        type="monotone"
                        dataKey="turnos"
                        name="Turnos"
                        stroke="#a50454"
                        strokeWidth={3}
                        dot={{
                          r: 4,
                          fill: "#a50454",
                          strokeWidth: 0,
                        }}
                        activeDot={{
                          r: 6,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                  title="Tiempo de atención por box"
                  subtitle="Promedio en minutos por cada box."
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tiempoAtencionPorBoxData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(100, 116, 139, 0.18)"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        tick={axisTick}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(100, 116, 139, 0.22)" }}
                        interval={0}
                        angle={tiempoAtencionPorBoxData.length > 3 ? -14 : 0}
                        textAnchor={
                          tiempoAtencionPorBoxData.length > 3
                            ? "end"
                            : "middle"
                        }
                        height={tiempoAtencionPorBoxData.length > 3 ? 58 : 34}
                      />

                      <YAxis
                        tick={axisTick}
                        tickLine={false}
                        axisLine={false}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="minutos"
                        name="Minutos promedio"
                        fill="#a50454"
                        radius={[10, 10, 0, 0]}
                        maxBarSize={56}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                  title="Espera promedio por consulta"
                  subtitle="Tiempo promedio antes del llamado."
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tiempoEsperaPorConsultaData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(100, 116, 139, 0.18)"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        tick={axisTick}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(100, 116, 139, 0.22)" }}
                        interval={0}
                        angle={tiempoEsperaPorConsultaData.length > 3 ? -14 : 0}
                        textAnchor={
                          tiempoEsperaPorConsultaData.length > 3
                            ? "end"
                            : "middle"
                        }
                        height={tiempoEsperaPorConsultaData.length > 3 ? 58 : 34}
                      />

                      <YAxis
                        tick={axisTick}
                        tickLine={false}
                        axisLine={false}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="minutos"
                        name="Minutos promedio"
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

export default InformesAdmin;