import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Bell, Menu, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/lib/utils';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center">
              <span className="text-primary-500 text-2xl font-bold">Med<span className="text-teal-500">Connect</span></span>
            </a>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {NAV_ITEMS.map((item) => (
              <Link key={item.path} href={item.path}>
                <a className={`px-3 py-2 font-medium ${
                  location === item.path 
                    ? "text-primary-500"
                    : "text-gray-700 hover:text-primary-500"
                }`}>
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>
          
          {/* Right side navigation */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <Bell className="h-5 w-5" />
                </Button>
                
                <div className="hidden md:block border-r border-gray-300 h-6 mx-2"></div>
                
                <div className="flex items-center space-x-3">
                  <Link href={user && user.isDoctor ? '/doctor-dashboard' : '/patient-dashboard'}>
                    <a className="cursor-pointer">
                      <Avatar>
                        <AvatarImage src={user && user.profileImage} alt={user && user.firstName} />
                        <AvatarFallback className="bg-primary-100">
                          {getInitials(user ? `${user.firstName} ${user.lastName}` : '')}
                        </AvatarFallback>
                      </Avatar>
                    </a>
                  </Link>
                  <span className="hidden md:inline-block">
                    {user && user.firstName} {user && user.lastName && user.lastName.charAt(0)}.
                  </span>
                  <Button 
                    variant="ghost" 
                    className="hidden md:inline-block text-sm"
                    onClick={logout}
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="hidden md:flex space-x-2">
                <Link href="/login">
                  <Button variant="outline">Log in</Button>
                </Link>
                <Link href="/signup">
                  <Button>Sign up</Button>
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={toggleMenu}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation (Hidden by default) */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="pt-2 pb-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link key={item.path} href={item.path}>
                  <a 
                    className={`block px-3 py-2 text-base font-medium ${
                      location === item.path 
                        ? "text-primary-500 bg-primary-50"
                        : "text-gray-700 hover:bg-gray-100 hover:text-primary-500"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </a>
                </Link>
              ))}
              
              {isAuthenticated ? (
                <>
                  <Link href={user && user.isDoctor ? '/doctor-dashboard' : '/patient-dashboard'}>
                    <a 
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-500"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </a>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-500"
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 p-3">
                  <Link href="/login">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setIsOpen(false)}
                    >
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button 
                      className="w-full"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;