"use client";
import WeddingHeader from "./WeddingHeader";
import Countdown from "./Countdown";
import Gallery from "./Gallery";
import LoveStory from "./LoveStory";
import WishList from "./WishList";
import QRCode from "./QRCode";
import { Card, Container } from "react-bootstrap";

const WeddingPreviewCard = ({ form, wishes }) => (
  <Container fluid className="py-5" data-theme={form.theme}>
    <Card className="shadow-lg border-0 mx-auto">
      <Card.Title className="text-center mt-4">
        Xem trước giao diện đám cưới
      </Card.Title>
      <Card.Body>
        <WeddingHeader data={form} />
        {form.showCountdown && form.weddingDate && (
          <Countdown weddingDate={form.weddingDate} />
        )}
        {form.showGallery && form.gallery?.length > 0 && (
          <Gallery images={form.gallery} />
        )}
        {form.showLoveStory && form.loveStory && (
          <LoveStory text={form.loveStory} />
        )}
        {form.showQRCode && <QRCode bankInfo={form.bankInfo} />}
        {form.showWishList && wishes?.length > 0 && (
          <WishList wishes={wishes} />
        )}
      </Card.Body>
    </Card>
  </Container>
);

export default WeddingPreviewCard;
