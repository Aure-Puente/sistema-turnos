//Importaciones:
import React from "react";
import { Box, Paper, Typography, Chip, Stack, Divider } from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import TvRoundedIcon from "@mui/icons-material/TvRounded";
import MeetingRoomRoundedIcon from "@mui/icons-material/MeetingRoomRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import logoHorizontal from "../../assets/images/logo-horizontal.png";

//JSX:
const ActionCard = ({ icon, title, description }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.2 },
        borderRadius: "22px",
        border: "1px solid rgba(15, 23, 42, 0.08)",
        backgroundColor: "#ffffff",
        boxShadow: "0 14px 34px rgba(15, 23, 42, 0.04)",
        height: "100%",
      }}
    >
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
          mb: 1.6,
          "& svg": {
            fontSize: 26,
          },
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          color: "#111827",
          fontSize: { xs: "1rem", md: "1.08rem" },
          fontWeight: 750,
          mb: 0.6,
          lineHeight: 1.25,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          color: "#64748b",
          fontSize: "0.9rem",
          fontWeight: 500,
          lineHeight: 1.45,
        }}
      >
        {description}
      </Typography>
    </Paper>
  );
};

const HomeAdmin = () => {
  const nombreCompleto =
    localStorage.getItem("nombreCompleto") || "Administrador";

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1480,
        mx: "auto",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: { xs: "22px", md: "28px" },
          border: "1px solid rgba(15, 23, 42, 0.08)",
          backgroundColor: "#ffffff",
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.045)",
          overflow: "hidden",
          mb: { xs: 2.4, md: 3 },
        }}
      >
        <Box
          sx={{
            p: { xs: 2.4, sm: 3, md: 4 },
            background:
              "radial-gradient(circle at top right, rgba(165, 4, 84, 0.07), transparent 34%), linear-gradient(135deg, #ffffff 0%, #ffffff 60%, #f8fafc 100%)",
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", lg: "center" }}
            spacing={{ xs: 3, md: 4 }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box
                component="img"
                src={logoHorizontal}
                alt="Logo"
                sx={{
                  width: { xs: 185, sm: 215, md: 245 },
                  maxHeight: 82,
                  objectFit: "contain",
                  mb: { xs: 2.4, md: 3 },
                }}
              />

              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                sx={{ mb: 2 }}
              >
                <Chip
                  icon={<AdminPanelSettingsRoundedIcon />}
                  label="Panel administrador"
                  variant="outlined"
                  sx={{
                    height: 34,
                    borderRadius: "999px",
                    fontWeight: 700,
                    color: "primary.main",
                    borderColor: "rgba(165, 4, 84, 0.20)",
                    backgroundColor: "rgba(165, 4, 84, 0.04)",
                    "& .MuiChip-icon": {
                      color: "primary.main",
                      fontSize: 18,
                    },
                  }}
                />

                <Chip
                  icon={<VisibilityRoundedIcon />}
                  label="Supervisión general"
                  variant="outlined"
                  sx={{
                    height: 34,
                    borderRadius: "999px",
                    fontWeight: 700,
                    color: "#475569",
                    borderColor: "rgba(15, 23, 42, 0.12)",
                    backgroundColor: "#ffffff",
                    "& .MuiChip-icon": {
                      color: "#64748b",
                      fontSize: 18,
                    },
                  }}
                />
              </Stack>

              <Typography
                sx={{
                  fontSize: {
                    xs: "1.9rem",
                    sm: "2.25rem",
                    md: "2.65rem",
                  },
                  fontWeight: 800,
                  color: "#111827",
                  lineHeight: 1.05,
                  letterSpacing: "-1.1px",
                  mb: 1.4,
                }}
              >
                Bienvenido, {nombreCompleto}
              </Typography>

              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: {
                    xs: "0.98rem",
                    md: "1.08rem",
                  },
                  maxWidth: 790,
                  lineHeight: 1.55,
                  fontWeight: 500,
                }}
              >
                Desde este panel podés supervisar la atención en vivo, consultar
                el estado de los boxes, revisar informes, administrar usuarios y
                coordinar la comunicación interna del sistema.
              </Typography>
            </Box>

            <Box
              sx={{
                width: {
                  xs: "100%",
                  lg: 310,
                },
                flexShrink: 0,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "24px",
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  backgroundColor: "rgba(255,255,255,0.88)",
                  p: { xs: 2, md: 2.3 },
                  boxShadow: "0 14px 34px rgba(15, 23, 42, 0.04)",
                }}
              >
                <Box
                  sx={{
                    width: 58,
                    height: 58,
                    borderRadius: "20px",
                    backgroundColor: "rgba(165, 4, 84, 0.08)",
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1.6,
                  }}
                >
                  <DashboardRoundedIcon sx={{ fontSize: 34 }} />
                </Box>

                <Typography
                  sx={{
                    color: "#111827",
                    fontSize: "1.08rem",
                    fontWeight: 800,
                    mb: 0.6,
                  }}
                >
                  Vista administrativa
                </Typography>

                <Typography
                  sx={{
                    color: "#64748b",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    lineHeight: 1.45,
                  }}
                >
                  Usá las secciones laterales para monitorear la operación,
                  gestionar accesos y consultar métricas del sistema.
                </Typography>
              </Paper>
            </Box>
          </Stack>
        </Box>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
          },
          gap: { xs: 1.6, md: 2 },
          mb: { xs: 2.4, md: 3 },
        }}
      >
        <ActionCard
          icon={<TvRoundedIcon />}
          title="Pantalla en vivo"
          description="Visualizá los turnos llamados, los movimientos recientes y la cola de espera."
        />

        <ActionCard
          icon={<MeetingRoomRoundedIcon />}
          title="Boxes"
          description="Consultá el estado de cada box en tiempo real: disponible, llamando, atendiendo o en pausa."
        />

        <ActionCard
          icon={<AssessmentRoundedIcon />}
          title="Informes"
          description="Analizá métricas generales, tiempos promedio, motivos de consulta y rendimiento por box."
        />

        <ActionCard
          icon={<PeopleRoundedIcon />}
          title="Usuarios"
          description="Creá usuarios, asigná roles, configurá boxes y administrá accesos al sistema."
        />

        <ActionCard
          icon={<ChatRoundedIcon />}
          title="Chat interno"
          description="Comunicate con operadores y administradores desde una sala común del equipo."
        />

        <ActionCard
          icon={<SettingsRoundedIcon />}
          title="Configuración"
          description="Prepará ajustes generales del sistema, motivos de consulta y preferencias operativas."
        />
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: { xs: "22px", md: "26px" },
          border: "1px solid rgba(15, 23, 42, 0.08)",
          backgroundColor: "#ffffff",
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.04)",
          p: { xs: 2.2, sm: 2.6, md: 3 },
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 2, md: 3 }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                color: "#111827",
                fontSize: { xs: "1.15rem", md: "1.28rem" },
                fontWeight: 800,
                letterSpacing: "-0.2px",
                mb: 0.6,
              }}
            >
              Supervisión del sistema
            </Typography>

            <Typography
              sx={{
                color: "#64748b",
                fontSize: "0.95rem",
                fontWeight: 500,
                lineHeight: 1.5,
                maxWidth: 820,
              }}
            >
              Para una revisión rápida, comenzá por Pantalla en vivo o Boxes.
              Desde ahí podés ver el flujo de atención y detectar si algún box
              necesita seguimiento.
            </Typography>
          </Box>

          <Divider
            flexItem
            orientation="vertical"
            sx={{
              display: { xs: "none", md: "block" },
              borderColor: "rgba(15, 23, 42, 0.08)",
            }}
          />

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            sx={{
              justifyContent: {
                xs: "flex-start",
                md: "flex-end",
              },
              minWidth: { md: 350 },
            }}
          >
            <Chip
              icon={<TvRoundedIcon />}
              label="Ver pantalla"
              variant="outlined"
              sx={{
                borderRadius: "999px",
                fontWeight: 700,
                color: "#475569",
                borderColor: "rgba(15, 23, 42, 0.12)",
                backgroundColor: "#ffffff",
                "& .MuiChip-icon": {
                  color: "#64748b",
                  fontSize: 18,
                },
              }}
            />

            <Chip
              icon={<MeetingRoomRoundedIcon />}
              label="Revisar boxes"
              variant="outlined"
              sx={{
                borderRadius: "999px",
                fontWeight: 700,
                color: "#475569",
                borderColor: "rgba(15, 23, 42, 0.12)",
                backgroundColor: "#ffffff",
                "& .MuiChip-icon": {
                  color: "#64748b",
                  fontSize: 18,
                },
              }}
            />

            <Chip
              icon={<TuneRoundedIcon />}
              label="Gestionar"
              variant="outlined"
              sx={{
                borderRadius: "999px",
                fontWeight: 700,
                color: "primary.main",
                borderColor: "rgba(165, 4, 84, 0.20)",
                backgroundColor: "rgba(165, 4, 84, 0.04)",
                "& .MuiChip-icon": {
                  color: "primary.main",
                  fontSize: 18,
                },
              }}
            />
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default HomeAdmin;