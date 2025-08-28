// src/components/QrCodeDisplay.js
"use client";

import QRCode from "react-qr-code";

const QrCodeDisplay = ({ url }) => {
  if (!url) return null;

  // This library uses SVG, so it scales nicely.
  // We'll wrap it in a box to give it a size and background.
  return (
    <div style={{ background: "white", padding: "16px" }}>
      <QRCode
        value={url}
        size={150} // This size is for the SVG canvas
        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        viewBox={`0 0 256 256`}
      />
    </div>
  );
};

export default QrCodeDisplay;
