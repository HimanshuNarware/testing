import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { apiRequest, queryClient } from '@/lib/queryClient';
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
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar,
  Clock,
  Users,
  Star,
  ChevronUp,
  ChevronDown,
  ClipboardCheck,
  AlertCircle,
  UserPlus,
  BarChart4
} from 'lucide-react';
import { getInitials, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('schedule');
  const [expandedPatient, setExpandedPatient] = useState<number | null>(null);

  // Fetch doctor profile
  const { data: doctorProfile } = useQuery({
    queryKey: [`/api/doctors/user/${user?.id}`],
    queryFn: undefined,
  });

  // Fetch appointments for the doctor
  const { 
    data: appointments, 
    isLoading: appointmentsLoading, 
    error: appointmentsError 
  } = useQuery({
    queryKey: [`/api/appointments/doctor/${doctorProfile?.id}`],
    queryFn: undefined,
    enabled: !!doctorProfile?.id,
  });

  // Fetch reviews for the doctor
  const { 
    data: reviews, 
    isLoading: reviewsLoading, 
    error: reviewsError 
  } = useQuery({
    queryKey: [`/api/reviews/doctor/${doctorProfile?.id}`],
    queryFn: undefined,
    enabled: !!doctorProfile?.id,
  });

  const handleUpdateAppointment = async (id: number, status: string) => {
    try {
      await apiRequest('PATCH', `/api/appointments/${id}`, { status });
      
      queryClient.invalidateQueries({ queryKey: [`/api/appointments/doctor/${doctorProfile?.id}`] });
      
      toast({
        title: "Appointment Updated",
        description: `Appointment status updated to ${status}.`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update appointment status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const togglePatientDetails = (patientId: number) => {
    if (expandedPatient === patientId) {
      setExpandedPatient(null);
    } else {
      setExpandedPatient(patientId);
    }
  };

  // Filter today's appointments
  const todayAppointments = appointments?.filter((apt: any) => {
    const appointmentDate = new Date(apt.date).toDateString();
    const today = new Date().toDateString();
    return appointmentDate === today && apt.status === 'scheduled';
  }) || [];

  // Group patients by ID
  const patientMap = new Map();
  appointments?.forEach((appointment: any) => {
    if (!patientMap.has(appointment.patientId)) {
      patientMap.set(appointment.patientId, {
        id: appointment.patientId,
        name: appointment.patientName || 'Unknown Patient',
        appointments: []
      });
    }
    patientMap.get(appointment.patientId).appointments.push(appointment);
  });

  const patients = Array.from(patientMap.values());

  // Calculate statistics
  const totalPatients = patients.length;
  const newPatientsThisMonth = patients.filter((patient: any) => {
    const firstAppointment = new Date(patient.appointments[0].date);
    const now = new Date();
    return firstAppointment.getMonth() === now.getMonth() && 
           firstAppointment.getFullYear() === now.getFullYear();
  }).length;
  
  const followUpRequired = patients.filter((patient: any) => {
    const lastAppointment = patient.appointments[patient.appointments.length - 1];
    return lastAppointment.status === 'completed' && 
           new Date(lastAppointment.date) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }).length;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Doctor Dashboard</h1>
            <p className="text-gray-600">Welcome, Dr. {user?.lastName}!</p>
          </div>
          <Button 
            className="mt-4 md:mt-0 bg-teal-500 hover:bg-teal-600"
            onClick={() => navigate('/doctor-profile/' + doctorProfile?.id)}
          >
            View Public Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Today's Schedule */}
          <Card className="bg-blue-50 border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : appointmentsError ? (
                <div className="flex items-center text-red-500">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>Failed to load schedule</span>
                </div>
              ) : todayAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-3">No appointments scheduled for today</p>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.slice(0, 2).map((appointment: any) => (
                    <div 
                      key={appointment.id} 
                      className="bg-white rounded-lg shadow-sm p-3"
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{appointment.patientName || 'Patient'}</p>
                          <p className="text-sm text-gray-600">{appointment.time} - {appointment.type}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs text-primary-600 border-primary-300 hover:bg-primary-50"
                          onClick={() => setActiveTab('schedule')}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Badge className="ml-auto">
                {todayAppointments.length} appointments today
              </Badge>
            </CardFooter>
          </Card>

          {/* Patient Stats */}
          <Card className="bg-teal-50 border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Patient Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Total Patients</span>
                    <span className="text-sm font-bold">{totalPatients}</span>
                  </div>
                  <Progress value={100} className="h-2 bg-teal-200">
                    <div className="bg-teal-500 h-2 rounded-full"></div>
                  </Progress>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">New This Month</span>
                    <span className="text-sm font-bold">{newPatientsThisMonth}</span>
                  </div>
                  <Progress 
                    value={totalPatients ? (newPatientsThisMonth / totalPatients) * 100 : 0} 
                    className="h-2 bg-teal-200"
                  >
                    <div className="bg-teal-500 h-2 rounded-full"></div>
                  </Progress>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Follow-up Required</span>
                    <span className="text-sm font-bold">{followUpRequired}</span>
                  </div>
                  <Progress 
                    value={totalPatients ? (followUpRequired / totalPatients) * 100 : 0} 
                    className="h-2 bg-teal-200"
                  >
                    <div className="bg-teal-500 h-2 rounded-full"></div>
                  </Progress>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="link" 
                className="text-teal-700 w-full"
                onClick={() => {
                  setActiveTab('patients');
                  document.getElementById('dashboard-tabs')?.scrollIntoView();
                }}
              >
                View All Patients
              </Button>
            </CardFooter>
          </Card>

          {/* Recent Reviews */}
          <Card className="bg-amber-50 border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {reviewsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : reviewsError ? (
                <div className="flex items-center text-red-500">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>Failed to load reviews</span>
                </div>
              ) : !reviews || reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-3">No reviews yet</p>
              ) : (
                <div className="space-y-3">
                  {reviews.slice(0, 1).map((review: any) => (
                    <Card key={review.id} className="shadow-sm">
                      <CardContent className="p-3">
                        <div className="flex text-yellow-400 mb-1">
                          {Array(5).fill(0).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 italic">
                          "{review.comment}"
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          - From {review.patientName}, {formatDate(review.date)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="mt-3 w-full bg-white text-amber-700 border-amber-300 hover:bg-amber-50"
                onClick={() => {
                  setActiveTab('reviews');
                  document.getElementById('dashboard-tabs')?.scrollIntoView();
                }}
              >
                View All Reviews
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div id="dashboard-tabs">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full border-b pb-0 rounded-none mb-4">
              <TabsTrigger className="flex-1" value="schedule">Schedule</TabsTrigger>
              <TabsTrigger className="flex-1" value="patients">Patients</TabsTrigger>
              <TabsTrigger className="flex-1" value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="schedule" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Schedule</CardTitle>
                  <CardDescription>Manage your upcoming and past appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  {appointmentsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Card key={i}>
                          <CardContent className="p-6">
                            <div className="flex gap-4">
                              <Skeleton className="h-12 w-12 rounded-full" />
                              <div className="space-y-2 flex-1">
                                <Skeleton className="h-5 w-1/3" />
                                <Skeleton className="h-4 w-2/3" />
                              </div>
                              <Skeleton className="h-8 w-24" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : appointmentsError ? (
                    <div className="text-center text-red-500 py-8">
                      <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                      <p>Failed to load your schedule. Please try again.</p>
                    </div>
                  ) : !appointments || appointments.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-xl font-medium mb-2">No Appointments Found</p>
                      <p className="text-gray-500">You don't have any appointments scheduled yet.</p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-medium text-lg mb-4">Today's Appointments</h3>
                      {todayAppointments.length === 0 ? (
                        <Card className="mb-6 bg-gray-50">
                          <CardContent className="p-4 text-center text-gray-500">
                            No appointments scheduled for today
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="space-y-4 mb-6">
                          {todayAppointments.map((appointment: any) => (
                            <Card key={appointment.id} className="overflow-hidden hover:shadow-md transition-shadow">
                              <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-4">
                                  <div className="flex-shrink-0">
                                    <Avatar className="h-12 w-12">
                                      <AvatarFallback className="bg-primary-100">
                                        {appointment.patientName ? getInitials(appointment.patientName) : 'P'}
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-medium">{appointment.patientName || 'Patient'}</h3>
                                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                                      <span className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {appointment.time}
                                      </span>
                                      <span className="flex items-center">
                                        <Badge variant="outline" className="mr-1">
                                          {appointment.type}
                                        </Badge>
                                      </span>
                                    </div>
                                    {appointment.notes && (
                                      <p className="mt-2 text-sm text-gray-500">
                                        <span className="font-medium">Notes:</span> {appointment.notes}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-2 items-end justify-center">
                                    <Badge className={
                                      appointment.status === 'scheduled' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 
                                      appointment.status === 'completed' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : 
                                      'bg-red-100 text-red-700 hover:bg-red-100'
                                    }>
                                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                    </Badge>
                                    {appointment.status === 'scheduled' && (
                                      <div className="flex gap-2 mt-2">
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => handleUpdateAppointment(appointment.id, 'cancelled')}
                                        >
                                          Cancel
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          className="bg-primary-500 hover:bg-primary-600"
                                          onClick={() => handleUpdateAppointment(appointment.id, 'completed')}
                                        >
                                          Complete
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                      
                      <h3 className="font-medium text-lg mb-4">Upcoming Appointments</h3>
                      <div className="space-y-4">
                        {appointments.filter((apt: any) => {
                          const appointmentDate = new Date(apt.date);
                          const today = new Date();
                          return appointmentDate > today && 
                                 apt.status === 'scheduled' && 
                                 appointmentDate.toDateString() !== today.toDateString();
                        }).map((appointment: any) => (
                          <Card key={appointment.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-shrink-0">
                                  <Avatar className="h-12 w-12">
                                    <AvatarFallback className="bg-primary-100">
                                      {appointment.patientName ? getInitials(appointment.patientName) : 'P'}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-medium">{appointment.patientName || 'Patient'}</h3>
                                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                                    <span className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-1" />
                                      {formatDate(appointment.date)}
                                    </span>
                                    <span className="flex items-center">
                                      <Clock className="h-4 w-4 mr-1" />
                                      {appointment.time}
                                    </span>
                                    <span className="flex items-center">
                                      <Badge variant="outline" className="mr-1">
                                        {appointment.type}
                                      </Badge>
                                    </span>
                                  </div>
                                  {appointment.notes && (
                                    <p className="mt-2 text-sm text-gray-500">
                                      <span className="font-medium">Notes:</span> {appointment.notes}
                                    </p>
                                  )}
                                </div>
                                <div className="flex flex-col gap-2 items-end justify-center">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleUpdateAppointment(appointment.id, 'cancelled')}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="patients" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Management</CardTitle>
                  <CardDescription>View and manage your patients</CardDescription>
                </CardHeader>
                <CardContent>
                  {appointmentsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Card key={i}>
                          <CardContent className="p-6">
                            <div className="flex gap-4">
                              <Skeleton className="h-12 w-12 rounded-full" />
                              <div className="space-y-2 flex-1">
                                <Skeleton className="h-5 w-1/3" />
                                <Skeleton className="h-4 w-2/3" />
                              </div>
                              <Skeleton className="h-8 w-8" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : appointmentsError ? (
                    <div className="text-center text-red-500 py-8">
                      <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                      <p>Failed to load patient data. Please try again.</p>
                    </div>
                  ) : patients.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-xl font-medium mb-2">No Patients Found</p>
                      <p className="text-gray-500">You don't have any patients yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-gray-500">{patients.length} patients total</p>
                        <Button 
                          className="bg-teal-500 hover:bg-teal-600"
                          size="sm"
                          onClick={() => {}}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add New Patient
                        </Button>
                      </div>
                      
                      {patients.map((patient: any) => (
                        <Card key={patient.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div 
                              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                              onClick={() => togglePatientDetails(patient.id)}
                            >
                              <div className="flex items-center">
                                <Avatar className="h-10 w-10 mr-3">
                                  <AvatarFallback className="bg-primary-100">
                                    {getInitials(patient.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-medium">{patient.name}</h3>
                                  <p className="text-sm text-gray-500">
                                    {patient.appointments.length} appointments
                                  </p>
                                </div>
                              </div>
                              {expandedPatient === patient.id ? (
                                <ChevronUp className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            
                            {expandedPatient === patient.id && (
                              <div className="border-t border-gray-100 p-4 bg-gray-50">
                                <h4 className="font-medium mb-2">Appointment History</h4>
                                <div className="space-y-3">
                                  {patient.appointments.map((appointment: any) => (
                                    <div key={appointment.id} className="bg-white rounded-lg border p-3 text-sm">
                                      <div className="flex justify-between">
                                        <div className="flex items-center">
                                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                          <span>{formatDate(appointment.date)}</span>
                                        </div>
                                        <Badge className={
                                          appointment.status === 'scheduled' ? 'bg-green-100 text-green-700' : 
                                          appointment.status === 'completed' ? 'bg-blue-100 text-blue-700' : 
                                          'bg-red-100 text-red-700'
                                        }>
                                          {appointment.status}
                                        </Badge>
                                      </div>
                                      <div className="mt-2 flex items-center text-gray-600">
                                        <Clock className="h-4 w-4 mr-2" />
                                        <span>{appointment.time}</span>
                                        <span className="mx-2">•</span>
                                        <span>{appointment.type}</span>
                                      </div>
                                      {appointment.notes && (
                                        <p className="mt-2 text-gray-600 italic">
                                          "{appointment.notes}"
                                        </p>
                                      )}
                                      {appointment.status === 'scheduled' && (
                                        <div className="mt-3 flex justify-end gap-2">
                                          <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleUpdateAppointment(appointment.id, 'cancelled');
                                            }}
                                          >
                                            Cancel
                                          </Button>
                                          {new Date(appointment.date).toDateString() === new Date().toDateString() && (
                                            <Button 
                                              size="sm" 
                                              className="bg-primary-500 hover:bg-primary-600"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleUpdateAppointment(appointment.id, 'completed');
                                              }}
                                            >
                                              Complete
                                            </Button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="mt-4 flex justify-end">
                                  <Button 
                                    variant="outline"
                                    size="sm"
                                    className="text-teal-600 border-teal-200 hover:bg-teal-50"
                                  >
                                    <ClipboardCheck className="h-4 w-4 mr-2" />
                                    Add Medical Record
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Patient Reviews</CardTitle>
                      <CardDescription>See what your patients are saying about you</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        <div className="flex text-yellow-400 mr-2">
                          {Array(5).fill(0).map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-current" />
                          ))}
                        </div>
                        <span className="font-bold text-lg">
                          {doctorProfile?.rating || 0}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {doctorProfile?.reviewCount || 0} reviews
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {reviewsLoading ? (
                    <div className="space-y-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border-b pb-6">
                          <div className="flex items-center mb-2">
                            <Skeleton className="h-10 w-10 rounded-full mr-3" />
                            <div>
                              <Skeleton className="h-4 w-40 mb-1" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                          <Skeleton className="h-4 w-full mb-1" />
                          <Skeleton className="h-4 w-full mb-1" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      ))}
                    </div>
                  ) : reviewsError ? (
                    <div className="text-center text-red-500 py-8">
                      <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                      <p>Failed to load reviews. Please try again.</p>
                    </div>
                  ) : !reviews || reviews.length === 0 ? (
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-xl font-medium mb-2">No Reviews Yet</p>
                      <p className="text-gray-500">You haven't received any patient reviews yet.</p>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-8">
                        <h3 className="text-lg font-medium mb-3">Rating Breakdown</h3>
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map((rating) => {
                            const count = reviews.filter((r: any) => r.rating === rating).length;
                            const percentage = (count / reviews.length) * 100;
                            return (
                              <div key={rating} className="flex items-center">
                                <div className="flex items-center w-16">
                                  <span className="font-medium mr-1">{rating}</span>
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                </div>
                                <div className="flex-1 mx-2">
                                  <div className="bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-yellow-400 h-2 rounded-full" 
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="w-12 text-right text-sm text-gray-500">
                                  {count}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-medium mb-4">All Reviews</h3>
                      <div className="space-y-6">
                        {reviews.map((review: any) => (
                          <div key={review.id} className="border-b pb-6 last:border-0 last:pb-0">
                            <div className="flex items-start">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarFallback className="bg-primary-100">
                                  {getInitials(review.patientName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium">{review.patientName}</h4>
                                <div className="flex items-center mb-2">
                                  <div className="flex text-yellow-400 mr-2">
                                    {Array(5).fill(0).map((_, i) => (
                                      <Star 
                                        key={i} 
                                        className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} 
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button 
                    variant="outline" 
                    className="mr-2"
                    onClick={() => {
                      const csvContent = "data:text/csv;charset=utf-8," + 
                        "Patient,Rating,Date,Comment\n" +
                        reviews?.map((r: any) => 
                          `"${r.patientName}",${r.rating},${new Date(r.date).toLocaleDateString()},"${r.comment}"`
                        ).join("\n");
                      
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", "reviews.csv");
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button>
                    <BarChart4 className="h-4 w-4 mr-2" />
                    Detailed Analytics
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
