"use client";

import React, { useEffect } from "react";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import OrderDiscountForm from "../components/OrderDiscountForm";

export default function OrderDiscountPage() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Amount Off Order");
  }, [setTitle]);

  return <OrderDiscountForm />;
}
