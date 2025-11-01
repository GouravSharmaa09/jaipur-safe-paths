import { Home, MapPin, FileText, Info, MessageSquare } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import logo from "@/assets/logo.png";

const menuItems = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Map", url: "/map", icon: MapPin },
  { title: "Report", url: "/report", icon: FileText },
  { title: "About", url: "/about", icon: Info },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const isHomePage = location.pathname === '/home' || location.pathname === '/';

  const handleOpenChat = () => {
    if (window.voiceflow?.chat) {
      window.voiceflow.chat.open();
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4 border-b flex items-center gap-2">
          <img src={logo} alt="Safe-Bazaar" className="h-8 w-8" />
          {open && <span className="font-bold text-lg">Safe-Bazaar</span>}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isHomePage && open && (
          <div className="p-4">
            <Button
              onClick={handleOpenChat}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>AI Chat</span>
            </Button>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
