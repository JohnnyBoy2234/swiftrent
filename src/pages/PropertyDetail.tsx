import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { 
  ArrowLeft, 
  MapPin, 
  Bed, 
  Bath, 
  Car, 
  Home, 
  Heart,
  Share2,
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import TenantScreeningForm from '@/components/application/TenantScreeningForm';
import { useApplications } from '@/hooks/useApplications';

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  parking_spaces: number;
  size_sqm: number | null;
  furnished: boolean;
  pets_allowed: boolean;
  available_from: string | null;
  images: string[];
  amenities: string[];
  status: string;
  featured: boolean;
  created_at: string;
  landlord_id: string;
  profiles: {
    display_name: string;
    phone: string | null;
  } | null;
}

interface MessageFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [isIdVerified, setIsIdVerified] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [userProfile, setUserProfile] = useState<{display_name: string; phone: string | null} | null>(null);
  const [showScreeningForm, setShowScreeningForm] = useState(false);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<MessageFormData>();
  const { isScreened, hasAppliedToProperty, submitApplication, loading: applicationLoading } = useApplications();

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  useEffect(() => {
    if (user) {
      checkIdVerification();
      fetchUserProfile();
    }
  }, [user]);

  // Add effect to re-check verification status when user returns to page
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        checkIdVerification();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, phone')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setUserProfile(data);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
    }
  };

  const checkIdVerification = async () => {
    if (!user) return;

    setCheckingVerification(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id_verified')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      console.log('ID Verification check result:', data);
      console.log('User ID:', user.id);
      
      // If no profile exists, user is not verified
      if (!data) {
        console.log('No profile found for user');
        setIsIdVerified(false);
      } else {
        setIsIdVerified(data.id_verified || false);
      }
    } catch (error: any) {
      console.error('Error checking verification status:', error);
      setIsIdVerified(false);
    } finally {
      setCheckingVerification(false);
    }
  };

  const fetchProperty = async () => {
    if (!id) return;

    try {
      // First, fetch the property
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (propertyError) throw propertyError;

      // Then, fetch the landlord profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('display_name, phone')
        .eq('user_id', propertyData.landlord_id)
        .single();

      if (profileError) {
        console.warn('Could not fetch landlord profile:', profileError);
      }

      // Combine the data
      const combinedData = {
        ...propertyData,
        profiles: profileData || null
      };

      setProperty(combinedData as unknown as Property);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading property",
        description: error.message
      });
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitMessage = async (data: MessageFormData) => {
    if (!property || !user) return;
    
    setMessageLoading(true);
    
    try {
      // First, check if a conversation already exists between this tenant and landlord for this property
      const { data: existingConversation, error: conversationCheckError } = await supabase
        .from('conversations')
        .select('id')
        .eq('property_id', property.id)
        .eq('tenant_id', user.id)
        .eq('landlord_id', property.landlord_id)
        .single();

      let conversationId: string;

      if (existingConversation) {
        // Use existing conversation
        conversationId = existingConversation.id;
      } else {
        // Create a new conversation
        const { data: newConversation, error: conversationError } = await supabase
          .from('conversations')
          .insert({
            property_id: property.id,
            tenant_id: user.id,
            landlord_id: property.landlord_id,
            status: 'active'
          })
          .select('id')
          .single();

        if (conversationError) throw conversationError;
        conversationId = newConversation.id;
      }

      // Create the message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: data.message,
          message_type: 'text'
        });

      if (messageError) throw messageError;

      // Also create an inquiry record for backward compatibility
      const { error: inquiryError } = await supabase
        .from('inquiries')
        .insert({
          property_id: property.id,
          tenant_id: user.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message
        });

      if (inquiryError) {
        console.warn('Could not create inquiry record:', inquiryError);
      }

      toast({
        title: "Message sent successfully!",
        description: "The landlord will receive your message and can respond in their Messages section."
      });

      setMessageOpen(false);
      reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error sending message",
        description: error.message
      });
    } finally {
      setMessageLoading(false);
    }
  };

  const handleContactLandlord = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Sign in required",
        description: "Please sign in to message the landlord."
      });
      navigate('/auth');
      return;
    }

    if (!isIdVerified) {
      toast({
        title: "ID verification required",
        description: "Complete your ID verification to message landlords."
      });
      navigate(`/id-verification?return=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // Auto-fill form with user data
    if (userProfile) {
      setValue('name', userProfile.display_name || '');
      setValue('phone', userProfile.phone || '');
    }
    if (user.email) {
      setValue('email', user.email);
    }

    setMessageOpen(true);
  };

  const handleCallLandlord = () => {
    if (!user) {
      toast({
        variant: "destructive", 
        title: "Sign in required",
        description: "Please sign in to call the landlord."
      });
      navigate('/auth');
      return;
    }

    if (!isIdVerified) {
      toast({
        title: "ID verification required",
        description: "Complete your ID verification to contact landlords."
      });
      navigate(`/id-verification?return=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (property?.profiles?.phone) {
      window.open(`tel:${property.profiles.phone}`, '_self');
    } else {
      toast({
        variant: "destructive",
        title: "Phone number not available",
        description: "The landlord's phone number is not available."
      });
    }
  };

  const handleStartApplication = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Sign in required",
        description: "Please sign in to submit an application."
      });
      navigate('/auth');
      return;
    }

    if (!isIdVerified) {
      toast({
        title: "ID verification required",
        description: "Complete your ID verification to apply for properties."
      });
      navigate(`/id-verification?return=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (property && hasAppliedToProperty(property.id)) {
      toast({
        title: "Already applied",
        description: "You have already submitted an application for this property."
      });
      return;
    }

    if (isScreened && property) {
      // User is already screened, submit application directly
      try {
        await submitApplication(property.id, property.landlord_id);
        toast({
          title: "Application submitted successfully",
          description: "Your application has been sent using your saved details."
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error submitting application",
          description: error.message
        });
      }
    } else {
      // Show screening form for first-time applicants
      setShowScreeningForm(true);
    }
  };

  const handleScreeningComplete = () => {
    setShowScreeningForm(false);
    toast({
      title: "Application submitted successfully",
      description: "Your screening details have been saved and your application has been sent to the landlord."
    });
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: isLiked ? "Property removed from your favorites" : "Property saved to your favorites"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <Home className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Property not found</h2>
          <p className="text-muted-foreground mb-4">The property you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/properties">Browse Properties</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/properties')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={toggleLike}>
            <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current text-red-500' : ''}`} />
            {isLiked ? 'Saved' : 'Save'}
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Property Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            {property.featured && <Badge variant="secondary">Featured</Badge>}
            <Badge>{property.status}</Badge>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">{property.title}</h1>
          <div className="flex items-center text-muted-foreground mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            {property.location}
          </div>
          <div className="text-3xl font-bold text-accent">
            R{property.price.toLocaleString()}/month
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                {property.images && property.images.length > 0 ? (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {property.images.map((image, index) => (
                        <CarouselItem key={index}>
                          <div className="relative h-96 rounded-lg overflow-hidden">
                            <img
                              src={image}
                              alt={`${property.title} - Image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-4" />
                    <CarouselNext className="right-4" />
                  </Carousel>
                ) : (
                  <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                    <Home className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Property Details */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>Property Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{property.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <Bed className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <div className="font-semibold">{property.bedrooms}</div>
                        <div className="text-sm text-muted-foreground">Bedrooms</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <Bath className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <div className="font-semibold">{property.bathrooms}</div>
                        <div className="text-sm text-muted-foreground">Bathrooms</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <Car className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <div className="font-semibold">{property.parking_spaces}</div>
                        <div className="text-sm text-muted-foreground">Parking</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <Home className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <div className="font-semibold">{property.size_sqm || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">Size (sqm)</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="features">
                <Card>
                  <CardHeader>
                    <CardTitle>Property Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Badge variant={property.furnished ? "default" : "outline"}>
                          {property.furnished ? "Furnished" : "Unfurnished"}
                        </Badge>
                        <Badge variant={property.pets_allowed ? "default" : "outline"}>
                          {property.pets_allowed ? "Pet Friendly" : "No Pets"}
                        </Badge>
                      </div>
                      
                      {property.amenities && property.amenities.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">Amenities</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {property.amenities.map((amenity, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm">{amenity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {property.available_from && (
                        <div>
                          <h4 className="font-semibold mb-2">Available From</h4>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span>{new Date(property.available_from).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="location">
                <Card>
                  <CardHeader>
                    <CardTitle>Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span className="text-lg">{property.location}</span>
                    </div>
                    <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Interactive map coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Landlord */}
            <Card>
              <CardHeader>
                <CardTitle>Message Landlord</CardTitle>
                <CardDescription>Send a message to arrange a viewing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {property.profiles && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">{property.profiles.display_name}</div>
                      {property.profiles.phone && (
                        <div className="text-sm text-muted-foreground">{property.profiles.phone}</div>
                      )}
                    </div>
                  </div>
                )}
                
                {user && property.landlord_id === user.id ? (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <CheckCircle className="h-4 w-4 inline mr-1" />
                      This is your property listing
                    </p>
                  </div>
                ) : user ? (
                  <div className="space-y-2">
                    {!isIdVerified && (
                      <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                        <p className="text-sm text-amber-800">
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          Complete ID verification to message landlords
                        </p>
                      </div>
                    )}
                    <Button 
                      className="w-full" 
                      onClick={handleContactLandlord}
                      disabled={checkingVerification}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {checkingVerification ? 'Checking...' : 'Send Message'}
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full"
                    onClick={() => navigate('/auth')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Sign In to Message Landlord
                  </Button>
                )}

                <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Send Message</DialogTitle>
                      <DialogDescription>
                        Send a message to the landlord about this property
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmitMessage)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          {...register('name', { required: 'Name is required' })}
                          placeholder="John Doe"
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          type="email"
                          {...register('email', { required: 'Email is required' })}
                          placeholder="john@example.com"
                        />
                        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          {...register('phone')}
                          placeholder="+27 123 456 7890"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          {...register('message', { required: 'Message is required' })}
                          placeholder="I'm interested in viewing this property..."
                          rows={4}
                        />
                        {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
                      </div>
                      
                      <Button type="submit" className="w-full" disabled={messageLoading}>
                        {messageLoading ? 'Sending...' : 'Send Message'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                
                {user && property.landlord_id !== user.id ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleCallLandlord}
                    disabled={checkingVerification}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Landlord
                  </Button>
                ) : !user ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/auth')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Sign In to Call
                  </Button>
                ) : null}
              </CardContent>
            </Card>

            {/* Application */}
            <Card>
              <CardHeader>
                <CardTitle>Apply for this Property</CardTitle>
                <CardDescription>Submit a formal rental application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {user && property.landlord_id === user.id ? (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <CheckCircle className="h-4 w-4 inline mr-1" />
                      This is your property listing
                    </p>
                  </div>
                ) : (
                  <>
                    {property && hasAppliedToProperty(property.id) ? (
                      <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                        <p className="text-sm text-green-800">
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          Application submitted
                        </p>
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        size="lg" 
                        onClick={handleStartApplication}
                        disabled={applicationLoading || checkingVerification}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {applicationLoading ? 'Submitting...' : 'Start Application'}
                      </Button>
                    )}
                    {isScreened && !hasAppliedToProperty(property?.id || '') && (
                      <p className="text-xs text-muted-foreground">
                        Your screening details are saved - application will be submitted instantly
                      </p>
                    )}
                    {!isScreened && (
                      <p className="text-xs text-muted-foreground">
                        Complete one-time screening form and submit application
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Property Info */}
            <Card>
              <CardHeader>
                <CardTitle>Property Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property Type</span>
                  <span className="font-medium">{property.property_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Listed</span>
                  <span className="font-medium">{new Date(property.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property ID</span>
                  <span className="font-medium text-xs">{property.id.slice(0, 8)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Screening Form Dialog */}
        {showScreeningForm && property && (
          <Dialog open={showScreeningForm} onOpenChange={setShowScreeningForm}>
            <DialogContent className="max-w-4xl">
              <TenantScreeningForm
                propertyId={property.id}
                landlordId={property.landlord_id}
                onComplete={handleScreeningComplete}
                onCancel={() => setShowScreeningForm(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}