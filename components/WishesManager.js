"use client";
import { useState } from "react";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { ListGroup, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots } from "@fortawesome/free-solid-svg-icons";

export default function WishesManager({
  weddingId,
  wishes,
  setWishes,
  setError,
}) {
  const handleApproveWish = async (wishId) => {
    if (!weddingId) {
      setError("Vui lòng chọn một đám cưới trước khi duyệt lời chúc.");
      return;
    }
    try {
      const wishRef = doc(db, "weddings", weddingId, "wishes", wishId);
      await setDoc(wishRef, { approved: true }, { merge: true });
      setWishes(
        wishes.map((wish) =>
          wish.id === wishId ? { ...wish, approved: true } : wish
        )
      );
    } catch (err) {
      setError("Lỗi khi duyệt lời chúc. Vui lòng thử lại.");
    }
  };

  const handleRejectWish = async (wishId) => {
    if (!weddingId) {
      setError("Vui lòng chọn một đám cưới trước khi từ chối lời chúc.");
      return;
    }
    try {
      const wishRef = doc(db, "weddings", weddingId, "wishes", wishId);
      await setDoc(wishRef, { approved: false }, { merge: true });
      setWishes(
        wishes.map((wish) =>
          wish.id === wishId ? { ...wish, approved: false } : wish
        )
      );
    } catch (err) {
      setError("Lỗi khi từ chối lời chúc. Vui lòng thử lại.");
    }
  };

  const handleDeleteWish = async (wishId) => {
    if (!weddingId) {
      setError("Vui lòng chọn một đám cưới trước khi xóa lời chúc.");
      return;
    }
    try {
      const wishRef = doc(db, "weddings", weddingId, "wishes", wishId);
      await deleteDoc(wishRef);
      setWishes(wishes.filter((wish) => wish.id !== wishId));
    } catch (err) {
      setError("Lỗi khi xóa lời chúc. Vui lòng thử lại.");
    }
  };

  return (
    <>
      <h3 className="section-heading">
        <FontAwesomeIcon icon={faCommentDots} className="me-2" />
        Quản lý lời chúc
      </h3>
      {wishes.length > 0 ? (
        <ListGroup className="mb-4">
          {wishes.map((wish) => (
            <ListGroup.Item key={wish.id} className="wish-list-item">
              <div>
                <strong className="wish-name">{wish.name}</strong>:{" "}
                {wish.message}
                <br />
                <small className="wish-meta">
                  {wish.createdAt.toDate().toLocaleDateString("vi-VN")} -{" "}
                  {wish.approved ? "Đã duyệt" : "Chưa duyệt"}
                </small>
              </div>
              <div className="d-flex gap-2">
                {!wish.approved && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleApproveWish(wish.id)}
                    className="btn-approve"
                  >
                    Duyệt
                  </Button>
                )}
                {wish.approved && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRejectWish(wish.id)}
                    className="btn-reject"
                  >
                    Hủy duyệt
                  </Button>
                )}
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDeleteWish(wish.id)}
                  className="btn-delete"
                >
                  Xóa
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <p className="no-wishes">Chưa có lời chúc nào.</p>
      )}
    </>
  );
}
