import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import FilterSection from '@/components/FilterSection';
import DoctorListingSection from '@/components/DoctorListingSection';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const FindDoctors: React.FC = () => {
  const [location, params] = useLocation();
  const searchParams = new URLSearchParams(params);
  
  const [filters, setFilters] = useState({
    specialty: '',
    availability: '',
    gender: '',
    insurance: '',
    rating: 0,
    distance: [10],
    offersInPerson: false,
    offersTelehealth: false,
  });
  
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);
  
  // Parse search parameters from URL
  useEffect(() => {
    const searchQuery = searchParams.get('q') || '';
    const locationQuery = searchParams.get('location') || '';
    
    // Update relevant filters from URL parameters
    if (searchParams.has('specialty')) {
      setFilters(prev => ({ ...prev, specialty: searchParams.get('specialty') || '' }));
    }
  }, [params]);
  
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleShowMoreFilters = () => {
    setIsMoreFiltersOpen(true);
  };
  
  const handleApplyFilters = () => {
    setIsMoreFiltersOpen(false);
    // Apply additional filters logic
  };

  return (
    <div>
      <FilterSection 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onShowMoreFilters={handleShowMoreFilters}
      />
      
      <DoctorListingSection 
        searchQuery={searchParams.get('q') || undefined}
        locationQuery={searchParams.get('location') || undefined}
        specialty={filters.specialty}
        sortBy="relevance"
      />
      
      {/* More Filters Sheet */}
      <Sheet open={isMoreFiltersOpen} onOpenChange={setIsMoreFiltersOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Additional Filters</SheetTitle>
            <SheetDescription>
              Refine your search with more specific filters.
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-4 space-y-6">
            {/* Rating Filter */}
            <div>
              <Label className="mb-2 block">Minimum Rating</Label>
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Any Rating</span>
                  <span className="text-sm font-semibold">{filters.rating}+ Stars</span>
                </div>
                <Slider
                  defaultValue={[filters.rating]}
                  max={5}
                  step={1}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, rating: value[0] }))}
                />
              </div>
            </div>
            
            {/* Distance Filter */}
            <div>
              <Label className="mb-2 block">Maximum Distance</Label>
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Any Distance</span>
                  <span className="text-sm font-semibold">{filters.distance[0]} miles</span>
                </div>
                <Slider
                  defaultValue={filters.distance}
                  max={50}
                  step={5}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, distance: value }))}
                />
              </div>
            </div>
            
            {/* Appointment Type Filters */}
            <div className="space-y-4">
              <h4 className="font-medium">Appointment Types</h4>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="offers-in-person" className="flex-1">In-person Appointments</Label>
                <Switch
                  id="offers-in-person"
                  checked={filters.offersInPerson}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, offersInPerson: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="offers-telehealth" className="flex-1">Telehealth Appointments</Label>
                <Switch
                  id="offers-telehealth"
                  checked={filters.offersTelehealth}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, offersTelehealth: checked }))}
                />
              </div>
            </div>
            
            <Button className="w-full" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default FindDoctors;
