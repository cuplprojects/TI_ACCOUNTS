"use client";

import React, { useEffect } from "react";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import ProductDiscountForm from "../components/ProductDiscountForm";

export default function ProductDiscountPage() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Amount Off Products");
  }, [setTitle]);

  return <ProductDiscountForm />;
}
