import WeddingHeader from "./WeddingHeader";
import Countdown from "./Countdown";
import Gallery from "./Gallery";
import LoveStory from "./LoveStory";
import WishList from "./WishList";
import { Card, Container } from "react-bootstrap";

const WeddingPreviewCard = ({ form, wishes }) => (
  <Container fluid className="py-5" data-theme={form.theme}>
    <Card className="shadow-lg border-0 mx-auto">
      <Card.Header className="text-center">
        Xem trước giao diện đám cưới
      </Card.Header>
      <Card.Body>
        <WeddingHeader data={form} />
        <Countdown weddingDate={form.weddingDate} />
        <Gallery images={form.gallery} />
        <LoveStory text={form.loveStory} />
        <WishList wishes={wishes} />
      </Card.Body>
    </Card>
  </Container>
);
export default WeddingPreviewCard;
