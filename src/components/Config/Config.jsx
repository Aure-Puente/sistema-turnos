//Importaciones:
import React from "react";
import { Box, Paper, Typography, Chip, Stack } from "@mui/material";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import MeetingRoomRoundedIcon from "@mui/icons-material/MeetingRoomRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";

//JSX:
const Config = () => {
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
          minHeight: {
            xs: "calc(100vh - 130px)",
            md: "calc(100vh - 155px)",
          },
          borderRadius: { xs: "22px", md: "26px" },
          border: "1px solid rgba(15, 23, 42, 0.08)",
          backgroundColor: "#ffffff",
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.045)",
          p: {
            xs: 2.4,
            sm: 3,
            md: 4,
          },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 260,
            height: 260,
            borderRadius: "50%",
            backgroundColor: "rgba(165, 4, 84, 0.035)",
            top: -120,
            right: -90,
          }}
        />

        <Box
          sx={{
            position: "absolute",
            width: 180,
            height: 180,
            borderRadius: "50%",
            backgroundColor: "rgba(15, 23, 42, 0.025)",
            bottom: -80,
            left: -60,
          }}
        />

        <Box
          sx={{
            width: "100%",
            maxWidth: 760,
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: {
                xs: 76,
                md: 88,
              },
              height: {
                xs: 76,
                md: 88,
              },
              borderRadius: {
                xs: "24px",
                md: "28px",
              },
              backgroundColor: "rgba(165, 4, 84, 0.075)",
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2.2,
            }}
          >
            <ConstructionRoundedIcon
              sx={{
                fontSize: {
                  xs: 42,
                  md: 50,
                },
              }}
            />
          </Box>

          <Chip
            label="Próximamente"
            variant="outlined"
            sx={{
              height: 32,
              borderRadius: "999px",
              fontWeight: 700,
              color: "primary.main",
              borderColor: "rgba(165, 4, 84, 0.20)",
              backgroundColor: "rgba(165, 4, 84, 0.04)",
              mb: 2,
            }}
          />

          <Typography
            sx={{
              fontSize: {
                xs: "1.55rem",
                sm: "1.8rem",
                md: "2rem",
              },
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.12,
              letterSpacing: "-0.7px",
              mb: 1,
            }}
          >
            Configuración en construcción
          </Typography>

          <Typography
            sx={{
              color: "#64748b",
              fontSize: {
                xs: "0.98rem",
                md: "1.04rem",
              },
              maxWidth: 620,
              mx: "auto",
              lineHeight: 1.55,
              fontWeight: 500,
              mb: {
                xs: 3,
                md: 3.5,
              },
            }}
          >
            Esta sección permitirá administrar las preferencias generales del
            sistema de turnos y adaptar el funcionamiento a cada sucursal.
          </Typography>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1.4}
            sx={{
              width: "100%",
              justifyContent: "center",
              maxWidth: 700,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                p: {
                  xs: 1.8,
                  md: 2,
                },
                borderRadius: "20px",
                border: "1px solid rgba(15, 23, 42, 0.08)",
                backgroundColor: "#f8fafc",
                textAlign: "left",
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "15px",
                  backgroundColor: "#ffffff",
                  color: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1.4,
                  border: "1px solid rgba(165, 4, 84, 0.10)",
                }}
              >
                <CategoryRoundedIcon sx={{ fontSize: 24 }} />
              </Box>

              <Typography
                sx={{
                  color: "#111827",
                  fontWeight: 750,
                  fontSize: "0.98rem",
                  mb: 0.5,
                }}
              >
                Motivos de consulta
              </Typography>

              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: "0.88rem",
                  lineHeight: 1.4,
                  fontWeight: 500,
                }}
              >
                Alta, edición y organización de los tipos de atención.
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                flex: 1,
                p: {
                  xs: 1.8,
                  md: 2,
                },
                borderRadius: "20px",
                border: "1px solid rgba(15, 23, 42, 0.08)",
                backgroundColor: "#f8fafc",
                textAlign: "left",
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "15px",
                  backgroundColor: "#ffffff",
                  color: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1.4,
                  border: "1px solid rgba(165, 4, 84, 0.10)",
                }}
              >
                <MeetingRoomRoundedIcon sx={{ fontSize: 24 }} />
              </Box>

              <Typography
                sx={{
                  color: "#111827",
                  fontWeight: 750,
                  fontSize: "0.98rem",
                  mb: 0.5,
                }}
              >
                Boxes y sucursal
              </Typography>

              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: "0.88rem",
                  lineHeight: 1.4,
                  fontWeight: 500,
                }}
              >
                Configuración de puestos de atención y datos operativos.
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                flex: 1,
                p: {
                  xs: 1.8,
                  md: 2,
                },
                borderRadius: "20px",
                border: "1px solid rgba(15, 23, 42, 0.08)",
                backgroundColor: "#f8fafc",
                textAlign: "left",
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "15px",
                  backgroundColor: "#ffffff",
                  color: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1.4,
                  border: "1px solid rgba(165, 4, 84, 0.10)",
                }}
              >
                <TuneRoundedIcon sx={{ fontSize: 24 }} />
              </Box>

              <Typography
                sx={{
                  color: "#111827",
                  fontWeight: 750,
                  fontSize: "0.98rem",
                  mb: 0.5,
                }}
              >
                Preferencias generales
              </Typography>

              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: "0.88rem",
                  lineHeight: 1.4,
                  fontWeight: 500,
                }}
              >
                Ajustes visuales y reglas generales del sistema.
              </Typography>
            </Paper>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default Config;