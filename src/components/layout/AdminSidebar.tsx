import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Star,
  MessageSquare,
  ChefHat,
  Users,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Reviews", href: "/reviews", icon: Star },
  { name: "Contacts", href: "/contacts", icon: MessageSquare },
  { name: "Menu Items", href: "/menu", icon: ChefHat },
  { name: "Admins", href: "/admins", icon: Users },
];

export const AdminSidebar = () => {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile backdrop */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-background border-r border-white/[0.05] z-50 transition-all duration-300
        ${collapsed ? '-translate-x-full lg:w-20' : 'w-72 lg:w-72'}
        lg:translate-x-0 lg:static lg:h-screen
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/[0.05]">
            {!collapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">JC</span>
                </div>
                <span className="text-lg font-semibold">Jagdamba Admin</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="lg:hidden"
            >
              {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow-admin-gold' 
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="font-medium">{item.name}</span>}
                </NavLink>
              );
            })}
          </nav>

          {/* Admin Profile */}
          <div className="p-4 border-t border-white/[0.05]">
            {!collapsed && (
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={admin?.profile_picture} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {admin?.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{admin?.username}</p>
                  <p className="text-xs text-muted-foreground truncate">{admin?.email}</p>
                </div>
              </div>
            )}
            
            <Button
              variant="ghost"
              onClick={logout}
              className={`
                w-full flex items-center space-x-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10
                ${collapsed ? 'justify-center px-0' : 'justify-start'}
              `}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sign Out</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCollapsed(false)}
        className="fixed top-4 left-4 z-30 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  );
};