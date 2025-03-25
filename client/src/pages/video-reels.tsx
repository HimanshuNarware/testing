import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatViewCount } from '@/lib/constants';
import { getInitials, getTimeAgo } from '@/lib/utils';
import { Play, ThumbsUp, MessageSquare, Share2, AlertCircle, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface VideoReel {
  id: number;
  title: string;
  description: string;
  authorId: number;
  thumbnail: string;
  videoUrl: string;
  views: number;
  date: string;
  author: {
    id: number;
    name: string;
    profileImage: string;
    isDoctor: boolean;
  };
}

const VideoReels: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<VideoReel | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Fetch video reels
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['/api/videos'],
    queryFn: undefined, // Using the default query function
  });
  
  const handlePlayVideo = (video: VideoReel) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
    
    // Increment view count
    apiRequest('GET', `/api/videos/${video.id}`, undefined)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      })
      .catch(error => {
        console.error('Error incrementing view count:', error);
      });
  };
  
  const handleModalClose = () => {
    setIsVideoModalOpen(false);
    // Pause video when modal is closed
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };
  
  // Filter videos based on search query
  const filteredVideos = videos?.filter((video: VideoReel) => {
    if (!searchQuery) return true;
    
    return (
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.author.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  
  // Get trending videos (sort by view count)
  const trendingVideos = filteredVideos ? 
    [...filteredVideos].sort((a, b) => b.views - a.views).slice(0, 4) : 
    [];
  
  // Get latest videos (sort by date)
  const latestVideos = filteredVideos ? 
    [...filteredVideos].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : 
    [];

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">Healthcare Video Reels</h1>
          <p className="text-lg text-gray-600">
            Watch informative videos from healthcare professionals
          </p>
        </div>
        
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-auto flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search videos..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {isAuthenticated && user?.isDoctor && (
            <Button className="bg-primary-500 hover:bg-primary-600 w-full sm:w-auto">
              Upload New Video
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="all" className="space-y-8">
          <div className="flex justify-center">
            <TabsList>
              <TabsTrigger value="all">All Videos</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="latest">Latest</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="trending" className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Trending Videos</h2>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array(4).fill(0).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="relative pb-[56.25%]">
                      <Skeleton className="absolute inset-0" />
                    </div>
                    <CardContent className="p-4">
                      <Skeleton className="h-5 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-6 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p>Error loading videos. Please try again later.</p>
                </CardContent>
              </Card>
            ) : trendingVideos.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center py-10">
                  <p className="text-gray-500">No videos found matching your search.</p>
                  {searchQuery && (
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchQuery('')}
                      className="mt-4"
                    >
                      Clear Search
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {trendingVideos.map((video: VideoReel) => (
                  <Card key={video.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative pb-[56.25%] bg-gray-200 cursor-pointer" onClick={() => handlePlayVideo(video)}>
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-30 transition-all">
                        <div className="bg-white bg-opacity-70 rounded-full p-3">
                          <Play className="h-6 w-6 text-primary-600 fill-current" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {formatViewCount(video.views)}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium line-clamp-2 mb-1" title={video.title}>
                        {video.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={video.author.profileImage} alt={video.author.name} />
                          <AvatarFallback className="text-xs bg-primary-100">
                            {getInitials(video.author.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{video.author.name}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="latest" className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Latest Videos</h2>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array(4).fill(0).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="relative pb-[56.25%]">
                      <Skeleton className="absolute inset-0" />
                    </div>
                    <CardContent className="p-4">
                      <Skeleton className="h-5 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-6 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p>Error loading videos. Please try again later.</p>
                </CardContent>
              </Card>
            ) : latestVideos.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center py-10">
                  <p className="text-gray-500">No videos found matching your search.</p>
                  {searchQuery && (
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchQuery('')}
                      className="mt-4"
                    >
                      Clear Search
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {latestVideos.map((video: VideoReel) => (
                  <Card key={video.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative pb-[56.25%] bg-gray-200 cursor-pointer" onClick={() => handlePlayVideo(video)}>
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-30 transition-all">
                        <div className="bg-white bg-opacity-70 rounded-full p-3">
                          <Play className="h-6 w-6 text-primary-600 fill-current" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {formatViewCount(video.views)}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium line-clamp-2 mb-1" title={video.title}>
                        {video.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={video.author.profileImage} alt={video.author.name} />
                          <AvatarFallback className="text-xs bg-primary-100">
                            {getInitials(video.author.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{video.author.name}</span>
                        <span className="mx-1">•</span>
                        <span>{getTimeAgo(video.date)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="all" className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">All Videos</h2>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array(8).fill(0).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="relative pb-[56.25%]">
                      <Skeleton className="absolute inset-0" />
                    </div>
                    <CardContent className="p-4">
                      <Skeleton className="h-5 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-6 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p>Error loading videos. Please try again later.</p>
                </CardContent>
              </Card>
            ) : filteredVideos?.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center py-10">
                  <p className="text-gray-500">No videos found matching your search.</p>
                  {searchQuery && (
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchQuery('')}
                      className="mt-4"
                    >
                      Clear Search
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredVideos?.map((video: VideoReel) => (
                  <Card key={video.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative pb-[56.25%] bg-gray-200 cursor-pointer" onClick={() => handlePlayVideo(video)}>
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-30 transition-all">
                        <div className="bg-white bg-opacity-70 rounded-full p-3">
                          <Play className="h-6 w-6 text-primary-600 fill-current" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {formatViewCount(video.views)}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium line-clamp-2 mb-1" title={video.title}>
                        {video.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={video.author.profileImage} alt={video.author.name} />
                          <AvatarFallback className="text-xs bg-primary-100">
                            {getInitials(video.author.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{video.author.name}</span>
                        <span className="mx-1">•</span>
                        <span>{getTimeAgo(video.date)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Video Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
          <DialogHeader className="bg-black p-4">
            <DialogTitle className="text-white">{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div>
              <div className="relative pb-[56.25%] bg-black">
                <video
                  ref={videoRef}
                  src={selectedVideo.videoUrl}
                  className="absolute inset-0 w-full h-full"
                  controls
                  autoPlay
                ></video>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={selectedVideo.author.profileImage} alt={selectedVideo.author.name} />
                      <AvatarFallback className="bg-primary-100">
                        {getInitials(selectedVideo.author.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedVideo.author.name}</p>
                      <p className="text-sm text-gray-500">{formatViewCount(selectedVideo.views)} • {getTimeAgo(selectedVideo.date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Like
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-700">{selectedVideo.description}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoReels;
