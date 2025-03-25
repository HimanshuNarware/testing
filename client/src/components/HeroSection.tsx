import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const HeroSection: React.FC = () => {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct query parameters for the search
    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.set('q', searchQuery);
    if (location) queryParams.set('location', location);
    
    // Navigate to the search results page with the query parameters
    navigate(`/find-doctors?${queryParams.toString()}`);
  };

  return (
    <section className="bg-gradient-to-r from-primary-500 to-primary-700 text-white py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Find the Right Doctor, Right Now</h1>
          <p className="text-lg md:text-xl opacity-90">Book appointments with top healthcare specialists near you</p>
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
        </form>
      </div>
    </section>
  );
};

export default HeroSection;
