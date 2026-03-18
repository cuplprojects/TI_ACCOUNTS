"use client";

import StatisticsSection from "./components/StatisticsSection";
import RevenueSection from "./components/RevenueSection";
import TopCategoriesSection from "./components/TopCategoriesSection";
import ActiveUserSection from "./components/ActiveUserSection";
import ConversionSection from "./components/ConversionSection";
import TopBrandsSection from "./components/TopBrandsSection";
import TopSellersSection from "./components/TopSellersSection";
import TopProductsSection from "./components/TopProductsSection";
import OrdersTableSection from "./components/OrdersTableSection";
import RecentActivitySection from "./components/RecentActivitySection";

export default function AdminDashboardPage() {
  return (
    <main className="flex-1 p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 space-y-3 xs:space-y-4 sm:space-y-5 lg:space-y-6">
      {/* Top Section: Left (2 rows stacked) + Right (Top Categories) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 lg:gap-6">
        {/* Left side: 2 rows stacked - 3 columns */}
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-3 xs:gap-4 sm:gap-5 lg:gap-6">
          {/* Row 1: 3 Statistics Cards */}
          <StatisticsSection />
          
          {/* Row 2: Revenue Analytics */}
          <RevenueSection />
        </div>
        
        {/* Right side: Top Categories - 1 column */}
        <div className="col-span-1 lg:col-span-1 lg:row-span-2">
          <TopCategoriesSection />
        </div>
      </div>

      {/* Row 3: Active Users (1/4) + Conversion Rate (1/2) + Top Brands (1/4) */}
      <div className="flex flex-col lg:flex-row gap-3 xs:gap-4 sm:gap-5 lg:gap-6 min-h-[200px]">
        <div className="w-full lg:w-1/4">
          <ActiveUserSection />
        </div>
        <div className="w-full lg:w-1/2">
          <ConversionSection />
        </div>
        <div className="w-full lg:w-1/4">
          <TopBrandsSection />
        </div>
      </div>

      {/* Row 4: Recent Orders (2/3) + Recent Activity (1/3) */}
      <div className="flex flex-col lg:flex-row gap-3 xs:gap-4 sm:gap-5 lg:gap-6">
        <div className="w-full lg:flex-[1]">
          <OrdersTableSection />
        </div>
        {/* <div className="w-full lg:flex-[1]">
          <RecentActivitySection />
        </div> */}
      </div>

       {/* Row 5: Top Sellers (1/2) + Top Products (1/2) */}
      <div className="flex flex-col md:flex-row gap-3 xs:gap-4 sm:gap-5 lg:gap-6">
        <div className="w-full md:w-1/2">
          <TopSellersSection />
        </div>
        <div className="w-full md:w-1/2">
          <TopProductsSection />
        </div>
      </div>

    </main>
  );
}
