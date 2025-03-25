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
import { 
  Calendar,
  Clock,
  MapPin,
  Video,
  FileText,
  Pill,
  AlertCircle,
  Download
} from 'lucide-react';
import { getInitials, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('appointments');

  // Fetch upcoming appointments
  const { 
    data: appointments, 
    isLoading: appointmentsLoading, 
    error: appointmentsError 
  } = useQuery({
    queryKey: [`/api/appointments/patient/${user?.id}`],
    queryFn: undefined, // Using the default query function from setup
  });

  // Fetch medical records
  const { 
    data: medicalRecords, 
    isLoading: recordsLoading, 
    error: recordsError 
  } = useQuery({
    queryKey: [`/api/medical-records/patient/${user?.id}`],
    queryFn: undefined,
  });

  // Fetch prescriptions
  const { 
    data: prescriptions, 
    isLoading: prescriptionsLoading, 
    error: prescriptionsError 
  } = useQuery({
    queryKey: [`/api/prescriptions/patient/${user?.id}`],
    queryFn: undefined,
  });

  const handleRenewPrescription = async (id: number) => {
    try {
      await apiRequest('PATCH', `/api/prescriptions/${id}`, {
        refillsLeft: 3, // Request 3 refills
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/prescriptions/patient/${user?.id}`] });
      
      toast({
        title: "Renewal Requested",
        description: "Your prescription renewal request has been submitted.",
      });
    } catch (error) {
      toast({
        title: "Renewal Failed",
        description: "Failed to submit renewal request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelAppointment = async (id: number) => {
    try {
      await apiRequest('PATCH', `/api/appointments/${id}`, {
        status: 'cancelled'
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/appointments/patient/${user?.id}`] });
      
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been successfully cancelled.",
      });
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const upcomingAppointments = appointments?.filter(
    (apt: any) => apt.status === 'scheduled' && new Date(apt.date) >= new Date()
  ) || [];

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Patient Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
          </div>
          <Button 
            className="mt-4 md:mt-0 bg-primary-500 hover:bg-primary-600"
            onClick={() => navigate('/find-doctors')}
          >
            Book New Appointment
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Upcoming Appointments Overview */}
          <Card className="bg-blue-50 border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
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
                  <span>Failed to load appointments</span>
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-3">No upcoming appointments</p>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.slice(0, 2).map((appointment: any) => (
                    <div 
                      key={appointment.id} 
                      className="bg-white rounded-lg shadow-sm p-3"
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{appointment.doctorName}</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(appointment.date)}, {appointment.time}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs text-primary-600 border-primary-300 hover:bg-primary-50"
                          onClick={() => navigate('/appointments')}
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="link" 
                className="text-primary-600 w-full"
                onClick={() => {
                  setActiveTab('appointments');
                  document.getElementById('dashboard-tabs')?.scrollIntoView();
                }}
              >
                View All Appointments
              </Button>
            </CardFooter>
          </Card>

          {/* Medical Records Overview */}
          <Card className="bg-green-50 border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Medical Records</CardTitle>
            </CardHeader>
            <CardContent>
              {recordsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : recordsError ? (
                <div className="flex items-center text-red-500">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>Failed to load records</span>
                </div>
              ) : !medicalRecords || medicalRecords.length === 0 ? (
                <p className="text-gray-500 text-center py-3">No medical records found</p>
              ) : (
                <ul className="space-y-2">
                  {medicalRecords.slice(0, 3).map((record: any) => (
                    <li key={record.id} className="flex items-center text-sm">
                      <FileText className="h-4 w-4 text-green-600 mr-2" />
                      <span>{record.title} ({formatDate(record.date)})</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full bg-white text-green-700 border-green-300 hover:bg-green-50"
                onClick={() => {
                  setActiveTab('records');
                  document.getElementById('dashboard-tabs')?.scrollIntoView();
                }}
              >
                View All Records
              </Button>
            </CardFooter>
          </Card>

          {/* Prescriptions Overview */}
          <Card className="bg-purple-50 border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              {prescriptionsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : prescriptionsError ? (
                <div className="flex items-center text-red-500">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>Failed to load prescriptions</span>
                </div>
              ) : !prescriptions || prescriptions.length === 0 ? (
                <p className="text-gray-500 text-center py-3">No prescriptions found</p>
              ) : (
                <div className="space-y-3">
                  {prescriptions.slice(0, 2).map((prescription: any) => (
                    <div 
                      key={prescription.id} 
                      className="bg-white rounded-lg shadow-sm p-3"
                    >
                      <p className="font-medium">{prescription.medication}</p>
                      <p className="text-xs text-gray-600">{prescription.dosage}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-xs text-purple-700">
                          {prescription.refillsLeft} refills left
                        </span>
                        {prescription.refillsLeft <= 1 && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs text-purple-700 border-purple-300 hover:bg-purple-50"
                            onClick={() => handleRenewPrescription(prescription.id)}
                          >
                            Renew
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="link" 
                className="text-purple-700 w-full"
                onClick={() => {
                  setActiveTab('prescriptions');
                  document.getElementById('dashboard-tabs')?.scrollIntoView();
                }}
              >
                View All Prescriptions
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div id="dashboard-tabs">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full border-b pb-0 rounded-none mb-4">
              <TabsTrigger className="flex-1" value="appointments">Appointments</TabsTrigger>
              <TabsTrigger className="flex-1" value="records">Medical Records</TabsTrigger>
              <TabsTrigger className="flex-1" value="prescriptions">Prescriptions</TabsTrigger>
            </TabsList>

            <TabsContent value="appointments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Appointments</CardTitle>
                  <CardDescription>View and manage all your scheduled appointments</CardDescription>
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
                      <p>Failed to load your appointments. Please try again.</p>
                    </div>
                  ) : !appointments || appointments.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-xl font-medium mb-2">No Appointments Found</p>
                      <p className="text-gray-500 mb-6">You don't have any appointments scheduled yet.</p>
                      <Button 
                        onClick={() => navigate('/find-doctors')}
                        className="bg-primary-500 hover:bg-primary-600"
                      >
                        Book an Appointment
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {appointments.map((appointment: any) => (
                        <Card key={appointment.id} className="overflow-hidden hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={appointment.doctorProfileImage} alt={appointment.doctorName} />
                                <AvatarFallback className="bg-primary-100">
                                  {getInitials(appointment.doctorName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h3 className="font-medium">{appointment.doctorName}</h3>
                                <p className="text-sm text-primary-600">{appointment.doctorSpecialty}</p>
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
                                    {appointment.type === 'telehealth' ? (
                                      <Video className="h-4 w-4 mr-1" />
                                    ) : (
                                      <MapPin className="h-4 w-4 mr-1" />
                                    )}
                                    {appointment.type === 'telehealth' ? 'Telehealth' : 'In-person'}
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
                                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleCancelAppointment(appointment.id)}
                                    >
                                      Cancel
                                    </Button>
                                    {appointment.type === 'telehealth' && (
                                      <Button size="sm" className="bg-primary-500 hover:bg-primary-600">
                                        Join Call
                                      </Button>
                                    )}
                                  </div>
                                )}
                                {appointment.status === 'completed' && (
                                  <Button 
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => navigate(`/doctor-profile/${appointment.doctorId}`)}
                                  >
                                    Leave Review
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-primary-500 hover:bg-primary-600"
                    onClick={() => navigate('/find-doctors')}
                  >
                    Book New Appointment
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="records" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Medical Records</CardTitle>
                  <CardDescription>Access and manage your medical history</CardDescription>
                </CardHeader>
                <CardContent>
                  {recordsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Card key={i}>
                          <CardContent className="p-6">
                            <div className="space-y-2">
                              <Skeleton className="h-5 w-1/3" />
                              <Skeleton className="h-4 w-1/4" />
                              <Skeleton className="h-4 w-full" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : recordsError ? (
                    <div className="text-center text-red-500 py-8">
                      <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                      <p>Failed to load your medical records. Please try again.</p>
                    </div>
                  ) : !medicalRecords || medicalRecords.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-xl font-medium mb-2">No Medical Records Found</p>
                      <p className="text-gray-500">Your medical records will appear here once they're added by your healthcare provider.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {medicalRecords.map((record: any) => (
                        <Card key={record.id} className="overflow-hidden hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-lg">{record.title}</h3>
                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                  <Badge variant="outline" className="mr-2">{record.type}</Badge>
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {formatDate(record.date)}
                                </div>
                                <p className="mt-3 text-gray-700">{record.content}</p>
                              </div>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prescriptions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Prescriptions</CardTitle>
                  <CardDescription>View and manage your current and past prescriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  {prescriptionsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Card key={i}>
                          <CardContent className="p-6">
                            <div className="space-y-2">
                              <Skeleton className="h-5 w-1/3" />
                              <Skeleton className="h-4 w-1/4" />
                              <div className="flex justify-between mt-3">
                                <Skeleton className="h-4 w-1/5" />
                                <Skeleton className="h-8 w-20" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : prescriptionsError ? (
                    <div className="text-center text-red-500 py-8">
                      <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                      <p>Failed to load your prescriptions. Please try again.</p>
                    </div>
                  ) : !prescriptions || prescriptions.length === 0 ? (
                    <div className="text-center py-8">
                      <Pill className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-xl font-medium mb-2">No Prescriptions Found</p>
                      <p className="text-gray-500">You don't have any active prescriptions at the moment.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {prescriptions.map((prescription: any) => (
                        <Card key={prescription.id} className="overflow-hidden hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="sm:flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-lg">{prescription.medication}</h3>
                                <p className="text-gray-700 mt-1">{prescription.dosage}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  <span className="font-medium">Doctor:</span> {prescription.doctorName}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  <span className="font-medium">Instructions:</span> {prescription.instructions}
                                </p>
                                <div className="flex items-center mt-3">
                                  <Badge className={
                                    prescription.refillsLeft > 0 
                                      ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                                      : 'bg-red-100 text-red-700 hover:bg-red-100'
                                  }>
                                    {prescription.refillsLeft} refills left
                                  </Badge>
                                  <span className="text-sm text-gray-500 ml-3">
                                    <Calendar className="h-4 w-4 inline mr-1" />
                                    Prescribed on {formatDate(prescription.date)}
                                  </span>
                                </div>
                              </div>
                              {prescription.refillsLeft <= 1 && (
                                <Button 
                                  variant="outline" 
                                  className="mt-4 sm:mt-0 text-purple-700 border-purple-300 hover:bg-purple-50"
                                  onClick={() => handleRenewPrescription(prescription.id)}
                                >
                                  Request Renewal
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
