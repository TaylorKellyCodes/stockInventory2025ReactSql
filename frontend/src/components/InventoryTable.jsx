import React from "react";

export default function InventoryTable({ selectedLocation = "all", data, loading }) {
  if (loading) return <p aria-live="polite">Loading inventory table...</p>;
  if (!data) return <p aria-live="polite">No inventory data available.</p>;

  const locations = data.locations || [];

  const filteredLocations =
    selectedLocation === "all"
      ? locations
      : locations.filter((l) => l.id === parseInt(selectedLocation));

  return (
    <div className="mt-4">
      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full bg-white border">
          <caption className="sr-only">
            Inventory details for {selectedLocation === "all" ? "all locations" : "selected location"}
          </caption>
          <thead>
            <tr>
              <th className="px-4 py-2 border" scope="col">Location</th>
              <th className="px-4 py-2 border" scope="col">4x5 Sheets <span className="sr-only">(quantity)</span></th>
              <th className="px-4 py-2 border" scope="col">4x8 Sheets <span className="sr-only">(quantity)</span></th>
              <th className="px-4 py-2 border" scope="col">Inventory Value <span className="sr-only">(in USD)</span></th>
              <th className="px-4 py-2 border" scope="col">Profit Today <span className="sr-only">(in USD)</span></th>
            </tr>
          </thead>
          <tbody>
            {filteredLocations.map((loc) => {
              const qty4x5 = loc.items?.find((i) => i.sku === "4x5")?.quantity || 0;
              const qty4x8 = loc.items?.find((i) => i.sku === "4x8")?.quantity || 0;
              return (
                <tr key={loc.id}>
                  <td className="px-4 py-2 border font-semibold">{loc.name || loc.id}</td>
                  <td className="px-4 py-2 border" role="cell" aria-label={`4x5 sheets: ${qty4x5}`}>{qty4x5}</td>
                  <td className="px-4 py-2 border" role="cell" aria-label={`4x8 sheets: ${qty4x8}`}>{qty4x8}</td>
                  <td className="px-4 py-2 border" role="cell" aria-label={`Inventory value: ${(loc.inventory_value_cents / 100).toLocaleString()} USD`}>${(loc.inventory_value_cents / 100).toLocaleString()}</td>
                  <td className="px-4 py-2 border" role="cell" aria-label={`Profit today: ${(loc.profit_cents / 100).toLocaleString()} USD`}>${(loc.profit_cents / 100).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-4">
        {filteredLocations.map((loc) => {
          const qty4x5 = loc.items?.find((i) => i.sku === "4x5")?.quantity || 0;
          const qty4x8 = loc.items?.find((i) => i.sku === "4x8")?.quantity || 0;
          return (
            <div
              key={loc.id}
              className="p-4 bg-white rounded-lg shadow border-l-4 border-blue-500"
              role="article"
              aria-label={`Inventory for ${loc.name || loc.id}`}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-3">{loc.name || loc.id}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600 font-semibold">4x5 Sheets</p>
                  <p className="text-xl font-bold text-gray-900">{qty4x5}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600 font-semibold">4x8 Sheets</p>
                  <p className="text-xl font-bold text-gray-900">{qty4x8}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600 font-semibold">Inventory Value</p>
                  <p className="text-lg font-bold text-green-600">${(loc.inventory_value_cents / 100).toLocaleString()}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600 font-semibold">Profit Today</p>
                  <p className="text-lg font-bold text-blue-600">${(loc.profit_cents / 100).toLocaleString()}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
