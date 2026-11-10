"use client";
import { useEffect } from "react";
import { GOOGLE_FONTS_HREF } from "@/lib/editor";

/** Loads the Google Fonts used by card designs (once per page). */
export function useDesignFonts() {
  useEffect(() => {
    if (document.querySelector("link[data-design-fonts]")) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = GOOGLE_FONTS_HREF;
    link.dataset.designFonts = "true";
    document.head.appendChild(link);
  }, []);
}
