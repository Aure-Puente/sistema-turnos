import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PersonOffRoundedIcon from "@mui/icons-material/PersonOffRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import dayjs from "dayjs";
import { db } from "../../firebase/firebaseConfig";

const COLORS = ["#a50454", "#16a34a", "#f59e0b", "#6b7280", "#2563eb"];

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

  return Object.entries(map).map(([name, value]) => ({
    name,
    value,
  }));
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

  return Object.entries(map).map(([name, data]) => ({
    name,
    segundos: Math.round(data.total / data.count),
    minutos: Number((data.total / data.count / 60).toFixed(1)),
  }));
};

const StatCard = ({ icon, title, value, subtitle }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "22px",
        border: "1px solid #ececef",
        backgroundColor: "#ffffff",
        p: 2.5,
        minHeight: 140,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "16px",
            backgroundColor: "rgba(165, 4, 84, 0.08)",
            color: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography
            sx={{
              color: "#6b7280",
              fontSize: "0.9rem",
              fontWeight: 700,
              mb: 0.5,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              color: "#111827",
              fontSize: "2rem",
              fontWeight: 950,
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>

          {subtitle && (
            <Typography
              sx={{
                color: "#6b7280",
                fontSize: "0.85rem",
                mt: 1,
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
        borderRadius: "24px",
        border: "1px solid #ececef",
        backgroundColor: "#ffffff",
        p: { xs: 2.5, md: 3 },
        minHeight: 360,
      }}
    >
      <Typography
        sx={{
          color: "primary.main",
          fontSize: "1.25rem",
          fontWeight: 900,
          mb: 0.5,
        }}
      >
        {title}
      </Typography>

      {subtitle && (
        <Typography
          sx={{
            color: "#6b7280",
            fontSize: "0.9rem",
            mb: 2,
          }}
        >
          {subtitle}
        </Typography>
      )}

      <Box sx={{ width: "100%", height: 280 }}>{children}</Box>
    </Paper>
  );
};

const InformesAdmin = () => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const hoy = dayjs().format("YYYY-MM-DD");

  const [filters, setFilters] = useState({
    fechaDesde: hoy,
    fechaHasta: hoy,
    boxId: "TODOS",
    tipoConsulta: "TODOS",
    estado: "TODOS",
  });

  useEffect(() => {
    const q = query(
      collection(db, "turnos"),
      where("fechaKey", ">=", filters.fechaDesde),
      where("fechaKey", "<=", filters.fechaHasta)
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
  }, [filters.fechaDesde, filters.fechaHasta]);

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

    return Array.from(unique.values());
  }, [turnos]);

  const consultasOptions = useMemo(() => {
    return Array.from(
      new Set(
        turnos
          .map((turno) => turno.tipoConsultaLabel || turno.tipoConsulta)
          .filter(Boolean)
      )
    );
  }, [turnos]);

  const turnosFiltrados = useMemo(() => {
    return turnos.filter((turno) => {
      const matchBox =
        filters.boxId === "TODOS" ||
        turno.boxId === filters.boxId ||
        turno.boxNombre === filters.boxId;

      const consulta = turno.tipoConsultaLabel || turno.tipoConsulta;

      const matchConsulta =
        filters.tipoConsulta === "TODOS" || consulta === filters.tipoConsulta;

      const matchEstado =
        filters.estado === "TODOS" || turno.estado === filters.estado;

      return matchBox && matchConsulta && matchEstado;
    });
  }, [turnos, filters]);

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
    return groupCount(turnosFiltrados, (turno) => estadoLabels[turno.estado] || turno.estado);
  }, [turnosFiltrados]);

  const turnosPorBoxData = useMemo(() => {
    return groupCount(
      turnosFiltrados.filter((turno) => turno.boxNombre || turno.boxId),
      (turno) => turno.boxNombre || turno.boxId
    );
  }, [turnosFiltrados]);

  const turnosPorConsultaData = useMemo(() => {
    return groupCount(
      turnosFiltrados,
      (turno) => turno.tipoConsultaLabel || turno.tipoConsulta
    );
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
      (turno) => turno.tipoConsultaLabel || turno.tipoConsulta,
      (turno) => turno.tiempoEsperaSegundos
    );
  }, [turnosFiltrados]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
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
            Informes administrativos
          </Typography>

          <Typography sx={{ color: "#6b7280", mt: 0.8 }}>
            Métricas generales de atención, tiempos, boxes, consultas y
            ausencias.
          </Typography>
        </Box>

        <Chip
          icon={<AssessmentRoundedIcon />}
          label={`${turnosFiltrados.length} turnos filtrados`}
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

      <Paper
        elevation={0}
        sx={{
          borderRadius: "24px",
          border: "1px solid #ececef",
          backgroundColor: "#ffffff",
          p: { xs: 2.5, md: 3 },
          mb: 3,
        }}
      >
        <Typography
          sx={{
            color: "primary.main",
            fontWeight: 900,
            fontSize: "1.2rem",
            mb: 2,
          }}
        >
          Filtros
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(5, 1fr)",
            },
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            type="date"
            label="Desde"
            value={filters.fechaDesde}
            onChange={(e) => handleFilterChange("fechaDesde", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            type="date"
            label="Hasta"
            value={filters.fechaHasta}
            onChange={(e) => handleFilterChange("fechaHasta", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            select
            fullWidth
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
          </TextField>

          <TextField
            select
            fullWidth
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
          </TextField>

          <TextField
            select
            fullWidth
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
          </TextField>
        </Box>
      </Paper>

      {loading ? (
        <Paper
          elevation={0}
          sx={{
            borderRadius: "24px",
            border: "1px solid #ececef",
            backgroundColor: "#ffffff",
            minHeight: 360,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
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
                sm: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 2,
              mb: 3,
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
              subtitle="Llamados que no se presentaron"
            />

            <StatCard
              icon={<PendingActionsRoundedIcon />}
              title="En espera / activos"
              value={`${stats.esperando} / ${stats.activos}`}
              subtitle="Esperando y llamados/en atención"
            />

            <StatCard
              icon={<AccessTimeRoundedIcon />}
              title="Espera promedio"
              value={formatSeconds(stats.promedioEspera)}
              subtitle="Desde creación hasta llamado"
            />

            <StatCard
              icon={<AccessTimeRoundedIcon />}
              title="Atención promedio"
              value={formatSeconds(stats.promedioAtencion)}
              subtitle="Desde inicio hasta finalización"
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                lg: "1fr 1fr",
              },
              gap: 3,
            }}
          >
            <ChartCard
              title="Estados de turnos"
              subtitle="Distribución de turnos según su estado actual o final."
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={estadosData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={95}
                    label
                  >
                    {estadosData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Turnos por box"
              subtitle="Cantidad de turnos gestionados por cada box."
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={turnosPorBoxData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Turnos" fill="#a50454" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Consultas más frecuentes"
              subtitle="Cantidad de turnos por tipo de consulta."
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={turnosPorConsultaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Turnos" fill="#a50454" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Turnos por día"
              subtitle="Evolución diaria dentro del rango seleccionado."
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={turnosPorDiaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="turnos"
                    name="Turnos"
                    stroke="#a50454"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Tiempo promedio de atención por box"
              subtitle="Promedio en minutos por cada box."
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tiempoAtencionPorBoxData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="minutos"
                    name="Minutos promedio"
                    fill="#a50454"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Espera promedio por consulta"
              subtitle="Tiempo promedio de espera antes del llamado."
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tiempoEsperaPorConsultaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="minutos"
                    name="Minutos promedio"
                    fill="#a50454"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Box>
        </>
      )}
    </Box>
  );
};

export default InformesAdmin;