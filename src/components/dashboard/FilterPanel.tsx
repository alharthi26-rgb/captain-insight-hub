import { useState } from "react";
import { CalendarIcon, FilterIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  companies: string[];
  captains: string[];
  packageCodes: string[];
  selectedCompany: string;
  selectedCaptain: string;
  selectedPackageCode: string;
  dateRange: DateRange;
  onCompanyChange: (company: string) => void;
  onCaptainChange: (captain: string) => void;
  onPackageCodeChange: (packageCode: string) => void;
  onDateRangeChange: (range: DateRange) => void;
  onResetFilters: () => void;
}

export function FilterPanel({
  companies,
  captains,
  packageCodes,
  selectedCompany,
  selectedCaptain,
  selectedPackageCode,
  dateRange,
  onCompanyChange,
  onCaptainChange,
  onPackageCodeChange,
  onDateRangeChange,
  onResetFilters
}: FilterPanelProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const hasActiveFilters = selectedCompany !== "all" || selectedCaptain !== "all" || selectedPackageCode !== "all" || dateRange.from || dateRange.to;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <FilterIcon className="h-5 w-5" />
          Filters & Controls
        </CardTitle>
        <CardDescription>
          Filter data by date range, company, captain, or package code
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Date Range</label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    onDateRangeChange(range || {});
                    if (range?.from && range?.to) {
                      setCalendarOpen(false);
                    }
                  }}
                  numberOfMonths={2}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Company</label>
            <Select value={selectedCompany} onValueChange={onCompanyChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Captain</label>
            <Select value={selectedCaptain} onValueChange={onCaptainChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select captain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Captains</SelectItem>
                {captains.map((captain) => (
                  <SelectItem key={captain} value={captain}>
                    {captain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Package Code</label>
            <Select value={selectedPackageCode} onValueChange={onPackageCodeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select package" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Packages</SelectItem>
                {packageCodes.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button 
              variant="outline" 
              onClick={onResetFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}