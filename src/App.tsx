import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import VoiceflowChat from "./components/VoiceflowChat";
import { MapProvider } from "./contexts/MapContext";
import Splash from "./pages/Splash";
import Home from "./pages/Home";
import Map from "./pages/Map";
import Report from "./pages/Report";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MapProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <div className="flex-1 flex flex-col w-full">
                <VoiceflowChat />
                <Routes>
                  <Route path="/" element={<Splash />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/map" element={<Map />} />
                  <Route path="/report" element={<Report />} />
                  <Route path="/about" element={<About />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </MapProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
