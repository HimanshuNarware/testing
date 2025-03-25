import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, MessageSquare, Clock, Search } from 'lucide-react';
import { getInitials, formatDate, getTimeAgo } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';

interface ForumTopic {
  id: number;
  title: string;
  content: string;
  authorId: number;
  date: string;
  isActive: boolean;
  replyCount: number;
  author: {
    id: number;
    name: string;
    profileImage: string;
    isDoctor: boolean;
  };
}

interface BlogPost {
  id: number;
  title: string;
  content: string;
  date: string;
  image: string;
  readTime: number;
  author: {
    id: number;
    name: string;
    profileImage: string;
    isDoctor: boolean;
  };
}

const Community: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Fetch forum topics
  const { 
    data: forumTopics, 
    isLoading: isLoadingTopics, 
    error: topicsError 
  } = useQuery({
    queryKey: ['/api/forum/topics'],
    queryFn: undefined, // Using the default query function
  });
  
  // Fetch blog posts
  const { 
    data: blogPosts, 
    isLoading: isLoadingPosts, 
    error: postsError 
  } = useQuery({
    queryKey: ['/api/blog/posts'],
    queryFn: undefined, // Using the default query function
  });
  
  const handleCreateTopic = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a topic.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newTopicTitle.trim() || !newTopicContent.trim()) {
      toast({
        title: "Invalid input",
        description: "Please provide both a title and content for your topic.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await apiRequest('POST', '/api/forum/topics', {
        title: newTopicTitle,
        content: newTopicContent,
        authorId: user?.id,
        date: new Date().toISOString(),
        isActive: true,
      });
      
      // Reset form and close dialog
      setNewTopicTitle('');
      setNewTopicContent('');
      setIsDialogOpen(false);
      
      // Invalidate forum topics query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/forum/topics'] });
      
      toast({
        title: "Topic created",
        description: "Your topic has been successfully created.",
      });
    } catch (error) {
      toast({
        title: "Failed to create topic",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  // Filter topics based on search query
  const filteredTopics = forumTopics?.filter((topic: ForumTopic) => {
    if (!searchQuery) return true;
    
    return (
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  
  // Filter blog posts based on search query
  const filteredPosts = blogPosts?.filter((post: BlogPost) => {
    if (!searchQuery) return true;
    
    return (
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">Community Hub</h1>
          <p className="text-lg text-gray-600">
            Connect with healthcare professionals and fellow patients
          </p>
        </div>
        
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-auto flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search topics and articles..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary-500 hover:bg-primary-600 w-full sm:w-auto">
                Start a New Discussion
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Topic</DialogTitle>
                <DialogDescription>
                  Share your health questions or experiences with the community.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="topic-title" className="text-sm font-medium">
                    Topic Title
                  </label>
                  <Input
                    id="topic-title"
                    placeholder="e.g. Tips for managing diabetes"
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="topic-content" className="text-sm font-medium">
                    Content
                  </label>
                  <Textarea
                    id="topic-content"
                    placeholder="Describe your topic in detail..."
                    className="min-h-[150px]"
                    value={newTopicContent}
                    onChange={(e) => setNewTopicContent(e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTopic}>
                  Create Topic
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Tabs defaultValue="forums" className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="forums" className="flex-1 sm:flex-initial">Forums</TabsTrigger>
            <TabsTrigger value="blogs" className="flex-1 sm:flex-initial">Health Articles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="forums" className="space-y-6">
            {isLoadingTopics ? (
              // Loading skeleton
              Array(3).fill(0).map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))
            ) : topicsError ? (
              <Card>
                <CardContent className="p-6 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p>Error loading forum topics. Please try again later.</p>
                </CardContent>
              </Card>
            ) : filteredTopics?.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center py-10">
                  <p className="text-gray-500 mb-4">No forum topics found matching your search.</p>
                  {searchQuery && (
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchQuery('')}
                    >
                      Clear Search
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredTopics?.map((topic: ForumTopic) => (
                <Card key={topic.id} className="hover:border-primary-200 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">
                      <a href={`/community/topic/${topic.id}`} className="hover:text-primary-600">
                        {topic.title}
                      </a>
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <span>Started by</span>
                      <div className="flex items-center space-x-1">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={topic.author?.profileImage} alt={topic.author?.name} />
                          <AvatarFallback className="text-xs bg-primary-100">
                            {getInitials(topic.author?.name || '')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {topic.author?.name}
                          {topic.author?.isDoctor && <span className="text-teal-600"> (Doctor)</span>}
                        </span>
                      </div>
                      <span>•</span>
                      <span><Clock className="h-3 w-3 inline mr-1" />{getTimeAgo(topic.date)}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-gray-700 line-clamp-2 mb-3">{topic.content}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <div className="flex items-center space-x-3">
                      <Badge variant={topic.isActive ? "default" : "outline"} className={topic.isActive ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                        {topic.isActive ? "Active" : "Closed"}
                      </Badge>
                      <span className="text-sm text-gray-500 flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {topic.replyCount} {topic.replyCount === 1 ? 'reply' : 'replies'}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/community/topic/${topic.id}`}>View Discussion</a>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="blogs" className="space-y-6">
            {isLoadingPosts ? (
              // Loading skeleton
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array(4).fill(0).map((_, index) => (
                  <Card key={index}>
                    <div className="relative h-40 w-full">
                      <Skeleton className="absolute inset-0" />
                    </div>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : postsError ? (
              <Card>
                <CardContent className="p-6 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p>Error loading blog posts. Please try again later.</p>
                </CardContent>
              </Card>
            ) : filteredPosts?.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center py-10">
                  <p className="text-gray-500 mb-4">No blog posts found matching your search.</p>
                  {searchQuery && (
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchQuery('')}
                    >
                      Clear Search
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPosts?.map((post: BlogPost) => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-40 w-full bg-gray-200">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">
                        <a href={`/community/blog/${post.id}`} className="hover:text-primary-600">
                          {post.title}
                        </a>
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={post.author?.profileImage} alt={post.author?.name} />
                            <AvatarFallback className="text-xs bg-primary-100">
                              {getInitials(post.author?.name || '')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {post.author?.name}
                          </span>
                        </div>
                        <span>•</span>
                        <span>{formatDate(post.date)}</span>
                        <span>•</span>
                        <span>{post.readTime} min read</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 line-clamp-3">{post.content}</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <a href={`/community/blog/${post.id}`}>Read Article</a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Community;
