"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faChevronDown,
  faPlus,
  faChevronRight,
  faEye,
  faEyeSlash,
  faRotate,
  faSearch,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import AddressModal, {
  AddressData,
} from "../../../../components/common/AddressModal";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createCustomer,
  updateCustomer,
  getCustomer,
  Customer,
  CustomerAddress,
} from "@/app/lib/services/admin/customerService";
import CountryCodeSelector from "@/app/components/common/CountryCodeSelector";
import {
  validateEmail,
  validatePhone,
  validatePassword,
  VALIDATION_ERRORS,
} from "@/app/lib/utils/validations";
import { showErrorMessage } from "@/app/lib/swalConfig";
import { getAllTags, createTag } from "@/app/lib/services/admin";
import type { Tag } from "@/app/lib/services/admin/tagService";
import { Country } from "country-state-city";

// Form validation errors interface
interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
}

function AddCustomerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("id");
  const isEditMode = !!customerId;

  const { setTitle } = usePageTitle();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [emailConsent, setEmailConsent] = useState(false);
  const [smsConsent, setSmsConsent] = useState(false);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(isEditMode);

  // Customer form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [language, setLanguage] = useState("English (Default)");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [countryCodeIso, setCountryCodeIso] = useState("IN");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [address, setAddress] = useState<CustomerAddress | null>(null);

  // Tags management
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState("");

  // Tag creation modal
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagDescription, setNewTagDescription] = useState("");

  // Ref for tag dropdown to handle click outside
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitle(isEditMode ? "Edit Customer" : "New Customer");

    // Load tags on mount
    loadTags();

    // If in edit mode, load customer data
    if (isEditMode && customerId) {
      loadCustomerData(customerId);
    } else {
      // Auto-generate password only for new customers
      generatePassword();
    }

    // Add event listener for clicks outside the tag dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tagDropdownRef.current &&
        !tagDropdownRef.current.contains(event.target as Node)
      ) {
        setShowTagDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setTitle, isEditMode, customerId]);

  // Load customer data for edit mode
  const loadCustomerData = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await getCustomer(id);
      if (data) {
        // Populate form fields with customer data
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setEmail(data.email || "");
        setCountryCode(data.country_code || "+91");
        setCountryCodeIso(data.country_code_iso || "IN");
        setPhone(data.phone || "");
        setGender(data.gender || "");
        setEmailConsent(!!data.is_marketing_emails);
        setSmsConsent(!!data.is_marketing_sms);

        // Don't set password for existing users
        setPassword("");

        // Set address if available
        if (data.UserAddresses && data.UserAddresses.length > 0) {
          setAddress(data.UserAddresses[0]);
        } else if (data.addresses && data.addresses.length > 0) {
          setAddress(data.addresses[0]);
        }

        // Set language
        if (data.language) {
          setLanguage(data.language);
        }

        // Set notes if available
        if (data.notes && data.notes.length > 0) {
          setNotes(data.notes[0].content || "");
        }

        // Load tags if available
        if (data.tags && data.tags.length > 0 && tags.length > 0) {
          const customerTags = tags.filter((tag) =>
            data.tags?.includes(tag.id || "")
          );
          setSelectedTags(customerTags);
        }
      }
    } catch (error) {
      console.error("Failed to load customer data:", error);
      showErrorMessage(
        "Failed to load customer data. Redirecting to customers list."
      );
      router.push("/admin/customers");
    } finally {
      setIsLoading(false);
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
      !selectedTags.some((selectedTag) => selectedTag.id === tag.id)
  );

  const handleAddAddress = () => {
    setShowAddressModal(true);
  };

  const handleAddressModalClose = () => {
    setShowAddressModal(false);
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
      Math.floor(Math.random() * specialChars.length)
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

  // Handle form field change
  const handleInputChange = (field: keyof FormErrors, value: string) => {
    // Update appropriate field
    switch (field) {
      case "firstName":
        setFirstName(value);
        break;
      case "lastName":
        setLastName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "phone":
        setPhone(value);
        break;
    }

    // Validate the field in real-time
    validateField(field, value);
  };

  // Validate individual field
  const validateField = (field: keyof FormErrors, value: string): boolean => {
    let error: string | undefined = undefined;

    switch (field) {
      case "firstName":
        if (!value.trim()) {
          error = "First name is required";
        }
        break;

      case "lastName":
        if (!value.trim()) {
          error = "Last name is required";
        }
        break;

      case "email":
        if (!value) {
          error = "Email is required";
        } else if (!validateEmail(value)) {
          error = VALIDATION_ERRORS.EMAIL;
        }
        break;

      case "password":
        // Only validate password for new customers, not for editing
        if (!isEditMode) {
          if (!value) {
            error = "Password is required";
          } else if (!validatePassword(value)) {
            error = VALIDATION_ERRORS.PASSWORD;
          }
        }
        break;

      case "phone":
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
    // Validate all fields
    const fieldsToValidate = [
      validateField("firstName", firstName),
      validateField("lastName", lastName),
      validateField("email", email),
      validateField("phone", phone),
    ];

    // Only validate password for new customers
    if (!isEditMode) {
      fieldsToValidate.push(validateField("password", password));
    }

    const isValid = fieldsToValidate.every(Boolean);

    if (!isValid) {
      // Show the first error
      const firstError = Object.values(errors).find((error) => error);
      if (firstError) {
        showErrorMessage(firstError);
      }
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Get country information from the address country
    let userCountryCodeIso = "AU"; // Default to Australia for user
    let addressCountryCode = "+61"; // Default phone code for Australia
    let addressCountryCodeIso = "AU"; // Default ISO code for Australia

    if (address?.country) {
      const allCountries = Country.getAllCountries();
      const selectedCountry = allCountries.find(
        (c) => c.name === address.country
      );
      if (selectedCountry) {
        userCountryCodeIso = selectedCountry.isoCode;
        const cleanedPhonecode = selectedCountry.phonecode.replace(/^\+/, '');
        addressCountryCode = `+${cleanedPhonecode}`;
        addressCountryCodeIso = selectedCountry.isoCode;
      }
    }

    // Prepare addresses with required country code fields
    let addressesToSend = undefined;
    if (address) {
      // Ensure address has required country code fields
      const addressWithCountryCodes = {
        ...address,
        country_code: address.country_code || addressCountryCode,
        country_code_iso: address.country_code_iso || addressCountryCodeIso,
      };
      addressesToSend = [addressWithCountryCodes];
    }

    // Base customer data (common fields for create and update)
    const customerData: Partial<Customer> = {
      first_name: firstName,
      last_name: lastName,
      language: language,
      email: email,
      country_code: countryCode,
      country_code_iso: countryCodeIso,
      phone: phone,
      gender: gender || undefined,
      is_marketing_emails: emailConsent,
      is_marketing_sms: smsConsent,
      country: address?.country || "Australia",
      addresses: addressesToSend,
      tag_ids: selectedTags.map((tag) => tag.id!),
    };

    // Add password only for new customers
    if (!isEditMode) {
      customerData.password = password;

      // Add note if provided (send in backend expected format) - only for new customers
      if (notes.trim()) {
        customerData.note = {
          content: notes.trim(),
        };
      }
    }

    let success = false;
    if (isEditMode && customerId) {
      // Update existing customer
      success = await updateCustomer(customerId, customerData);

      // If customer update was successful and notes were provided, save notes separately
      if (success && notes.trim()) {
        try {
          console.log('Attempting to save note for customer:', customerId);
          const { createNote } = await import("@/app/lib/services/admin/noteService");
          const noteCreated = await createNote({
            note_type: "customer",
            reference_id: customerId,
            content: notes.trim(),
          });

          console.log('Note creation result:', noteCreated);

          if (!noteCreated) {
            console.warn("Note was not created but customer was updated");
          }
        } catch (error) {
          console.error("Error saving note:", error);
          showErrorMessage("Customer updated but note could not be saved. Please try adding the note from the customer details page.");
        }
      }

      // Redirect to customer detail page to show updated info and notes
      if (success) {
        router.push(`/admin/customers/${customerId}`);
      }
    } else {
      // Create new customer
      success = await createCustomer(customerData as Customer);

      if (success) {
        router.push("/admin/customers");
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading customer details...</div>;
  }

  return (
    <div className="bg-gray-bg rounded-lg p-5">
      {/* Header with back button */}
      <div className="flex items-center mb-4">
        <Link href="/admin/customers" className="flex items-center text-black">
          <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
          <span className="display-4-bold">
            {isEditMode ? "Edit Customer" : "New Customer"}
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Form Column */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSubmit}>
            {/* Customer Interview */}
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
                  Customer Interview
                </h3>

                <div className="grid grid-cols-2 gap-6 mb-3">
                  <div>
                    <label className="block text-gray-50 body mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full custom-border-3 rounded-md focus:outline-none ${errors.firstName ? "border-red-500" : ""
                        }`}
                      value={firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      required
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-50 body mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full custom-border-3 rounded-md focus:outline-none ${errors.lastName ? "border-red-500" : ""
                        }`}
                      value={lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      required
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-gray-50 body mb-1">
                    Language
                  </label>
                  <div className="relative">
                    <select
                      className="w-full custom-border-3 rounded-md appearance-none focus:outline-none pr-10"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option>English (Default)</option>
                      <option>Hindi</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className="text-gray-500"
                      />
                    </div>
                  </div>
                  <p className="text-gray-10 xsmall mt-1">
                    This Customer will receive notification in this language.
                  </p>
                </div>

                <div className="mb-3">
                  <label className="block text-gray-50 body mb-1">Gender</label>
                  <div className="relative">
                    <select
                      className="w-full custom-border-3 rounded-md appearance-none focus:outline-none pr-10"
                      value={gender}
                      onChange={(e) =>
                        setGender(
                          e.target.value as "male" | "female" | "other" | ""
                        )
                      }
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className="text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-gray-50 body mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    className={`w-full custom-border-3 rounded-md focus:outline-none ${errors.email ? "border-red-500" : ""
                      }`}
                    value={email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Show password field only for new customers */}
                {!isEditMode && (
                  <div className="mb-3">
                    <label className="block text-gray-50 body mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`w-full custom-border-3 rounded-md focus:outline-none pr-20 ${errors.password ? "border-red-500" : ""
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
                        >
                          <FontAwesomeIcon
                            icon={faRotate}
                            className="h-4 w-4"
                          />
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.password}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <label className="block text-gray-50 body mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <CountryCodeSelector
                      value={countryCode}
                      countryCode={countryCodeIso}
                      onChange={(dialCode, isoCode) => {
                        setCountryCode(dialCode);
                        setCountryCodeIso(isoCode);
                      }}
                      defaultCountry="IN"
                      className="w-24"
                    />
                    <input
                      type="tel"
                      className={`flex-1 custom-border-3 rounded-md focus:outline-none ${errors.phone ? "border-red-500" : ""
                        }`}
                      value={phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      required
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-start justify-stretch">
                    <input
                      type="checkbox"
                      id="email-consent"
                      checked={emailConsent}
                      onChange={() => setEmailConsent(!emailConsent)}
                      className="h-4 w-4 rounded border-gray-300 text-primary"
                    />
                    <label
                      htmlFor="email-consent"
                      className="ml-2 text-gray-700 small"
                    >
                      Customer agreed to receive marketing emails.
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sms-consent"
                      checked={smsConsent}
                      onChange={() => setSmsConsent(!smsConsent)}
                      className="h-4 w-4 rounded border-gray-300 text-primary"
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

            {/* Default Address */}
            <div className="mt-5 bg-white rounded-lg shadow-sm custom-border-1 p-6">
              <h3 className="text-black title-4-semibold">Default Address</h3>
              <p className="text-gray-10 small mb-4">
                The primary address of this customer.
              </p>

              {address ? (
                <div className="p-4 border rounded-md">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">
                      {address.first_name} {address.last_name}
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddAddress}
                      className="text-primary text-sm"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-gray-700">{address.address_line_1}</p>
                  {address.address_line_2 && (
                    <p className="text-gray-700">{address.address_line_2}</p>
                  )}
                  <p className="text-gray-700">
                    {address.city}, {address.state} {address.zip_code}
                  </p>
                  <p className="text-gray-700">{address.country}</p>
                  {address.company && (
                    <p className="text-gray-700">{address.company}</p>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAddAddress}
                  className="flex items-center justify-between w-full custom-border-3 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="h-5 w-5 flex border-2 items-center justify-center rounded-full border-gray-500 mr-2">
                      <FontAwesomeIcon
                        icon={faPlus}
                        className="text-gray-500"
                        size="xs"
                      />
                    </div>
                    <span className="text-black small">Add Address</span>
                  </div>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className="text-gray-500"
                  />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1 space-y-6">
          {/* Notes */}
          <div className="bg-white rounded-lg shadow-sm custom-border-1 p-6">
            <div className="flex justify-between items-center">
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
              className="w-full custom-border-3 rounded-md focus:outline-none h-32"
              placeholder="Add notes about your customer here..."
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
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center"
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

          {/* Save Button */}
          <div className="bg-white rounded-lg shadow-sm custom-border-1 p-6">
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full py-3 bg-primary text-white rounded-md small-semibold"
            >
              {isEditMode ? "Update Customer" : "Add Customer"}
            </button>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <AddressModal
          onClose={handleAddressModalClose}
          initialData={
            address
              ? {
                firstName: address.first_name,
                lastName: address.last_name,
                address: address.address_line_1,
                apartment: address.address_line_2 || "",
                city: address.city,
                state: address.state,
                zipCode: address.zip_code,
                country: address.country,
                company: address.company || "",
                countryCode: address.country_code || "",
                country_code_iso: address.country_code_iso || "",
              }
              : undefined
          }
          onSave={(addressData: AddressData) => {
            // Convert AddressData to CustomerAddress
            const customerAddress: CustomerAddress = {
              first_name: addressData.firstName || firstName,
              last_name: addressData.lastName || lastName,
              address_line_1: addressData.address,
              address_line_2: addressData.apartment,
              city: addressData.city,
              state: addressData.state,
              zip_code: addressData.zipCode,
              country: addressData.country,
              company: addressData.company,
              country_code: addressData.countryCode,
              country_code_iso: addressData.country_code_iso,
            };
            setAddress(customerAddress);
            handleAddressModalClose();
          }}
        />
      )}

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
    </div>
  );
}

export default function AddCustomerPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
      <AddCustomerContent />
    </Suspense>
  );
}
