
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PGListing } from "@/types";
import { MapPin, Wifi, Utensils, Home, Check, X } from "lucide-react";

interface PGCardProps {
  listing: PGListing;
}

const PGCard: React.FC<PGCardProps> = ({ listing }) => {
  const { id, name, location, price, genderPreference, amenities, imageUrl, availability } = listing;

  // Function to render amenity icons
  const renderAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="w-4 h-4" />;
      case "food":
        return <Utensils className="w-4 h-4" />;
      default:
        return <Check className="w-4 h-4" />;
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        <div className="absolute top-2 right-2">
          <Badge
            className={
              availability
                ? "bg-pgfinder-success hover:bg-pgfinder-success/90"
                : "bg-pgfinder-danger hover:bg-pgfinder-danger/90"
            }
          >
            {availability ? "Available" : "Booked"}
          </Badge>
        </div>
        <div className="absolute top-2 left-2">
          <Badge
            variant="outline"
            className="bg-background/80 backdrop-blur-sm border-0"
          >
            For {genderPreference === "any" ? "All" : genderPreference === "male" ? "Males" : "Females"}
          </Badge>
        </div>
      </div>
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg truncate">{name}</h3>
            <p className="font-bold text-pgfinder-primary">₹{price}/mo</p>
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="text-sm truncate">{location}</span>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-sm text-muted-foreground mb-2">Amenities:</p>
          <div className="flex flex-wrap gap-2">
            {amenities.slice(0, 4).map((amenity) => (
              <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                {renderAmenityIcon(amenity)}
                {amenity}
              </Badge>
            ))}
            {amenities.length > 4 && (
              <Badge variant="secondary">+{amenities.length - 4} more</Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button asChild className="w-full">
          <Link to={`/listing/${id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PGCard;
