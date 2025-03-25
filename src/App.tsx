
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import Dashboard from "@/pages/Dashboard";


// Pages
import Index from "./pages/Index";
import Map from "./pages/Map";
import Auth from "./pages/Auth";
import ReportForm from "./pages/ReportForm";
import NotFound from "./pages/NotFound";

// Add framer-motion
import { motion } from "framer-motion";

const queryClient = new QueryClient();


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AnimatePresence mode="wait">
          <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/map" element={<Map />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/report" element={<ReportForm />} />
              <Route path="/dashboard" element={<Dashboard />} />
              {/* Cambiamos NotFound por Navigate para manejar rutas no encontradas */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
