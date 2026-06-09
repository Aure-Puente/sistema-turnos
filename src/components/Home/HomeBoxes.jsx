import React from "react";
import { Box, Paper, Typography, Chip, Stack } from "@mui/material";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import logoHorizontal from "../../assets/images/logo-horizontal.png";

const HomeBoxes = () => {
  const nombreCompleto = localStorage.getItem("nombreCompleto") || "Operador";
  const boxNombre = localStorage.getItem("boxNombre") || "Box asignado";

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
              icon={<ConfirmationNumberRoundedIcon />}
              label={boxNombre}
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
              Desde tu panel vas a poder llamar al siguiente turno, iniciar la
              atención, finalizarla y consultar tus estadísticas de atención.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default HomeBoxes;