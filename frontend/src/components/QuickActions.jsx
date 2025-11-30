import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  Input,
} from "@/components/ui/form";

export default function QuickActions({ onAction, selectedLocation, data }) {
  const [currentAction, setCurrentAction] = useState(null);
  const [truckType, setTruckType] = useState(null);
  const [sellWarning, setSellWarning] = useState(null);
  const [sellConfirmed, setSellConfirmed] = useState(false);
  const [selectedItemType, setSelectedItemType] = useState("4x5");
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);

  const actions = [
    { id: "fullTruck", label: "Add Full Truck", mobileLabel: "Full Truck", description: "Add a complete truck of one sheet type to the selected location" },
    { id: "splitTruck", label: "Add 50/50 Truck", mobileLabel: "50/50 Truck", description: "Add a split truck with equal quantities of 4x5 and 4x8 sheets" },
    { id: "custom", label: "Add Custom Amount", mobileLabel: "Custom", description: "Add custom quantities of sheets to the selected location" },
    { id: "sell", label: "Sell Items", mobileLabel: "Sell", description: "Record a sale of sheets from the selected location" },
  ];

  // Only show action buttons when a specific location is selected (not "all")
  const isLocationSelected = selectedLocation && selectedLocation !== "all";

  // Get current inventory for selected location
  const getCurrentInventory = () => {
    if (!data || !data.locations || !isLocationSelected) return {};
    const location = data.locations.find((l) => l.id === parseInt(selectedLocation));
    if (!location || !location.items) return {};
    return {
      "4x5": location.items.find((i) => i.sku === "4x5")?.quantity || 0,
      "4x8": location.items.find((i) => i.sku === "4x8")?.quantity || 0,
    };
  };

  const handleSellChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "itemType") {
      setSelectedItemType(value);
    }
    
    const quantity = parseInt(document.querySelector('input[name="quantity"]')?.value) || 0;
    const itemType = document.querySelector('select[name="itemType"]')?.value || "4x5";
    const inventory = getCurrentInventory();
    
    if (quantity > (inventory[itemType] || 0)) {
      setSellWarning(`Warning: Selling more than available. Available: ${inventory[itemType] || 0}`);
    } else {
      setSellWarning(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());

    // For sell action with warning, require confirmation
    if (currentAction === "sell" && sellWarning && !sellConfirmed) {
      setSellConfirmed(true);
      return;
    }

    try {
      if (onAction) {
        await onAction(currentAction, values);
      }
      setCurrentAction(null);
      setTruckType(null);
      setSellWarning(null);
      setSellConfirmed(false);
      setSelectedItemType("4x5");
      setTransactionDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      console.error("Error performing action:", err);
    }
  };

  return (
    <section aria-label="Quick Actions" className="flex flex-col sm:flex-wrap sm:flex-row gap-4 mb-6">
      {actions.map((action) => {
        // Hide action buttons if no specific location is selected
        if (!isLocationSelected) {
          return null;
        }

        return (
          <Dialog
            key={action.id}
            open={currentAction === action.id}
            onOpenChange={(open) => {
              if (!open) {
                setCurrentAction(null);
                setTruckType(null);
                setSellWarning(null);
                setSellConfirmed(false);
                setSelectedItemType("4x5");
                setTransactionDate(new Date().toISOString().split('T')[0]);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button 
                onClick={() => setCurrentAction(action.id)}
                aria-label={action.label}
                title={action.description}
                className="w-full sm:w-auto"
              >
                <span className="sm:hidden">{action.mobileLabel}</span>
                <span className="hidden sm:inline">{action.label}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[90vw] sm:w-full max-w-md">
              <DialogHeader>
                <DialogTitle>{action.label}</DialogTitle>
                <p id={`${action.id}-description`} className="text-sm text-gray-600 mt-2">
                  {action.description}
                </p>
              </DialogHeader>

              <form onSubmit={handleSubmit}>
                {action.id === "fullTruck" && !truckType && (
                  <div className="space-y-4">
                    <p className="font-semibold">Select the type of full truck:</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        type="button"
                        onClick={() => setTruckType("4x5")}
                        variant="outline"
                        aria-label="Add full truck of 4x5 sheets"
                        className="w-full sm:w-auto"
                      >
                        Full 4x5
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setTruckType("4x8")}
                        variant="outline"
                        aria-label="Add full truck of 4x8 sheets"
                        className="w-full sm:w-auto"
                      >
                        Full 4x8
                      </Button>
                    </div>
                  </div>
                )}

                {action.id === "fullTruck" && truckType && (
                  <div className="space-y-4">
                    <p>Full truck of <strong>{truckType}</strong> selected</p>
                    <input type="hidden" name="truckType" value={truckType} />
                  </div>
                )}

                {action.id === "custom" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField name="qty4x5">
                        <FormItem>
                          <FormLabel htmlFor="qty4x5">Quantity 4x5</FormLabel>
                          <FormControl>
                            <Input
                              id="qty4x5"
                              type="number"
                              defaultValue={0}
                              min={0}
                              name="qty4x5"
                              aria-label="Quantity of 4x5 sheets to add"
                              aria-describedby="qty4x5-help"
                            />
                          </FormControl>
                          <p id="qty4x5-help" className="text-xs text-gray-500 mt-1">Enter the number of 4x5 sheets</p>
                        </FormItem>
                      </FormField>
                      <FormField name="qty4x8">
                        <FormItem>
                          <FormLabel htmlFor="qty4x8">Quantity 4x8</FormLabel>
                          <FormControl>
                            <Input
                              id="qty4x8"
                              type="number"
                              defaultValue={0}
                              min={0}
                              name="qty4x8"
                              aria-label="Quantity of 4x8 sheets to add"
                              aria-describedby="qty4x8-help"
                            />
                          </FormControl>
                          <p id="qty4x8-help" className="text-xs text-gray-500 mt-1">Enter the number of 4x8 sheets</p>
                        </FormItem>
                      </FormField>
                    </div>
                  </div>
                )}

                {action.id === "sell" && (
                  <div className="space-y-4">
                    <FormField name="itemType">
                      <FormItem>
                        <FormLabel htmlFor="itemType">Item Type</FormLabel>
                        <FormControl>
                          <select
                            id="itemType"
                            name="itemType"
                            className="border rounded px-2 py-1 w-full"
                            onChange={handleSellChange}
                            value={selectedItemType}
                            aria-label="Select item type to sell"
                            aria-describedby="itemType-help"
                          >
                            <option value="4x5">4x5 Sheets (Available: {getCurrentInventory()["4x5"] || 0})</option>
                            <option value="4x8">4x8 Sheets (Available: {getCurrentInventory()["4x8"] || 0})</option>
                          </select>
                        </FormControl>
                        <p id="itemType-help" className="text-xs text-gray-500 mt-1">Choose which sheet type to sell</p>
                      </FormItem>
                    </FormField>

                    <FormField name="quantity">
                      <FormItem>
                        <FormLabel htmlFor="quantity">
                          Quantity (Available: {getCurrentInventory()[selectedItemType] || 0})
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="quantity"
                            type="number"
                            defaultValue={0}
                            min={0}
                            name="quantity"
                            onChange={handleSellChange}
                            aria-label={`Quantity of ${selectedItemType} sheets to sell`}
                            aria-describedby="quantity-help"
                          />
                        </FormControl>
                        <p id="quantity-help" className="text-xs text-gray-500 mt-1">Enter the number of sheets to sell</p>
                      </FormItem>
                    </FormField>

                    {sellWarning && (
                      <div 
                        className="p-3 bg-yellow-100 border-2 border-yellow-400 rounded"
                        role="alert"
                        aria-live="assertive"
                        aria-label="Warning: insufficient inventory"
                      >
                        <p className="text-sm font-semibold text-yellow-900">{sellWarning}</p>
                        {!sellConfirmed && (
                          <p className="text-xs text-yellow-800 mt-1">Click Confirm again to proceed.</p>
                        )}
                      </div>
                    )}

                    {sellConfirmed && sellWarning && (
                      <div 
                        className="p-3 bg-blue-100 border-2 border-blue-400 rounded"
                        role="region"
                        aria-label="Confirmed sale details"
                      >
                        <p className="text-sm text-blue-900">
                          Confirmed: Selling{" "}
                          <strong>
                            {document.querySelector('input[name="quantity"]')?.value || 0}
                          </strong>
                          {" "}of item type{" "}
                          <strong>
                            {selectedItemType}
                          </strong>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {(action.id === "fullTruck" || action.id === "splitTruck" || action.id === "custom" || action.id === "sell") && (
                  <FormField name="transactionDate">
                    <FormItem>
                      <FormLabel htmlFor="transactionDate">Date</FormLabel>
                      <FormControl>
                        <Input
                          id="transactionDate"
                          type="date"
                          name="transactionDate"
                          value={transactionDate}
                          onChange={(e) => setTransactionDate(e.target.value)}
                          aria-label="Transaction date"
                          aria-describedby="date-help"
                        />
                      </FormControl>
                      <p id="date-help" className="text-xs text-gray-500 mt-1">Leave as today or select a different date</p>
                    </FormItem>
                  </FormField>
                )}

                <DialogFooter className="mt-4">
                  <Button 
                    type="submit"
                    aria-label={sellConfirmed && sellWarning ? "Confirm sale despite inventory warning" : `Confirm ${action.label}`}
                  >
                    Confirm
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        );
      })}
    </section>
  );
}
