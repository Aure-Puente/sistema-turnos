import React from "react";
import { Box, Paper, Typography, Chip, Stack } from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import logoHorizontal from "../../assets/images/logo-horizontal.png";

const HomeAdmin = () => {
  const nombreCompleto = localStorage.getItem("nombreCompleto") || "Administrador";

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          borderRadius: "28px",
          border: "1px solid #ececef",
          background:
            "linear-gradient(135deg, #ffffff 0%, #ffffff 55%, #f6edf2 100%)",
          p: { xs: 3, md: 5 },
          minHeight: 340,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Stack spacing={3} sx={{ width: "100%" }}>
          <Box
            component="img"
            src={logoHorizontal}
            alt="Logo"
            sx={{
              width: { xs: 220, md: 300 },
              maxHeight: 90,
              objectFit: "contain",
            }}
          />

          <Box>
            <Chip
              icon={<DashboardRoundedIcon />}
              label="Panel administrador"
              color="primary"
              variant="outlined"
              sx={{
                fontWeight: 800,
                borderRadius: "999px",
                mb: 2,
              }}
            />

            <Typography
              sx={{
                fontSize: { xs: "2rem", md: "2.8rem" },
                fontWeight: 900,
                color: "primary.main",
                lineHeight: 1.1,
                mb: 1.5,
              }}
            >
              Bienvenido, {nombreCompleto}
            </Typography>

            <Typography
              sx={{
                color: "#6b7280",
                fontSize: { xs: "1.05rem", md: "1.2rem" },
                maxWidth: 760,
              }}
            >
              Desde este panel vas a poder supervisar la atención, consultar la
              pantalla en vivo, administrar boxes, crear usuarios y revisar
              informes del sistema de turnos.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default HomeAdmin;