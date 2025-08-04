import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Car } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  beds: number;
  baths: number;
  parking: number;
  image: string;
  type: string;
  featured?: boolean;
}

const PropertyCard = ({
  id,
  title,
  location,
  price,
  beds,
  baths,
  parking,
  image,
  type,
  featured = false,
}: PropertyCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/property/${id}`);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {featured && (
          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
            Featured
          </Badge>
        )}
        <Button
          variant="ghost"
          size="sm"
          className={`absolute top-3 right-3 p-2 ${
            isLiked
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-white/80 hover:bg-white"
          }`}
          onClick={() => setIsLiked(!isLiked)}
        >
          <Heart className="h-4 w-4" fill={isLiked ? "currentColor" : "none"} />
        </Button>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{type}</Badge>
            <span className="text-2xl font-bold text-primary">
              R{price.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground">/month</span>
            </span>
          </div>
          
          <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
          
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{location}</span>
          </div>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{beds} beds</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{baths} baths</span>
            </div>
            {parking > 0 && (
              <div className="flex items-center">
                <Car className="h-4 w-4 mr-1" />
                <span>{parking} parking</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full" onClick={handleViewDetails}>View Details</Button>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;