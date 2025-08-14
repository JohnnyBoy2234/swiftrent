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
    if (!min && !max) return "Price";
    if (!min) return `Up to ${max}`;
    if (!max) return `From ${min}`;
    return `${min} - ${max}`;
  };
  const getPropertyTypeLabel = () => {
    const hasSelection = filters.propertyType !== "Any" && filters.propertyType;
    if (hasSelection) {
      return <div className="flex flex-col items-start">
          <span className="text-xs text-gray-400">Property Type</span>
          <span className="text-sm font-normal">{filters.propertyType}</span>
        </div>;
    }
    return "Property Type";
  };
  const getBedroomsLabel = () => {
    const hasSelection = filters.bedrooms !== "Any" && filters.bedrooms;
    if (hasSelection) {
      return <div className="flex flex-col items-start">
          <span className="text-xs text-muted-foreground/70">Bedrooms</span>
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
                {propertyTypeOptions.map(option => <Button key={option.value} variant="ghost" size="sm" onClick={() => {
                onFiltersChange({
                  propertyType: option.value
                });
                setPropertyTypeOpen(false);
              }} className="w-full justify-start hover:bg-muted/50 text-sm text-gray-950">
                    {option.label}
                  </Button>)}
              </div>
            </PopoverContent>
          </Popover>

          {/* Price Range Dropdown */}
          <Popover open={priceOpen} onOpenChange={setPriceOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-10 px-3 flex-1 min-w-[130px] justify-start text-left bg-white hover:bg-primary hover:text-white text-foreground border-input text-sm">
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
                    <Input type="number" placeholder="Any" value={filters.minPrice || ""} onChange={e => onFiltersChange({
                    minPrice: e.target.value
                  })} className="h-9 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Max Price</label>
                    <Input type="number" placeholder="Any" value={filters.maxPrice || ""} onChange={e => onFiltersChange({
                    maxPrice: e.target.value
                  })} className="h-9 text-sm" />
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
                {bedroomOptions.map(option => <Button key={option.value} variant="ghost" size="sm" className="w-full justify-start hover:bg-muted/50 text-sm" onClick={() => {
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