import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export const useUnsavedChanges = (hasChanges) => {
  const hasChangesRef = useRef(hasChanges);
  const router = useRouter();

  useEffect(() => {
    hasChangesRef.current = hasChanges;
  }, [hasChanges]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChangesRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    const handleLinkClick = (e) => {
      if (!hasChangesRef.current) return;

      const target = e.target.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      e.preventDefault();

      Swal.fire({
        title: 'Unsaved Changes',
        text: 'You have unsaved changes. Do you want to discard them?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Discard Changes',
        cancelButtonText: 'Keep Editing',
        allowOutsideClick: false,
        allowEscapeKey: false,
      }).then((result) => {
        if (result.isConfirmed) {
          if (href.startsWith('/')) {
            router.push(href);
          } else {
            window.location.href = href;
          }
        }
      });
    };

    document.addEventListener('click', handleLinkClick, true);
    return () => document.removeEventListener('click', handleLinkClick, true);
  }, [router]);

  const confirmNavigation = async (callback) => {
    if (!hasChangesRef.current) {
      callback();
      return;
    }

    const result = await Swal.fire({
      title: 'Unsaved Changes',
      text: 'You have unsaved changes. Do you want to discard them?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Discard Changes',
      cancelButtonText: 'Keep Editing',
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    if (result.isConfirmed) {
      callback();
    }
  };

  return { confirmNavigation };
};
