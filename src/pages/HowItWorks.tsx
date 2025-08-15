import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Home, 
  Users, 
  Shield, 
  Star, 
  CheckCircle, 
  ArrowRight,
  MessageSquare,
  Calendar,
  FileText,
  DollarSign,
  Phone,
  Mail,
  Heart
} from "lucide-react";
import { Link } from "react-router-dom";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-earth-light/20 to-ocean-blue/5">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-ocean-blue to-success-green bg-clip-text text-transparent">
              How SwiftRent Works
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-12">
              Connecting landlords and tenants directly with no agents, zero commission, and full control
            </p>
          </div>
        </div>
      </section>

      {/* Main Content - Two Column Layout */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* For Tenants Section */}
            <Card className="shadow-strong border-ocean-blue/20 bg-gradient-to-br from-white via-white to-ocean-blue/5 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-ocean-blue/10 to-ocean-blue/5 pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-ocean-blue to-ocean-blue-light rounded-2xl flex items-center justify-center shadow-soft">
                    <Home className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl text-ocean-blue-dark">For Tenants</CardTitle>
                    <Badge variant="outline" className="mt-1 text-xs">Find Your Home</Badge>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Discover your perfect rental home with complete transparency and direct landlord contact
                </p>
              </CardHeader>
              
              <CardContent className="p-6 sm:p-8 space-y-6">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-ocean-blue to-ocean-blue-light rounded-full flex items-center justify-center flex-shrink-0 shadow-soft">
                    <Search className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base sm:text-lg mb-2">Search & Discover</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-3">
                      Browse thousands of verified properties with detailed photos, descriptions, and transparent pricing.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">Advanced Filters</Badge>
                      <Badge variant="secondary" className="text-xs">Interactive Maps</Badge>
                      <Badge variant="secondary" className="text-xs">Verified Listings</Badge>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-earth-warm to-earth-warm-dark rounded-full flex items-center justify-center flex-shrink-0 shadow-soft">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base sm:text-lg mb-2">Connect Directly</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-3">
                      Message landlords directly, book viewings, and ask questions without any intermediaries.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">Direct Messaging</Badge>
                      <Badge variant="secondary" className="text-xs">Quick Responses</Badge>
                      <Badge variant="secondary" className="text-xs">No Agents</Badge>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-success-green to-success-green-glow rounded-full flex items-center justify-center flex-shrink-0 shadow-soft">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base sm:text-lg mb-2">Schedule Viewings</h3>
                    <p className="text-sm sm:text-base text-muted-foregreen mb-3">
                      Book convenient viewing times and get instant confirmations from landlords.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">Online Booking</Badge>
                      <Badge variant="secondary" className="text-xs">Flexible Times</Badge>
                      <Badge variant="secondary" className="text-xs">Instant Confirmation</Badge>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-soft">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base sm:text-lg mb-2">Apply & Sign</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-3">
                      Submit applications online and sign lease agreements digitally for a seamless process.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">Digital Applications</Badge>
                      <Badge variant="secondary" className="text-xs">E-Signatures</Badge>
                      <Badge variant="secondary" className="text-xs">Fast Processing</Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Link to="/properties">
                    <Button className="w-full bg-ocean-blue hover:bg-ocean-blue-dark text-white shadow-soft">
                      Start Your Search
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* For Landlords Section */}
            <Card className="shadow-strong border-success-green/20 bg-gradient-to-br from-white via-white to-success-green/5 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-success-green/10 to-success-green/5 pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-success-green to-success-green-glow rounded-2xl flex items-center justify-center shadow-soft">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl text-success-green-dark">For Landlords</CardTitle>
                    <Badge variant="outline" className="mt-1 text-xs">List Your Property</Badge>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  List your property and connect with quality tenants without paying agent commissions
                </p>
              </CardHeader>
              
              <CardContent className="p-6 sm:p-8 space-y-6">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-success-green to-success-green-glow rounded-full flex items-center justify-center flex-shrink-0 shadow-soft">
                    <Home className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base sm:text-lg mb-2">List Your Property</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-3">
                      Create detailed listings with professional photos and comprehensive property information.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">Easy Setup</Badge>
                      <Badge variant="secondary" className="text-xs">Photo Upload</Badge>
                      <Badge variant="secondary" className="text-xs">Rich Descriptions</Badge>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-earth-warm to-earth-warm-dark rounded-full flex items-center justify-center flex-shrink-0 shadow-soft">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base sm:text-lg mb-2">Receive Applications</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-3">
                      Get applications directly from interested tenants with all their information organized.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">Direct Contact</Badge>
                      <Badge variant="secondary" className="text-xs">Organized Inbox</Badge>
                      <Badge variant="secondary" className="text-xs">Quick Reviews</Badge>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-ocean-blue to-ocean-blue-light rounded-full flex items-center justify-center flex-shrink-0 shadow-soft">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base sm:text-lg mb-2">Screen & Verify</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-3">
                      Access tenant screening tools and background checks to make informed decisions.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">Credit Checks</Badge>
                      <Badge variant="secondary" className="text-xs">References</Badge>
                      <Badge variant="secondary" className="text-xs">Employment Verification</Badge>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-soft">
                    <DollarSign className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base sm:text-lg mb-2">Manage & Collect</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-3">
                      Use our property management tools and online rent collection system.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">Online Payments</Badge>
                      <Badge variant="secondary" className="text-xs">Maintenance Tracking</Badge>
                      <Badge variant="secondary" className="text-xs">Financial Reports</Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Link to="/list-property">
                    <Button className="w-full bg-success-green hover:bg-success-green-dark text-white shadow-soft">
                      List Your Property
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-ocean-blue/5 to-success-green/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Why Choose SwiftRent?</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
              Experience the future of property rental with our innovative platform designed for modern South African rental market
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <Card className="text-center p-6 sm:p-8 shadow-soft hover:shadow-medium transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-to-br from-ocean-blue to-ocean-blue-light rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3">Zero Commission</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  No agent fees or hidden charges. Keep more money in your pocket.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 sm:p-8 shadow-soft hover:shadow-medium transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-to-br from-success-green to-success-green-glow rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3">Verified Listings</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  All properties are verified to ensure authenticity and quality.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 sm:p-8 shadow-soft hover:shadow-medium transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-to-br from-earth-warm to-earth-warm-dark rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3">Direct Communication</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Chat directly with landlords and tenants without intermediaries.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 sm:p-8 shadow-soft hover:shadow-medium transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3">Premium Support</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Get 24/7 customer support throughout your rental journey.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-ocean-blue via-ocean-blue-light to-success-green text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg sm:text-xl mb-8 text-white/90 max-w-3xl mx-auto">
            Join thousands of satisfied customers who found their perfect rental match through SwiftRent
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link to="/properties" className="flex-1">
              <Button size="lg" variant="secondary" className="w-full">
                <Home className="h-5 w-5 mr-2" />
                Find Properties
              </Button>
            </Link>
            <Link to="/list-property" className="flex-1">
              <Button size="lg" variant="outline" className="w-full text-white border-white/80 hover:bg-white hover:text-ocean-blue backdrop-blur-sm bg-white/10">
                <Users className="h-5 w-5 mr-2" />
                List Property
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;