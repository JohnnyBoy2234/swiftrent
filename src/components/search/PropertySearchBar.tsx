import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { ChevronDown, SlidersHorizontal, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
interface SearchFilters {
  location: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
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
  const [propertyTypeOpen, setPropertyTypeOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [bedroomsOpen, setBedroomsOpen] = useState(false);
  const propertyTypeOptions = [{
    value: "Any",
    label: "Any Property Type"
  }, {
    value: "House",
    label: "House"
  }, {
    value: "Apartment",
    label: "Apartment"
  }, {
    value: "Townhouse",
    label: "Townhouse"
  }, {
    value: "Studio",
    label: "Studio"
  }, {
    value: "Duplex",
    label: "Duplex"
  }];
  const bedroomOptions = [{
    value: "Any",
    label: "Any"
  }, {
    value: "1",
    label: "1+"
  }, {
    value: "2",
    label: "2+"
  }, {
    value: "3",
    label: "3+"
  }, {
    value: "4",
    label: "4+"
  }];
  const bathroomOptions = [{
    value: "Any",
    label: "Any"
  }, {
    value: "1",
    label: "1+"
  }, {
    value: "2",
    label: "2+"
  }, {
    value: "3",
    label: "3+"
  }, {
    value: "4",
    label: "4+"
  }];
  const formatPrice = (value: string) => {
    if (!value || value === "0") return "";
    return `R${parseInt(value).toLocaleString()}`;
  };
  const getPriceLabel = () => {
    const min = formatPrice(filters.minPrice);
    const max = formatPrice(filters.maxPrice);
    
    const hasSelection = (filters.minPrice && filters.minPrice !== "0") || (filters.maxPrice && filters.maxPrice !== "0");
    if (hasSelection) {
      let priceRange = "";
      if (!min && !max) priceRange = "Any";
      else if (!min) priceRange = `Up to ${max}`;
      else if (!max || filters.maxPrice === "") priceRange = `From ${min}`;
      else priceRange = `${min} - ${max}`;
      
      return (
        <div className="flex flex-col items-start">
          <span className="text-xs text-slate-300">Price</span>
          <span className="text-sm font-normal">{priceRange}</span>
        </div>
      );
    }
    return "Price";
  };
  const getPropertyTypeLabel = () => {
    const selectedTypes = filters.propertyType ? filters.propertyType.split(',').filter(type => type !== "Any" && type.trim() !== "") : [];
    if (selectedTypes.length > 0) {
      const displayText = selectedTypes.length === 1 ? selectedTypes[0] : `${selectedTypes.length} Selected`;
      return <div className="flex flex-col items-start">
          <span className="text-xs text-slate-300">Property Type</span>
          <span className="text-sm font-normal">{displayText}</span>
        </div>;
    }
    return "Property Type";
  };
  const getBedroomsLabel = () => {
    const hasSelection = filters.bedrooms !== "Any" && filters.bedrooms;
    if (hasSelection) {
      return <div className="flex flex-col items-start">
          <span className="text-xs text-slate-300">Bedrooms</span>
          <span className="text-sm font-normal">{filters.bedrooms}+</span>
        </div>;
    }
    return "Bedrooms";
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };
  return <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20">
      {/* Location Search - Top Section */}
      <div className="p-3 border-b border-gray-200">
        <div onKeyDown={handleKeyPress}>
          <AddressAutocomplete value={filters.location} onChange={value => onFiltersChange({
          location: value
        })} placeholder="Search city or suburb..." className="h-10 text-sm border-0 focus-visible:ring-2 focus-visible:ring-primary text-foreground bg-white w-full" />
        </div>
      </div>

      {/* Filters - Bottom Section */}
      <div className="p-3">
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          {/* Property Type Dropdown */}
          <Popover open={propertyTypeOpen} onOpenChange={setPropertyTypeOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={`h-10 px-3 flex-1 min-w-[130px] justify-start text-left bg-white hover:bg-primary hover:text-white border-input text-sm ${filters.propertyType !== "Any" && filters.propertyType ? 'bg-primary text-white' : 'text-foreground'}`}>
                <span className="truncate w-full">{getPropertyTypeLabel()}</span>
                <ChevronDown className="h-3 w-3 ml-1 flex-shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 bg-white border border-border z-50" align="start">
              <div className="space-y-1">
                {propertyTypeOptions.map(option => {
                  const selectedTypes = filters.propertyType ? filters.propertyType.split(',').filter(type => type.trim() !== "") : [];
                  const isSelected = selectedTypes.includes(option.value);
                  
                  return <Button 
                    key={option.value} 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      if (option.value === "Any") {
                        onFiltersChange({ propertyType: "Any" });
                      } else {
                        let newSelectedTypes;
                        if (isSelected) {
                          newSelectedTypes = selectedTypes.filter(type => type !== option.value);
                        } else {
                          newSelectedTypes = [...selectedTypes.filter(type => type !== "Any"), option.value];
                        }
                        onFiltersChange({ 
                          propertyType: newSelectedTypes.length === 0 ? "Any" : newSelectedTypes.join(',')
                        });
                      }
                    }} 
                    className={`w-full justify-start hover:bg-primary hover:text-white text-sm text-gray-950 ${isSelected ? 'bg-primary/10 text-primary' : ''}`}>
                    {option.label}
                  </Button>;
                })}
              </div>
            </PopoverContent>
          </Popover>

          {/* Price Range Dropdown */}
          <Popover open={priceOpen} onOpenChange={setPriceOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={`h-10 px-3 flex-1 min-w-[130px] justify-start text-left bg-white hover:bg-primary hover:text-white border-input text-sm ${((filters.minPrice && filters.minPrice !== "0") || (filters.maxPrice && filters.maxPrice !== "0")) ? 'bg-primary text-white' : 'text-foreground'}`}>
                <span className="truncate w-full">{getPriceLabel()}</span>
                <ChevronDown className="h-3 w-3 ml-1 flex-shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 bg-white border border-border z-50" align="start">
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Price Range</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Min Price</label>
                    <Input 
                      type="number" 
                      placeholder="Any" 
                      value={filters.minPrice || ""} 
                      onChange={e => {
                        const value = e.target.value;
                        const maxPrice = filters.maxPrice ? parseInt(filters.maxPrice) : null;
                        const newMinPrice = value ? parseInt(value) : null;
                        
                        // If max price exists and new min is higher, adjust max
                        if (maxPrice && newMinPrice && newMinPrice > maxPrice) {
                          onFiltersChange({
                            minPrice: value,
                            maxPrice: value
                          });
                        } else {
                          onFiltersChange({
                            minPrice: value
                          });
                        }
                      }} 
                      className="h-9 text-sm" 
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Max Price</label>
                    <Input 
                      type="number" 
                      placeholder="Any" 
                      value={filters.maxPrice || ""} 
                      onChange={e => {
                        const value = e.target.value;
                        const minPrice = filters.minPrice ? parseInt(filters.minPrice) : null;
                        const newMaxPrice = value ? parseInt(value) : null;
                        
                        // If value is empty, allow it (means "any" max price)
                        if (!value) {
                          onFiltersChange({
                            maxPrice: ""
                          });
                          return;
                        }
                        
                        // If min price exists and new max is lower, adjust min
                        if (minPrice && newMaxPrice && newMaxPrice < minPrice) {
                          onFiltersChange({
                            minPrice: value,
                            maxPrice: value
                          });
                        } else {
                          onFiltersChange({
                            maxPrice: value
                          });
                        }
                      }} 
                      className="h-9 text-sm" 
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => setPriceOpen(false)} className="bg-primary hover:bg-primary/90 text-sm">
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Bedrooms Dropdown */}
          <Popover open={bedroomsOpen} onOpenChange={setBedroomsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={`h-10 px-3 flex-1 min-w-[130px] justify-start text-left bg-white hover:bg-primary hover:text-white border-input text-sm ${filters.bedrooms !== "Any" && filters.bedrooms ? 'bg-primary text-white' : 'text-foreground'}`}>
                <span className="truncate w-full">{getBedroomsLabel()}</span>
                <ChevronDown className="h-3 w-3 ml-1 flex-shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 bg-white border border-border z-50" align="start">
              <div className="space-y-1">
                {bedroomOptions.map(option => <Button key={option.value} variant="ghost" size="sm" className="w-full justify-start hover:bg-primary hover:text-white text-sm" onClick={() => {
                onFiltersChange({
                  bedrooms: option.value
                });
                setBedroomsOpen(false);
              }}>
                    {option.label} {option.label !== 'Any' ? 'Bedroom' + (option.label !== '1+' ? 's' : '') : ''}
                  </Button>)}
              </div>
            </PopoverContent>
          </Popover>

          {/* More Filters Button */}
          <Button variant="outline" className="h-10 px-3 flex-1 min-w-[130px] bg-white hover:bg-primary hover:text-white text-foreground border-input text-sm" onClick={onMoreFiltersClick}>
            <SlidersHorizontal className="h-3 w-3 mr-1" />
            More Filters
          </Button>

          {/* Search Button */}
          <Button size="sm" className="h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground text-sm sm:ml-auto" onClick={onSearch}>
            <Search className="h-4 w-4 mr-1" />
            Search
          </Button>
        </div>
      </div>
    </div>;
};