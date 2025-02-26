import { useLocation, Link } from "wouter";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { 
  Bell, 
  Home, 
  AlertTriangle, 
  Clipboard, 
  ShoppingBag, 
  MapPin, 
  Building, 
  Home as HomeIcon,
  ChevronDown
} from "lucide-react";
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
  const [navOpen, setNavOpen] = useState(false);

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
        if (location.startsWith('/apartments/')) {
          return 'Detalles del Apartamento';
        }
        return 'AirMaint';
    }
  };

  // Navigation links for the top bar
  const navLinks = [
    { href: '/', icon: <Home size={20} />, text: 'Panel' },
    { href: '/corrective', icon: <AlertTriangle size={20} />, text: 'Correctivo' },
    { href: '/preventive', icon: <Clipboard size={20} />, text: 'Preventivo' },
    { href: '/purchasing', icon: <ShoppingBag size={20} />, text: 'Compras' },
  ];

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center">
          {/* Page title - larger on desktop */}
          <h1 className="text-xl font-semibold text-neutral-800 ml-8 lg:ml-0">{getPageTitle()}</h1>
        </div>

        {/* Top navigation bar - visible on medium screens and up */}
        <div className="hidden md:flex items-center space-x-1 absolute left-1/2 transform -translate-x-1/2">
          {navLinks.map((link) => (
            <Link href={link.href} key={link.href}>
              <div className={`flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                location === link.href 
                  ? 'text-primary-700 bg-primary-50'
                  : 'text-neutral-700 hover:text-primary-600 hover:bg-primary-50/50'
              }`}>
                <span className="mr-2">{link.icon}</span>
                <span>{link.text}</span>
              </div>
            </Link>
          ))}

          {/* More sections dropdown for secondary navigation */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center text-neutral-700 hover:text-primary-600 hover:bg-primary-50/50">
                <span className="mr-1">Más</span>
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <Link href="/cities">
                <DropdownMenuItem className="cursor-pointer">
                  <MapPin size={18} className="mr-2" />
                  <span>Ciudades</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/buildings">
                <DropdownMenuItem className="cursor-pointer">
                  <Building size={18} className="mr-2" />
                  <span>Edificios</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/apartments">
                <DropdownMenuItem className="cursor-pointer">
                  <HomeIcon size={18} className="mr-2" />
                  <span>Apartamentos</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
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
                <DropdownMenuItem className="text-neutral-700 hover:text-neutral-900 cursor-pointer">Perfil</DropdownMenuItem>
                <DropdownMenuItem className="text-neutral-700 hover:text-neutral-900 cursor-pointer">Configuración</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer">Cerrar Sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      
      {/* Mobile Quick Navigation - visible only on small screens */}
      <div className="md:hidden overflow-x-auto flex items-center justify-between border-t border-gray-200 bg-gray-50 px-1 py-2">
        {navLinks.map((link) => (
          <Link href={link.href} key={link.href}>
            <div className={`flex flex-col items-center justify-center rounded-md px-2 py-1 cursor-pointer ${
              location === link.href 
                ? 'text-primary-700 bg-primary-100'
                : 'text-neutral-700 hover:text-primary-600 hover:bg-primary-50'
            }`}>
              <span className="text-current">{link.icon}</span>
              <span className="text-xs font-medium mt-1">{link.text}</span>
            </div>
          </Link>
        ))}
        
        {/* More options dropdown for mobile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex flex-col items-center justify-center h-auto py-1 px-2 text-neutral-700">
              <span className="text-current"><ChevronDown size={20} /></span>
              <span className="text-xs font-medium mt-1">Más</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <Link href="/cities">
              <DropdownMenuItem className="cursor-pointer">
                <MapPin size={18} className="mr-2" />
                <span>Ciudades</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/buildings">
              <DropdownMenuItem className="cursor-pointer">
                <Building size={18} className="mr-2" />
                <span>Edificios</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/apartments">
              <DropdownMenuItem className="cursor-pointer">
                <HomeIcon size={18} className="mr-2" />
                <span>Apartamentos</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
