import React from "react";
import { Box, Paper, Typography, Chip } from "@mui/material";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";

const Config = () => {
  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          minHeight: 360,
          borderRadius: "24px",
          border: "1px solid #ececef",
          backgroundColor: "#ffffff",
          p: { xs: 3, md: 5 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Box
        sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <ConstructionRoundedIcon
            sx={{
              fontSize: 82,
              color: "primary.main",
              mb: 2,
              display: "block",
            }}
          />

          <Chip
            label="Próximamente"
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
              fontSize: { xs: "1.8rem", md: "2.2rem" },
              fontWeight: 900,
              color: "primary.main",
              mb: 1,
            }}
          >
            Configuración en construcción
          </Typography>

          <Typography
            sx={{
              color: "#6b7280",
              fontSize: "1.05rem",
              maxWidth: 560,
              mx: "auto",
            }}
          >
            Esta sección permitirá configurar motivos de consulta, datos de la
            sucursal, cantidad de boxes y preferencias generales del sistema.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Config;