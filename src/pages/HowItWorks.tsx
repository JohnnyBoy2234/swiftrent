import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Search, Users, Home, Star, Shield, Clock, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">How EasyRent Works</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connecting landlords and tenants directly has never been easier. Follow these simple steps to find your perfect rental.
          </p>
        </div>

        {/* Process Steps */}
        <div className="space-y-16 mb-16">
          {/* For Tenants */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-12">For Tenants</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="relative">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Search Properties</h3>
                  <p className="text-muted-foreground">
                    Browse our extensive collection of verified properties. Use filters to narrow down by location, price, property type, and amenities.
                  </p>
                </CardContent>
              </Card>

              <Card className="relative">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Phone className="h-8 w-8 text-accent" />
                  </div>
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Contact Directly</h3>
                  <p className="text-muted-foreground">
                    Get in touch with landlords directly through our secure messaging system. Ask questions, schedule viewings, and negotiate terms.
                  </p>
                </CardContent>
              </Card>

              <Card className="relative">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-success-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Home className="h-8 w-8 text-success-green" />
                  </div>
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-success-green text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Move In</h3>
                  <p className="text-muted-foreground">
                    Complete the rental agreement, arrange move-in dates, and enjoy your new home. No agent fees or hidden costs.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* For Landlords */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-12">For Landlords</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="relative">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Home className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <h3 className="text-xl font-semibold mb-4">List Your Property</h3>
                  <p className="text-muted-foreground">
                    Create a detailed listing with photos, descriptions, and rental terms. Our easy-to-use platform makes it simple to showcase your property.
                  </p>
                </CardContent>
              </Card>

              <Card className="relative">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="h-8 w-8 text-accent" />
                  </div>
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Connect with Tenants</h3>
                  <p className="text-muted-foreground">
                    Receive inquiries from pre-screened tenants. Communicate directly and arrange viewings at your convenience.
                  </p>
                </CardContent>
              </Card>

              <Card className="relative">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-success-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-success-green" />
                  </div>
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-success-green text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Rent Out</h3>
                  <p className="text-muted-foreground">
                    Select your ideal tenant, finalize the agreement, and start earning rental income. Keep 100% of your rental fees.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>

        {/* Benefits */}
        <section className="py-16 bg-secondary/30 rounded-lg">
          <div className="max-w-5xl mx-auto px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose EasyRent?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">No Commission Fees</h3>
                    <p className="text-muted-foreground">Connect directly with no agent fees or hidden costs.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Verified Properties</h3>
                    <p className="text-muted-foreground">All listings are verified for authenticity and accuracy.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-success-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-success-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Quick Response</h3>
                    <p className="text-muted-foreground">Get responses faster with direct landlord communication.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Quality Listings</h3>
                    <p className="text-muted-foreground">High-quality properties from trusted landlords.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Community Support</h3>
                    <p className="text-muted-foreground">Join a community of satisfied tenants and landlords.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-success-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-success-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">24/7 Support</h3>
                    <p className="text-muted-foreground">Round-the-clock customer support when you need it.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of satisfied users who found their perfect rental match
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/properties">
              <Button size="lg">
                Browse Properties
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              List Your Property
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HowItWorks;