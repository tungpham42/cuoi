"use client";
import React from "react";
import { Card, Container, Image } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQrcode, faMoneyBillWave } from "@fortawesome/free-solid-svg-icons";

const QRCode = ({ bankInfo }) => {
  const defaultBankInfo = {
    bankName: bankInfo?.bankName || "VCB",
    accountNumber: bankInfo?.accountNumber || "1234567890",
    accountHolder: bankInfo?.accountHolder || "Nguyen Van A",
    description: bankInfo?.description || "Qua mung dam cuoi",
  };

  const qrURL = `https://img.vietqr.io/image/${defaultBankInfo.bankName}-${
    defaultBankInfo.accountNumber
  }-print.png?addInfo=${encodeURIComponent(
    defaultBankInfo.description
  )}&accountName=${encodeURIComponent(defaultBankInfo.accountHolder)}`;

  return (
    <Container className="py-4">
      <Card
        className="shadow-sm border-0 mx-auto"
        style={{ maxWidth: "400px" }}
      >
        <Card.Body className="text-center">
          <Card.Title
            style={{
              fontFamily: "'Great Vibes', cursive",
              color: "#BE123C",
              fontSize: "1.5rem",
            }}
          >
            Chúc mừng hạnh phúc!
          </Card.Title>
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#9F1239",
            }}
          >
            <FontAwesomeIcon icon={faQrcode} className="me-2" />
            Quét mã QR để gửi tiền mừng:
          </p>
          <div className="mb-3">
            <Image src={qrURL} alt="QR code" width={240} />
          </div>
          <div className="text-center">
            <p>
              <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" />
              <strong>Ngân hàng:</strong> {defaultBankInfo.bankName}
            </p>
            <p>
              <strong>Số tài khoản:</strong> {defaultBankInfo.accountNumber}
            </p>
            <p>
              <strong>Chủ tài khoản:</strong> {defaultBankInfo.accountHolder}
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default QRCode;
