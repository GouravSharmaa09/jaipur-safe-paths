import { NavLink, useLocation } from "react-router-dom";
import { MapPin, FileText, Info, Home, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/home' || location.pathname === '/';

  const navItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/map", label: "Map", icon: MapPin },
    { to: "/report", label: "Report", icon: FileText },
    { to: "/about", label: "About", icon: Info },
  ];

  const handleOpenChat = () => {
    if (window.voiceflow?.chat) {
      window.voiceflow.chat.open();
      console.log('Opening Voiceflow chat');
    } else {
      console.log('Voiceflow not loaded yet');
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-lg shadow-card"
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <NavLink to="/" className="flex items-center gap-3 group">
          <img src={logo} alt="Safe-Bazaar" className="h-10 w-10 transition-transform group-hover:scale-110" />
          <span className="text-xl font-bold gradient-primary bg-clip-text text-transparent hidden sm:inline">
            Safe-Bazaar
          </span>
        </NavLink>

        <div className="flex items-center gap-2 sm:gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden md:inline">{item.label}</span>
            </NavLink>
          ))}
          
          {isHomePage && (
            <Button
              onClick={handleOpenChat}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 px-3 py-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden md:inline">AI Chat</span>
            </Button>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
