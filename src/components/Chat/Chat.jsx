//Importaciones:
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import MeetingRoomRoundedIcon from "@mui/icons-material/MeetingRoomRounded";

import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";

//JSX:
const ordenarMensajes = (mensajes) => {
  return [...mensajes].sort(
    (a, b) => new Date(a.createdAtDate || 0) - new Date(b.createdAtDate || 0)
  );
};

const getInitials = (name = "Usuario") => {
  const parts = name.trim().split(" ").filter(Boolean).slice(0, 2);

  if (!parts.length) return "U";

  return parts.map((part) => part[0]?.toUpperCase()).join("");
};

const getRoleLabel = (rol = "BOX") => {
  return rol?.toUpperCase() === "ADMIN" ? "Administrador" : "Box";
};

const formatMessageTime = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Chat = () => {
  const bottomRef = useRef(null);

  const uid = localStorage.getItem("uid") || "";
  const nombreCompleto = localStorage.getItem("nombreCompleto") || "Usuario";
  const rol = (localStorage.getItem("rol") || "BOX").toUpperCase();

  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const rolLabel = useMemo(() => getRoleLabel(rol), [rol]);

  useEffect(() => {
    const q = query(collection(db, "chatMensajes"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMensajes(ordenarMensajes(data));
        setLoading(false);
      },
      (error) => {
        console.error("Error cargando chat:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const handleEnviar = async () => {
    const textoLimpio = texto.trim();

    if (!textoLimpio) return;

    try {
      setEnviando(true);

      const ahora = new Date();

      await addDoc(collection(db, "chatMensajes"), {
        texto: textoLimpio,
        uid,
        nombreCompleto,
        rol,
        createdAt: serverTimestamp(),
        createdAtDate: ahora.toISOString(),
      });

      setTexto("");
    } catch (error) {
      console.error("Error enviando mensaje:", error);
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  return (
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
        sx={{
          mb: {
            xs: 2,
            md: 2.4,
          },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: { xs: "1.5rem", sm: "1.65rem", md: "1.82rem" },
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.12,
              letterSpacing: "-0.7px",
            }}
          >
            Chat interno
          </Typography>

          <Typography
            sx={{
              color: "#64748b",
              mt: 0.55,
              fontSize: { xs: "0.94rem", md: "0.98rem" },
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            Sala común para administradores y boxes de atención.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            icon={<ChatRoundedIcon />}
            label={`${mensajes.length} mensajes`}
            variant="outlined"
            sx={{
              height: 34,
              borderRadius: "999px",
              fontWeight: 700,
              color: mensajes.length > 0 ? "primary.main" : "#64748b",
              borderColor:
                mensajes.length > 0
                  ? "rgba(165, 4, 84, 0.20)"
                  : "rgba(15, 23, 42, 0.12)",
              backgroundColor:
                mensajes.length > 0 ? "rgba(165, 4, 84, 0.04)" : "#ffffff",
              "& .MuiChip-icon": {
                color: mensajes.length > 0 ? "primary.main" : "#64748b",
                fontSize: 18,
              },
            }}
          />

          <Chip
            icon={
              rol === "ADMIN" ? (
                <AdminPanelSettingsRoundedIcon />
              ) : (
                <MeetingRoomRoundedIcon />
              )
            }
            label={rolLabel}
            variant="outlined"
            sx={{
              height: 34,
              borderRadius: "999px",
              fontWeight: 700,
              color: "#374151",
              borderColor: "rgba(15, 23, 42, 0.12)",
              backgroundColor: "#ffffff",
              "& .MuiChip-icon": {
                color: "primary.main",
                fontSize: 18,
              },
            }}
          />
        </Stack>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          height: {
            xs: "calc(100dvh - 225px)",
            sm: "calc(100dvh - 225px)",
            md: "calc(100dvh - 240px)",
            lg: "calc(100dvh - 235px)",
          },
          minHeight: {
            xs: 430,
            md: 455,
          },
          maxHeight: {
            md: "720px",
          },
          borderRadius: { xs: "22px", md: "26px" },
          border: "1px solid rgba(15, 23, 42, 0.08)",
          backgroundColor: "#ffffff",
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.045)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            px: { xs: 2, sm: 2.4, md: 2.6 },
            py: { xs: 1.6, md: 1.8 },
            borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
            backgroundColor: "#ffffff",
            flexShrink: 0,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Stack
              direction="row"
              spacing={1.3}
              alignItems="center"
              sx={{ minWidth: 0 }}
            >
              <Box
                sx={{
                  width: { xs: 40, md: 44 },
                  height: { xs: 40, md: 44 },
                  borderRadius: "16px",
                  backgroundColor: "rgba(165, 4, 84, 0.07)",
                  color: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ForumRoundedIcon sx={{ fontSize: { xs: 23, md: 25 } }} />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  noWrap
                  sx={{
                    fontWeight: 800,
                    color: "#111827",
                    fontSize: { xs: "1.05rem", md: "1.16rem" },
                    letterSpacing: "-0.2px",
                    lineHeight: 1.2,
                  }}
                >
                  Sala general
                </Typography>

                <Typography
                  noWrap
                  sx={{
                    color: "#64748b",
                    fontSize: { xs: "0.82rem", md: "0.88rem" },
                    fontWeight: 500,
                    mt: 0.15,
                  }}
                >
                  Mensajes compartidos del equipo
                </Typography>
              </Box>
            </Stack>

            <Box
              sx={{
                display: { xs: "none", sm: "block" },
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#22c55e",
                boxShadow: "0 0 0 4px rgba(34, 197, 94, 0.12)",
                flexShrink: 0,
              }}
            />
          </Stack>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            p: { xs: 1.8, md: 2.3 },
            background:
              "linear-gradient(180deg, #f8fafc 0%, #fafafa 100%)",
          }}
        >
          {loading ? (
            <Box
              sx={{
                height: "100%",
                minHeight: 250,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : mensajes.length === 0 ? (
            <Box
              sx={{
                height: "100%",
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
                  <ChatRoundedIcon sx={{ fontSize: 38 }} />
                </Box>

                <Typography
                  sx={{
                    fontSize: { xs: "1.22rem", md: "1.34rem" },
                    fontWeight: 800,
                    color: "#111827",
                    letterSpacing: "-0.3px",
                  }}
                >
                  Todavía no hay mensajes
                </Typography>

                <Typography
                  sx={{
                    color: "#64748b",
                    mt: 0.8,
                    fontWeight: 500,
                    lineHeight: 1.45,
                  }}
                >
                  Escribí el primer mensaje para iniciar la conversación.
                </Typography>
              </Box>
            </Box>
          ) : (
            <Stack spacing={1.35}>
              {mensajes.map((mensaje) => {
                const esPropio = mensaje.uid === uid;
                const mensajeRol = (mensaje.rol || "BOX").toUpperCase();
                const mensajeRolLabel = getRoleLabel(mensajeRol);
                const mensajeNombre = mensaje.nombreCompleto || "Usuario";
                const initials = getInitials(mensajeNombre);

                return (
                  <Box
                    key={mensaje.id}
                    sx={{
                      display: "flex",
                      justifyContent: esPropio ? "flex-end" : "flex-start",
                    }}
                  >
                    <Stack
                      direction={esPropio ? "row-reverse" : "row"}
                      spacing={1.1}
                      alignItems="flex-end"
                      sx={{
                        maxWidth: {
                          xs: "96%",
                          sm: "84%",
                          md: "68%",
                          lg: "58%",
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: esPropio ? "primary.main" : "#475569",
                          width: { xs: 34, md: 36 },
                          height: { xs: 34, md: 36 },
                          fontWeight: 800,
                          fontSize: "0.8rem",
                          boxShadow: esPropio
                            ? "0 10px 22px rgba(165, 4, 84, 0.16)"
                            : "none",
                        }}
                      >
                        {initials}
                      </Avatar>

                      <Box sx={{ minWidth: 0 }}>
                        <Stack
                          direction="row"
                          spacing={0.8}
                          justifyContent={esPropio ? "flex-end" : "flex-start"}
                          alignItems="center"
                          sx={{ mb: 0.4 }}
                        >
                          <Tooltip
                            title={esPropio ? nombreCompleto : mensajeNombre}
                            arrow
                            placement="top"
                          >
                            <Typography
                              noWrap
                              sx={{
                                color: "#64748b",
                                fontSize: "0.76rem",
                                fontWeight: 650,
                                maxWidth: { xs: 150, sm: 220 },
                              }}
                            >
                              {esPropio ? "Vos" : mensajeNombre}
                            </Typography>
                          </Tooltip>

                          {!esPropio && (
                            <Chip
                              size="small"
                              label={mensajeRolLabel}
                              variant="outlined"
                              sx={{
                                height: 21,
                                borderRadius: "999px",
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                color:
                                  mensajeRol === "ADMIN"
                                    ? "primary.main"
                                    : "#475569",
                                borderColor:
                                  mensajeRol === "ADMIN"
                                    ? "rgba(165, 4, 84, 0.18)"
                                    : "rgba(15, 23, 42, 0.12)",
                                backgroundColor:
                                  mensajeRol === "ADMIN"
                                    ? "rgba(165, 4, 84, 0.04)"
                                    : "#ffffff",
                              }}
                            />
                          )}
                        </Stack>

                        <Paper
                          elevation={0}
                          sx={{
                            px: { xs: 1.45, md: 1.65 },
                            py: { xs: 1.05, md: 1.12 },
                            borderRadius: esPropio
                              ? "18px 18px 6px 18px"
                              : "18px 18px 18px 6px",
                            backgroundColor: esPropio
                              ? "primary.main"
                              : "#ffffff",
                            color: esPropio ? "#ffffff" : "#111827",
                            border: esPropio
                              ? "none"
                              : "1px solid rgba(15, 23, 42, 0.08)",
                            boxShadow: esPropio
                              ? "0 10px 24px rgba(165, 4, 84, 0.16)"
                              : "0 8px 20px rgba(15, 23, 42, 0.04)",
                          }}
                        >
                          <Typography
                            sx={{
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                              fontSize: { xs: "0.94rem", md: "0.96rem" },
                              lineHeight: 1.45,
                              fontWeight: 450,
                            }}
                          >
                            {mensaje.texto}
                          </Typography>
                        </Paper>

                        <Typography
                          sx={{
                            color: "#94a3b8",
                            fontSize: "0.7rem",
                            mt: 0.4,
                            textAlign: esPropio ? "right" : "left",
                            fontWeight: 500,
                          }}
                        >
                          {formatMessageTime(mensaje.createdAtDate)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                );
              })}

              <div ref={bottomRef} />
            </Stack>
          )}
        </Box>

        <Divider sx={{ borderColor: "rgba(15, 23, 42, 0.08)" }} />

        <Box
          sx={{
            p: { xs: 1.5, sm: 1.7, md: 1.9 },
            backgroundColor: "#ffffff",
            flexShrink: 0,
          }}
        >
          <Stack direction="row" spacing={1.1} alignItems="flex-end">
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="Escribí un mensaje..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={enviando}
              sx={{
                "& .MuiOutlinedInput-root": {
                  minHeight: 50,
                  borderRadius: "18px",
                  backgroundColor: "#f8fafc",
                  fontSize: "0.95rem",
                  pr: 1,
                  "& fieldset": {
                    borderColor: "rgba(15, 23, 42, 0.10)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(165, 4, 84, 0.35)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "primary.main",
                    borderWidth: 2,
                  },
                },
              }}
            />

            <IconButton
              onClick={handleEnviar}
              disabled={enviando || !texto.trim()}
              sx={{
                width: { xs: 48, md: 50 },
                height: { xs: 48, md: 50 },
                borderRadius: "17px",
                color: "#ffffff",
                backgroundColor: "primary.main",
                flexShrink: 0,
                boxShadow: "0 12px 26px rgba(165, 4, 84, 0.18)",
                "&:hover": {
                  backgroundColor: "primary.dark",
                  boxShadow: "0 12px 26px rgba(165, 4, 84, 0.18)",
                },
                "&.Mui-disabled": {
                  backgroundColor: "#e5e7eb",
                  color: "#9ca3af",
                  boxShadow: "none",
                },
              }}
            >
              {enviando ? (
                <CircularProgress size={21} color="inherit" />
              ) : (
                <SendRoundedIcon />
              )}
            </IconButton>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default Chat;