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

import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PersonOffRoundedIcon from "@mui/icons-material/PersonOffRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";

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
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { db } from "../../firebase/firebaseConfig";

const COLORS = ["#a50454", "#16a34a", "#f59e0b"];

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

  return Object.entries(map).map(([name, value]) => ({
    name,
    value,
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
      <Stack direction="row" spacing={2}>
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
        minHeight: 340,
      }}
    >
      <Typography
        sx={{
          color: "primary.main",
          fontSize: "1.2rem",
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

      <Box sx={{ width: "100%", height: 250 }}>{children}</Box>
    </Paper>
  );
};

const InformesBoxes = () => {
  const boxId = localStorage.getItem("boxId") || "";
  const boxNombre = localStorage.getItem("boxNombre") || "Mi box";

  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!boxId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "turnos"),
      where("boxId", "==", boxId)
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
        console.error("Error cargando informes del box:", error);
        setError("No se pudieron cargar los informes.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [boxId]);

  const stats = useMemo(() => {
    const total = turnos.length;

    const finalizados = turnos.filter(
      (turno) => turno.estado === "finalizado"
    ).length;

    const ausentes = turnos.filter(
      (turno) => turno.estado === "ausente"
    ).length;

    const promedioEspera = average(
      turnos.map((turno) => turno.tiempoEsperaSegundos)
    );

    const promedioAtencion = average(
      turnos.map((turno) => turno.tiempoAtencionSegundos)
    );

    return {
      total,
      finalizados,
      ausentes,
      promedioEspera,
      promedioAtencion,
    };
  }, [turnos]);

  const estadosData = useMemo(() => {
    return [
      {
        name: "Finalizados",
        value: turnos.filter((t) => t.estado === "finalizado").length,
      },
      {
        name: "Ausentes",
        value: turnos.filter((t) => t.estado === "ausente").length,
      },
      {
        name: "Activos",
        value: turnos.filter((t) =>
          ["esperando", "llamado", "atendiendo"].includes(t.estado)
        ).length,
      },
    ];
  }, [turnos]);

  const consultasData = useMemo(() => {
    return groupCount(
      turnos,
      (turno) => turno.tipoConsultaLabel || turno.tipoConsulta
    );
  }, [turnos]);

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
            Mis informes
          </Typography>

          <Typography sx={{ color: "#6b7280", mt: 0.8 }}>
            Estadísticas personales de atención del {boxNombre}.
          </Typography>
        </Box>

        <Chip
          icon={<AssessmentRoundedIcon />}
          label={`${turnos.length} turnos gestionados`}
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
            minHeight: 300,
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
                lg: "repeat(5, 1fr)",
              },
              gap: 2,
              mb: 3,
            }}
          >
            <StatCard
              icon={<GroupsRoundedIcon />}
              title="Turnos totales"
              value={stats.total}
              subtitle="Gestionados por este box"
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
              subtitle="Tiempo hasta el llamado"
            />

            <StatCard
              icon={<AccessTimeRoundedIcon />}
              title="Atención promedio"
              value={formatSeconds(stats.promedioAtencion)}
              subtitle="Duración de atención"
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
              title="Estados de mis turnos"
              subtitle="Distribución de estados."
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={estadosData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
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
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Consultas más atendidas"
              subtitle="Tipos de consultas gestionadas."
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={consultasData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="name" />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    name="Turnos"
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

export default InformesBoxes;