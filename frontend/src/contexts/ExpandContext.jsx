import React, { createContext, useContext, useState, useEffect } from "react";

const ExpandContext = createContext();

export const ExpandProvider = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  // Scroll to top when expanding (instant, no animation)
  useEffect(() => {
    if (isExpanded) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [isExpanded]);

  return (
    <ExpandContext.Provider value={{ isExpanded, toggleExpand }}>
      {children}
    </ExpandContext.Provider>
  );
};

export const useExpand = () => {
  const context = useContext(ExpandContext);
  if (!context) {
    throw new Error("useExpand must be used within an ExpandProvider");
  }
  return context;
};

