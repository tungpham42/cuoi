"use client";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faCalendarAlt,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import { formatDateTime } from "@/utils/dateTime";

const WeddingHeader = ({ data }) => {
  const { brideName, groomName, weddingDate, weddingTime, location } = data;

  const dateTimeDisplay = formatDateTime(weddingDate, weddingTime);

  return (
    <header className="wedding-section text-center py-5 px-0 mx-auto my-5">
      <div className="decorative-corner-top"></div>
      <div className="decorative-corner-bottom"></div>
      <h1 className="h1 mb-3">
        {brideName}
        <FontAwesomeIcon icon={faHeart} className="mx-3" />
        {groomName}
      </h1>
      <p className="mb-3">
        Chúng tôi hân hạnh mời bạn đến dự lễ cưới của chúng tôi.
      </p>
      {dateTimeDisplay && (
        <p className="mb-2">
          <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
          <strong>Ngày và giờ:</strong> {dateTimeDisplay}
        </p>
      )}
      {location && (
        <p>
          <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
          <strong>Địa điểm:</strong> {location}
        </p>
      )}
    </header>
  );
};

export default WeddingHeader;
