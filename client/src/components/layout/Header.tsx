import { useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [notifications] = useState(5); // Demo notification count

  const getPageTitle = () => {
    switch (location) {
      case '/':
        return 'Panel de Control';
      case '/corrective':
        return 'Mantenimiento Correctivo';
      case '/preventive':
        return 'Mantenimiento Preventivo';
      case '/purchasing':
        return 'Compras';
      case '/cities':
        return 'Ciudades';
      case '/buildings':
        return 'Edificios';
      case '/apartments':
        return 'Apartamentos';
      default:
        return 'AirMaint';
    }
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center">
          {/* Mobile view has the toggle button in Sidebar component */}
          <h1 className="text-xl font-semibold text-neutral-800">{getPageTitle()}</h1>
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-6 w-6 text-neutral-600" />
              {notifications > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-destructive rounded-full">
                  {notifications}
                </span>
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 focus:outline-none">
                  <span className="hidden md:block text-sm font-medium text-neutral-700">{user.name}</span>
                  <img 
                    src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                    alt="User profile" 
                    className="h-8 w-8 rounded-full"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white text-neutral-800">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-neutral-700 hover:text-neutral-900">Perfil</DropdownMenuItem>
                <DropdownMenuItem className="text-neutral-700 hover:text-neutral-900">Configuración</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive hover:text-destructive hover:bg-destructive/10">Cerrar Sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
