import React, { useMemo, type FC } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"; // Adjust imports
import { Button } from "@/components/ui/button"; // Adjust imports
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Adjust imports
import { ChevronDown } from "lucide-react";
import type { SearchFilters } from "@/types/filters";

const propertyPrice = [
    { value: "", label: "Any" },
    { value: "5000", label: "R 5 000" },
    { value: "10000", label: "R 10 000" },
    { value: "25000", label: "R 25 000" },
    { value: "50000", label: "R 50 000" },
    { value: "100000", label: "R 100 000" },
    { value: "250000", label: "R 250 000" },
    { value: "500000", label: "R 500 000" },
    { value: "750000", label: "R 750 000" },
    { value: "1000000", label: "R 1 000 000" },
];

interface PriceDropdownProps {
  filters: SearchFilters;
  onFiltersChange: (patch: Partial<SearchFilters>) => void;
  priceOpen: boolean;
  setPriceOpen: (open: boolean) => void;
  getPriceLabel: () => React.ReactNode;
}

const PriceDropdown: FC<PriceDropdownProps> = ({ filters, onFiltersChange, priceOpen, setPriceOpen, getPriceLabel }) => {

    const maxPriceOptions = useMemo(() => {
        const minPriceValue = Number.parseInt(filters.minPrice || "0", 10) || 0;
        return propertyPrice.filter(option => {
            if (option.value === "") return true;
            const optionValue = Number.parseInt(option.value, 10) || 0;
            return optionValue >= minPriceValue;
        });
    }, [filters.minPrice]);

    const handleMinPriceChange = (value: string) => {
        const newMinPrice = value || "";
        const currentMaxPrice = filters.maxPrice || "";

        const newMinNumber = Number.parseInt(newMinPrice || "0", 10) || 0;
        const currentMaxNumber = Number.parseInt(currentMaxPrice || "0", 10) || 0;

        if (currentMaxPrice && newMinNumber > currentMaxNumber) {
            onFiltersChange({ minPrice: newMinPrice, maxPrice: newMinPrice });
        } else {
            onFiltersChange({ minPrice: newMinPrice });
        }
    };

    const handleMaxPriceChange = (value: string) => {
        onFiltersChange({ maxPrice: value || "" });
    };

    return (
        <Popover open={priceOpen} onOpenChange={setPriceOpen}>
            <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`h-10 px-3 flex-1 min-w-[130px] justify-start text-left bg-white hover:bg-primary hover:text-white border-input text-sm ${((filters.minPrice && filters.minPrice !== "") || (filters.maxPrice && filters.maxPrice !== "")) ? 'bg-primary text-white' : 'text-foreground'}`}
                >
                    <span className="truncate w-full">{getPriceLabel()}</span>
                    <ChevronDown className="h-3 w-3 ml-1 flex-shrink-0" />
                </Button>
            </PopoverTrigger>

            {/* stop propagation on the popover content so selects don't trigger outer clicks */}
            <PopoverContent
              className="w-80 p-4 bg-white border border-border z-50"
              align="start"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
                <div className="space-y-4" onPointerDown={(e) => e.stopPropagation()}>
                    <h4 className="font-medium text-foreground">Price Range</h4>
                    <div className="grid grid-cols-2 gap-3">

                        {/* --- Min Price Select --- */}
                        <div>
                            <label className="text-sm text-muted-foreground mb-1 block">Min Price</label>
                            <Select value={filters.minPrice || ""} onValueChange={(v) => { /* prevent bubbling */ handleMinPriceChange(v); }}>
                                <SelectTrigger className="h-9 text-sm" onPointerDown={(e) => e.stopPropagation()}>
                                    <SelectValue placeholder="Any" />
                                </SelectTrigger>
                                <SelectContent onPointerDown={(e) => e.stopPropagation()}>
                                    {propertyPrice.map(option => (
                                        <SelectItem
                                          key={`min-${option.value}`}
                                          value={option.value}
                                          onClick={(e) => { e.stopPropagation(); }} // extra guard
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* --- Max Price Select --- */}
                        <div>
                            <label className="text-sm text-muted-foreground mb-1 block">Max Price</label>
                            <Select value={filters.maxPrice || ""} onValueChange={(v) => { handleMaxPriceChange(v); }}>
                                <SelectTrigger className="h-9 text-sm" onPointerDown={(e) => e.stopPropagation()}>
                                    <SelectValue placeholder="Any" />
                                </SelectTrigger>
                                <SelectContent onPointerDown={(e) => e.stopPropagation()}>
                                    {maxPriceOptions.map(option => (
                                        <SelectItem
                                          key={`max-${option.value}`}
                                          value={option.value}
                                          onClick={(e) => { e.stopPropagation(); }}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
    );
};

export default PriceDropdown;