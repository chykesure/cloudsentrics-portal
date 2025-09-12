// src/components/ScrollToTop.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // small delay so it runs after page render
    setTimeout(() => {
      // Try window scroll first
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });

      // Also reset any main scrollable containers
      const containers = document.querySelectorAll(
        "[data-scroll-container], #main-content, .scroll-container"
      );
      containers.forEach((el) => {
        (el as HTMLElement).scrollTo({ top: 0, left: 0, behavior: "instant" });
      });
    }, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
