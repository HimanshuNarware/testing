import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Map, Brain, Star, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { SPECIALTIES, INSURANCE_OPTIONS } from '@/lib/constants';
import { apiRequest } from '@/lib/queryClient';
import { generateStarRating } from '@/lib/utils';

const AdvancedSearchSection = () => {
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [insurance, setInsurance] = useState('');
  const [sortBy, setSortBy] = useState('matchScore');
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Results states
  const [recommendations, setRecommendations] = useState([]);

  // Trending doctors
  const { data: trendingDoctors, isLoading: trendingLoading } = useQuery({
    queryKey: ['/api/recommendations/trending'],
    enabled: !searchPerformed
  });

  // Search recommendations
  const { 
    data: searchResults, 
    isLoading: searchLoading,
    refetch: refetchSearch
  } = useQuery({
    queryKey: ['/api/recommendations', searchQuery, location, specialty],
    enabled: false,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (location) params.append('location', location);
      if (specialty) params.append('specialty', specialty);
      
      return apiRequest(`/api/recommendations?${params.toString()}`);
    }
  });

  // Handle search submission
  const handleSearch = async (e) => {
    e?.preventDefault();
    setSearchPerformed(true);
    
    await refetchSearch();
  };

  // Update recommendations when search results change
  useEffect(() => {
    if (searchResults) {
      let sortedResults = [...searchResults];
      
      // Apply sorting
      if (sortBy === 'rating') {
        sortedResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (sortBy === 'reviewCount') {
        sortedResults.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      } else {
        // Default sort by matchScore
        sortedResults.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      }
      
      setRecommendations(sortedResults);
    }
  }, [searchResults, sortBy]);

  // Reset search
  const resetSearch = () => {
    setSearchQuery('');
    setLocation('');
    setSpecialty('');
    setInsurance('');
    setSortBy('matchScore');
    setSearchPerformed(false);
    setRecommendations([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-2">Advanced Doctor Search</h2>
        <p className="text-gray-600">Find the perfect doctor with our AI-powered recommendation engine</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by doctor name, specialty or symptom"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Location or hospital"
              className="pl-10"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          
          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger>
              <SelectValue placeholder="Select specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All specialties</SelectItem>
              {SPECIALTIES.map((spec) => (
                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={insurance} onValueChange={setInsurance}>
            <SelectTrigger>
              <SelectValue placeholder="Insurance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any insurance</SelectItem>
              {INSURANCE_OPTIONS.map((ins) => (
                <SelectItem key={ins} value={ins}>{ins}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Button 
            type="submit" 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Brain size={16} />
            <span>Search with AI Recommendations</span>
          </Button>
          
          {searchPerformed && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={resetSearch}
            >
              Reset Search
            </Button>
          )}
          
          {searchPerformed && recommendations.length > 0 && (
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="matchScore">Best match</SelectItem>
                <SelectItem value="rating">Highest rating</SelectItem>
                <SelectItem value="reviewCount">Most reviewed</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </form>

      {/* Search Results */}
      {searchLoading && (
        <div className="text-center py-10">
          <div className="mb-4">
            <Brain className="animate-pulse mx-auto h-12 w-12 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Our AI is finding the best doctors for you</h3>
          <div className="max-w-md mx-auto">
            <Progress value={65} className="h-2 mb-2" />
            <p className="text-sm text-gray-500">Analyzing your search criteria...</p>
          </div>
        </div>
      )}

      {searchPerformed && !searchLoading && recommendations.length === 0 && (
        <div className="text-center py-10 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">No doctors found matching your criteria</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search terms or removing some filters</p>
          <Button variant="outline" onClick={resetSearch}>Reset Filters</Button>
        </div>
      )}

      {searchPerformed && recommendations.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Recommended Doctors</h3>
            <Badge variant="outline" className="font-normal">
              {recommendations.length} results
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((doctor) => (
              <DoctorCard 
                key={doctor.id} 
                doctor={doctor} 
                showMatchScore={true} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Trending Doctors (shown on initial load) */}
      {!searchPerformed && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <h3 className="text-xl font-semibold">Trending Doctors</h3>
          </div>
          
          {trendingLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="w-full h-40 bg-gray-200 rounded-md mb-4" />
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingDoctors?.map((doctor) => (
                <DoctorCard 
                  key={doctor.id} 
                  doctor={doctor} 
                  isTrending={true} 
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DoctorCard = ({ doctor, showMatchScore, isTrending }) => {
  // Get user associated with doctor profile
  const user = doctor.user || {};
  
  // Generate rating stars
  const ratingStars = generateStarRating(doctor.rating || 0);
  
  // Format specialty badges
  const specialties = doctor.specialty ? doctor.specialty.split(',') : [];
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="relative">
          {/* Doctor image */}
          <div className="aspect-video bg-gray-100 overflow-hidden">
            <img 
              src={user.profileImage || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'} 
              alt={`Dr. ${user.firstName} ${user.lastName}`}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Match score or trending badge */}
          {showMatchScore && doctor.matchScore > 0 && (
            <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-semibold rounded-full px-2 py-1 flex items-center gap-1">
              <Brain size={12} />
              <span>{Math.round(doctor.matchScore * 100)}% Match</span>
            </div>
          )}
          
          {isTrending && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-semibold rounded-full px-2 py-1 flex items-center gap-1">
              <TrendingUp size={12} />
              <span>Trending</span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-1">Dr. {user.firstName} {user.lastName}</h3>
          
          <div className="flex flex-wrap gap-1 mb-2">
            {specialties.slice(0, 2).map((specialty, index) => (
              <Badge key={index} variant="outline" className="text-xs font-normal">
                {specialty.trim()}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {ratingStars.map((star, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    star.type === 'full' 
                      ? 'text-yellow-500 fill-yellow-500' 
                      : star.type === 'half' 
                        ? 'text-yellow-500 fill-yellow-500' 
                        : 'text-gray-300'
                  }
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {doctor.rating?.toFixed(1) || 'No ratings'} 
              {doctor.reviewCount ? ` (${doctor.reviewCount})` : ''}
            </span>
          </div>
          
          <div className="text-sm text-gray-600 mb-3">
            <div>{doctor.hospital}</div>
            <div>{doctor.address}</div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {doctor.offersInPerson && (
              <Badge variant="secondary" className="text-xs">In-person</Badge>
            )}
            {doctor.offersTelehealth && (
              <Badge variant="secondary" className="text-xs">Telehealth</Badge>
            )}
          </div>
          
          <Button className="w-full">View Profile</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearchSection;