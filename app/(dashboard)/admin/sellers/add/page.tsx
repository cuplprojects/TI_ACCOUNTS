"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import { useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faChevronDown,
  faPlus,
  faChevronRight,
  faSearch,
  faTimes,
  faEye,
  faEyeSlash,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import AddressModal, {
  AddressData,
} from "../../../../components/common/AddressModal";
import WarehouseAddressModal, {
  WarehouseAddressData,
} from "../../../../components/common/WarehouseAddressModal";
import BankDetailsSection from "@/app/components/admin/BankDetailsSection";
import CountryCodeSelector from "@/app/components/common/CountryCodeSelector";
import {
  createSeller,
  updateSeller,
  getSeller,
  addSellerAddress,
  deleteSellerAddress,
  SellerRequest,
  Address as SellerAddress,
  approveSeller,
  rejectSeller,
} from "@/app/lib/services/admin/sellerService";
import { getAllTags, createTag } from "@/app/lib/services/admin";
import {
  getAllBrands,
  assignMultipleBrandsToSeller,
  getBrandsBySellerIdForAdmin,
} from "@/app/lib/services/admin/brandService";
import type { Tag } from "@/app/lib/services/admin/tagService";
import { useRouter } from "next/navigation";
import {
  validateEmail,
  validateGST,
  validatePhone,
  validatePassword,
  VALIDATION_ERRORS,
} from "@/app/lib/utils/validations";
import {
  showErrorMessage,
  showSuccessMessage,
  showConfirmation,
} from "@/app/lib/swalConfig";

// Form validation errors interface
interface FormErrors {
  firmName?: string;
  password?: string;
  firmType?: string;
  gstinNo?: string;
  email?: string;
  phoneNumber?: string;
}

// Update the Address interface to include required fields
interface Address {
  type: "default" | "warehouse";
  country: string;
  country_code: string;
  country_code_iso: string;
  first_name: string;
  last_name: string;
  company: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
}

function AddSellerContent() {
  const router = useRouter();
  const { setTitle } = usePageTitle();
  const searchParams = useSearchParams();

  // Get URL parameters
  const sellerId = searchParams.get("id");
  const isEditMode = !!sellerId;
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressType, setAddressType] = useState<"default" | "warehouse">(
    "default",
  );

  // Form state
  const [firmName, setFirmName] = useState("");
  const [password, setPassword] = useState("");
  const [firmType, setFirmType] = useState("");
  const [isGstRegistered, setIsGstRegistered] = useState(false);
  const [gstinNo, setGstinNo] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailConsent, setEmailConsent] = useState(false);
  const [smsConsent, setSmsConsent] = useState(false);
  const [selfPickup, setSelfPickup] = useState(false);
  const [margin, setMargin] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [defaultAddress, setDefaultAddress] = useState<AddressData | null>(
    null,
  );
  const [warehouseAddress, setWarehouseAddress] =
    useState<WarehouseAddressData | null>(null);
  const [useDefaultAsWarehouse, setUseDefaultAsWarehouse] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [countryCodeIso, setCountryCodeIso] = useState("IN");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoadingSeller, setIsLoadingSeller] = useState(isEditMode);

  // Tags management
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState("");

  // Brands management
  const [brands, setBrands] = useState<any[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<any[]>([]);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [brandSearchTerm, setBrandSearchTerm] = useState("");

  // Tag creation modal
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagDescription, setNewTagDescription] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  // Document uploads
  const [stampFile, setStampFile] = useState<File | null>(null);
  const [stampUrl, setStampUrl] = useState<string>("");
  const [isUploadingStamp, setIsUploadingStamp] = useState(false);

  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string>("");
  const [isUploadingSignature, setIsUploadingSignature] = useState(false);

  const [gstCertificateFile, setGstCertificateFile] = useState<File | null>(
    null,
  );
  const [gstCertificateUrl, setGstCertificateUrl] = useState<string>("");
  const [isUploadingGstCertificate, setIsUploadingGstCertificate] =
    useState(false);

  const [agreementFile, setAgreementFile] = useState<File | null>(null);
  const [agreementUrl, setAgreementUrl] = useState<string>("");
  const [isUploadingAgreement, setIsUploadingAgreement] = useState(false);

  // Document viewer
  const [viewingDocument, setViewingDocument] = useState<{
    type: string;
    url: string;
  } | null>(null);

  // Seller status and approval
  const [sellerStatus, setSellerStatus] = useState<string>("");
  const [isApprovingRejecting, setIsApprovingRejecting] = useState(false);

  // Ref for tag dropdown container
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const brandDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set title based on mode
    if (isEditMode) {
      setTitle("Edit Seller");
    } else {
      setTitle("New Seller");
    }

    // Load tags on mount
    loadTags();

    // Load brands on mount
    loadBrands();

    // Load seller data if editing
    if (isEditMode && sellerId) {
      loadSellerData(sellerId);
    } else {
      // Auto-generate password only for new sellers
      generatePassword();
    }
  }, [setTitle, isEditMode, sellerId]);

  // Add click outside listener to close tag dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tagDropdownRef.current &&
        !tagDropdownRef.current.contains(event.target as Node)
      ) {
        setShowTagDropdown(false);
      }
    }

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTagDropdown]);

  // Add click outside listener to close brand dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        brandDropdownRef.current &&
        !brandDropdownRef.current.contains(event.target as Node)
      ) {
        setShowBrandDropdown(false);
      }
    }

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showBrandDropdown]);

  // Load seller data for edit mode
  const loadSellerData = async (id: string) => {
    setIsLoadingSeller(true);
    try {
      const response = await getSeller(id);

      // Debug the response to see what's coming back
      console.log("Seller data from backend:", response);

      // No need to check response.success and response.data since getSeller already does that
      const sellerData = response.data;

      // Make sure sellerData exists before proceeding
      if (!sellerData) {
        throw new Error("No seller data found in the response");
      }

      // Set seller status
      setSellerStatus(sellerData.status || "");

      // Populate form fields with seller data
      console.log("Setting firm name:", sellerData.firm_name);
      setFirmName(sellerData.firm_name || "");
      console.log("Setting firm type:", sellerData.entity_type);
      setFirmType(sellerData.entity_type || "");
      console.log("Setting GST registered:", sellerData.is_gst_registered);
      setIsGstRegistered(!!sellerData.is_gst_registered);
      console.log("Setting GSTIN:", sellerData.gstin);
      setGstinNo(sellerData.gstin || "");
      console.log("Setting email:", sellerData.email);
      setEmail(sellerData.email || "");
      console.log("Setting phone:", sellerData.phone);
      setPhoneNumber(sellerData.phone || "");
      console.log("Setting country code:", sellerData.country_code);
      // Convert country code: if it's "IN", convert to "+91"
      const countryCodeValue =
        sellerData.country_code === "IN"
          ? "+91"
          : sellerData.country_code || "+91";
      setCountryCode(countryCodeValue);
      setCountryCodeIso(sellerData.country_code_iso || "IN");
      console.log("Setting email consent:", sellerData.is_marketing_emails);
      setEmailConsent(!!sellerData.is_marketing_emails);
      console.log("Setting SMS consent:", sellerData.is_marketing_sms);
      setSmsConsent(!!sellerData.is_marketing_sms);
      console.log("Setting self pickup:", sellerData.self_pickup);
      setSelfPickup(!!sellerData.self_pickup);

      // Set margin if available
      if (sellerData.margin !== undefined && sellerData.margin !== null) {
        console.log("Setting margin:", sellerData.margin);
        setMargin(sellerData.margin);
      }

      // Don't set password for existing sellers
      setPassword("");

      // Load tags if available
      if (sellerData.Tags && Array.isArray(sellerData.Tags)) {
        console.log("Setting tags:", sellerData.Tags);
        const sellerTags = sellerData.Tags.map((tag: any) => ({
          id: tag.id,
          name: tag.name,
          description: tag.description || "",
        }));
        setSelectedTags(sellerTags);
      }

      // Load notes if available
      if (
        sellerData.SellerNotes &&
        Array.isArray(sellerData.SellerNotes) &&
        sellerData.SellerNotes.length > 0
      ) {
        console.log("Setting notes:", sellerData.SellerNotes[0].content);
        const noteContent = sellerData.SellerNotes[0].content;
        setNotes(noteContent || "");
      }

      // Set addresses if available
      if (sellerData.SellerAddresses && sellerData.SellerAddresses.length > 0) {
        console.log("Setting addresses from:", sellerData.SellerAddresses);

        const defaultAddr = sellerData.SellerAddresses.find(
          (addr: any) => addr.type === "default",
        );
        const warehouseAddr = sellerData.SellerAddresses.find(
          (addr: any) => addr.type === "warehouse",
        );

        console.log("Default address:", defaultAddr);
        console.log("Warehouse address:", warehouseAddr);

        if (defaultAddr) {
          setDefaultAddress({
            firstName: defaultAddr.first_name || "",
            lastName: defaultAddr.last_name || "",
            address: defaultAddr.address_line_1,
            apartment: defaultAddr.address_line_2 || "",
            city: defaultAddr.city,
            state: defaultAddr.state,
            zipCode: defaultAddr.zip_code,
            country: defaultAddr.country,
            countryCode: defaultAddr.country_code || "",
            country_code_iso: defaultAddr.country_code_iso || "",
            stateCode: "", // Add a default empty stateCode
            company: defaultAddr.company,
          });
        }

        if (warehouseAddr) {
          setWarehouseAddress({
            firstName: warehouseAddr.first_name || "",
            lastName: warehouseAddr.last_name || "",
            address: warehouseAddr.address_line_1,
            apartment: warehouseAddr.address_line_2 || "",
            city: warehouseAddr.city,
            state: warehouseAddr.state,
            zipCode: warehouseAddr.zip_code,
            country: warehouseAddr.country,
            countryCode: warehouseAddr.country_code || "",
            country_code_iso: warehouseAddr.country_code_iso || "",
            stateCode: "", // Add a default empty stateCode
            company: warehouseAddr.company || "",
          });
        }

        // Check if default and warehouse addresses are the same
        if (defaultAddr && warehouseAddr) {
          const isSameAddress =
            defaultAddr.address_line_1 === warehouseAddr.address_line_1 &&
            defaultAddr.city === warehouseAddr.city &&
            defaultAddr.state === warehouseAddr.state &&
            defaultAddr.zip_code === warehouseAddr.zip_code;

          if (isSameAddress) {
            setUseDefaultAsWarehouse(true);
          }
        }
      }

      // Load brands if available
      if (sellerData.Brands && Array.isArray(sellerData.Brands)) {
        console.log("Setting brands:", sellerData.Brands);
        const sellerBrands = sellerData.Brands.map((brand: any) => ({
          id: brand.id,
          name: brand.name,
          description: brand.description || "",
        }));
        setSelectedBrands(sellerBrands);
      } else {
        // If brands not in seller data, try to fetch them separately
        try {
          const sellerBrands = await getBrandsBySellerIdForAdmin(id);
          if (sellerBrands && sellerBrands.length > 0) {
            console.log("Fetched brands for seller:", sellerBrands);
            setSelectedBrands(sellerBrands);
          }
        } catch (brandError) {
          console.error("Failed to fetch seller brands:", brandError);
        }
      }

      // Load document URLs if available
      if (sellerData.stamp_url) {
        setStampUrl(sellerData.stamp_url);
      }
      if (sellerData.signature_url) {
        setSignatureUrl(sellerData.signature_url);
      }
      if (sellerData.gst_certificate_url) {
        setGstCertificateUrl(sellerData.gst_certificate_url);
      }
      if (sellerData.agreement_url) {
        setAgreementUrl(sellerData.agreement_url);
      }
    } catch (err) {
      console.error("Failed to load seller data:", err);
      showErrorMessage(
        "Failed to load seller data. Redirecting to sellers list.",
      );
      router.push("/admin/sellers");
    } finally {
      setIsLoadingSeller(false);
    }
  };

  // Load all existing tags
  const loadTags = async () => {
    setIsLoadingTags(true);
    try {
      const tagsData = await getAllTags();
      setTags(tagsData);
    } catch (error) {
      console.error("Failed to load tags:", error);
    } finally {
      setIsLoadingTags(false);
    }
  };

  // Load all existing brands
  const loadBrands = async () => {
    setIsLoadingBrands(true);
    try {
      const brandsData = await getAllBrands(1, 1000);
      if (brandsData) {
        setBrands(brandsData.brands || []);
      }
    } catch (error) {
      console.error("Failed to load brands:", error);
    } finally {
      setIsLoadingBrands(false);
    }
  };

  // Add a new tag
  const handleAddNewTag = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      const success = await createTag({
        name: newTagName.trim(),
        description: newTagDescription.trim(),
      });

      if (success) {
        // Clear inputs
        setNewTagName("");
        setNewTagDescription("");

        // Close modal
        setShowTagModal(false);

        // Refresh tags list
        await loadTags();

        // Show the dropdown after creating a new tag
        setShowTagDropdown(true);
      }
    } catch (error) {
      console.error("Failed to create tag:", error);
    }
  };

  // Select a tag
  const handleSelectTag = (tag: Tag) => {
    // Check if tag is already selected
    if (!selectedTags.some((t) => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagSearchTerm("");
    setShowTagDropdown(false);
  };

  // Remove a selected tag
  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag.id !== tagId));
  };

  // Filter tags based on search term
  const filteredTags = tags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase()) &&
      !selectedTags.some((selectedTag) => selectedTag.id === tag.id),
  );

  // Select a brand
  const handleSelectBrand = (brand: any) => {
    // Check if brand is already selected
    if (!selectedBrands.some((b) => b.id === brand.id)) {
      setSelectedBrands([...selectedBrands, brand]);
    }
    setBrandSearchTerm("");
    setShowBrandDropdown(false);
  };

  // Remove a selected brand
  const handleRemoveBrand = (brandId: string) => {
    setSelectedBrands(selectedBrands.filter((brand) => brand.id !== brandId));
  };

  // Filter brands based on search term
  const filteredBrands = brands.filter(
    (brand) =>
      brand.name.toLowerCase().includes(brandSearchTerm.toLowerCase()) &&
      !selectedBrands.some((selectedBrand) => selectedBrand.id === brand.id),
  );

  const handleAddAddress = (type: "default" | "warehouse") => {
    setAddressType(type);
    setShowAddressModal(true);
  };

  const handleDeleteAddress = async (type: "default" | "warehouse") => {
    if (isEditMode && sellerId) {
      // Call API to delete address
      const success = await deleteSellerAddress(sellerId, type);
      if (success) {
        // Update local state
        if (type === "default") {
          setDefaultAddress(null);
          setUseDefaultAsWarehouse(false);
        } else {
          setWarehouseAddress(null);
        }
      }
    } else {
      // For new sellers, just clear local state
      if (type === "default") {
        setDefaultAddress(null);
        setUseDefaultAsWarehouse(false);
      } else {
        setWarehouseAddress(null);
      }
    }
  };

  const handleAddressModalClose = () => {
    setShowAddressModal(false);
  };

  // Update warehouse address when default address changes if the checkbox is checked
  // Only sync when user manually checks the box, not during initial load
  useEffect(() => {
    if (useDefaultAsWarehouse && defaultAddress && !isLoadingSeller) {
      // Convert default address to warehouse address format
      const warehouseData: WarehouseAddressData = {
        firstName: defaultAddress.firstName,
        lastName: defaultAddress.lastName,
        address: defaultAddress.address,
        apartment: defaultAddress.apartment,
        city: defaultAddress.city,
        state: defaultAddress.state,
        zipCode: defaultAddress.zipCode,
        country: defaultAddress.country,
        countryCode: defaultAddress.countryCode,
        country_code_iso: defaultAddress.country_code_iso,
        stateCode: defaultAddress.stateCode,
        company: defaultAddress.company,
      };
      setWarehouseAddress(warehouseData);
    }
  }, [useDefaultAsWarehouse, defaultAddress, isLoadingSeller]);

  // Toggle use default address as warehouse
  const toggleUseDefaultAddress = () => {
    const newValue = !useDefaultAsWarehouse;
    setUseDefaultAsWarehouse(newValue);

    if (!newValue) {
      // If unchecking, clear the warehouse address
      setWarehouseAddress(null);
    }
  };

  const mapAddressDataToAddress = (
    data: AddressData | WarehouseAddressData,
    type: "default" | "warehouse",
  ): any => {
    // Validate that address is from India
    if (data.country && data.country.toLowerCase() !== "india") {
      showErrorMessage(
        "Sellers can only be from India. Please select India as the country.",
      );
      return null;
    }

    // Map to backend schema
    return {
      type: type,
      country: "India", // Force India
      country_code: "+91", // Force India country code
      country_code_iso: "IN", // Force India ISO code
      first_name: data.firstName,
      last_name: data.lastName,
      company: data.company || firmName, // Use company from form or fallback to firm name
      address_line_1: data.address,
      address_line_2: data.apartment || null,
      city: data.city,
      state: data.state,
      zip_code: data.zipCode,
      phone: phoneNumber || "", // Use seller phone number
    };
  };

  // Handle form field change
  const handleInputChange = (field: keyof FormErrors, value: string) => {
    // For GSTIN, convert to uppercase automatically
    const finalValue = field === "gstinNo" ? value.toUpperCase() : value;

    // Update appropriate field
    switch (field) {
      case "firmName":
        setFirmName(finalValue);
        break;
      case "password":
        setPassword(finalValue);
        break;
      case "firmType":
        setFirmType(finalValue);
        break;
      case "gstinNo":
        setGstinNo(finalValue);
        break;
      case "email":
        setEmail(finalValue);
        break;
      case "phoneNumber":
        setPhoneNumber(finalValue);
        break;
    }

    // Validate the field in real-time
    validateField(field, finalValue);
  };

  // Toggle GST registration status
  const handleGstRegistrationToggle = () => {
    const newStatus = !isGstRegistered;
    setIsGstRegistered(newStatus);

    // Clear GSTIN error if turning off GST registration
    if (!newStatus) {
      setErrors({
        ...errors,
        gstinNo: undefined,
      });
    } else if (newStatus && gstinNo) {
      // Validate existing GSTIN if turning on GST registration and there's a value
      validateField("gstinNo", gstinNo);
    }
  };

  // Validate individual field
  const validateField = (field: keyof FormErrors, value: string): boolean => {
    let error: string | undefined = undefined;

    switch (field) {
      case "firmName":
        if (!value.trim()) {
          error = "Firm name is required";
        }
        break;

      case "password":
        if (!isEditMode) {
          // Only validate password in create mode
          if (!value) {
            error = "Password is required";
          } else if (!validatePassword(value)) {
            error = VALIDATION_ERRORS.PASSWORD;
          }
        }
        break;

      case "firmType":
        if (!value) {
          error = "Firm type is required";
        }
        break;

      case "gstinNo":
        if (isGstRegistered) {
          if (!value) {
            error = "GSTIN is required when GST registered";
          } else if (!validateGST(value)) {
            error = VALIDATION_ERRORS.GST;
          }
        }
        break;

      case "email":
        if (!value) {
          error = "Email is required";
        } else if (!validateEmail(value)) {
          error = VALIDATION_ERRORS.EMAIL;
        }
        break;

      case "phoneNumber":
        if (!value) {
          error = "Phone number is required";
        } else if (!validatePhone(value)) {
          error = VALIDATION_ERRORS.PHONE;
        }
        break;
    }

    // Update only this field's error
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));

    return !error; // Return true if valid
  };

  // Validate form before submitting
  const validateForm = (): boolean => {
    // Common validations for both create and edit modes
    const commonValidations = [
      validateField("firmName", firmName),
      validateField("firmType", firmType),
      isGstRegistered ? validateField("gstinNo", gstinNo) : true,
      validateField("email", email),
      validateField("phoneNumber", phoneNumber),
    ];

    // Add password validation only for create mode
    const validations = isEditMode
      ? commonValidations
      : [...commonValidations, validateField("password", password)];

    const isValid = validations.every(Boolean);

    if (!isValid) {
      // Show the first error
      const firstError = Object.values(errors).find((error) => error);
      if (firstError) {
        showErrorMessage(firstError);
      }
    }

    return isValid;
  };

  // Handle approve seller
  const handleApproveSeller = async () => {
    if (!isEditMode || !sellerId) return;

    const result = await showConfirmation(
      "Approve Seller",
      "Are you sure you want to approve this seller?",
    );

    if (result.isConfirmed) {
      setIsApprovingRejecting(true);
      const success = await approveSeller(sellerId);
      setIsApprovingRejecting(false);

      if (success) {
        setSellerStatus("approved");
        await loadSellerData(sellerId);
      }
    }
  };

  // Handle reject seller
  const handleRejectSeller = async () => {
    if (!isEditMode || !sellerId) return;

    const result = await showConfirmation(
      "Reject Seller",
      "Are you sure you want to reject this seller?",
    );

    if (result.isConfirmed) {
      setIsApprovingRejecting(true);
      const success = await rejectSeller(sellerId);
      setIsApprovingRejecting(false);

      if (success) {
        setSellerStatus("rejected");
        await loadSellerData(sellerId);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Check if GST certificate is required and uploaded
    if (isGstRegistered && !gstCertificateUrl) {
      showErrorMessage("GST Certificate is required when GST is registered");
      return;
    }

    // Create seller object matching backend schema
    const sellerData: Partial<SellerRequest> = {
      firm_name: firmName,
      entity_type: firmType,
      country_code: countryCode,
      country_code_iso: countryCodeIso,
      phone: phoneNumber,
      email,
      is_gst_registered: isGstRegistered,
      gstin: isGstRegistered ? gstinNo : null,
      is_marketing_emails: emailConsent,
      is_marketing_sms: smsConsent,
      self_pickup: selfPickup,
      margin,
      tags: selectedTags.map((tag) => tag.id!),
      // Add document URLs
      stamp_url: stampUrl || null,
      signature_url: signatureUrl || null,
      gst_certificate_url: gstCertificateUrl || null,
      agreement_url: agreementUrl || null,
    };

    // Only add addresses for new sellers (create mode)
    if (!isEditMode) {
      sellerData.defaultAddress = defaultAddress
        ? mapAddressDataToAddress(defaultAddress, "default")
        : undefined;
      sellerData.warehouseAddress =
        useDefaultAsWarehouse && defaultAddress
          ? mapAddressDataToAddress(defaultAddress, "warehouse")
          : warehouseAddress
            ? mapAddressDataToAddress(warehouseAddress, "warehouse")
            : undefined;
    }

    // Add password only for new sellers
    if (!isEditMode) {
      sellerData.password = password;
    }

    // Add note if provided (or empty string if not)
    sellerData.note = {
      content: notes.trim() || "",
    };

    let success = false;
    if (isEditMode && sellerId) {
      // Delete old documents if they were replaced
      if (stampFile && stampUrl) {
        // If new stamp was uploaded, delete old one
        const oldStampUrl = (await getSeller(sellerId)).data?.stamp_url;
        if (oldStampUrl && oldStampUrl !== stampUrl) {
          await deleteOldDocument(oldStampUrl);
        }
      }

      if (signatureFile && signatureUrl) {
        const oldSignatureUrl = (await getSeller(sellerId)).data?.signature_url;
        if (oldSignatureUrl && oldSignatureUrl !== signatureUrl) {
          await deleteOldDocument(oldSignatureUrl);
        }
      }

      if (gstCertificateFile && gstCertificateUrl) {
        const oldGstUrl = (await getSeller(sellerId)).data?.gst_certificate_url;
        if (oldGstUrl && oldGstUrl !== gstCertificateUrl) {
          await deleteOldDocument(oldGstUrl);
        }
      }

      if (agreementFile && agreementUrl) {
        const oldAgreementUrl = (await getSeller(sellerId)).data?.agreement_url;
        if (oldAgreementUrl && oldAgreementUrl !== agreementUrl) {
          await deleteOldDocument(oldAgreementUrl);
        }
      }

      // Update existing seller
      success = await updateSeller(sellerId, sellerData);
      if (success) {
        // Assign brands to the seller (suppress message since updateSeller already shows one)
        const brandIds = selectedBrands
          .map((brand) => brand.id!)
          .filter(Boolean);
        if (brandIds.length > 0) {
          await assignMultipleBrandsToSeller(sellerId, brandIds, false);
        }
      }
    } else {
      // Create new seller
      success = await createSeller(sellerData as SellerRequest);
      if (success) {
        // Get the newly created seller ID and assign brands
        // Note: We need to fetch the seller to get the ID, or the backend should return it
        // For now, we'll assume the seller was created and redirect
      }
    }

    if (success) {
      if (isEditMode && sellerId) {
        // Show success message for update
        showSuccessMessage("Seller updated successfully!");
        // Just stay on the page, don't navigate
        // The page will refresh data automatically
      } else {
        // For new sellers, navigate to sellers list
        router.push("/admin/sellers");
      }
    }
  };

  // Generate a random password
  const generatePassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const specialChars = "!@#$%^&*";

    // Ensure at least one character from each required category
    let result = "";
    result += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    result += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));

    // Add one special character for extra security
    result += specialChars.charAt(
      Math.floor(Math.random() * specialChars.length),
    );

    // Fill the rest of the password (total 12 characters)
    const allChars = uppercase + lowercase + numbers + specialChars;
    for (let i = result.length; i < 12; i++) {
      result += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password characters to avoid predictable pattern
    result = result
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");

    setPassword(result);
    validateField("password", result);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Upload file to S3
  const uploadFileToS3 = async (
    file: File,
    documentType: string,
  ): Promise<string> => {
    try {
      const { getAdminPresignedUrls } =
        await import("@/app/lib/services/presignedUrlService");
      const { uploadFileToS3: uploadToS3 } =
        await import("@/app/lib/services/presignedUrlService");

      // Get presigned URL
      const presignedUrls = await getAdminPresignedUrls({
        count: 1,
        keys: [
          {
            key: `sellers/documents/${documentType}`,
            filename: file.name,
          },
        ],
      });

      if (!presignedUrls || presignedUrls.length === 0) {
        throw new Error("Failed to get presigned URL");
      }

      // Upload to S3
      const success = await uploadToS3(presignedUrls[0].url, file);
      if (!success) {
        throw new Error("Upload failed");
      }

      // Return clean URL
      const url = new URL(presignedUrls[0].url);
      return `${url.protocol}//${url.host}${url.pathname}`;
    } catch (error) {
      console.error("File upload error:", error);
      showErrorMessage("Failed to upload file. Please try again.");
      throw error;
    }
  };

  // Delete old document from S3
  const deleteOldDocument = async (documentUrl: string) => {
    try {
      if (!documentUrl) return;

      const { deleteAdminFiles } =
        await import("@/app/lib/services/presignedUrlService");

      // Extract S3 key from URL
      const url = new URL(documentUrl);
      const key = url.pathname.substring(1); // Remove leading slash

      await deleteAdminFiles([key]);
    } catch (error) {
      console.error("Error deleting old document:", error);
      // Don't show error to user, just log it
    }
  };

  // Handle stamp upload
  const handleStampUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(file.type)
    ) {
      showErrorMessage("Please upload an image file (JPG, PNG, GIF)");
      return;
    }

    setStampFile(file);
    setIsUploadingStamp(true);

    try {
      const url = await uploadFileToS3(file, "stamp");
      setStampUrl(url);
    } finally {
      setIsUploadingStamp(false);
    }
  };

  // Handle signature upload
  const handleSignatureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(file.type)
    ) {
      showErrorMessage("Please upload an image file (JPG, PNG, GIF)");
      return;
    }

    setSignatureFile(file);
    setIsUploadingSignature(true);

    try {
      const url = await uploadFileToS3(file, "signature");
      setSignatureUrl(url);
    } finally {
      setIsUploadingSignature(false);
    }
  };

  // Handle GST certificate upload
  const handleGstCertificateUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showErrorMessage("Please upload a PDF file");
      return;
    }

    setGstCertificateFile(file);
    setIsUploadingGstCertificate(true);

    try {
      const url = await uploadFileToS3(file, "gst_certificate");
      setGstCertificateUrl(url);
    } finally {
      setIsUploadingGstCertificate(false);
    }
  };

  // Handle agreement upload
  const handleAgreementUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showErrorMessage("Please upload a PDF file");
      return;
    }

    setAgreementFile(file);
    setIsUploadingAgreement(true);

    try {
      const url = await uploadFileToS3(file, "agreement");
      setAgreementUrl(url);
    } finally {
      setIsUploadingAgreement(false);
    }
  };

  if (isLoadingSeller) {
    return <div className="text-center py-10">Loading seller details...</div>;
  }

  return (
    <div className="bg-gray-bg rounded-lg p-5">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/sellers" className="flex items-center text-black">
          <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
          <span className="title-2-semibold">
            {isEditMode ? "Edit Seller" : "New Seller"}
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {/* Show approval actions only in edit mode for pending sellers */}
          {isEditMode && sellerStatus === "pending" && (
            <>
              <button
                onClick={handleApproveSeller}
                disabled={isApprovingRejecting}
                className="px-4 py-2 bg-green-600 text-white rounded-md small-semibold hover:bg-green-700 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={handleRejectSeller}
                disabled={isApprovingRejecting}
                className="px-4 py-2 bg-red-600 text-white rounded-md small-semibold hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
            </>
          )}
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary text-white rounded-md small-semibold"
          >
            {isEditMode ? "Update Seller" : "Save Seller"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Form Column */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSubmit}>
            {/* Seller Detail */}
            <div className="top">
              <div
                className="bg-white rounded-lg shadow-sm custom-border-1 p-6"
                style={{
                  borderBottom: "none",
                  borderBottomLeftRadius: "0px",
                  borderBottomRightRadius: "0px",
                }}
              >
                <h3 className="text-black title-4-semibold mb-4">
                  Seller Detail
                </h3>

                <div className="mb-6">
                  <label className="block text-gray-50 body mb-1">
                    Firm Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full custom-border-3 p-3 rounded-md focus:outline-none ${errors.firmName ? "border-red-500" : ""
                      }`}
                    value={firmName}
                    onChange={(e) =>
                      handleInputChange("firmName", e.target.value)
                    }
                    required
                  />
                  {errors.firmName && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.firmName}
                    </p>
                  )}
                </div>

                {/* Show password field only for new sellers */}
                {!isEditMode && (
                  <div className="mb-6">
                    <label className="block text-gray-50 body mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`w-full custom-border-3 p-3 pr-20 rounded-md focus:outline-none ${errors.password ? "border-red-500" : ""
                          }`}
                        value={password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        required
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <FontAwesomeIcon
                            icon={showPassword ? faEyeSlash : faEye}
                            className="h-4 w-4"
                          />
                        </button>
                        <button
                          type="button"
                          onClick={generatePassword}
                          className="text-gray-500 hover:text-gray-700"
                          title="Generate new password"
                        >
                          <FontAwesomeIcon
                            icon={faRotate}
                            className="h-4 w-4"
                          />
                        </button>
                      </div>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.password}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-amber-600">
                      This is a temporary password. The seller will need to
                      change it upon first login.
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-gray-50 body mb-1">
                    Firm Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className={`w-full p-3 custom-border-3 rounded-md appearance-none focus:outline-none ${errors.firmType ? "border-red-500" : ""
                        }`}
                      value={firmType}
                      onChange={(e) =>
                        handleInputChange("firmType", e.target.value)
                      }
                      required
                    >
                      <option value="">Select Firm Type</option>
                      <option value="Proprietor">Proprietor</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Limited Liability Partnership">
                        Limited Liability Partnership
                      </option>
                      <option value="One Person Company">
                        One Person Company
                      </option>
                      <option value="Private Limited Company">
                        Private Limited Company
                      </option>
                      <option value="Public Limited Company">
                        Public Limited Company
                      </option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className="text-gray-500"
                      />
                    </div>
                  </div>
                  {errors.firmType && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.firmType}
                    </p>
                  )}
                </div>

                <div className="flex items-start mb-2">
                  <input
                    type="checkbox"
                    id="gst-registered"
                    checked={isGstRegistered}
                    onChange={handleGstRegistrationToggle}
                    className="h-4 w-4 mt-1 rounded border-gray-300 text-primary"
                  />
                  <label
                    htmlFor="gst-registered"
                    className="ml-2 text-gray-700 small"
                  >
                    GST Registered
                  </label>
                </div>
                {isGstRegistered && (
                  <>
                    <label className="block text-gray-50 body mb-1">
                      GSTIN No <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full p-3 custom-border-3 rounded-md focus:outline-none ${errors.gstinNo ? "border-red-500" : ""
                        }`}
                      placeholder="Enter GSTIN Number"
                      value={gstinNo}
                      onChange={(e) =>
                        handleInputChange("gstinNo", e.target.value)
                      }
                      style={{ textTransform: "uppercase" }}
                    />
                    {errors.gstinNo && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.gstinNo}
                      </p>
                    )}
                  </>
                )}

                <div className="mb-6">
                  <label className="block text-gray-50 body mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    className={`w-full p-3 custom-border-3 rounded-md focus:outline-none ${errors.email ? "border-red-500" : ""
                      }`}
                    value={email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-gray-50 body mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <CountryCodeSelector
                      value={countryCode}
                      countryCode={countryCodeIso}
                      onChange={(dial, iso) => {
                        setCountryCode(dial);
                        setCountryCodeIso(iso);
                      }}
                      defaultCountry="IN"
                      allowedCountries={["IN"]}
                    />
                    <input
                      type="tel"
                      className={`flex-1 p-3 custom-border-3 rounded-md focus:outline-none ${errors.phoneNumber ? "border-red-500" : ""
                        }`}
                      value={phoneNumber}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="email-consent"
                      checked={emailConsent}
                      onChange={() => setEmailConsent(!emailConsent)}
                      className="h-4 w-4 mt-1 rounded border-gray-300 text-primary"
                    />
                    <label
                      htmlFor="email-consent"
                      className="ml-2 text-gray-700 small"
                    >
                      Customer agreed to receive marketing emails.
                    </label>
                  </div>
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="sms-consent"
                      checked={smsConsent}
                      onChange={() => setSmsConsent(!smsConsent)}
                      className="h-4 w-4 mt-1 rounded border-gray-300 text-primary"
                    />
                    <label
                      htmlFor="sms-consent"
                      className="ml-2 text-gray-700 small"
                    >
                      Customer agreed to receive marketing sms and text
                      messages.
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-gray-70 p-4 rounded-b-[10px]">
                <p className="text-gray-60 small">
                  You should ask your customers for permission before you
                  subscribe them to your marketing emails or sms.
                </p>
              </div>
            </div>

            {/* Default Shop Address */}
            <div className="bg-white rounded-lg shadow-sm custom-border-1 p-6 mt-5">
              <h3 className="text-black title-4-semibold mb-2">
                Default shop Address
              </h3>
              <p className="text-gray-10 small mb-4">
                The primary address of this Seller.
              </p>

              {defaultAddress ? (
                <div className="p-4 border rounded-md">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">
                      {defaultAddress.firstName} {defaultAddress.lastName}
                    </h4>
                    <div className="flex gap-2">
                      {!isEditMode && (
                        <button
                          type="button"
                          onClick={() => handleAddAddress("default")}
                          className="text-primary text-sm"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress("default")}
                        className="text-red-600 text-sm hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700">{defaultAddress.address}</p>
                  {defaultAddress.apartment && (
                    <p className="text-gray-700">{defaultAddress.apartment}</p>
                  )}
                  <p className="text-gray-700">
                    {defaultAddress.city}, {defaultAddress.state}{" "}
                    {defaultAddress.zipCode}
                  </p>
                  <p className="text-gray-700">{defaultAddress.country}</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAddAddress("default")}
                  className="flex items-center justify-between w-full p-3 custom-border-3 rounded-md  transition-colors"
                >
                  <div className="flex items-center">
                    <div className="h-5 w-5 flex border-2 items-center justify-center rounded-full border-gray-500 mr-2">
                      <FontAwesomeIcon
                        icon={faPlus}
                        className="text-gray-500"
                        size="xs"
                      />
                    </div>
                    <span className="text-gray-700 small">Add Address</span>
                  </div>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className="text-gray-500"
                  />
                </button>
              )}
            </div>

            {/* Warehouse Address */}
            <div className="bg-white rounded-lg shadow-sm custom-border-1 p-6 mt-5">
              <h3 className="text-black title-4-semibold mb-2">
                Warehouse Address
              </h3>
              <p className="text-gray-10 small mb-4">
                The warehouse address of this Seller.
              </p>

              {/* Use default address checkbox */}
              <div className="flex items-start mb-4">
                <input
                  type="checkbox"
                  id="use-default-address"
                  checked={useDefaultAsWarehouse}
                  onChange={toggleUseDefaultAddress}
                  disabled={!defaultAddress || isEditMode}
                  className="h-4 w-4 mt-1 rounded border-gray-300 text-primary"
                />
                <label
                  htmlFor="use-default-address"
                  className="ml-2 text-gray-700 small"
                >
                  Use default address as warehouse address
                </label>
              </div>

              {useDefaultAsWarehouse ? (
                defaultAddress ? (
                  <div className="p-4 border rounded-md ">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">
                        Warehouse (Same as Default)
                      </h4>
                    </div>
                    <p className="text-gray-700">{defaultAddress.address}</p>
                    {defaultAddress.apartment && (
                      <p className="text-gray-700">
                        {defaultAddress.apartment}
                      </p>
                    )}
                    <p className="text-gray-700">
                      {defaultAddress.city}, {defaultAddress.state}{" "}
                      {defaultAddress.zipCode}
                    </p>
                    <p className="text-gray-700">{defaultAddress.country}</p>
                  </div>
                ) : (
                  <p className="text-amber-600 small">
                    Please add a default address first.
                  </p>
                )
              ) : warehouseAddress ? (
                <div className="p-4 border rounded-md">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">Warehouse</h4>
                    <div className="flex gap-2">
                      {!isEditMode && (
                        <button
                          type="button"
                          onClick={() => handleAddAddress("warehouse")}
                          className="text-primary text-sm"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress("warehouse")}
                        className="text-red-600 text-sm hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700">{warehouseAddress.address}</p>
                  {warehouseAddress.apartment && (
                    <p className="text-gray-700">
                      {warehouseAddress.apartment}
                    </p>
                  )}
                  <p className="text-gray-700">
                    {warehouseAddress.city}, {warehouseAddress.state}{" "}
                    {warehouseAddress.zipCode}
                  </p>
                  <p className="text-gray-700">{warehouseAddress.country}</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAddAddress("warehouse")}
                  className="flex items-center justify-between w-full p-3 custom-border-3 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={useDefaultAsWarehouse}
                >
                  <div className="flex items-center">
                    <div className="h-5 w-5 flex border-2 items-center justify-center rounded-full border-gray-500 mr-2">
                      <FontAwesomeIcon
                        icon={faPlus}
                        className="text-gray-500"
                        size="xs"
                      />
                    </div>
                    <span className="text-gray-700 small">Add Address</span>
                  </div>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className="text-gray-500"
                  />
                </button>
              )}
            </div>

            {/* Bank Details Section - Only show in edit mode */}
            {isEditMode && sellerId ? (
              <div className="mt-5">
                <BankDetailsSection sellerId={sellerId} />
              </div>
            ) : (
              <div className="mt-5 bg-white rounded-lg shadow-sm custom-border-1 p-6">
                <h3 className="text-black title-4-semibold mb-2">
                  Bank Details
                </h3>
                <p className="text-gray-10 small">
                  Bank details can be added after creating the seller.
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1 space-y-6">
          {/* Document Uploads */}
          <div className="bg-white rounded-lg shadow-sm custom-border-1 p-6">
            <h3 className="text-black title-4-semibold mb-4">Documents</h3>

            {/* Stamp Upload */}
            <div className="mb-6">
              <label className="block text-gray-50 body mb-3">
                Upload Stamp
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleStampUpload}
                disabled={isUploadingStamp}
                className="hidden"
                id="stamp-upload"
              />
              {stampUrl ? (
                <div className="flex items-center gap-3 p-3 rounded-md border border-gray-200">
                  <img
                    src={stampUrl}
                    alt="Stamp preview"
                    className="h-16 w-16 object-cover rounded border border-gray-300"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-green-600 font-medium">
                      ✓ Uploaded
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setViewingDocument({ type: "Stamp", url: stampUrl })
                      }
                      className="text-primary hover:text-primary-dark"
                      title="View document"
                    >
                      <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteOldDocument(stampUrl);
                        setStampUrl("");
                        setStampFile(null);
                      }}
                      className="text-red-600 hover:text-red-800"
                      title="Delete document"
                    >
                      <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="stamp-upload"
                  className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 cursor-pointer transition-colors"
                >
                  <div className="text-center">
                    {isUploadingStamp ? (
                      <p className="text-sm text-gray-600">Uploading...</p>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-600">Click to upload</p>
                        <p className="text-xs text-gray-500">JPG, PNG, GIF</p>
                      </div>
                    )}
                  </div>
                </label>
              )}
            </div>

            {/* Signature Upload */}
            <div className="mb-6">
              <label className="block text-gray-50 body mb-3">
                Upload Signature
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleSignatureUpload}
                disabled={isUploadingSignature}
                className="hidden"
                id="signature-upload"
              />
              {signatureUrl ? (
                <div className="flex items-center gap-3 p-3 rounded-md border border-gray-200">
                  <img
                    src={signatureUrl}
                    alt="Signature preview"
                    className="h-16 w-16 object-cover rounded border border-gray-300"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-green-600 font-medium">
                      ✓ Uploaded
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setViewingDocument({
                          type: "Signature",
                          url: signatureUrl,
                        })
                      }
                      className="text-primary hover:text-primary-dark"
                      title="View document"
                    >
                      <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteOldDocument(signatureUrl);
                        setSignatureUrl("");
                        setSignatureFile(null);
                      }}
                      className="text-red-600 hover:text-red-800"
                      title="Delete document"
                    >
                      <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="signature-upload"
                  className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 cursor-pointer transition-colors"
                >
                  <div className="text-center">
                    {isUploadingSignature ? (
                      <p className="text-sm text-gray-600">Uploading...</p>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-600">Click to upload</p>
                        <p className="text-xs text-gray-500">JPG, PNG, GIF</p>
                      </div>
                    )}
                  </div>
                </label>
              )}
            </div>

            {/* GST Certificate Upload - Only show if GST is registered */}
            {isGstRegistered && (
              <div className="mb-6">
                <label className="block text-gray-50 body mb-3">
                  Upload GST Certificate <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleGstCertificateUpload}
                  disabled={isUploadingGstCertificate}
                  className="hidden"
                  id="gst-certificate-upload"
                />
                {gstCertificateUrl ? (
                  <div className="flex items-center gap-3 p-3 rounded-md border border-gray-200">
                    <div className="h-12 w-12 flex items-center justify-center bg-red-100 rounded border border-red-300">
                      <span className="text-red-600 font-bold text-sm">
                        PDF
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-green-600 font-medium">
                        ✓ Uploaded
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {gstCertificateFile?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setViewingDocument({
                            type: "GST Certificate",
                            url: gstCertificateUrl,
                          })
                        }
                        className="text-primary hover:text-primary-dark"
                        title="View document"
                      >
                        <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteOldDocument(gstCertificateUrl);
                          setGstCertificateUrl("");
                          setGstCertificateFile(null);
                        }}
                        className="text-red-600 hover:text-red-800"
                        title="Delete document"
                      >
                        <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="gst-certificate-upload"
                    className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 cursor-pointer transition-colors"
                  >
                    <div className="text-center">
                      {isUploadingGstCertificate ? (
                        <p className="text-sm text-gray-600">Uploading...</p>
                      ) : (
                        <div>
                          <p className="text-sm text-gray-600">
                            Click to upload
                          </p>
                          <p className="text-xs text-gray-500">PDF only</p>
                        </div>
                      )}
                    </div>
                  </label>
                )}
              </div>
            )}

            {/* Agreement Upload */}
            <div className="mb-4">
              <label className="block text-gray-50 body mb-3">
                Upload Agreement
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleAgreementUpload}
                disabled={isUploadingAgreement}
                className="hidden"
                id="agreement-upload"
              />
              {agreementUrl ? (
                <div className="flex items-center gap-3 p-3 rounded-md border border-gray-200">
                  <div className="h-12 w-12 flex items-center justify-center bg-red-100 rounded border border-red-300">
                    <span className="text-red-600 font-bold text-sm">PDF</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-green-600 font-medium">
                      ✓ Uploaded
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {agreementFile?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setViewingDocument({
                          type: "Agreement",
                          url: agreementUrl,
                        })
                      }
                      className="text-primary hover:text-primary-dark"
                      title="View document"
                    >
                      <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteOldDocument(agreementUrl);
                        setAgreementUrl("");
                        setAgreementFile(null);
                      }}
                      className="text-red-600 hover:text-red-800"
                      title="Delete document"
                    >
                      <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="agreement-upload"
                  className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 cursor-pointer transition-colors"
                >
                  <div className="text-center">
                    {isUploadingAgreement ? (
                      <p className="text-sm text-gray-600">Uploading...</p>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-600">Click to upload</p>
                        <p className="text-xs text-gray-500">PDF only</p>
                      </div>
                    )}
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-sm custom-border-1 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-black title-4-semibold">Notes</h3>
              <button className="text-gray-500">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
            </div>
            <p className="text-gray-10 xsmall mb-2">
              Notes are private wont be shared with customer
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 custom-border-3 rounded-md focus:outline-none h-32"
              placeholder="Add notes about your seller here..."
            ></textarea>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow-sm custom-border-1 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-black title-4-semibold">Tags</h3>
              <button
                type="button"
                onClick={() => setShowTagModal(true)}
                className="text-gray-500"
              >
                <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
              </button>
            </div>

            {/* Selected tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedTags.map((tag) => (
                <div
                  key={tag.id}
                  className="bg-gray-100 text-blue-800 px-2 py-1 rounded-md flex items-center"
                >
                  <span className="text-xs">{tag.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag.id!)}
                    className="ml-1 text-blue-800 hover:text-blue-900"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Tag search input */}
            <div className="relative" ref={tagDropdownRef}>
              <div className="flex items-center w-full custom-border-3 rounded-md overflow-hidden">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="ml-2 text-gray-400"
                />
                <input
                  type="text"
                  value={tagSearchTerm}
                  onChange={(e) => {
                    setTagSearchTerm(e.target.value);
                    if (!showTagDropdown && e.target.value) {
                      setShowTagDropdown(true);
                    }
                  }}
                  onFocus={() => {
                    if (tags.length > 0) setShowTagDropdown(true);
                  }}
                  placeholder="Search tags..."
                  className="w-full ml-2 bg-transparent focus:outline-none"
                />
              </div>

              {/* Tag dropdown */}
              {showTagDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-auto">
                  {isLoadingTags ? (
                    <div className="p-2 text-center text-sm text-gray-500">
                      Loading tags...
                    </div>
                  ) : filteredTags.length > 0 ? (
                    filteredTags.map((tag) => (
                      <div
                        key={tag.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => handleSelectTag(tag)}
                      >
                        {tag.name}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-center text-sm text-gray-500">
                      {tagSearchTerm ? "No matching tags" : "No tags available"}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Brands */}
          <div className="bg-white rounded-lg shadow-sm custom-border-1 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-black title-4-semibold">Brands</h3>
            </div>

            {/* Selected brands */}
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedBrands.map((brand) => (
                <div
                  key={brand.id}
                  className="bg-green-100 text-green-800 px-2 py-1 rounded-md flex items-center"
                >
                  <span className="text-xs">{brand.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBrand(brand.id!)}
                    className="ml-1 text-green-800 hover:text-green-900"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Brand search input */}
            <div className="relative" ref={brandDropdownRef}>
              <div className="flex items-center w-full custom-border-3 rounded-md overflow-hidden">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="ml-2 text-gray-400"
                />
                <input
                  type="text"
                  value={brandSearchTerm}
                  onChange={(e) => {
                    setBrandSearchTerm(e.target.value);
                    if (!showBrandDropdown && e.target.value) {
                      setShowBrandDropdown(true);
                    }
                  }}
                  onFocus={() => {
                    if (brands.length > 0) setShowBrandDropdown(true);
                  }}
                  placeholder="Search brands..."
                  className="w-full ml-2 bg-transparent focus:outline-none"
                />
              </div>

              {/* Brand dropdown */}
              {showBrandDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-auto">
                  {isLoadingBrands ? (
                    <div className="p-2 text-center text-sm text-gray-500">
                      Loading brands...
                    </div>
                  ) : filteredBrands.length > 0 ? (
                    filteredBrands.map((brand) => (
                      <div
                        key={brand.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => handleSelectBrand(brand)}
                      >
                        {brand.name}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-center text-sm text-gray-500">
                      {brandSearchTerm
                        ? "No matching brands"
                        : "No brands available"}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Default Margin */}
          <div className="bg-white rounded-lg shadow-sm custom-border-1 p-6">
            <h3 className="text-black title-4-semibold mb-4">Default Margin</h3>

            <div className="mb-4">
              <label className="block text-gray-50 body mb-2">
                Margin (%){" "}
                <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="flex-1 p-3 custom-border-3 rounded-md focus:outline-none"
                  value={margin}
                  onChange={(e) => setMargin(parseFloat(e.target.value) || 0)}
                  placeholder="Enter margin percentage"
                  min="0"
                  max="100"
                  step="0.01"
                />
                <span className="text-gray-600 font-medium">%</span>
              </div>
            </div>
          </div>

          {/* Self Pickup Settings */}
          <div className="bg-white rounded-lg shadow-sm custom-border-1 p-6">
            <h3 className="text-black title-4-semibold mb-4">Self Pickup</h3>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="self-pickup"
                checked={selfPickup}
                onChange={() => setSelfPickup(!selfPickup)}
                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary focus:ring-2"
              />
              <label
                htmlFor="self-pickup"
                className="ml-3 text-gray-700 small cursor-pointer"
              >
                Enable self pickup for this seller.
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="bg-white rounded-lg shadow-sm custom-border-1 p-6">
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full py-3 bg-primary text-white rounded-md small-semibold"
            >
              {isEditMode ? "Update Seller" : "Create Seller"}
            </button>
          </div>
        </div>
      </div>
      {/* Tag Creation Modal */}
      {showTagModal && (
        <div
          className="fixed left-0 right-0 top-0 h-full w-full bottom-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Create New Tag</h3>
            <form onSubmit={handleAddNewTag}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Tag Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
                  placeholder="Enter tag name"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={newTagDescription}
                  onChange={(e) => setNewTagDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
                  placeholder="Enter tag description (optional)"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowTagModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md"
                >
                  Create Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Address Modal */}
      {showAddressModal && addressType === "default" && (
        <AddressModal
          onClose={handleAddressModalClose}
          onSave={async (addressData: AddressData) => {
            if (isEditMode && sellerId) {
              // Call API to add address
              const addressPayload = mapAddressDataToAddress(
                addressData,
                "default",
              );
              if (addressPayload) {
                const success = await addSellerAddress(
                  sellerId,
                  addressPayload,
                );
                if (success) {
                  setDefaultAddress(addressData);
                  handleAddressModalClose();
                }
              }
            } else {
              // For new sellers, just update local state
              setDefaultAddress(addressData);
              handleAddressModalClose();
            }
          }}
          initialData={defaultAddress || undefined}
          restrictToIndia={true}
        />
      )}

      {/* Warehouse Address Modal */}
      {showAddressModal && addressType === "warehouse" && (
        <WarehouseAddressModal
          onClose={handleAddressModalClose}
          onSave={async (addressData: WarehouseAddressData) => {
            if (isEditMode && sellerId) {
              // Call API to add address
              const addressPayload = mapAddressDataToAddress(
                addressData,
                "warehouse",
              );
              if (addressPayload) {
                const success = await addSellerAddress(
                  sellerId,
                  addressPayload,
                );
                if (success) {
                  setWarehouseAddress(addressData);
                  handleAddressModalClose();
                }
              }
            } else {
              // For new sellers, just update local state
              setWarehouseAddress(addressData);
              handleAddressModalClose();
            }
          }}
          initialData={warehouseAddress || undefined}
          restrictToIndia={true}
        />
      )}

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingDocument(null)}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-black title-3-semibold">
                {viewingDocument.type}
              </h3>
              <button
                onClick={() => setViewingDocument(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              {viewingDocument.url.toLowerCase().endsWith(".pdf") ? (
                // PDF Viewer
                <iframe
                  src={viewingDocument.url}
                  className="w-full h-full min-h-[500px] border border-gray-200 rounded-md"
                  title={viewingDocument.type}
                />
              ) : (
                // Image Viewer
                <div className="flex items-center justify-center">
                  <img
                    src={viewingDocument.url}
                    alt={viewingDocument.type}
                    className="max-w-full max-h-[70vh] object-contain rounded-md"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <a
                href={viewingDocument.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-primary text-white rounded-md small-semibold hover:bg-primary-dark"
              >
                Download
              </a>
              <button
                onClick={() => setViewingDocument(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md small-semibold hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddSellerPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
      <AddSellerContent />
    </Suspense>
  );
}
