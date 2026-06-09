import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";

import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";

const ordenarMensajes = (mensajes) => {
  return [...mensajes].sort(
    (a, b) => new Date(a.createdAtDate || 0) - new Date(b.createdAtDate || 0)
  );
};

const Chat = () => {
  const bottomRef = useRef(null);

  const uid = localStorage.getItem("uid") || "";
  const nombreCompleto = localStorage.getItem("nombreCompleto") || "Usuario";
  const rol = localStorage.getItem("rol") || "BOX";
  const boxNombre = localStorage.getItem("boxNombre") || "";

  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

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
        boxNombre,
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
            Chat interno
          </Typography>

          <Typography sx={{ color: "#6b7280", mt: 0.8 }}>
            Sala común para administradores y boxes.
          </Typography>
        </Box>

        <Chip
          icon={<ChatRoundedIcon />}
          label={`${mensajes.length} mensajes`}
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 800 }}
        />
      </Stack>

      <Paper
        elevation={0}
        sx={{
          height: "calc(100vh - 190px)",
          minHeight: 520,
          borderRadius: "26px",
          border: "1px solid #ececef",
          backgroundColor: "#ffffff",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2.2,
            borderBottom: "1px solid #ececef",
            background:
              "linear-gradient(135deg, #ffffff 0%, #ffffff 60%, #f6edf2 100%)",
          }}
        >
          <Typography
            sx={{
              fontWeight: 900,
              color: "primary.main",
              fontSize: "1.25rem",
            }}
          >
            Sala general
          </Typography>

          <Typography sx={{ color: "#6b7280", fontSize: "0.95rem" }}>
            Todos los boxes y administradores pueden leer y escribir acá.
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: { xs: 2, md: 3 },
            backgroundColor: "#fafafa",
          }}
        >
          {loading ? (
            <Box
              sx={{
                height: "100%",
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
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                p: 3,
              }}
            >
              <Box>
                <ChatRoundedIcon
                  sx={{
                    fontSize: 76,
                    color: "primary.main",
                    mb: 2,
                  }}
                />

                <Typography
                  sx={{
                    fontSize: "1.6rem",
                    fontWeight: 900,
                    color: "primary.main",
                  }}
                >
                  Todavía no hay mensajes
                </Typography>

                <Typography sx={{ color: "#6b7280", mt: 1 }}>
                  Escribí el primer mensaje para iniciar la conversación.
                </Typography>
              </Box>
            </Box>
          ) : (
            <Stack spacing={1.7}>
              {mensajes.map((mensaje) => {
                const esPropio = mensaje.uid === uid;

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
                      spacing={1.2}
                      alignItems="flex-end"
                      sx={{
                        maxWidth: { xs: "92%", md: "72%" },
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: esPropio ? "primary.main" : "#6b7280",
                          width: 38,
                          height: 38,
                          fontWeight: 900,
                        }}
                      >
                        {(mensaje.nombreCompleto || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </Avatar>

                      <Box>
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent={esPropio ? "flex-end" : "flex-start"}
                          alignItems="center"
                          sx={{ mb: 0.5 }}
                        >
                          <Typography
                            sx={{
                              color: "#6b7280",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                            }}
                          >
                            {mensaje.nombreCompleto || "Usuario"}
                          </Typography>

                          <Chip
                            size="small"
                            label={
                              mensaje.rol === "ADMIN"
                                ? "Admin"
                                : mensaje.boxNombre || "Box"
                            }
                            color={mensaje.rol === "ADMIN" ? "primary" : "default"}
                            variant="outlined"
                            sx={{
                              height: 22,
                              fontSize: "0.72rem",
                              fontWeight: 800,
                            }}
                          />
                        </Stack>

                        <Paper
                          elevation={0}
                          sx={{
                            px: 2,
                            py: 1.3,
                            borderRadius: esPropio
                              ? "18px 18px 4px 18px"
                              : "18px 18px 18px 4px",
                            backgroundColor: esPropio
                              ? "primary.main"
                              : "#ffffff",
                            color: esPropio ? "#ffffff" : "#111827",
                            border: esPropio ? "none" : "1px solid #ececef",
                          }}
                        >
                          <Typography
                            sx={{
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                              fontSize: "0.98rem",
                              lineHeight: 1.45,
                            }}
                          >
                            {mensaje.texto}
                          </Typography>
                        </Paper>

                        <Typography
                          sx={{
                            color: "#9ca3af",
                            fontSize: "0.75rem",
                            mt: 0.4,
                            textAlign: esPropio ? "right" : "left",
                          }}
                        >
                          {mensaje.createdAtDate
                            ? new Date(mensaje.createdAtDate).toLocaleTimeString(
                                "es-AR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : ""}
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

        <Divider />

        <Box
          sx={{
            p: { xs: 2, md: 2.5 },
            backgroundColor: "#ffffff",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-end">
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Escribí un mensaje..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={enviando}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "18px",
                  backgroundColor: "#fafafa",
                },
              }}
            />

            <IconButton
              onClick={handleEnviar}
              disabled={enviando || !texto.trim()}
              sx={{
                width: 54,
                height: 54,
                borderRadius: "18px",
                color: "#ffffff",
                backgroundColor: "primary.main",
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
                "&.Mui-disabled": {
                  backgroundColor: "#e5e7eb",
                  color: "#9ca3af",
                },
              }}
            >
              {enviando ? (
                <CircularProgress size={22} color="inherit" />
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