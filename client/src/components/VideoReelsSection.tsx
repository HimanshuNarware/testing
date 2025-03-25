import React, { useRef } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatViewCount } from '@/lib/constants';

const VideoReelsSection: React.FC = () => {
  const [, navigate] = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const { data: videos, isLoading } = useQuery({
    queryKey: ['/api/videos'],
    queryFn: undefined,
  });
  
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  const handleExploreVideos = () => {
    navigate('/video-reels');
  };

  return (
    <section className="py-12 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Healthcare Video Reels</h2>
            <p className="text-lg text-gray-300">Watch short, informative videos from doctors and healthcare professionals</p>
          </div>
          
          <div className="relative">
            {/* Video Reel Carousel */}
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto pb-6 space-x-4 scrollbar-hide no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {isLoading ? (
                // Skeleton loaders for videos
                Array(4).fill(0).map((_, index) => (
                  <div key={index} className="flex-none w-64">
                    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                      <div className="relative pb-[177.77%]">
                        <Skeleton className="absolute w-full h-full" />
                      </div>
                      <div className="p-4">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </div>
                ))
              ) : videos && videos.length > 0 ? (
                videos.map((video: any) => (
                  <div key={video.id} className="flex-none w-64">
                    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                      <div className="relative pb-[177.77%]">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title} 
                          className="absolute w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button className="bg-white bg-opacity-30 hover:bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200">
                            <Play className="text-white h-6 w-6 fill-current" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-white text-sm line-clamp-2">{video.title}</h4>
                        <p className="text-xs text-gray-400 mt-1">
                          {video.author?.name} • {formatViewCount(video.views)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center min-h-[200px]">
                  <p className="text-gray-400">No videos available</p>
                </div>
              )}
            </div>
            
            {/* Navigation Arrows */}
            <button 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -ml-4 bg-white bg-opacity-30 hover:bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center shadow-lg z-10"
              onClick={scrollLeft}
            >
              <ChevronLeft className="text-white h-6 w-6" />
            </button>
            <button 
              className="absolute right-0 top-1/2 transform -translate-y-1/2 -mr-4 bg-white bg-opacity-30 hover:bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center shadow-lg z-10"
              onClick={scrollRight}
            >
              <ChevronRight className="text-white h-6 w-6" />
            </button>
          </div>
          
          <div className="mt-8 text-center">
            <Button 
              className="bg-primary-500 hover:bg-primary-600"
              onClick={handleExploreVideos}
            >
              Explore All Videos
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoReelsSection;
