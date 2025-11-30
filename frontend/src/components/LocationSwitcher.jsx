import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LocationSwitcher({ locations = [], selected, onSelect }) {
  return (
    <div className="flex items-center justify-between mb-4">
      {/* Tabs for desktop */}
      <div className="hidden sm:block">
        <Tabs value={String(selected)} onValueChange={onSelect} aria-label="Location selection tabs">
          <TabsList aria-label="Available locations">
            <TabsTrigger value="all" aria-label="View all locations">All Locations</TabsTrigger>
            {locations.map((loc) => (
              <TabsTrigger key={loc.id} value={String(loc.id)} aria-label={`View ${loc.name} location`}>
                {loc.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Select for mobile */}
      <div className="sm:hidden w-48">
        <Select value={String(selected)} onValueChange={onSelect}>
          <SelectTrigger aria-label="Select a location">
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={String(loc.id)}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
