"use client";

import React, { useEffect } from "react";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import BuyGetDiscountForm from "../components/BuyGetDiscountForm";

export default function BuyGetDiscountPage() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Buy X Get Y");
  }, [setTitle]);

  return <BuyGetDiscountForm />;
}
