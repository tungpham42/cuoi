"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { Card, ListGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { MapContainer } from "react-leaflet";
import { formatDateTime } from "@/utils/dateTime";
import { extractCoordinatesFromGoogleMaps, MapContent } from "@/utils/map";

// Reusable EventItem component with map
const EventItem = ({ event, index }) => {
  const [coordinates, setCoordinates] = useState(null);
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const markerRef = useRef(null);

  // Extract coordinates from Google Maps link
  const loadCoordinates = useCallback(() => {
    if (!event.mapInfo?.embedCode) {
      setCoordinates(null);
      setGoogleMapsUrl("");
      return;
    }

    const result = extractCoordinatesFromGoogleMaps(event.mapInfo.embedCode);
    if (result) {
      setCoordinates([result.lat, result.lng]);
      setGoogleMapsUrl(result.url);
    } else {
      setCoordinates(null);
      setGoogleMapsUrl("");
    }
  }, [event.mapInfo?.embedCode]);

  useEffect(() => {
    if (event.mapInfo?.embedCode) {
      loadCoordinates();
    } else {
      setCoordinates(null);
      setGoogleMapsUrl("");
    }
  }, [event.mapInfo?.embedCode, loadCoordinates]);

  return (
    <ListGroup.Item key={index} className="border-0 py-3">
      <h3 className="mb-2 font-weight-bold">{event.title}</h3>
      <p className="mb-1 text-muted">
        <strong>Ngày và giờ:</strong> {formatDateTime(event.date, event.time)}
      </p>
      {event.description && (
        <p className="mb-2 text-secondary">{event.description}</p>
      )}
      {coordinates ? (
        <div
          className="map-container"
          style={{ height: "300px", marginTop: "1rem" }}
        >
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
              address={event.mapInfo?.address}
              googleMapsUrl={googleMapsUrl}
            />
          </MapContainer>
        </div>
      ) : event.mapInfo?.embedCode ? (
        <div
          className="map-embed"
          style={{ marginTop: "1rem" }}
          dangerouslySetInnerHTML={{ __html: event.mapInfo.embedCode }}
        />
      ) : null}
      {event.mapInfo?.address && (
        <p className="text-center mt-3" style={{ color: "var(--foreground)" }}>
          Địa chỉ: {event.mapInfo.address}
        </p>
      )}
    </ListGroup.Item>
  );
};

const KeyDates = ({ keyDates = [] }) => {
  // Early return for empty or invalid data
  if (!keyDates || keyDates.length === 0) {
    return null;
  }

  return (
    <section className="wedding-section my-5 p-4 mx-auto">
      <div className="decorative-corner-top"></div>
      <div className="decorative-corner-bottom"></div>
      <h2 className="section-heading text-center mb-4">
        <FontAwesomeIcon icon={faCalendar} className="me-2" />
        Lịch các ngày trọng đại
      </h2>
      <Card className="shadow-sm border-0 rounded-lg">
        <Card.Body className="p-4">
          <ListGroup variant="flush">
            {keyDates.map((event, index) => (
              <EventItem key={index} event={event} index={index} />
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
    </section>
  );
};

export default KeyDates;
