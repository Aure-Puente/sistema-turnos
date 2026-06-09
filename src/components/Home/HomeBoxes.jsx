//Importaciones:
import React from "react";
import { Box, Paper, Typography, Chip, Stack, Divider } from "@mui/material";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import MeetingRoomRoundedIcon from "@mui/icons-material/MeetingRoomRounded";
import TvRoundedIcon from "@mui/icons-material/TvRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
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

const HomeBoxes = () => {
  const nombreCompleto = localStorage.getItem("nombreCompleto") || "Operador";
  const boxNombre = localStorage.getItem("boxNombre") || "Box asignado";

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
                  icon={<MeetingRoomRoundedIcon />}
                  label={boxNombre}
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
                  icon={<ConfirmationNumberRoundedIcon />}
                  label="Panel de atención"
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
                  maxWidth: 760,
                  lineHeight: 1.55,
                  fontWeight: 500,
                }}
              >
                Desde este panel podés gestionar los turnos de tu box, ver la
                pantalla en vivo, consultar tus informes y comunicarte con el
                equipo desde el chat interno.
              </Typography>
            </Box>

            <Box
              sx={{
                width: {
                  xs: "100%",
                  lg: 300,
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
                  <CampaignRoundedIcon sx={{ fontSize: 34 }} />
                </Box>

                <Typography
                  sx={{
                    color: "#111827",
                    fontSize: "1.08rem",
                    fontWeight: 800,
                    mb: 0.6,
                  }}
                >
                  Próximo paso
                </Typography>

                <Typography
                  sx={{
                    color: "#64748b",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    lineHeight: 1.45,
                  }}
                >
                  Ingresá a la sección Turnos para llamar al siguiente turno
                  disponible y comenzar la atención.
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
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: { xs: 1.6, md: 2 },
          mb: { xs: 2.4, md: 3 },
        }}
      >
        <ActionCard
          icon={<CampaignRoundedIcon />}
          title="Turnos"
          description="Llamá al siguiente turno, iniciá la atención o marcá ausentes."
        />

        <ActionCard
          icon={<TvRoundedIcon />}
          title="Pantalla en vivo"
          description="Visualizá los llamados activos y los próximos turnos."
        />

        <ActionCard
          icon={<AssessmentRoundedIcon />}
          title="Informes"
          description="Consultá métricas de atención, tiempos y turnos gestionados."
        />

        <ActionCard
          icon={<ChatRoundedIcon />}
          title="Chat interno"
          description="Comunicate con administradores y otros boxes del equipo."
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
              Flujo de atención
            </Typography>

            <Typography
              sx={{
                color: "#64748b",
                fontSize: "0.95rem",
                fontWeight: 500,
                lineHeight: 1.5,
                maxWidth: 780,
              }}
            >
              El flujo recomendado es llamar un turno, esperar a que la persona
              se presente, iniciar la atención y finalizarla al terminar la
              gestión.
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
              minWidth: { md: 320 },
            }}
          >
            <Chip
              icon={<CampaignRoundedIcon />}
              label="Llamar"
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
              icon={<PlayArrowRoundedIcon />}
              label="Atender"
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
              icon={<DoneRoundedIcon />}
              label="Finalizar"
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

export default HomeBoxes;