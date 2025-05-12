"use client";
import { Container, Card, Alert } from "react-bootstrap";
import dynamic from "next/dynamic";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Components
import WeddingHeader from "./WeddingHeader";
import Countdown from "./Countdown";
import Gallery from "./Gallery";
import LoveStory from "./LoveStory";
import WishList from "./WishList";
import QRCode from "./QRCode";
import Introduction from "./Introduction";

// Dynamic imports
const LocationMap = dynamic(() => import("./LocationMap"), { ssr: false });
const AudioPlayer = dynamic(() => import("./AudioPlayer"), { ssr: false });

// Constants
const DEFAULT_COMPONENT_ORDER = [
  "WeddingHeader",
  "Introduction",
  "Countdown",
  "Gallery",
  "LoveStory",
  "LocationMap",
  "QRCode",
  "WishList",
  "AudioPlayer",
];
const DEFAULT_PRIMARY_FONT = "Dancing Script";
const DEFAULT_SECONDARY_FONT = "Lora";
const DEFAULT_THEME = "romantic";

// Sortable component for drag-and-drop
const SortableComponent = ({ id, children, disabled }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: disabled ? "default" : "grab",
    padding: "10px 0",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

// Component rendering logic
const renderComponent = (componentId, form, wishes) => {
  const {
    brideName = "",
    groomName = "",
    weddingDate = "",
    gallery = [],
    playlist = [],
    loveStory = "",
    bankInfo = {},
    introduction = "",
    mapInfo = { embedCode: "", address: "" },
    showCountdown = true,
    showGallery = true,
    showLoveStory = true,
    showWishList = true,
    showQRCode = true,
    showIntroduction = true,
    showLocationMap = true,
    showAudioPlayer = true,
  } = form || {};

  const components = {
    WeddingHeader: () =>
      brideName || groomName ? <WeddingHeader data={form} /> : null,
    Introduction: () =>
      showIntroduction && introduction.trim() ? (
        <Introduction form={form} />
      ) : null,
    Countdown: () =>
      showCountdown && weddingDate ? (
        <Countdown weddingDate={weddingDate} />
      ) : null,
    Gallery: () =>
      showGallery && gallery.length > 0 ? <Gallery images={gallery} /> : null,
    LoveStory: () =>
      showLoveStory && loveStory.trim() ? <LoveStory text={loveStory} /> : null,
    LocationMap: () =>
      showLocationMap && (mapInfo.embedCode || mapInfo.address) ? (
        <LocationMap form={form} />
      ) : null,
    QRCode: () =>
      showQRCode &&
      bankInfo &&
      Object.values(bankInfo).some((value) => value) ? (
        <QRCode bankInfo={bankInfo} />
      ) : null,
    WishList: () =>
      showWishList && wishes?.length > 0 ? <WishList wishes={wishes} /> : null,
    AudioPlayer: () =>
      showAudioPlayer && playlist.length > 0 ? (
        <AudioPlayer playlist={playlist} />
      ) : null,
  };

  return components[componentId]?.() || null;
};

const WeddingPreviewPane = ({ form, wishes = [] }) => {
  if (!form) {
    return (
      <Container fluid className="py-5">
        <Alert variant="info" className="text-center">
          Vui lòng chọn một đám cưới để xem trước.
        </Alert>
      </Container>
    );
  }

  const {
    componentOrder = DEFAULT_COMPONENT_ORDER,
    primaryFont = DEFAULT_PRIMARY_FONT,
    secondaryFont = DEFAULT_SECONDARY_FONT,
    theme = DEFAULT_THEME,
  } = form;

  return (
    <Container fluid className="py-5" data-theme={theme}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .wedding-preview,
            .wedding-preview p,
            .wedding-preview span {
              font-family: "${secondaryFont}", serif !important;
            }
            .wedding-preview h1,
            .wedding-preview h2,
            .wedding-preview h3,
            .wedding-preview h4,
            .wedding-preview h5,
            .wedding-preview h6,
            .wedding-preview .h1,
            .wedding-preview .h2,
            .wedding-preview .h3,
            .wedding-preview .h4,
            .wedding-preview .h5,
            .wedding-preview .h6 {
              font-family: "${primaryFont}", cursive !important;
            }
          `,
        }}
      />
      <Card className="shadow-lg border-0 mx-auto wedding-preview">
        <Card.Title className="text-center mt-4 h2">
          Xem trước giao diện đám cưới
        </Card.Title>
        <Card.Body>
          <DndContext collisionDetection={closestCenter}>
            <SortableContext
              items={componentOrder}
              strategy={verticalListSortingStrategy}
            >
              {componentOrder.map((id) => (
                <SortableComponent key={id} id={id} disabled>
                  {renderComponent(id, form, wishes)}
                </SortableComponent>
              ))}
            </SortableContext>
          </DndContext>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default WeddingPreviewPane;
