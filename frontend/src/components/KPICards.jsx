import React from "react";

export default function KPICards({ selectedLocation = "all", data, loading }) {
  if (loading) return <p aria-live="polite">Loading KPIs...</p>;
  if (!data) return <p aria-live="polite">No inventory data available.</p>;

  const locations = data.locations || [];

  const filteredLocations =
    selectedLocation === "all"
      ? locations
      : locations.filter((l) => l.id === parseInt(selectedLocation));

  const totals = {
    inventory_value_cents: filteredLocations.reduce(
      (acc, l) => acc + (l.inventory_value_cents || 0),
      0
    ),
    profit_cents: filteredLocations.reduce((acc, l) => acc + (l.profit_cents || 0), 0),
    total_sheets_4x5: filteredLocations.reduce(
      (acc, l) => acc + (l.items?.find((i) => i.sku === "4x5")?.quantity || 0),
      0
    ),
    total_sheets_4x8: filteredLocations.reduce(
      (acc, l) => acc + (l.items?.find((i) => i.sku === "4x8")?.quantity || 0),
      0
    ),
  };

  const kpis = [
    { id: "inventory_value", label: "Inventory Value", value: totals.inventory_value_cents / 100, prefix: "$", ariaLabel: "Total inventory value in USD" },
    { id: "profit_today", label: "Profit Today", value: totals.profit_cents / 100, prefix: "$", ariaLabel: "Total profit today in USD" },
    { id: "total_4x5", label: "Total 4x5 Sheets", value: totals.total_sheets_4x5, ariaLabel: "Total quantity of 4x5 sheets" },
    { id: "total_4x8", label: "Total 4x8 Sheets", value: totals.total_sheets_4x8, ariaLabel: "Total quantity of 4x8 sheets" },
  ];

  return (
    <section aria-label="Key Performance Indicators">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="p-4 bg-white rounded shadow" role="region" aria-label={kpi.label}>
            <h2 className="text-sm font-medium text-gray-700">{kpi.label}</h2>
            <p className="text-lg font-semibold" aria-label={`${kpi.ariaLabel}: ${kpi.prefix || ""}${kpi.value.toLocaleString()}`}>
              {kpi.prefix || ""}{kpi.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
