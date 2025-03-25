
import React, { useState } from "react";
import MapView from "@/components/MapView";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Plus } from "lucide-react";
import { motion } from "framer-motion";

const Map = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <motion.div 
        className="flex-1 pt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container max-w-6xl mx-auto px-4 py-4 md:px-6 md:py-6 h-[calc(100vh-4rem)] flex flex-col">
          <div className="grid grid-cols-2 items-center justify-between mb-1">
            <span className="!text-2xl font-bold !text-black">Mapa de problemas 😡</span> 
          
            
            {!isAuthenticated ? (
              <Link to="/auth" className="mt-7 flex justify-end">
                <Button className="button-custom gap-2 font-bold min-h-[40px] whitespace-normal text-sm md:text-base" size="sm">
                  <Plus className="h-4 w-4" />
                  <span className="hidden md:inline">Iniciar sesión para reportar</span>
                  <span className="md:hidden">
                    Iniciar sesión<br />para reportar
                  </span>
                </Button>
              </Link>
            ) : (
              <Link to="/report" className="mt-7 flex justify-end">
                <Button className="button-custom gap-2 font-bold" size="sm">
                  <Plus className="h-4 w-4" />
                  <span>Nuevo reporte</span>
                </Button>
              </Link>
            )}
          </div>
          <p className="italic text-lg text-gray-500 mb-4">
            Haz clic en los emojis para ver los detalles de cada reporte.
          </p>
          
          <div className="flex-1 rounded-xl overflow-hidden border border-border">
            <MapView />
          </div>
          

        </div>
      </motion.div>
    </div>
  );
};

export default Map;
