import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Always scroll the window
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });

    // Also scroll dashboard/main containers
    const containers = document.querySelectorAll(
      "#main-scroll, #main-content, .scroll-container, [data-scroll-container]"
    );

    containers.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      }
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
