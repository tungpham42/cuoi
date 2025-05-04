import WeddingHeader from "./WeddingHeader";
import Countdown from "./Countdown";
import Gallery from "./Gallery";
import LoveStory from "./LoveStory";
import WishList from "./WishList";
import { Card } from "react-bootstrap";

const WeddingPreviewCard = ({ form, wishes }) => (
  <Card className="mt-5 h3">
    <Card.Header className="text-center">
      Xem trước giao diện đám cưới
    </Card.Header>
    <Card.Body className={`theme-${form.theme}`}>
      <WeddingHeader data={form} />
      <Countdown weddingDate={form.weddingDate} />
      <Gallery images={form.gallery} />
      <LoveStory text={form.loveStory} />
      <WishList wishes={wishes} />
    </Card.Body>
  </Card>
);
export default WeddingPreviewCard;
