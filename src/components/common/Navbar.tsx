
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Home, LogIn, LogOut, User, Plus, Search, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout, isOwner } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navItems = [
    { label: "Home", path: "/", icon: <Home className="h-5 w-5 mr-2" /> },
    { label: "Browse PGs", path: "/listings", icon: <Search className="h-5 w-5 mr-2" /> },
  ];

  if (isAuthenticated && isOwner()) {
    navItems.push({
      label: "Add New PG",
      path: "/add-listing",
      icon: <Plus className="h-5 w-5 mr-2" />,
    });
  }

  if (isAuthenticated) {
    navItems.push({
      label: "My Dashboard",
      path: "/dashboard",
      icon: <User className="h-5 w-5 mr-2" />,
    });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold text-pgfinder-primary">PG Finder</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          ) : (
            <Button asChild variant="default">
              <Link to="/login">
                <LogIn className="h-5 w-5 mr-2" />
                Login
              </Link>
            </Button>
          )}
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="flex flex-col space-y-4 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}

              {isAuthenticated ? (
                <Button variant="outline" onClick={handleLogout} className="w-full justify-start">
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </Button>
              ) : (
                <Button asChild variant="default" className="w-full justify-start">
                  <Link to="/login">
                    <LogIn className="h-5 w-5 mr-2" />
                    Login
                  </Link>
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Navbar;
