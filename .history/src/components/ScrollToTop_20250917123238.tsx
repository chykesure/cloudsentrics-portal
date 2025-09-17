import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Keep a map of scroll positions per pathname
const scrollPositions: Record<string, number> = {};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const container =
      document.getElementById("main-scroll") || document.documentElement;

    // Restore saved scroll position if it exists
    const savedPosition = scrollPositions[pathname];
    if (savedPosition !== undefined) {
      container.scrollTo({ top: savedPosition, behavior: "auto" });
    } else {
      // Otherwise scroll to top
      container.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Save scroll position when navigating away
    return () => {
      if (container) {
        scrollPositions[pathname] = container.scrollTop;
      }
    };
  }, [pathname]);

  return null;
};

export default ScrollToTop;
