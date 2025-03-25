import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Star, StarHalf, MapPin, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SORT_OPTIONS } from '@/lib/constants';
import { generateStarRating, getInitials } from '@/lib/utils';

const DoctorListingSection = ({
  searchQuery = '',
  locationQuery = '',
  specialty = '',
  sortBy = 'relevance'
}) => {
  const [, navigate] = useLocation();
  const [currentSortBy, setCurrentSortBy] = useState(sortBy);
  
  // Create query params for the API call
  const queryParams = new URLSearchParams();
  if (specialty) queryParams.set('specialty', specialty);
  
  // Fetch doctors with filters
  const { data: doctors, isLoading, error } = useQuery({
    queryKey: [`/api/doctors?${queryParams.toString()}`],
    queryFn: undefined, // Using the default query function
  });
  
  const handleSortChange = (value) => {
    setCurrentSortBy(value);
    
    // Logic to sort doctors based on the selected option
    // Ideally this would be handled by the server but for now we'll do it client-side
  };
  
  const handleBookAppointment = (doctorId) => {
    navigate(`/doctor-profile/${doctorId}`);
  };

  // Filter doctors based on search query and location if applicable
  let filteredDoctors = doctors || [];
  
  if (searchQuery) {
    filteredDoctors = filteredDoctors.filter((doctor) => 
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  if (locationQuery) {
    filteredDoctors = filteredDoctors.filter((doctor) => 
      doctor.location.toLowerCase().includes(locationQuery.toLowerCase())
    );
  }

  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between">
          <h2 className="text-2xl font-bold">Top Doctors Near You</h2>
          <div className="flex items-center mt-4 sm:mt-0">
            <span className="mr-2 text-gray-600">Sort by:</span>
            <Select value={currentSortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Doctor Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="flex-1 ml-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Skeleton className="h-4 w-3/4 mb-3" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-6 w-1/4" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Error loading doctors. Please try again later.</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No doctors found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => {
              const stars = generateStarRating(doctor.rating);
              
              return (
                <div key={doctor.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="p-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={doctor.profileImage} alt={doctor.name} />
                          <AvatarFallback className="bg-primary-100 text-lg">
                            {getInitials(doctor.name)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {doctor.name}
                        </h3>
                        <p className="text-sm text-primary-600 mb-1">{doctor.specialty}</p>
                        <div className="flex items-center mb-1">
                          <div className="flex text-yellow-400">
                            {stars.map((star, index) => (
                              <span key={index}>
                                {star.type === 'full' && <Star className="h-4 w-4 fill-current" />}
                                {star.type === 'half' && <StarHalf className="h-4 w-4 fill-current" />}
                                {star.type === 'empty' && <Star className="h-4 w-4 text-gray-300" />}
                              </span>
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            {doctor.rating} ({doctor.reviewCount} reviews)
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{doctor.location}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 mb-3">
                        <Calendar className="h-4 w-4 inline-block text-green-500 mr-1" />
                        <span>Next available: <strong>Today, 3:00 PM</strong></span>
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {doctor.offersInPerson && (
                          <Badge variant="outline" className="bg-blue-50 text-primary-700 border-primary-200">
                            In-person
                          </Badge>
                        )}
                        {doctor.offersTelehealth && (
                          <Badge variant="outline" className="bg-blue-50 text-primary-700 border-primary-200">
                            Telehealth
                          </Badge>
                        )}
                        {doctor.acceptsInsurance && doctor.acceptsInsurance.length > 0 && (
                          <Badge variant="outline" className="bg-blue-50 text-primary-700 border-primary-200">
                            {doctor.acceptsInsurance[0]}
                          </Badge>
                        )}
                      </div>
                      <Button 
                        className="w-full bg-primary-500 hover:bg-primary-600"
                        onClick={() => handleBookAppointment(doctor.id)}
                      >
                        Book Appointment
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {filteredDoctors.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Button variant="outline" className="text-primary-600">
              Load More
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default DoctorListingSection;