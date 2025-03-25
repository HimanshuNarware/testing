import React from 'react';
import { 
  SPECIALTIES, 
  AVAILABILITY_OPTIONS, 
  GENDER_OPTIONS, 
  INSURANCE_OPTIONS 
} from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Sliders } from 'lucide-react';

const FilterSection = ({ 
  filters, 
  onFilterChange, 
  onShowMoreFilters 
}) => {
  return (
    <section className="py-8 bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between">
          <h2 className="text-xl font-semibold mb-4 md:mb-0">Filter Results</h2>
          
          <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
            <Select
              value={filters.specialty}
              onValueChange={(value) => onFilterChange('specialty', value)}
            >
              <SelectTrigger className="w-full md:w-[180px] bg-gray-100">
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="">All Specialties</SelectItem>
                  {SPECIALTIES.map((specialty) => (
                    <SelectItem key={specialty.value} value={specialty.value}>
                      {specialty.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Select
              value={filters.availability}
              onValueChange={(value) => onFilterChange('availability', value)}
            >
              <SelectTrigger className="w-full md:w-[180px] bg-gray-100">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="">Any Availability</SelectItem>
                  {AVAILABILITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Select
              value={filters.gender}
              onValueChange={(value) => onFilterChange('gender', value)}
            >
              <SelectTrigger className="w-full md:w-[180px] bg-gray-100">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="">Any Gender</SelectItem>
                  {GENDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Select
              value={filters.insurance}
              onValueChange={(value) => onFilterChange('insurance', value)}
            >
              <SelectTrigger className="w-full md:w-[180px] bg-gray-100">
                <SelectValue placeholder="Insurance" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="">Any Insurance</SelectItem>
                  {INSURANCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={onShowMoreFilters}
              className="w-full md:w-auto"
            >
              <Sliders className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FilterSection;