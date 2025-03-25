import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { queryClient, apiRequest } from '@/lib/queryClient';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getInitials, formatDate } from '@/lib/utils';
import { Calendar, Clock, Video, MapPin, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: number;
  doctorId: number;
  patientId: number;
  date: string;
  time: string;
  type: string;
  status: string;
  notes: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorProfileImage: string;
}

const Appointments: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { data: appointments, isLoading, error } = useQuery({
    queryKey: [`/api/appointments/patient/${user?.id}`],
    queryFn: undefined, // Using the default query function
  });
  
  const filteredAppointments = appointments?.filter((appointment: Appointment) => {
    if (statusFilter === 'all') return true;
    return appointment.status === statusFilter;
  });
  
  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      await apiRequest('PATCH', `/api/appointments/${appointmentId}`, {
        status: 'cancelled'
      });
      
      // Invalidate appointments query to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/appointments/patient/${user?.id}`] });
      
      toast({
        title: "Appointment cancelled",
        description: "Your appointment has been successfully cancelled.",
      });
    } catch (error) {
      toast({
        title: "Failed to cancel appointment",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
            <p className="text-gray-600">Manage your upcoming and past appointments</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button
              className="bg-primary-500 hover:bg-primary-600"
              onClick={() => window.location.href = '/find-doctors'}
            >
              Book New Appointment
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="upcoming" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <TabsContent value="upcoming" className="space-y-6">
            {isLoading ? (
              // Loading skeleton
              Array(3).fill(0).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <div className="flex flex-col gap-2 min-w-[120px]">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : error ? (
              <Card>
                <CardContent className="p-6 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p>Error loading appointments. Please try again later.</p>
                </CardContent>
              </Card>
            ) : filteredAppointments?.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center py-10">
                  <p className="text-gray-500 mb-4">You don't have any upcoming appointments.</p>
                  <Button 
                    className="bg-primary-500 hover:bg-primary-600"
                    onClick={() => window.location.href = '/find-doctors'}
                  >
                    Book an Appointment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredAppointments
                ?.filter((appointment: Appointment) => 
                  new Date(appointment.date) >= new Date() && 
                  appointment.status !== 'completed'
                )
                .map((appointment: Appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={appointment.doctorProfileImage} alt={appointment.doctorName} />
                          <AvatarFallback className="bg-primary-100 text-lg">
                            {getInitials(appointment.doctorName)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">{appointment.doctorName}</h3>
                          <p className="text-sm text-primary-600">{appointment.doctorSpecialty}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              {formatDate(appointment.date)}
                            </p>
                            <p className="text-sm flex items-center text-gray-600">
                              <Clock className="h-4 w-4 mr-2" />
                              {appointment.time}
                            </p>
                            <p className="text-sm flex items-center text-gray-600">
                              {appointment.type === 'telehealth' ? (
                                <Video className="h-4 w-4 mr-2" />
                              ) : (
                                <MapPin className="h-4 w-4 mr-2" />
                              )}
                              {appointment.type === 'telehealth' ? 'Telehealth' : 'In-person'} appointment
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 min-w-[120px] mt-4 md:mt-0">
                          <Badge className={
                            appointment.status === 'scheduled' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-700 hover:bg-red-100' : 
                            'bg-gray-100 text-gray-700 hover:bg-gray-100'
                          }>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Badge>
                          
                          {appointment.status === 'scheduled' ? (
                            <>
                              <Button 
                                variant="outline" 
                                className="mt-2"
                                onClick={() => handleCancelAppointment(appointment.id)}
                              >
                                Cancel
                              </Button>
                              {appointment.type === 'telehealth' && (
                                <Button className="bg-primary-500 hover:bg-primary-600 mt-2">
                                  Join Call
                                </Button>
                              )}
                            </>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>
          
          <TabsContent value="past" className="space-y-6">
            {isLoading ? (
              // Loading skeleton
              Array(3).fill(0).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <div className="flex flex-col gap-2 min-w-[120px]">
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : error ? (
              <Card>
                <CardContent className="p-6 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p>Error loading appointments. Please try again later.</p>
                </CardContent>
              </Card>
            ) : filteredAppointments?.filter((appointment: Appointment) => 
                  new Date(appointment.date) < new Date() || 
                  appointment.status === 'completed'
                ).length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center py-10">
                  <p className="text-gray-500">You don't have any past appointments.</p>
                </CardContent>
              </Card>
            ) : (
              filteredAppointments
                ?.filter((appointment: Appointment) => 
                  new Date(appointment.date) < new Date() || 
                  appointment.status === 'completed'
                )
                .map((appointment: Appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={appointment.doctorProfileImage} alt={appointment.doctorName} />
                          <AvatarFallback className="bg-primary-100 text-lg">
                            {getInitials(appointment.doctorName)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">{appointment.doctorName}</h3>
                          <p className="text-sm text-primary-600">{appointment.doctorSpecialty}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              {formatDate(appointment.date)}
                            </p>
                            <p className="text-sm flex items-center text-gray-600">
                              <Clock className="h-4 w-4 mr-2" />
                              {appointment.time}
                            </p>
                            <p className="text-sm flex items-center text-gray-600">
                              {appointment.type === 'telehealth' ? (
                                <Video className="h-4 w-4 mr-2" />
                              ) : (
                                <MapPin className="h-4 w-4 mr-2" />
                              )}
                              {appointment.type === 'telehealth' ? 'Telehealth' : 'In-person'} appointment
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 min-w-[120px] mt-4 md:mt-0">
                          <Badge className={
                            appointment.status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-700 hover:bg-red-100' : 
                            'bg-gray-100 text-gray-700 hover:bg-gray-100'
                          }>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Badge>
                          
                          {appointment.status === 'completed' && (
                            <Button 
                              variant="outline" 
                              className="mt-2"
                              onClick={() => window.location.href = `/doctor-profile/${appointment.doctorId}`}
                            >
                              Leave Review
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Appointments;
