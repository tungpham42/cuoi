"use client";
import { Container, Card, Alert } from "react-bootstrap";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import WeddingHeader from "./WeddingHeader";
import Countdown from "./Countdown";
import Gallery from "./Gallery";
import LoveStory from "./LoveStory";
import WishList from "./WishList";
import QRCode from "./QRCode";

// Sortable component for drag-and-drop functionality
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

// Main WeddingPreviewPane component
const WeddingPreviewPane = ({ form, wishes }) => {
  // If no form data, render a placeholder message
  if (!form) {
    return (
      <Container fluid className="py-5">
        <Alert variant="info" className="text-center">
          Vui lòng chọn một đám cưới để xem trước.
        </Alert>
      </Container>
    );
  }

  // Default values for form fields to prevent undefined errors
  const componentOrder = form.componentOrder || [
    "WeddingHeader",
    "Countdown",
    "Gallery",
    "LoveStory",
    "QRCode",
    "WishList",
  ];
  const primaryFont = form.primaryFont || "Dancing Script";
  const secondaryFont = form.secondaryFont || "Lora";
  const theme = form.theme || "romantic";
  const brideName = form.brideName || "";
  const groomName = form.groomName || "";
  const weddingDate = form.weddingDate || "";
  const gallery = form.gallery || [];
  const loveStory = form.loveStory || "";
  const bankInfo = form.bankInfo || {};
  const showCountdown = form.showCountdown !== false;
  const showGallery = form.showGallery !== false;
  const showLoveStory = form.showLoveStory !== false;
  const showWishList = form.showWishList !== false;
  const showQRCode = form.showQRCode !== false;

  // Render individual components based on ID
  const renderComponent = (componentId) => {
    switch (componentId) {
      case "WeddingHeader":
        return brideName || groomName ? (
          <WeddingHeader data={{ brideName, groomName, ...form }} />
        ) : null;
      case "Countdown":
        return showCountdown && weddingDate ? (
          <Countdown weddingDate={weddingDate} />
        ) : null;
      case "Gallery":
        return showGallery && gallery.length > 0 ? (
          <Gallery images={gallery} />
        ) : null;
      case "LoveStory":
        return showLoveStory && loveStory.trim() ? (
          <LoveStory text={loveStory} />
        ) : null;
      case "QRCode":
        return showQRCode &&
          bankInfo &&
          Object.values(bankInfo).some((value) => value) ? (
          <QRCode bankInfo={bankInfo} />
        ) : null;
      case "WishList":
        return showWishList && wishes?.length > 0 ? (
          <WishList wishes={wishes} />
        ) : null;
      default:
        return null;
    }
  };

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
                  {renderComponent(id)}
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
