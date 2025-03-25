import React from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, ProtectedRoute } from "@/context/AuthContext";

// Components
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Pages
import Home from "@/pages/home";
import FindDoctors from "@/pages/find-doctors";
import Appointments from "@/pages/appointments";
import Community from "@/pages/community";
import VideoReels from "@/pages/video-reels";
import DoctorProfile from "@/pages/doctor-profile";
import PatientDashboard from "@/pages/patient-dashboard";
import DoctorDashboard from "@/pages/doctor-dashboard";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import NotFound from "@/pages/not-found";

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/find-doctors" component={FindDoctors} />
          <Route path="/doctor-profile/:id">
            {params => <DoctorProfile id={parseInt(params.id)} />}
          </Route>
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          
          {/* Protected Routes */}
          <Route path="/appointments">
            <ProtectedRoute>
              <Appointments />
            </ProtectedRoute>
          </Route>
          <Route path="/community" component={Community} />
          <Route path="/video-reels" component={VideoReels} />
          <Route path="/patient-dashboard">
            <ProtectedRoute>
              <PatientDashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/doctor-dashboard">
            <ProtectedRoute>
              <DoctorDashboard />
            </ProtectedRoute>
          </Route>
          
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
