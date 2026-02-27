"use client";

import { Toaster } from "react-hot-toast";

const ToasterProvider = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#0a0a0f",
          color: "#fff",
          borderRadius: "0px",
          border: "1px solid rgba(0, 255, 255, 0.4)",
          fontFamily: "monospace",
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          boxShadow: "0 0 20px rgba(0, 0, 0, 0.8), 0 0 10px rgba(0, 255, 255, 0.1)",
        },
        success: {
          style: {
            borderColor: "rgba(34, 197, 94, 0.5)",
          },
          iconTheme: {
            primary: "#22c55e",
            secondary: "#0a0a0f",
          },
        },
        error: {
          style: {
            borderColor: "rgba(239, 68, 68, 0.5)",
          },
          iconTheme: {
            primary: "#ef4444",
            secondary: "#0a0a0f",
          },
        },
      }}
    />
  );
};

export default ToasterProvider;
