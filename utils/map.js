"use client";
import { useEffect } from "react";
import { TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet marker icon issue in Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Function to extract latitude and longitude from Google Maps URL
export const extractCoordinatesFromGoogleMaps = (url) => {
  try {
    const regexPatterns = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/, // Format: @lat,lng
      /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // Format: !3dlat!4dlng
      /ll=(-?\d+\.\d+),(-?\d+\.\d+)/, // Format: ll=lat,lng
    ];

    let lat, lng;
    for (const pattern of regexPatterns) {
      const match = url.match(pattern);
      if (match) {
        lat = parseFloat(match[1]);
        lng = parseFloat(match[2]);
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { lat, lng, url };
        }
      }
    }

    if (url.includes("<iframe")) {
      const srcMatch = url.match(/src="([^"]+)"/);
      if (srcMatch) {
        const iframeSrc = srcMatch[1];
        for (const pattern of regexPatterns) {
          const match = iframeSrc.match(pattern);
          if (match) {
            lat = parseFloat(match[1]);
            lng = parseFloat(match[2]);
            if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
              return { lat, lng, url: iframeSrc };
            }
          }
        }
      }
    }

    return null;
  } catch (err) {
    console.error("Error extracting coordinates:", err);
    return null;
  }
};

// Component to handle map content and popup logic
export const MapContent = ({
  coordinates,
  markerRef,
  address,
  googleMapsUrl,
}) => {
  const locationMap = useMap();

  useEffect(() => {
    if (coordinates && markerRef.current) {
      const popup = markerRef.current.getPopup();
      if (popup) {
        locationMap.openPopup(popup, coordinates);
      }
    }
  }, [coordinates, locationMap, markerRef]);

  return (
    <>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={coordinates} ref={markerRef}>
        <Popup>
          {address || "Địa điểm sự kiện"}
          <br />
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--foreground)" }}
          >
            Xem trên Google Maps
          </a>
        </Popup>
      </Marker>
    </>
  );
};
