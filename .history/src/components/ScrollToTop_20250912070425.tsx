import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // small delay so it runs after render
    setTimeout(() => {
      // Scroll the whole window
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth", // change to "instant" if you don’t want animation
      });

      // Also scroll any scrollable containers if present
      const containers = document.querySelectorAll(
        "[data-scroll-container], #main-content, .scroll-container"
      );
      containers.forEach((el) => {
        (el as HTMLElement).scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      });
    }, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
