import React from 'react';
import { useLocation } from 'wouter';
import { Search, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AppointmentSection: React.FC = () => {
  const [, navigate] = useLocation();
  
  const handleBookAppointment = () => {
    navigate('/find-doctors');
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Simplified Appointment Booking</h2>
            <p className="text-lg text-gray-600">Schedule an appointment with just a few clicks</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Search className="text-primary-600 h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Find a Doctor</h3>
              <p className="text-gray-600">Search by specialty, location, insurance or availability to find the right healthcare professional</p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-primary-600 h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Select a Time Slot</h3>
              <p className="text-gray-600">Choose from available appointments and select a time that works best for you</p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-primary-600 h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Confirm Booking</h3>
              <p className="text-gray-600">Provide your details, choose in-person or telehealth, and receive instant confirmation</p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Button 
              className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-8"
              onClick={handleBookAppointment}
            >
              Book an Appointment Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppointmentSection;
