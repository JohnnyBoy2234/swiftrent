import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, MapPin, Bed, Bath, Car, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PropertyCard from '@/components/PropertyCard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  parking_spaces: number;
  size_sqm: number | null;
  furnished: boolean;
  pets_allowed: boolean;
  images: string[];
  amenities: string[];
  status: string;
  featured: boolean;
  created_at: string;
}

const propertyTypes = ['All', 'Apartment', 'House', 'Townhouse', 'Flat', 'Studio', 'Bachelor', 'Room'];
const amenitiesList = [
  'Swimming Pool', 'Garden', 'Security', 'Gym/Fitness Center', 
  'Braai Area', 'Air Conditioning', 'WiFi', 'DSTV', 
  'Backup Power', 'Water Tank', 'Fiber Internet', 'Pet Friendly'
];

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('type') || 'All');
  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.get('minPrice') || '0'),
    parseInt(searchParams.get('maxPrice') || '50000')
  ]);
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || 'Any');
  const [bathrooms, setBathrooms] = useState(searchParams.get('bathrooms') || 'Any');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    searchParams.get('amenities')?.split(',').filter(Boolean) || []
  );
  const [furnished, setFurnished] = useState(searchParams.get('furnished') === 'true');
  const [petsAllowed, setPetsAllowed] = useState(searchParams.get('pets') === 'true');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, propertyType, priceRange, bedrooms, bathrooms, selectedAmenities, furnished, petsAllowed]);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'available')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading properties",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Update URL params
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (propertyType !== 'All') params.set('type', propertyType);
    if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString());
    if (priceRange[1] < 50000) params.set('maxPrice', priceRange[1].toString());
    if (bedrooms !== 'Any') params.set('bedrooms', bedrooms);
    if (bathrooms !== 'Any') params.set('bathrooms', bathrooms);
    if (selectedAmenities.length > 0) params.set('amenities', selectedAmenities.join(','));
    if (furnished) params.set('furnished', 'true');
    if (petsAllowed) params.set('pets', 'true');
    
    setSearchParams(params);
  };

  const filteredProperties = properties.filter(property => {
    // Search term filter
    if (searchTerm && !property.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !property.location.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Property type filter
    if (propertyType !== 'All' && property.property_type !== propertyType) {
      return false;
    }

    // Price range filter
    if (property.price < priceRange[0] || property.price > priceRange[1]) {
      return false;
    }

    // Bedrooms filter
    if (bedrooms !== 'Any' && property.bedrooms !== parseInt(bedrooms)) {
      return false;
    }

    // Bathrooms filter
    if (bathrooms !== 'Any' && property.bathrooms !== parseInt(bathrooms)) {
      return false;
    }

    // Amenities filter
    if (selectedAmenities.length > 0 && 
        !selectedAmenities.every(amenity => property.amenities?.includes(amenity))) {
      return false;
    }

    // Furnished filter
    if (furnished && !property.furnished) {
      return false;
    }

    // Pets allowed filter
    if (petsAllowed && !property.pets_allowed) {
      return false;
    }

    return true;
  });

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Find Your Perfect Home</h1>
          <p className="text-lg text-muted-foreground">
            Discover {properties.length} available properties across South Africa
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by location or property name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="lg:w-48">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="lg:w-32"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Filters */}
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleContent>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Advanced Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Range */}
                <div className="space-y-3">
                  <Label>Price Range: R{priceRange[0].toLocaleString()} - R{priceRange[1].toLocaleString()}</Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={50000}
                    step={1000}
                    className="w-full"
                  />
                </div>

                {/* Bedrooms & Bathrooms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bedrooms</Label>
                    <Select value={bedrooms} onValueChange={setBedrooms}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['Any', '1', '2', '3', '4', '5+'].map(num => (
                          <SelectItem key={num} value={num}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Bathrooms</Label>
                    <Select value={bathrooms} onValueChange={setBathrooms}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['Any', '1', '2', '3', '4+'].map(num => (
                          <SelectItem key={num} value={num}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Additional Options */}
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="furnished"
                      checked={furnished}
                      onCheckedChange={(checked) => setFurnished(!!checked)}
                    />
                    <Label htmlFor="furnished">Furnished Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pets"
                      checked={petsAllowed}
                      onCheckedChange={(checked) => setPetsAllowed(!!checked)}
                    />
                    <Label htmlFor="pets">Pet Friendly</Label>
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-3">
                  <Label>Amenities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {amenitiesList.map(amenity => (
                      <Badge
                        key={amenity}
                        variant={selectedAmenities.includes(amenity) ? "default" : "outline"}
                        className="cursor-pointer justify-center p-2 text-xs"
                        onClick={() => toggleAmenity(amenity)}
                      >
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Results */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            {filteredProperties.length} properties found
          </p>
          {(searchTerm || propertyType !== 'All' || selectedAmenities.length > 0 || furnished || petsAllowed) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setPropertyType('All');
                setPriceRange([0, 50000]);
                setBedrooms('Any');
                setBathrooms('Any');
                setSelectedAmenities([]);
                setFurnished(false);
                setPetsAllowed(false);
                setSearchParams(new URLSearchParams());
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Property Grid */}
        {filteredProperties.length === 0 ? (
          <Card className="p-12 text-center">
            <Home className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No properties found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or browse all available properties.
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setPropertyType('All');
              setSelectedAmenities([]);
              setFurnished(false);
              setPetsAllowed(false);
            }}>
              Show All Properties
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                title={property.title}
                location={property.location}
                price={property.price}
                beds={property.bedrooms}
                baths={property.bathrooms}
                parking={property.parking_spaces}
                image={property.images?.[0] || `https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=500&h=300&fit=crop`}
                type={property.property_type}
                featured={property.featured}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}