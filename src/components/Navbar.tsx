import { NavLink, useLocation } from "react-router-dom";
import { MapPin, FileText, Info, Home, MessageSquare, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import logo from "@/assets/logo.png";
import { useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/home' || location.pathname === '/';
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { to: "/home", label: "Home", icon: Home },
    { to: "/map", label: "Map", icon: MapPin },
    { to: "/report", label: "Report", icon: FileText },
    { to: "/about", label: "About", icon: Info },
  ];

  const handleOpenChat = () => {
    if (window.voiceflow?.chat) {
      window.voiceflow.chat.open();
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
        <div className="flex items-center gap-3">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
                {isHomePage && (
                  <Button
                    onClick={() => {
                      handleOpenChat();
                      setIsOpen(false);
                    }}
                    variant="outline"
                    className="flex items-center gap-3 justify-start px-4 py-3"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>AI Chat</span>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
          
          <NavLink to="/home" className="flex items-center gap-3 group">
            <img src={logo} alt="Safe-Bazaar" className="h-10 w-10 transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold text-foreground hidden sm:inline">
              Safe-Bazaar
            </span>
          </NavLink>
        </div>

        <div className="hidden md:flex items-center gap-2 sm:gap-6">
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
