//Importaciones:
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Stack,
  Chip,
  Paper,
  Badge,
  Avatar,
  Tooltip,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import TvRoundedIcon from "@mui/icons-material/TvRounded";
import MeetingRoomRoundedIcon from "@mui/icons-material/MeetingRoomRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import logoHorizontal from "../../assets/images/logo-horizontal.png";
import HomeAdmin from "../../components/Home/HomeAdmin";
import HomeBoxes from "../../components/Home/HomeBoxes";
import Turnos from "../../components/Turnos/Turnos";
import PantallaDashboard from "../../components/PantallaDashboard/PantallaDashboard";
import Boxes from "../../components/Boxes/Boxes";
import InformesAdmin from "../../components/Informes/InformesAdmin";
import InformesBoxes from "../../components/Informes/InformesBoxes";
import Usuarios from "../../components/Usuarios/Usuarios";
import Chat from "../../components/Chat/Chat";
import Config from "../../components/Config/Config";
import Logout from "../../components/Logout/Logout";

//JSX:
const drawerWidth = 280;

const allSections = [
  {
    id: "inicio",
    title: "Inicio",
    icon: <DashboardRoundedIcon />,
    roles: ["ADMIN", "BOX"],
  },
  {
    id: "turnos",
    title: "Turnos",
    icon: <ConfirmationNumberRoundedIcon />,
    roles: ["BOX"],
  },
  {
    id: "pantalla",
    title: "Pantalla en vivo",
    icon: <TvRoundedIcon />,
    roles: ["ADMIN", "BOX"],
  },
  {
    id: "boxes",
    title: "Boxes",
    icon: <MeetingRoomRoundedIcon />,
    roles: ["ADMIN"],
  },
  {
    id: "informes",
    title: "Informes",
    icon: <AssessmentRoundedIcon />,
    roles: ["ADMIN", "BOX"],
  },
  {
    id: "usuarios",
    title: "Usuarios",
    icon: <PeopleRoundedIcon />,
    roles: ["ADMIN"],
  },
  {
    id: "chat",
    title: "Chat interno",
    icon: <ChatRoundedIcon />,
    roles: ["ADMIN", "BOX"],
  },
  {
    id: "configuracion",
    title: "Configuración",
    icon: <SettingsRoundedIcon />,
    roles: ["ADMIN"],
  },
];

const Dashboard = () => {
  const uid = localStorage.getItem("uid") || "";
  const rol = (localStorage.getItem("rol") || "BOX").toUpperCase();
  const nombreCompleto = localStorage.getItem("nombreCompleto") || "Usuario";

  const chatSeenKey = `chatUltimaVista_${uid || "anonimo"}`;

  const [selectedSection, setSelectedSection] = useState("inicio");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [latestChatDate, setLatestChatDate] = useState(null);

  const sections = useMemo(() => {
    return allSections.filter((section) => section.roles.includes(rol));
  }, [rol]);

  const currentSection = useMemo(() => {
    return sections.find((item) => item.id === selectedSection) || sections[0];
  }, [selectedSection, sections]);

  const rolLabel = rol === "ADMIN" ? "Administrador" : "Box de atención";

  const userInitials = useMemo(() => {
    const partes = nombreCompleto
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2);

    if (!partes.length) return "U";

    return partes.map((item) => item[0]?.toUpperCase()).join("");
  }, [nombreCompleto]);

  useEffect(() => {
    const q = query(collection(db, "chatMensajes"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const mensajes = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const ultimaVista = localStorage.getItem(chatSeenKey);
        const ultimaVistaDate = ultimaVista ? new Date(ultimaVista) : null;

        const mensajesOrdenados = [...mensajes].sort(
          (a, b) =>
            new Date(b.createdAtDate || 0) - new Date(a.createdAtDate || 0)
        );

        const ultimoMensaje = mensajesOrdenados[0];

        if (ultimoMensaje?.createdAtDate) {
          setLatestChatDate(ultimoMensaje.createdAtDate);
        }

        if (selectedSection === "chat") {
          if (ultimoMensaje?.createdAtDate) {
            localStorage.setItem(chatSeenKey, ultimoMensaje.createdAtDate);
          }

          setUnreadChatCount(0);
          return;
        }

        const nuevos = mensajes.filter((mensaje) => {
          if (!mensaje.createdAtDate) return false;
          if (mensaje.uid === uid) return false;

          const fechaMensaje = new Date(mensaje.createdAtDate);

          if (!ultimaVistaDate) return true;

          return fechaMensaje > ultimaVistaDate;
        });

        setUnreadChatCount(nuevos.length);
      },
      (error) => {
        console.error("Error escuchando notificaciones de chat:", error);
      }
    );

    return () => unsubscribe();
  }, [chatSeenKey, selectedSection, uid]);

  useEffect(() => {
    if (selectedSection === "chat" && latestChatDate) {
      localStorage.setItem(chatSeenKey, latestChatDate);
      setUnreadChatCount(0);
    }
  }, [selectedSection, latestChatDate, chatSeenKey]);

  const handleChangeSection = (id) => {
    setSelectedSection(id);
    setMobileOpen(false);

    if (id === "chat") {
      const fechaVista = latestChatDate || new Date().toISOString();
      localStorage.setItem(chatSeenKey, fechaVista);
      setUnreadChatCount(0);
    }
  };

  const renderSection = () => {
    switch (currentSection?.id) {
      case "inicio":
        return rol === "ADMIN" ? <HomeAdmin /> : <HomeBoxes />;

      case "turnos":
        return rol === "BOX" ? <Turnos /> : null;

      case "pantalla":
        return <PantallaDashboard />;

      case "boxes":
        return rol === "ADMIN" ? <Boxes /> : null;

      case "informes":
        return rol === "ADMIN" ? <InformesAdmin /> : <InformesBoxes />;

      case "usuarios":
        return rol === "ADMIN" ? <Usuarios /> : null;

      case "chat":
        return <Chat />;

      case "configuracion":
        return rol === "ADMIN" ? <Config /> : null;

      default:
        return (
          <Typography sx={{ color: "#6b7280", fontWeight: 600 }}>
            Sección no encontrada.
          </Typography>
        );
    }
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2.8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          component="img"
          src={logoHorizontal}
          alt="Logo"
          sx={{
            width: 168,
            maxHeight: 52,
            objectFit: "contain",
          }}
        />
      </Box>

      <Divider sx={{ borderColor: "rgba(15, 23, 42, 0.08)" }} />

      <List
        sx={{
          px: 1.5,
          py: 2,
          flex: 1,
          overflowY: "auto",
        }}
      >
        {sections.map((item) => {
          const active = selectedSection === item.id;
          const isChat = item.id === "chat";
          const hasUnread = isChat && unreadChatCount > 0;

          return (
            <ListItemButton
              key={item.id}
              onClick={() => handleChangeSection(item.id)}
              sx={{
                mb: 0.8,
                borderRadius: "16px",
                minHeight: 54,
                px: 1.6,
                color: active ? "primary.main" : "#374151",
                backgroundColor: active
                  ? "rgba(165, 4, 84, 0.09)"
                  : hasUnread
                  ? "rgba(165, 4, 84, 0.06)"
                  : "transparent",
                border: active
                  ? "1px solid rgba(165, 4, 84, 0.14)"
                  : "1px solid transparent",
                transition: "all 0.18s ease",
                "&:hover": {
                  backgroundColor: active
                    ? "rgba(165, 4, 84, 0.12)"
                    : "rgba(17, 24, 39, 0.04)",
                  transform: "translateX(2px)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: active || hasUnread ? "primary.main" : "#6b7280",
                  minWidth: 42,
                  "& svg": {
                    fontSize: 24,
                  },
                }}
              >
                {isChat ? (
                  <Badge
                    badgeContent={unreadChatCount}
                    color="primary"
                    invisible={!hasUnread}
                    max={99}
                    sx={{
                      "& .MuiBadge-badge": {
                        fontWeight: 800,
                        fontSize: "0.68rem",
                      },
                    }}
                  >
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>

              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  fontWeight: active || hasUnread ? 800 : 600,
                  fontSize: "0.96rem",
                }}
              />

              {hasUnread && (
                <Chip
                  label="Nuevo"
                  color="primary"
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    borderRadius: "999px",
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ p: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: 1.6,
            borderRadius: "22px",
            background:
              "linear-gradient(135deg, rgba(165, 4, 84, 0.08), rgba(165, 4, 84, 0.035))",
            border: "1px solid rgba(165, 4, 84, 0.13)",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.4}>
            <Avatar
              sx={{
                width: 44,
                height: 44,
                bgcolor: "primary.main",
                color: "#ffffff",
                fontWeight: 900,
                fontSize: "0.95rem",
                boxShadow: "0 10px 22px rgba(165, 4, 84, 0.20)",
              }}
            >
              {userInitials}
            </Avatar>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  fontSize: "0.76rem",
                  color: "#64748b",
                  fontWeight: 600,
                  lineHeight: 1.2,
                  mb: 0.3,
                }}
              >
                Sesión actual
              </Typography>

              <Tooltip title={nombreCompleto} placement="top" arrow>
                <Typography
                  noWrap
                  sx={{
                    fontWeight: 800,
                    color: "#111827",
                    fontSize: "0.95rem",
                    lineHeight: 1.25,
                  }}
                >
                  {nombreCompleto}
                </Typography>
              </Tooltip>

              <Stack direction="row" alignItems="center" spacing={0.6} sx={{ mt: 0.6 }}>
                {rol === "ADMIN" ? (
                  <AdminPanelSettingsRoundedIcon
                    sx={{ fontSize: 16, color: "primary.main" }}
                  />
                ) : (
                  <PersonRoundedIcon sx={{ fontSize: 16, color: "primary.main" }} />
                )}

                <Typography
                  sx={{
                    fontSize: "0.8rem",
                    color: "#64748b",
                    fontWeight: 650,
                  }}
                >
                  {rolLabel}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f7f7f8",
      }}
    >
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(12px)",
          color: "#111827",
          borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
        }}
      >
        <Toolbar
          sx={{
            minHeight: {
              xs: "66px !important",
              md: "72px !important",
            },
            px: {
              xs: 1.5,
              sm: 2,
              md: 3,
            },
            display: "flex",
            justifyContent: "space-between",
            gap: {
              xs: 1,
              sm: 2,
            },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={{
              xs: 1,
              sm: 1.5,
            }}
            sx={{
              minWidth: 0,
              flex: 1,
            }}
          >
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{
                display: { md: "none" },
                color: "primary.main",
                backgroundColor: "rgba(165, 4, 84, 0.08)",
                borderRadius: "14px",
                "&:hover": {
                  backgroundColor: "rgba(165, 4, 84, 0.12)",
                },
              }}
            >
              <MenuRoundedIcon />
            </IconButton>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                noWrap
                sx={{
                  fontWeight: 850,
                  fontSize: {
                    xs: "1.08rem",
                    sm: "1.18rem",
                    md: "1.38rem",
                  },
                  color: "#111827",
                  lineHeight: 1.15,
                  letterSpacing: "-0.3px",
                }}
              >
                {currentSection?.title}
              </Typography>

              <Typography
                noWrap
                sx={{
                  color: "#64748b",
                  fontSize: "0.9rem",
                  display: {
                    xs: "none",
                    sm: "block",
                  },
                  mt: 0.2,
                }}
              >
                Sistema de turnos y gestión de boxes
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            spacing={{
              xs: 0.8,
              sm: 1,
            }}
            sx={{
              flexShrink: 0,
            }}
          >
            <Chip
              icon={
                rol === "ADMIN" ? (
                  <AdminPanelSettingsRoundedIcon />
                ) : (
                  <MeetingRoomRoundedIcon />
                )
              }
              label={rolLabel}
              color="primary"
              variant="outlined"
              sx={{
                height: 34,
                px: 0.4,
                borderRadius: "999px",
                fontWeight: 800,
                backgroundColor: "rgba(165, 4, 84, 0.04)",
                borderColor: "rgba(165, 4, 84, 0.22)",
                display: {
                  xs: "none",
                  sm: "flex",
                },
                "& .MuiChip-icon": {
                  fontSize: 19,
                  color: "primary.main",
                  ml: 0.8,
                },
                "& .MuiChip-label": {
                  px: 1.1,
                  fontSize: "0.82rem",
                },
              }}
            />

            <Logout />
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { md: drawerWidth },
          flexShrink: { md: 0 },
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: "1px solid rgba(15, 23, 42, 0.08)",
              boxShadow: "0 20px 60px rgba(15, 23, 42, 0.18)",
            },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: "1px solid rgba(15, 23, 42, 0.08)",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: {
            xs: "66px",
            md: "72px",
          },
          minHeight: "100vh",
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            p: {
              xs: 2,
              sm: 2.5,
              md: 4,
            },
          }}
        >
          {renderSection()}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;