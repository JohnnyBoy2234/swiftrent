import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import PropertyCard from "@/components/PropertyCard";
import { PropertySearchBar } from "@/components/search/PropertySearchBar";
import { MoreFiltersModal } from "@/components/search/MoreFiltersModal";
import { Search, Home, Shield, Users, Star, ArrowRight, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import heroBackground from "@/assets/hero-background.jpg";

const Index = () => {
  const [searchLocation, setSearchLocation] = useState("");
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const navigate = useNavigate();

  const [propertyType, setPropertyType] = useState("Any");
  const [bedrooms, setBedrooms] = useState("Any");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

  // Advanced filters state
  const [advancedFilters, setAdvancedFilters] = useState({
    propertyTypes: [] as string[],
    amenities: [] as string[],
    bathrooms: "Any" as string,
    availableFrom: null as Date | null,
  });

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (searchLocation.trim()) params.set('search', searchLocation.trim());
    if (bedrooms !== 'Any') params.set('bedrooms', bedrooms);
    if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0]));
    if (priceRange[1] < 100000) params.set('maxPrice', String(priceRange[1]));
    
    // Add advanced filters
    if (advancedFilters.propertyTypes.length > 0) {
      params.set('propertyTypes', advancedFilters.propertyTypes.join(','));
    }
    if (advancedFilters.amenities.length > 0) {
      params.set('amenities', advancedFilters.amenities.join(','));
    }
    if (advancedFilters.bathrooms !== 'Any') {
      params.set('bathrooms', advancedFilters.bathrooms);
    }
    if (advancedFilters.availableFrom) {
      params.set('availableFrom', advancedFilters.availableFrom.toISOString().split('T')[0]);
    }
    
    navigate(`/properties?${params.toString()}`);
  };

  const handleSearch = () => {
    if (searchLocation.trim()) {
      navigate(`/properties?search=${encodeURIComponent(searchLocation.trim())}`);
    } else {
      navigate('/properties');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Featured properties for the homepage
  const featuredProperties = [
    {
      id: "1",
      title: "Modern 2-Bedroom Apartment in Sandton",
      location: "Sandton, Johannesburg",
      price: 15000,
      beds: 2,
      baths: 2,
      parking: 1,
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      type: "Apartment" as const,
      featured: true,
    },
    {
      id: "2",
      title: "Spacious Family House with Garden",
      location: "Rosebank, Cape Town",
      price: 22000,
      beds: 4,
      baths: 3,
      parking: 2,
      image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      type: "House" as const,
    },
    {
      id: "3",
      title: "Luxury Townhouse Near Waterfront",
      location: "V&A Waterfront, Cape Town",
      price: 35000,
      beds: 3,
      baths: 2,
      parking: 2,
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      type: "Townhouse" as const,
      featured: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat md:bg-cover"
          style={{ backgroundImage: `url(${heroBackground})` }}
        ></div>
        {/* Premium Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-ocean-blue/90 via-ocean-blue-dark/85 to-success-green/80"></div>
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 min-h-[70vh] sm:min-h-[80vh] lg:min-h-screen flex items-center">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 sm:mb-6 mt-2 sm:mt-4 lg:mt-0 block text-white leading-tight">
              <span className="block text-white">Renting the way</span>
              <span className="block text-earth-warm">it should be</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90">
              Find your perfect rental home in South Africa — connecting landlords and tenants directly with state-of-the-art technology. No agents. Zero commission. Full control.
            </p>
            
            {/* Property24-style Search Bar */}
            <PropertySearchBar
              filters={{
                location: searchLocation,
                propertyType: propertyType,
                minPrice: priceRange[0] > 0 ? priceRange[0].toString() : "",
                maxPrice: priceRange[1] < 100000 ? priceRange[1].toString() : "",
                bedrooms: bedrooms
              }}
              onFiltersChange={(newFilters) => {
                if (newFilters.location !== undefined) setSearchLocation(newFilters.location);
                if (newFilters.propertyType !== undefined) setPropertyType(newFilters.propertyType);
                if (newFilters.minPrice !== undefined || newFilters.maxPrice !== undefined) {
                  const minPrice = newFilters.minPrice ? parseInt(newFilters.minPrice) : (priceRange[0] > 0 ? priceRange[0] : 0);
                  const maxPrice = newFilters.maxPrice ? parseInt(newFilters.maxPrice) : (priceRange[1] < 100000 ? priceRange[1] : 100000);
                  setPriceRange([minPrice, maxPrice]);
                }
                if (newFilters.bedrooms !== undefined) setBedrooms(newFilters.bedrooms);
              }}
              onMoreFiltersClick={() => setMoreFiltersOpen(true)}
              onSearch={handleSearch}
            />

            <MoreFiltersModal
              open={moreFiltersOpen}
              onClose={() => setMoreFiltersOpen(false)}
              filters={advancedFilters}
              onFiltersChange={(newFilters) => {
                setAdvancedFilters(prev => ({ ...prev, ...newFilters }));
              }}
              onApplyFilters={applyFilters}
              onClearFilters={() => {
                setAdvancedFilters({
                  propertyTypes: [],
                  amenities: [],
                  bathrooms: "Any",
                  availableFrom: null
                });
                setSearchLocation("");
                setPropertyType("Any");
                setBedrooms("Any");
                setPriceRange([0, 100000]);
              }}
            />
            
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-white/90">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>Direct Contact</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>No Commission</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>Verified Properties</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      

      {/* Featured Properties */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Featured Properties</h2>
            <p className="text-lg text-muted-foreground">
              Discover handpicked properties across South Africa's major cities
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/properties">
              <Button size="lg" variant="outline">
                View All Properties
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
              <div className="text-muted-foreground">Active Properties</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">15,000+</div>
              <div className="text-muted-foreground">Happy Tenants</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <div className="text-muted-foreground">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-ocean-blue via-ocean-blue-light to-success-green text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Next Home?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of satisfied customers who found their perfect rental through SwiftRent
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/properties">
              <Button size="lg" variant="secondary">
                Browse Properties
              </Button>
            </Link>
            <Link to="/list-property">
              <Button size="lg" variant="outline" className="text-white border-white/80 hover:bg-white hover:text-ocean-blue backdrop-blur-sm bg-white/10">
                List Your Property
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-ocean-blue to-success-green rounded-lg flex items-center justify-center">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">SwiftRent</span>
              </div>
              <p className="text-muted-foreground">
                Connecting landlords and tenants directly across South Africa.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Tenants</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/properties" className="hover:text-primary">Browse Properties</Link></li>
                <li><Link to="/how-it-works" className="hover:text-primary">How It Works</Link></li>
                <li><a href="#" className="hover:text-primary">Rental Tips</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Landlords</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary">List Property</a></li>
                <li><a href="#" className="hover:text-primary">Pricing Guide</a></li>
                <li><a href="#" className="hover:text-primary">Landlord Resources</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
                <li><a href="#" className="hover:text-primary">Help Center</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 SwiftRent. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
