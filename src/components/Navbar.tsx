import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Heart, User, Menu, LogOut, LayoutDashboard, MessageCircle, Bell } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useUserProperties } from "@/hooks/useUserProperties";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/useNotifications";
const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    user,
    signOut,
    isLandlord
  } = useAuth();
  const {
    unreadCount: messageUnread
  } = useUnreadMessages();
  const { notifications, unreadCount: notifUnread, markAsRead } = useNotifications();
  const {
    hasProperties
  } = useUserProperties();
  const navItems = [{
    path: "/",
    label: "Home",
    icon: Home
  }, {
    path: "/properties",
    label: "Properties",
    icon: Search
  }, {
    path: "/how-it-works",
    label: "How It Works",
    icon: Heart
  }, {
    path: "/about",
    label: "About",
    icon: User
  }];
  return <nav className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-ocean-blue to-success-green rounded-lg flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">SwiftRent</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(item => <Link key={item.path} to={item.path} className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === item.path ? "text-primary" : "text-muted-foreground"}`}>
                {item.label}
              </Link>)}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
                {user ? <>
                    <Button variant="outline" asChild>
                      <Link to="/list-property">List Property</Link>
                    </Button>
                    
                    {isLandlord && hasProperties ? <Button variant="ghost" size="sm" asChild>
                        <Link to="/dashboard" className="flex items-center relative">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Rental Manager
                        </Link>
                      </Button> : !isLandlord ? <Button variant="ghost" size="sm" asChild>
                        <Link to="/tenant-dashboard" className="flex items-center relative">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          My Dashboard
                        </Link>
                      </Button> : <Button variant="ghost" size="sm" asChild>
                        <Link to="/messages" className="flex items-center relative">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Messages
                          {messageUnread > 0 && <Badge variant="destructive" className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                              {messageUnread > 99 ? '99+' : messageUnread}
                            </Badge>}
                        </Link>
                      </Button>}
                
                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {notifUnread > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] h-5 min-w-[20px] px-1">
                          {notifUnread > 99 ? '99+' : notifUnread}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 p-0">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-sm font-medium">Notifications</p>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-3 py-6 text-sm text-muted-foreground">No notifications</div>
                    ) : (
                      <div className="max-h-96 overflow-auto">
                        {notifications.slice(0, 8).map((n) => (
                          <DropdownMenuItem key={n.id} asChild>
                            <Link
                              to={n.link_url || '#'}
                              className={`block w-full text-left px-3 py-2 ${n.is_read ? 'opacity-70' : ''}`}
                              onClick={() => markAsRead(n.id)}
                            >
                              <div className="text-sm leading-snug">{n.message}</div>
                              <div className="text-[11px] text-muted-foreground mt-1">
                                {new Date(n.created_at).toLocaleString()}
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User menu */}
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
                            {messageUnread > 0 && (
                              <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs">
                                {messageUnread > 99 ? '99+' : messageUnread}
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
              </> : <>
                <Button variant="outline" asChild>
                  <Link to="/list-property">List Property</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              </>}
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map(item => {
            const IconComponent = item.icon;
            return <Link key={item.path} to={item.path} className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === item.path ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-primary hover:bg-secondary"}`} onClick={() => setIsMobileMenuOpen(false)}>
                    <IconComponent className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>;
          })}
              <div className="pt-4 space-y-2">
                {user ? <>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/list-property">List Property</Link>
                    </Button>
                    {isLandlord && hasProperties ? <Button variant="outline" className="w-full" asChild>
                        <Link to="/dashboard">Rental Manager</Link>
                      </Button> : !isLandlord ? <Button variant="outline" className="w-full" asChild>
                        <Link to="/tenant-dashboard">My Dashboard</Link>
                      </Button> : <Button variant="outline" className="w-full" asChild>
                        <Link to="/messages" className="flex items-center justify-between">
                          <span>Messages</span>
                          {messageUnread > 0 && <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs">
                              {messageUnread > 99 ? '99+' : messageUnread}
                            </Badge>}
                        </Link>
                      </Button>}
                    <Button className="w-full" onClick={signOut}>
                      Sign Out
                    </Button>
                  </> : <>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/list-property">List Property</Link>
                    </Button>
                    <Button className="w-full" asChild>
                      <Link to="/auth">Sign In</Link>
                    </Button>
                  </>}
              </div>
            </div>
          </div>}
      </div>
    </nav>;
};
export default Navbar;