"use client";

import React, { useEffect } from "react";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import ShippingDiscountForm from "../components/ShippingDiscountForm";

export default function ShippingDiscountPage() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Free Shipping");
  }, [setTitle]);

  return <ShippingDiscountForm />;
}
