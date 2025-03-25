import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { queryClient, apiRequest } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, MapPin, Calendar as CalendarIcon, Clock, Star, Video, User, Award, Briefcase, Heart, Stethoscope } from 'lucide-react';
import { generateStarRating, getInitials, formatDate } from '@/lib/utils';
import { TIME_SLOTS, APPOINTMENT_TYPES } from '@/lib/constants';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface DoctorProfileProps {
  id: number;
}

const DoctorProfile: React.FC<DoctorProfileProps> = ({ id }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [appointmentType, setAppointmentType] = useState<string>("in-person");
  const [notes, setNotes] = useState("");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState("");
  
  // Fetch doctor details
  const { data: doctor, isLoading, error } = useQuery({
    queryKey: [`/api/doctors/${id}`],
    queryFn: undefined, // Using the default query function
  });
  
  // Fetch doctor reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: [`/api/reviews/doctor/${id}`],
    queryFn: undefined, // Using the default query function
  });
  
  const handleBookAppointment = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book an appointment.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Incomplete Information",
        description: "Please select both a date and time for your appointment.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const appointmentData = {
        doctorId: id,
        patientId: user?.id,
        date: selectedDate.toISOString(),
        time: selectedTime,
        type: appointmentType,
        status: "scheduled",
        notes: notes.trim(),
      };
      
      await apiRequest('POST', '/api/appointments', appointmentData);
      
      // Reset form
      setSelectedDate(undefined);
      setSelectedTime(undefined);
      setAppointmentType("in-person");
      setNotes("");
      setIsBookingModalOpen(false);
      
      toast({
        title: "Appointment Booked",
        description: "Your appointment has been successfully scheduled.",
      });
      
      navigate('/appointments');
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "There was an error booking your appointment. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a review.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    try {
      const reviewData = {
        doctorId: id,
        patientId: user?.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
        date: new Date().toISOString(),
      };
      
      await apiRequest('POST', '/api/reviews', reviewData);
      
      // Reset form
      setReviewRating(5);
      setReviewComment("");
      setIsReviewModalOpen(false);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/reviews/doctor/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/doctors/${id}`] });
      
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your review. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
            <div className="md:w-2/3 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Doctor Not Found</h1>
          <p className="text-gray-600 mb-6">The doctor you're looking for doesn't exist or there was an error loading their profile.</p>
          <Button 
            onClick={() => navigate('/find-doctors')}
            className="bg-primary-500 hover:bg-primary-600"
          >
            Find Other Doctors
          </Button>
        </div>
      </div>
    );
  }

  const stars = generateStarRating(doctor.rating);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Doctor Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <div className="md:w-1/3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 text-center">
                <Avatar className="h-32 w-32 mx-auto mb-4">
                  <AvatarImage src={doctor.profileImage} alt={doctor.name} />
                  <AvatarFallback className="text-3xl bg-primary-100">
                    {getInitials(doctor.name)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{doctor.name}</h2>
                <p className="text-primary-600 mb-4">{doctor.specialty}</p>
                
                <div className="flex justify-center mb-4">
                  <div className="flex text-yellow-400">
                    {stars.map((star, index) => (
                      <span key={index}>
                        {star.type === 'full' && <Star className="h-5 w-5 fill-current" />}
                        {star.type === 'half' && <Star className="h-5 w-5 fill-current half" />}
                        {star.type === 'empty' && <Star className="h-5 w-5 text-gray-300" />}
                      </span>
                    ))}
                    <span className="ml-2 text-gray-600">
                      {doctor.rating} ({doctor.reviewCount} reviews)
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-center gap-2 mb-6">
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
                
                <p className="text-sm text-gray-600 flex items-center justify-center mb-6">
                  <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                  <span>{doctor.location}</span>
                </p>
                
                <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-primary-500 hover:bg-primary-600">
                      Book Appointment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Book an Appointment with {doctor.name}</DialogTitle>
                      <DialogDescription>
                        Select your preferred date, time, and appointment type.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                      <div>
                        <h3 className="font-medium mb-2">Select Date</h3>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          className="border rounded-md"
                          disabled={(date) => 
                            date < new Date() || 
                            date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                          }
                        />
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Select Time</h3>
                        <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto p-1">
                          {TIME_SLOTS.map((time) => (
                            <Button
                              key={time}
                              variant={selectedTime === time ? "default" : "outline"}
                              className={`justify-start ${selectedTime === time ? 'bg-primary-500' : ''}`}
                              onClick={() => setSelectedTime(time)}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              {time}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4 py-4">
                      <div>
                        <h3 className="font-medium mb-2">Appointment Type</h3>
                        <RadioGroup 
                          value={appointmentType} 
                          onValueChange={setAppointmentType}
                          className="flex flex-col sm:flex-row sm:space-x-4"
                        >
                          {APPOINTMENT_TYPES.map((type) => (
                            <div key={type.value} className="flex items-center space-x-2">
                              <RadioGroupItem value={type.value} id={type.value} />
                              <Label htmlFor={type.value} className="flex items-center">
                                {type.value === 'in-person' ? (
                                  <MapPin className="h-4 w-4 mr-1" />
                                ) : (
                                  <Video className="h-4 w-4 mr-1" />
                                )}
                                {type.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Notes (Optional)</h3>
                        <Textarea
                          placeholder="Add any additional information or questions you may have"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsBookingModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleBookAppointment}>
                        Confirm Booking
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full mt-3">
                      Write a Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Review {doctor.name}</DialogTitle>
                      <DialogDescription>
                        Share your experience with this doctor to help others.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div>
                        <h3 className="font-medium mb-2">Rating</h3>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setReviewRating(rating)}
                              className="focus:outline-none"
                            >
                              <Star 
                                className={`h-8 w-8 ${rating <= reviewRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Your Review</h3>
                        <Textarea
                          placeholder="Share your experience with this doctor..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="min-h-[150px]"
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsReviewModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSubmitReview}>
                        Submit Review
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
          
          <div className="md:w-2/3">
            <Card>
              <CardHeader>
                <CardTitle>About {doctor.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-6">{doctor.bio}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Award className="h-5 w-5 mr-2 text-primary-500" />
                      Education
                    </h3>
                    <ul className="space-y-2">
                      {doctor.education.map((edu, index) => (
                        <li key={index} className="text-gray-700 flex items-start">
                          <span className="mr-2">•</span>
                          <span>{edu}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Briefcase className="h-5 w-5 mr-2 text-primary-500" />
                      Experience
                    </h3>
                    <p className="text-gray-700">{doctor.experience} years of experience</p>
                    
                    <h3 className="text-lg font-semibold mt-6 mb-3 flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-primary-500" />
                      Insurance
                    </h3>
                    <ul className="space-y-2">
                      {doctor.acceptsInsurance.map((insurance, index) => (
                        <li key={index} className="text-gray-700 flex items-start">
                          <span className="mr-2">•</span>
                          <span>{insurance}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Doctor Reviews & Services Tabs */}
        <Tabs defaultValue="reviews" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Patient Reviews</CardTitle>
                <CardDescription>
                  Based on {doctor.reviewCount} patient reviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingReviews ? (
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, index) => (
                      <div key={index} className="border-b pb-4">
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
                ) : reviews?.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
                    <p className="text-gray-600 mb-4">Be the first to share your experience with {doctor.name}</p>
                    <Button 
                      onClick={() => setIsReviewModalOpen(true)}
                      className="bg-primary-500 hover:bg-primary-600"
                    >
                      Write a Review
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews?.map((review: any) => (
                      <div key={review.id} className="border-b pb-6 last:border-0 last:pb-0">
                        <div className="flex items-start">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={review.patientProfileImage} alt={review.patientName} />
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
                    
                    <div className="text-center pt-4">
                      <Button 
                        onClick={() => setIsReviewModalOpen(true)}
                        className="bg-primary-500 hover:bg-primary-600"
                      >
                        Write a Review
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
                <CardDescription>
                  Specialized healthcare services by {doctor.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Stethoscope className="h-5 w-5 mr-2 text-primary-500" />
                      Primary Services
                    </h3>
                    <ul className="space-y-2">
                      <li className="text-gray-700 flex items-start">
                        <span className="mr-2">•</span>
                        <span>Consultation and Diagnosis</span>
                      </li>
                      <li className="text-gray-700 flex items-start">
                        <span className="mr-2">•</span>
                        <span>Treatment Planning</span>
                      </li>
                      <li className="text-gray-700 flex items-start">
                        <span className="mr-2">•</span>
                        <span>Preventive Care</span>
                      </li>
                      <li className="text-gray-700 flex items-start">
                        <span className="mr-2">•</span>
                        <span>Follow-up Appointments</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-primary-500" />
                      Specialty Services
                    </h3>
                    <ul className="space-y-2">
                      {doctor.specialty === 'Cardiology' && (
                        <>
                          <li className="text-gray-700 flex items-start">
                            <span className="mr-2">•</span>
                            <span>Electrocardiograms (ECGs)</span>
                          </li>
                          <li className="text-gray-700 flex items-start">
                            <span className="mr-2">•</span>
                            <span>Stress Tests</span>
                          </li>
                          <li className="text-gray-700 flex items-start">
                            <span className="mr-2">•</span>
                            <span>Heart Disease Management</span>
                          </li>
                        </>
                      )}
                      
                      {doctor.specialty === 'Dermatology' && (
                        <>
                          <li className="text-gray-700 flex items-start">
                            <span className="mr-2">•</span>
                            <span>Skin Examinations</span>
                          </li>
                          <li className="text-gray-700 flex items-start">
                            <span className="mr-2">•</span>
                            <span>Acne Treatment</span>
                          </li>
                          <li className="text-gray-700 flex items-start">
                            <span className="mr-2">•</span>
                            <span>Skin Cancer Screening</span>
                          </li>
                        </>
                      )}
                      
                      {doctor.specialty === 'Pediatrics' && (
                        <>
                          <li className="text-gray-700 flex items-start">
                            <span className="mr-2">•</span>
                            <span>Child Wellness Visits</span>
                          </li>
                          <li className="text-gray-700 flex items-start">
                            <span className="mr-2">•</span>
                            <span>Vaccinations</span>
                          </li>
                          <li className="text-gray-700 flex items-start">
                            <span className="mr-2">•</span>
                            <span>Growth and Development Monitoring</span>
                          </li>
                        </>
                      )}
                      
                      {!['Cardiology', 'Dermatology', 'Pediatrics'].includes(doctor.specialty) && (
                        <>
                          <li className="text-gray-700 flex items-start">
                            <span className="mr-2">•</span>
                            <span>Specialized Consultations</span>
                          </li>
                          <li className="text-gray-700 flex items-start">
                            <span className="mr-2">•</span>
                            <span>Advanced Diagnostics</span>
                          </li>
                          <li className="text-gray-700 flex items-start">
                            <span className="mr-2">•</span>
                            <span>Specialized Treatments</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Appointment Information</h3>
                  <p className="text-gray-700 mb-4">
                    Most appointments with {doctor.name} are typically 30 minutes for new patients and 15-20 minutes for follow-ups.
                  </p>
                  <Button 
                    onClick={() => setIsBookingModalOpen(true)}
                    className="bg-primary-500 hover:bg-primary-600"
                  >
                    Book an Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DoctorProfile;
