"use client";
import WeddingHeader from "./WeddingHeader";
import Countdown from "./Countdown";
import Gallery from "./Gallery";
import LoveStory from "./LoveStory";
import WishList from "./WishList";
import QRCode from "./QRCode";
import { Card, Container } from "react-bootstrap";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

const WeddingPreviewPane = ({ form, wishes }) => {
  const componentOrder = form.componentOrder || [
    "WeddingHeader",
    "Countdown",
    "Gallery",
    "LoveStory",
    "QRCode",
    "WishList",
  ];

  const renderComponent = (componentId) => {
    switch (componentId) {
      case "WeddingHeader":
        return <WeddingHeader data={form} />;
      case "Countdown":
        return (
          form.showCountdown &&
          form.weddingDate && <Countdown weddingDate={form.weddingDate} />
        );
      case "Gallery":
        return (
          form.showGallery &&
          form.gallery?.length > 0 && <Gallery images={form.gallery} />
        );
      case "LoveStory":
        return (
          form.showLoveStory &&
          form.loveStory && <LoveStory text={form.loveStory} />
        );
      case "QRCode":
        return form.showQRCode && <QRCode bankInfo={form.bankInfo} />;
      case "WishList":
        return (
          form.showWishList &&
          wishes?.length > 0 && <WishList wishes={wishes} />
        );
      default:
        return null;
    }
  };

  return (
    <Container fluid className="py-5" data-theme={form.theme}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .wedding-preview,
        .wedding-preview p,
        .wedding-preview span {
        font-family: "${form.secondaryFont || "Lora"}", serif !important;
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
        font-family: "${
          form.primaryFont || "Dancing Script"
        }", cursive !important;
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
