//Importaciones:
import React, { useMemo, useState } from "react";
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
  const rol = (localStorage.getItem("rol") || "BOX").toUpperCase();
  const nombreCompleto = localStorage.getItem("nombreCompleto") || "Usuario";

  const [selectedSection, setSelectedSection] = useState("inicio");
  const [mobileOpen, setMobileOpen] = useState(false);

  const sections = useMemo(() => {
    return allSections.filter((section) => section.roles.includes(rol));
  }, [rol]);

  const currentSection = useMemo(() => {
    return sections.find((item) => item.id === selectedSection) || sections[0];
  }, [selectedSection, sections]);

  const handleChangeSection = (id) => {
    setSelectedSection(id);
    setMobileOpen(false);
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
          py: 3,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box
          component="img"
          src={logoHorizontal}
          alt="Logo"
          sx={{
            width: 150,
            maxHeight: 48,
            objectFit: "contain",
          }}
        />
      </Box>

      <Divider />

      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {sections.map((item) => {
          const active = selectedSection === item.id;

          return (
            <ListItemButton
              key={item.id}
              onClick={() => handleChangeSection(item.id)}
              sx={{
                mb: 0.8,
                borderRadius: "14px",
                minHeight: 52,
                color: active ? "primary.main" : "#374151",
                backgroundColor: active
                  ? "rgba(165, 4, 84, 0.09)"
                  : "transparent",
                "&:hover": {
                  backgroundColor: active
                    ? "rgba(165, 4, 84, 0.12)"
                    : "rgba(17, 24, 39, 0.04)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: active ? "primary.main" : "#6b7280",
                  minWidth: 42,
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  fontWeight: active ? 800 : 600,
                  fontSize: "0.96rem",
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ p: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: "18px",
            backgroundColor: "rgba(165, 4, 84, 0.07)",
            border: "1px solid rgba(165, 4, 84, 0.12)",
          }}
        >
          <Typography sx={{ fontSize: "0.8rem", color: "#6b7280", mb: 0.5 }}>
            Sesión actual
          </Typography>

          <Typography sx={{ fontWeight: 800, color: "primary.main" }}>
            {nombreCompleto}
          </Typography>

          <Typography sx={{ fontSize: "0.85rem", color: "#6b7280", mt: 0.5 }}>
            {rol === "ADMIN" ? "Administrador" : "Box"}
          </Typography>
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
          backgroundColor: "#ffffff",
          color: "#111827",
          borderBottom: "1px solid #ececef",
        }}
      >
        <Toolbar
          sx={{
            minHeight: "72px !important",
            px: { xs: 2, md: 3 },
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ display: { md: "none" }, color: "primary.main" }}
            >
              <MenuRoundedIcon />
            </IconButton>

            <Box>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "1.15rem", md: "1.4rem" },
                  color: "#111827",
                  lineHeight: 1.1,
                }}
              >
                {currentSection?.title}
              </Typography>

              <Typography
                sx={{
                  color: "#6b7280",
                  fontSize: "0.9rem",
                  display: { xs: "none", sm: "block" },
                }}
              >
                Sistema de turnos y gestión de boxes
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip
              label={rol}
              color="primary"
              variant="outlined"
              sx={{
                fontWeight: 800,
                display: { xs: "none", sm: "flex" },
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
              borderRight: "1px solid #ececef",
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
              borderRight: "1px solid #ececef",
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
          pt: "72px",
          minHeight: "100vh",
        }}
      >
        <Box sx={{ p: { xs: 2, md: 4 } }}>{renderSection()}</Box>
      </Box>
    </Box>
  );
};

export default Dashboard;