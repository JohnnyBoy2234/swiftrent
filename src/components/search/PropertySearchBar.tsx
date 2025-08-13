import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { ChevronDown, SlidersHorizontal, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SearchFilters {
  location: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
}

interface PropertySearchBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  onMoreFiltersClick: () => void;
  onSearch: () => void;
}

export const PropertySearchBar = ({ 
  filters, 
  onFiltersChange, 
  onMoreFiltersClick, 
  onSearch 
}: PropertySearchBarProps) => {
  const [priceOpen, setPriceOpen] = useState(false);
  const [bedroomsOpen, setBedroomsOpen] = useState(false);
  const [bathroomsOpen, setBathroomsOpen] = useState(false);

  const bedroomOptions = [
    { value: "Any", label: "Any" },
    { value: "1", label: "1+" },
    { value: "2", label: "2+" },
    { value: "3", label: "3+" },
    { value: "4", label: "4+" }
  ];

  const bathroomOptions = [
    { value: "Any", label: "Any" },
    { value: "1", label: "1+" },
    { value: "2", label: "2+" },
    { value: "3", label: "3+" },
    { value: "4", label: "4+" }
  ];

  const formatPrice = (value: string) => {
    if (!value || value === "0") return "";
    return `R${parseInt(value).toLocaleString()}`;
  };

  const getPriceLabel = () => {
    const min = formatPrice(filters.minPrice);
    const max = formatPrice(filters.maxPrice);
    
    if (!min && !max) return "Price";
    if (!min) return `Up to ${max}`;
    if (!max) return `From ${min}`;
    return `${min} - ${max}`;
  };

  const getBedroomsLabel = () => {
    const option = bedroomOptions.find(opt => opt.value === filters.bedrooms);
    return option ? `${option.label === 'Any' ? 'Any' : option.label} Bedroom${option.label !== 'Any' && option.label !== '1+' ? 's' : ''}` : "Bedrooms";
  };

  const getBathroomsLabel = () => {
    const option = bathroomOptions.find(opt => opt.value === filters.bathrooms);
    return option ? `${option.label === 'Any' ? 'Any' : option.label} Bathroom${option.label !== 'Any' && option.label !== '1+' ? 's' : ''}` : "Bathrooms";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20">
      {/* Location Search - Top Section */}
      <div className="p-4 border-b border-gray-200">
        <div onKeyDown={handleKeyPress}>
          <AddressAutocomplete
            value={filters.location}
            onChange={(value) => onFiltersChange({ location: value })}
            placeholder="Search city or suburb..."
            className="h-12 text-base border-0 focus-visible:ring-2 focus-visible:ring-primary text-foreground bg-white w-full"
          />
        </div>
      </div>

      {/* Filters - Bottom Section */}
      <div className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Price Range Dropdown */}
          <Popover open={priceOpen} onOpenChange={setPriceOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="h-12 px-4 min-w-[140px] justify-between bg-white hover:bg-muted/50 text-foreground border-input"
              >
                <span className="truncate">{getPriceLabel()}</span>
                <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 bg-popover border border-border z-50" align="start">
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Price Range</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Min Price</label>
                    <Input
                      type="number"
                      placeholder="Any"
                      value={filters.minPrice || ""}
                      onChange={(e) => onFiltersChange({ minPrice: e.target.value })}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Max Price</label>
                    <Input
                      type="number"
                      placeholder="Any"
                      value={filters.maxPrice || ""}
                      onChange={(e) => onFiltersChange({ maxPrice: e.target.value })}
                      className="h-10"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    size="sm" 
                    onClick={() => setPriceOpen(false)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Bedrooms Dropdown */}
          <Popover open={bedroomsOpen} onOpenChange={setBedroomsOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="h-12 px-4 min-w-[140px] justify-between bg-white hover:bg-muted/50 text-foreground border-input"
              >
                <span className="truncate">{getBedroomsLabel()}</span>
                <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 bg-popover border border-border z-50" align="start">
              <div className="space-y-1">
                {bedroomOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start hover:bg-muted/50"
                    onClick={() => {
                      onFiltersChange({ bedrooms: option.value });
                      setBedroomsOpen(false);
                    }}
                  >
                    {option.label} {option.label !== 'Any' ? 'Bedroom' + (option.label !== '1+' ? 's' : '') : ''}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Bathrooms Dropdown */}
          <Popover open={bathroomsOpen} onOpenChange={setBathroomsOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="h-12 px-4 min-w-[140px] justify-between bg-white hover:bg-muted/50 text-foreground border-input"
              >
                <span className="truncate">{getBathroomsLabel()}</span>
                <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 bg-popover border border-border z-50" align="start">
              <div className="space-y-1">
                {bathroomOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start hover:bg-muted/50"
                    onClick={() => {
                      onFiltersChange({ bathrooms: option.value });
                      setBathroomsOpen(false);
                    }}
                  >
                    {option.label} {option.label !== 'Any' ? 'Bathroom' + (option.label !== '1+' ? 's' : '') : ''}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* More Filters Button */}
          <Button
            variant="outline"
            className="h-12 px-4 bg-white hover:bg-muted/50 text-foreground border-input"
            onClick={onMoreFiltersClick}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            More Filters
          </Button>

          {/* Search Button */}
          <Button 
            size="lg" 
            className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground sm:ml-auto"
            onClick={onSearch}
          >
            <Search className="h-5 w-5 mr-2" />
            Search
          </Button>
        </div>
      </div>
    </div>
  );
};