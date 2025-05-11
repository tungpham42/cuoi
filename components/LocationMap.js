"use client";
import { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMap } from "@fortawesome/free-solid-svg-icons";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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
const extractCoordinatesFromGoogleMaps = (url) => {
  try {
    // Handle various Google Maps URL formats
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

    // Extract from iframe src if provided
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

const LocationMap = ({ form }) => {
  const [coordinates, setCoordinates] = useState(null);
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [error, setError] = useState(null);

  // Extract coordinates from Google Maps link
  const loadCoordinates = useCallback(() => {
    if (!form.mapInfo.embedCode) {
      setCoordinates(null);
      setGoogleMapsUrl("");
      setError("No Google Maps link provided");
      return;
    }

    const result = extractCoordinatesFromGoogleMaps(form.mapInfo.embedCode);
    if (result) {
      setCoordinates([result.lat, result.lng]);
      setGoogleMapsUrl(result.url);
      setError(null);
    } else {
      setCoordinates(null);
      setGoogleMapsUrl("");
      setError("Could not extract coordinates from Google Maps link");
    }
  }, [form.mapInfo.embedCode]);

  useEffect(() => {
    if (form.showLocationMap && form.mapInfo.embedCode) {
      loadCoordinates();
    } else {
      setCoordinates(null);
      setGoogleMapsUrl("");
      setError(null);
    }
  }, [form.showLocationMap, form.mapInfo.embedCode, loadCoordinates]);

  if (!form.showLocationMap) {
    return null;
  }

  return (
    <section className="wedding-section my-5 p-5 mx-auto">
      <div className="decorative-corner-top"></div>
      <div className="decorative-corner-bottom"></div>
      <h2 className="section-heading text-center mb-4">
        <FontAwesomeIcon icon={faMap} className="me-2" />
        Bản đồ
      </h2>
      {coordinates ? (
        <div className="map-container" style={{ height: "420px" }}>
          <MapContainer
            center={coordinates}
            zoom={17}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
            touchZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={coordinates}>
              <Popup>
                {form.mapInfo.address || "Địa điểm đám cưới"}
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
          </MapContainer>
        </div>
      ) : form.mapInfo.embedCode ? (
        <div
          className="map-embed"
          dangerouslySetInnerHTML={{ __html: form.mapInfo.embedCode }}
        />
      ) : (
        <p className="text-center text-muted">
          {error || "Vui lòng cung cấp liên kết Google Maps hợp lệ."}
        </p>
      )}
      {form.mapInfo.address && (
        <p className="text-center mt-3" style={{ color: "var(--foreground)" }}>
          Địa chỉ: {form.mapInfo.address}
        </p>
      )}
    </section>
  );
};

export default LocationMap;
