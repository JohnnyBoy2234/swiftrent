import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Heart, User, Menu, LogOut, LayoutDashboard, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useUserProperties } from "@/hooks/useUserProperties";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut, isLandlord } = useAuth();
  const { unreadCount } = useUnreadMessages();
  const { hasProperties } = useUserProperties();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/properties", label: "Properties", icon: Search },
    { path: "/how-it-works", label: "How It Works", icon: Heart },
    { path: "/about", label: "About", icon: User },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-ocean-blue to-success-green rounded-lg flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">EasyRent</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === item.path
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
                {user ? (
                  <>
                    <Button variant="outline" asChild>
                      <Link to="/list-property">List Property</Link>
                    </Button>
                    
                    {isLandlord && hasProperties ? (
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/dashboard" className="flex items-center relative">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Rental Manager
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/messages" className="flex items-center relative">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Messages
                          {unreadCount > 0 && (
                            <Badge 
                              variant="destructive" 
                              className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                            >
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </Badge>
                          )}
                        </Link>
                      </Button>
                    )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                      <User className="h-4 w-4 mr-2" />
                      {user.email?.split('@')[0]}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {!isLandlord || !hasProperties ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/messages" className="flex items-center justify-between">
                            <div className="flex items-center">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Messages
                            </div>
                            {unreadCount > 0 && (
                              <Badge 
                                variant="destructive" 
                                className="h-5 w-5 flex items-center justify-center p-0 text-xs"
                              >
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </Badge>
                            )}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    ) : null}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/list-property">List Property</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-primary hover:bg-secondary"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="pt-4 space-y-2">
                {user ? (
                  <>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/list-property">List Property</Link>
                    </Button>
                    {isLandlord && hasProperties ? (
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/dashboard">Rental Manager</Link>
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/messages" className="flex items-center justify-between">
                          <span>Messages</span>
                          {unreadCount > 0 && (
                            <Badge 
                              variant="destructive" 
                              className="h-5 w-5 flex items-center justify-center p-0 text-xs"
                            >
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </Badge>
                          )}
                        </Link>
                      </Button>
                    )}
                    <Button className="w-full" onClick={signOut}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/list-property">List Property</Link>
                    </Button>
                    <Button className="w-full" asChild>
                      <Link to="/auth">Sign In</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;