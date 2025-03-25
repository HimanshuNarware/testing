import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Search, MapPin, Brain, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const HeroSection = () => {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Construct query parameters for the search
    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.set('q', searchQuery);
    if (location) queryParams.set('location', location);
    
    // Navigate to the search results page with the query parameters
    navigate(`/find-doctors?${queryParams.toString()}`);
  };
  
  const handleAdvancedSearch = () => {
    // Navigate to advanced search with AI recommendations
    const queryParams = new URLSearchParams();
    queryParams.set('advanced', 'true');
    if (searchQuery) queryParams.set('q', searchQuery);
    if (location) queryParams.set('location', location);
    
    navigate(`/find-doctors?${queryParams.toString()}`);
  };

  return (
    <section className="bg-gradient-to-r from-primary-500 to-primary-700 text-white py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Find the Right Doctor, Right Now</h1>
          <p className="text-lg md:text-xl opacity-90 mb-3">Book appointments with top healthcare specialists near you</p>
          <Badge variant="secondary" className="bg-blue-600 hover:bg-blue-700 text-white">
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            New! AI-Powered Doctor Recommendations
          </Badge>
        </div>

        <form onSubmit={handleSearch} className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Doctor name or specialty"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Location"
                className="pl-10"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button type="submit" className="bg-orange-400 hover:bg-orange-500 text-white">
              Find Doctors
            </Button>
          </div>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleAdvancedSearch}
              className="text-gray-600 hover:text-blue-600 text-sm inline-flex items-center"
            >
              <Brain className="h-4 w-4 mr-1" />
              Try our AI-powered doctor recommendations
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default HeroSection;