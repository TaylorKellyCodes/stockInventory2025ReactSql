import React, { useState, useEffect } from "react";
import KPICards from "./components/KPICards";
import InventoryTable from "./components/InventoryTable";
import LocationSwitcher from "./components/LocationSwitcher";
import QuickActions from "./components/QuickActions";
import TransactionsTable from "./components/TransactionsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

export default function App() {
  // List of locations (mock for switching)
  const locations = [
    { id: 1, name: "Durham" },
    { id: 2, name: "Concord" },
  ];

  const [selectedLocation, setSelectedLocation] = useState("all");
  const [inventoryData, setInventoryData] = useState(null);

  // Convert location ID to number if it's not "all"
  const getNumericLocationId = (locId) => {
    return locId === "all" ? "all" : parseInt(locId);
  };

  // Fetch inventory from backend
  const fetchInventory = async () => {
    try {
      const res = await fetch("http://localhost:4000/inventory");
      if (!res.ok) throw new Error("Failed to fetch inventory");
      const data = await res.json();
      setInventoryData(data);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Callback for QuickActions
  const handleAction = async (actionId, values) => {
    try {
      // Prevent actions if "all" is selected
      if (selectedLocation === "all") {
        alert("Please select a specific location before performing an action");
        return;
      }

      let endpoint = "";
      let body = { locationId: getNumericLocationId(selectedLocation) };

      switch (actionId) {
        case "fullTruck":
          endpoint = "/add-truck";
          body.mode = "full";
          body.truckType = values.truckType;
          break;
        case "splitTruck":
          endpoint = "/add-truck";
          body.mode = "split";
          break;
        case "custom":
          endpoint = "/add-custom";
          body = { ...body, qty4x5: parseInt(values.qty4x5) || 0, qty4x8: parseInt(values.qty4x8) || 0 };
          break;
        case "sell":
          endpoint = "/sell";
          body = { ...body, type: values.itemType, quantity: parseInt(values.quantity) || 0 };
          break;
        default:
          return;
      }

      const res = await fetch(`http://localhost:4000/inventory${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, transactionDate: values.transactionDate }),
      });

      if (!res.ok) throw new Error("Failed to perform action");

      // Refresh inventory after successful action
      await fetchInventory();
    } catch (err) {
      console.error("Error performing action:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <header className="max-w-6xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
        
      </header>

      <main className="max-w-6xl mx-auto space-y-6" role="main">
        {/* Location Switcher */}
        <LocationSwitcher
          locations={locations}
          selected={selectedLocation}
          onSelect={setSelectedLocation}
        />

        {/* When "All Locations" is selected, show tabs for Inventory and Transactions */}
        {selectedLocation === "all" ? (
          <Tabs defaultValue="inventory" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="inventory">Inventory Overview</TabsTrigger>
              <TabsTrigger value="transactions">Transaction History</TabsTrigger>
            </TabsList>
            <TabsContent value="inventory" className="space-y-6">
              <KPICards selectedLocation={selectedLocation} data={inventoryData} />
              <InventoryTable selectedLocation={selectedLocation} data={inventoryData} />
            </TabsContent>
            <TabsContent value="transactions">
              <TransactionsTable data={inventoryData} selectedLocation={selectedLocation} />
            </TabsContent>
          </Tabs>
        ) : (
          <>
            {/* Quick Action Buttons */}
            <QuickActions onAction={handleAction} selectedLocation={selectedLocation} data={inventoryData} />

            {/* KPI Cards */}
            <KPICards selectedLocation={selectedLocation} data={inventoryData} />

            {/* Inventory Table */}
            <InventoryTable selectedLocation={selectedLocation} data={inventoryData} />
          </>
        )}
      </main>
    </div>
  );
}
