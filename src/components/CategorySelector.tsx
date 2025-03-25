
import React from "react";
import { Check, Map, Trash2, AlertTriangle, Building, Lightbulb, Power } from "lucide-react";
import { motion } from "framer-motion";

export interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
}

export const categories: Category[] = [
  {
    id: "broken-sidewalks",
    name: "Veredas rotas",
    icon: Map,
    color: "bg-yellow-500"
  },
  {
    id: "potholes",
    name: "Pistas con huecos",
    icon: AlertTriangle,
    color: "bg-orange-500"
  },
  {
    id: "garbage",
    name: "Basura acumulada",
    icon: Trash2,
    color: "bg-green-500"
  },
  {
    id: "unstable-walls",
    name: "Paredes inestables",
    icon: Building,
    color: "bg-red-500"
  },
  {
    id: "no-lights",
    name: "Calles sin luz",
    icon: Lightbulb,
    color: "bg-purple-500"
  },
  {
    id: "unstable-poles",
    name: "Postes en mal estado",
    icon: Power,
    color: "bg-blue-500"
  }
];

interface CategorySelectorProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-medium text-muted-foreground">¿Cuál es el Problema?</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {categories.map(category => (
          <motion.button
            key={category.id}
            onClick={(e) => {
              e.preventDefault(); // 🔹 Evita que el formulario se resetee accidentalmente
              console.log("Categoría seleccionada:", category.id);
              onSelectCategory(category.id); // 🔹 Asegurar que se actualiza correctamente
            }}
            className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
              selectedCategory === category.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-secondary"
            }`}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {selectedCategory === category.id && (
              <div className="absolute top-2 right-2">
                <Check className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${category.color}/10`}>
              <category.icon className={`h-5 w-5 text-${category.color.split('-')[1]}-500`} />
            </div>
            <span className="text-xs font-medium text-center">{category.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};


export default CategorySelector;
