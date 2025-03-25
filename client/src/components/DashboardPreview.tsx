import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Pill } from 'lucide-react';

const DashboardPreview: React.FC = () => {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("patient");
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  const goToDashboard = () => {
    navigate(activeTab === "patient" ? "/patient-dashboard" : "/doctor-dashboard");
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Powerful User Dashboards</h2>
            <p className="text-lg text-gray-600">Manage your healthcare journey with our intuitive interfaces</p>
          </div>
          
          {/* Dashboard Tabs */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <Tabs defaultValue="patient" value={activeTab} onValueChange={handleTabChange}>
              <div className="border-b border-gray-200">
                <TabsList className="bg-transparent h-auto">
                  <TabsTrigger 
                    value="patient" 
                    className="py-4 px-6 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:shadow-none rounded-none"
                  >
                    Patient Dashboard
                  </TabsTrigger>
                  <TabsTrigger 
                    value="doctor" 
                    className="py-4 px-6 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:shadow-none rounded-none"
                  >
                    Doctor Dashboard
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* Patient Dashboard Preview */}
              <TabsContent value="patient" className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Upcoming Appointments Card */}
                  <Card className="bg-blue-50 border-0">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold">Upcoming Appointments</h3>
                        <Badge className="bg-primary-100 text-primary-800 hover:bg-primary-100">3 scheduled</Badge>
                      </div>
                      
                      <Card className="mb-2 shadow-sm">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Dr. Sarah Johnson</p>
                              <p className="text-sm text-gray-600">Today, 3:00 PM</p>
                            </div>
                            <Button variant="outline" size="sm" className="text-xs text-primary-600 border-primary-300 hover:bg-primary-50">
                              Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="shadow-sm">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Dr. Michael Chen</p>
                              <p className="text-sm text-gray-600">Tomorrow, 10:30 AM</p>
                            </div>
                            <Button variant="outline" size="sm" className="text-xs text-primary-600 border-primary-300 hover:bg-primary-50">
                              Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </CardContent>
                  </Card>
                  
                  {/* Medical Records Card */}
                  <Card className="bg-green-50 border-0">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3">Medical Records</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center text-sm">
                          <FileText className="h-4 w-4 text-green-600 mr-2" />
                          <span>Blood Test Results (May 15)</span>
                        </li>
                        <li className="flex items-center text-sm">
                          <FileText className="h-4 w-4 text-green-600 mr-2" />
                          <span>Annual Physical Report</span>
                        </li>
                        <li className="flex items-center text-sm">
                          <FileText className="h-4 w-4 text-green-600 mr-2" />
                          <span>Vaccination Records</span>
                        </li>
                      </ul>
                      <Button 
                        variant="outline" 
                        className="mt-3 w-full bg-white text-green-700 border-green-300 hover:bg-green-50"
                      >
                        View All Records
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Prescriptions Card */}
                  <Card className="bg-purple-50 border-0">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3">Prescriptions</h3>
                      <div className="space-y-3">
                        <Card className="shadow-sm">
                          <CardContent className="p-3">
                            <p className="font-medium">Amoxicillin</p>
                            <p className="text-xs text-gray-600">500mg, 3x daily</p>
                            <div className="mt-2 flex justify-between items-center">
                              <span className="text-xs text-purple-700">2 refills left</span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-xs text-purple-700 border-purple-300 hover:bg-purple-50"
                              >
                                Renew
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="shadow-sm">
                          <CardContent className="p-3">
                            <p className="font-medium">Lisinopril</p>
                            <p className="text-xs text-gray-600">10mg, 1x daily</p>
                            <div className="mt-2 flex justify-between items-center">
                              <span className="text-xs text-purple-700">5 refills left</span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-xs text-purple-700 border-purple-300 hover:bg-purple-50"
                              >
                                Renew
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-4 text-center">
                  <Button 
                    className="bg-primary-500 hover:bg-primary-600"
                    onClick={goToDashboard}
                  >
                    Go to Full Dashboard
                  </Button>
                </div>
              </TabsContent>
              
              {/* Doctor Dashboard Preview */}
              <TabsContent value="doctor" className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Today's Schedule Card */}
                  <Card className="bg-blue-50 border-0">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold">Today's Schedule</h3>
                        <Badge className="bg-primary-100 text-primary-800 hover:bg-primary-100">5 appointments</Badge>
                      </div>
                      
                      <Card className="mb-2 shadow-sm">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">John Doe</p>
                              <p className="text-sm text-gray-600">9:00 AM - Regular Checkup</p>
                            </div>
                            <Button variant="outline" size="sm" className="text-xs text-primary-600 border-primary-300 hover:bg-primary-50">
                              View
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="shadow-sm">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Jane Smith</p>
                              <p className="text-sm text-gray-600">10:30 AM - Consultation</p>
                            </div>
                            <Button variant="outline" size="sm" className="text-xs text-primary-600 border-primary-300 hover:bg-primary-50">
                              View
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </CardContent>
                  </Card>
                  
                  {/* Patient Stats Card */}
                  <Card className="bg-teal-50 border-0">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3">Patient Statistics</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Total Patients</span>
                            <span className="text-sm font-bold">248</span>
                          </div>
                          <div className="w-full bg-teal-200 rounded-full h-2">
                            <div className="bg-teal-500 h-2 rounded-full w-full"></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">New This Month</span>
                            <span className="text-sm font-bold">24</span>
                          </div>
                          <div className="w-full bg-teal-200 rounded-full h-2">
                            <div className="bg-teal-500 h-2 rounded-full w-1/4"></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Follow-up Required</span>
                            <span className="text-sm font-bold">16</span>
                          </div>
                          <div className="w-full bg-teal-200 rounded-full h-2">
                            <div className="bg-teal-500 h-2 rounded-full w-[15%]"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Recent Reviews Card */}
                  <Card className="bg-amber-50 border-0">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3">Recent Reviews</h3>
                      <div className="space-y-3">
                        <Card className="shadow-sm">
                          <CardContent className="p-3">
                            <div className="flex text-yellow-400 mb-1">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg key={star} className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 italic">
                              "Dr. Johnson is very thorough and takes time to explain everything."
                            </p>
                            <p className="text-xs text-gray-500 mt-1">- From John D., 2 days ago</p>
                          </CardContent>
                        </Card>
                      </div>
                      <Button 
                        variant="outline" 
                        className="mt-3 w-full bg-white text-amber-700 border-amber-300 hover:bg-amber-50"
                      >
                        View All Reviews
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-4 text-center">
                  <Button 
                    className="bg-primary-500 hover:bg-primary-600"
                    onClick={goToDashboard}
                  >
                    Go to Full Dashboard
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
