import Swal from "sweetalert2";

// Success message notification (now shows as toast)
export const showSuccessMessage = (message: string) => {
  return Swal.fire({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 6000,
    timerProgressBar: false,
    icon: "success",
    title: message,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
};

// Error message notification with HTML support
export const showErrorMessage = (message: string) => {
  return Swal.fire({
    icon: "error",
    title: "Error",
    html: message,
    showConfirmButton: true,
    confirmButtonText: "OK",
    confirmButtonColor: "#d33",
    position: "center",
    allowOutsideClick: false,
  });
};

// Toast notification (top-right positioned)
export const showToast = (
  message: string,
  type: "success" | "error" | "warning" | "info" = "info"
) => {
  return Swal.fire({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    icon: type,
    title: message,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
};

// Success toast
export const showSuccessToast = (message: string) => {
  return showToast(message, "success");
};

// Error toast
export const showErrorToast = (message: string) => {
  return showToast(message, "error");
};

// Warning toast
export const showWarningToast = (message: string) => {
  return showToast(message, "warning");
};

// Info toast
export const showInfoToast = (message: string) => {
  return showToast(message, "info");
};

// Confirmation dialog
export const showConfirmation = (
  title: string = "Are you sure?",
  text: string = "This action cannot be undone."
) => {
  return Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Yes, proceed",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    reverseButtons: true,
    focusCancel: true,
  });
};

// Loading state (now shows as toast)
export const showLoading = (message: string = "Loading...") => {
  return Swal.fire({
    toast: true,
    position: "top-end",
    title: message,
    allowOutsideClick: false,
    showConfirmButton: false,
    timer: 60000,
    timerProgressBar: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

// Close loading
export const closeLoading = () => {
  Swal.close();
};

// Add a global style element for SweetAlert2 custom styling
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    .swal-success-popup {
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2) !important;
      border-radius: 8px !important;
    }
    .swal-error-popup {
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2) !important;
      border-radius: 8px !important;
    }
    .swal2-toast .swal2-title {
      color: #333 !important;
      font-size: 14px !important;
      font-weight: 600 !important;
    }
    .swal2-toast {
      border-radius: 8px !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    }
  `;
  document.head.appendChild(style);
}
