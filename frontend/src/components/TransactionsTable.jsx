import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

export default function TransactionsTable({ data, selectedLocation }) {
  const [sortOrder, setSortOrder] = useState("reverse"); // "reverse" or "chronological"
  const [filterLocation, setFilterLocation] = useState("all");
  const [dateRangeStart, setDateRangeStart] = useState(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return firstDay.toISOString().split('T')[0];
  });
  const [dateRangeEnd, setDateRangeEnd] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Get all transactions from data
  const allTransactions = useMemo(() => {
    if (!data || !data.locations) return [];
    
    const transactions = [];
    data.locations.forEach((location) => {
      if (location.transactions && Array.isArray(location.transactions)) {
        // Group transactions by date (they come from the database with same date = same transaction)
        const txByDate = {};
        
        location.transactions.forEach((transaction) => {
          const txDate = transaction.date || transaction.created_at;
          const dateKey = typeof txDate === 'string' ? txDate.split('T')[0] : new Date(txDate).toISOString().split('T')[0];
          
          if (!txByDate[dateKey]) {
            txByDate[dateKey] = {
              date: txDate,
              locationId: location.id,
              locationName: location.name,
              qty4x5: 0,
              qty4x8: 0,
              type: transaction.type,
            };
          }
          
          // Aggregate quantities
          txByDate[dateKey].qty4x5 += transaction.qty4x5 || 0;
          txByDate[dateKey].qty4x8 += transaction.qty4x8 || 0;
        });
        
        Object.values(txByDate).forEach((tx) => {
          transactions.push(tx);
        });
      }
    });
    return transactions;
  }, [data]);

  // Filter transactions based on date range and location
  const filteredTransactions = useMemo(() => {
    let filtered = [...allTransactions];

    // Filter by location
    if (filterLocation !== "all") {
      filtered = filtered.filter((t) => t.locationId === parseInt(filterLocation));
    } else if (selectedLocation !== "all") {
      // If "All Locations" tab not explicitly selected, show filtered view
      filtered = filtered.filter((t) => t.locationId === parseInt(selectedLocation));
    }

    // Filter by date range
    filtered = filtered.filter((t) => {
      const txDate = t.date || t.created_at;
      const txDateOnly = typeof txDate === 'string' ? txDate.split('T')[0] : new Date(txDate).toISOString().split('T')[0];
      return txDateOnly >= dateRangeStart && txDateOnly <= dateRangeEnd;
    });

    // Sort
    if (sortOrder === "reverse") {
      filtered.sort((a, b) => {
        const dateA = new Date(a.date || a.created_at);
        const dateB = new Date(b.date || b.created_at);
        return dateB - dateA; // Most recent first
      });
    } else {
      filtered.sort((a, b) => {
        const dateA = new Date(a.date || a.created_at);
        const dateB = new Date(b.date || b.created_at);
        return dateA - dateB; // Oldest first
      });
    }

    return filtered;
  }, [allTransactions, dateRangeStart, dateRangeEnd, filterLocation, selectedLocation, sortOrder]);

  const getTransactionTypeLabel = (transaction) => {
    if (transaction.type === "add") {
      if (transaction.truckType === "4x5") return "Truck Delivery - Full 4x5";
      if (transaction.truckType === "4x8") return "Truck Delivery - Full 4x8";
      if (transaction.mode === "split") return "Truck Delivery - 50/50";
      return "Custom Add";
    }
    return "Sale";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const locations = data?.locations || [];

  return (
    <section aria-label="Transactions" className="space-y-4">
      {/* Filters */}
      <div className="space-y-3 bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="date-start" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              id="date-start"
              type="date"
              value={dateRangeStart}
              onChange={(e) => setDateRangeStart(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              aria-label="Transaction start date"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="date-end" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              id="date-end"
              type="date"
              value={dateRangeEnd}
              onChange={(e) => setDateRangeEnd(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              aria-label="Transaction end date"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="location-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <select
              id="location-filter"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              aria-label="Filter by location"
            >
              <option value="all">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 items-end">
            <Button
              type="button"
              onClick={() => setSortOrder("reverse")}
              variant={sortOrder === "reverse" ? "default" : "outline"}
              className="text-sm"
              aria-label="Sort by most recent first"
            >
              Recent First
            </Button>
            <Button
              type="button"
              onClick={() => setSortOrder("chronological")}
              variant={sortOrder === "chronological" ? "default" : "outline"}
              className="text-sm"
              aria-label="Sort by oldest first"
            >
              Oldest First
            </Button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No transactions in this date range</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <caption className="sr-only">
                  Transaction history for {filterLocation === "all" ? "all locations" : "selected location"}
                </caption>
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold" scope="col">Date</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold" scope="col">Location</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold" scope="col">Type</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold" scope="col">4x5 Sheets</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold" scope="col">4x8 Sheets</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">{formatDate(tx.date || tx.created_at)}</td>
                      <td className="px-4 py-2 text-sm font-medium">{tx.locationName}</td>
                      <td className="px-4 py-2 text-sm">{getTransactionTypeLabel(tx)}</td>
                      <td className="px-4 py-2 text-center text-sm">{tx.qty4x5 || 0}</td>
                      <td className="px-4 py-2 text-center text-sm">{tx.qty4x8 || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3 p-4">
              {filteredTransactions.map((tx, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500"
                  role="article"
                  aria-label={`Transaction on ${formatDate(tx.date || tx.created_at)}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-gray-900">{tx.locationName}</p>
                    <p className="text-xs text-gray-600">{formatDate(tx.date || tx.created_at)}</p>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{getTransactionTypeLabel(tx)}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-600">4x5 Sheets</p>
                      <p className="font-bold text-gray-900">{tx.qty4x5 || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">4x8 Sheets</p>
                      <p className="font-bold text-gray-900">{tx.qty4x8 || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
