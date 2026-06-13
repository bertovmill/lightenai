"use client";

import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

const CAL_LINK = "bertovmill/intro-call";
const CAL_NS = "intro-call-contact";

export function CalendlyWidget() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: CAL_NS });
      cal("ui", {
        theme: "light",
        hideEventTypeDetails: true,
        layout: "month_view",
        cssVarsPerTheme: {
          light: { "cal-brand": "#5F9468" },
          dark: { "cal-brand": "#5F9468" },
        },
      });
    })();
  }, []);

  return (
    <Cal
      namespace={CAL_NS}
      calLink={CAL_LINK}
      style={{ width: "100%", height: "100%", minHeight: "400px", overflow: "hidden" }}
      config={{ layout: "month_view", theme: "light" }}
    />
  );
}
