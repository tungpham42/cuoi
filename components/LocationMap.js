"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMap } from "@fortawesome/free-solid-svg-icons";
import { MapContainer } from "react-leaflet";
import { extractCoordinatesFromGoogleMaps, MapContent } from "@/utils/map";

const LocationMap = ({ form }) => {
  const [coordinates, setCoordinates] = useState(null);
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [error, setError] = useState(null);
  const markerRef = useRef(null);

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
    <section className="wedding-section my-5 p-4 mx-auto">
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
            <MapContent
              coordinates={coordinates}
              markerRef={markerRef}
              address={form.mapInfo.address}
              googleMapsUrl={googleMapsUrl}
            />
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
      {form.mapInfo && (
        <p className="text-center mt-3" style={{ color: "var(--foreground)" }}>
          Địa chỉ: {form.mapInfo.address}
        </p>
      )}
    </section>
  );
};

export default LocationMap;
