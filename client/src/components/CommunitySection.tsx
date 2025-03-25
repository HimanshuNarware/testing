import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CommunitySection: React.FC = () => {
  const [, navigate] = useLocation();
  
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Join Our Healthcare Community</h2>
            <p className="text-lg text-gray-600">Connect with others, learn from experts, and share your experiences</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Forums Section */}
            <div className="bg-gray-50 rounded-xl shadow-md overflow-hidden">
              <div className="bg-teal-500 text-white p-4">
                <h3 className="text-xl font-semibold">Community Forums</h3>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Living with Diabetes: Tips & Support</h4>
                        <p className="text-sm text-gray-600 mt-1">Started by JaneDoe • 24 replies</p>
                      </div>
                      <Badge className="bg-blue-50 text-primary-700 hover:bg-blue-50">Active</Badge>
                    </div>
                  </div>
                  
                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Managing Anxiety During COVID-19</h4>
                        <p className="text-sm text-gray-600 mt-1">Started by HealthCoach • 37 replies</p>
                      </div>
                      <Badge className="bg-blue-50 text-primary-700 hover:bg-blue-50">Active</Badge>
                    </div>
                  </div>
                  
                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Nutrition for Heart Health</h4>
                        <p className="text-sm text-gray-600 mt-1">Started by Dr.Smith • 18 replies</p>
                      </div>
                      <Badge variant="outline" className="bg-gray-100 text-gray-700 hover:bg-gray-100">Closed</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="mt-5">
                  <Button 
                    className="w-full bg-teal-500 hover:bg-teal-600"
                    onClick={() => navigate('/community')}
                  >
                    Browse All Forums
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Blogs Section */}
            <div className="bg-gray-50 rounded-xl shadow-md overflow-hidden">
              <div className="bg-orange-400 text-white p-4">
                <h3 className="text-xl font-semibold">Healthcare Blog</h3>
              </div>
              <div className="p-5">
                <div className="space-y-5">
                  <article className="flex border-b border-gray-200 pb-4">
                    <div className="flex-shrink-0 mr-4">
                      <div className="h-16 w-16 rounded bg-gray-300 overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" 
                          alt="Mental Health" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">The Importance of Mental Health Check-ups</h4>
                      <p className="text-sm text-gray-600 mt-1">By Dr. Emily Rodriguez • 5 min read</p>
                    </div>
                  </article>
                  
                  <article className="flex border-b border-gray-200 pb-4">
                    <div className="flex-shrink-0 mr-4">
                      <div className="h-16 w-16 rounded bg-gray-300 overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" 
                          alt="Vaccinations" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Understanding Vaccinations: Facts vs. Myths</h4>
                      <p className="text-sm text-gray-600 mt-1">By Dr. Michael Chen • 8 min read</p>
                    </div>
                  </article>
                  
                  <article className="flex">
                    <div className="flex-shrink-0 mr-4">
                      <div className="h-16 w-16 rounded bg-gray-300 overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1493548578639-b0c241186eb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" 
                          alt="Sleep Exercise" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Simple Exercises for Better Sleep</h4>
                      <p className="text-sm text-gray-600 mt-1">By Sarah Johnson, PT • 4 min read</p>
                    </div>
                  </article>
                </div>
                
                <div className="mt-5">
                  <Button 
                    className="w-full bg-orange-400 hover:bg-orange-500"
                    onClick={() => navigate('/community')}
                  >
                    Read All Articles
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
