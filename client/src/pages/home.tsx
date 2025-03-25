import React from 'react';
import HeroSection from '@/components/HeroSection';
import AppointmentSection from '@/components/AppointmentSection';
import DashboardPreview from '@/components/DashboardPreview';
import CommunitySection from '@/components/CommunitySection';
import VideoReelsSection from '@/components/VideoReelsSection';

const Home: React.FC = () => {
  return (
    <div>
      <HeroSection />
      <AppointmentSection />
      <DashboardPreview />
      <CommunitySection />
      <VideoReelsSection />
    </div>
  );
};

export default Home;
