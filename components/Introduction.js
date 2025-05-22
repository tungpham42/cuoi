"use client";

const Introduction = ({ form }) => {
  if (!form.introduction?.trim()) {
    return null;
  }

  return (
    <div className="text-center">
      <p className="mx-auto p-4" style={{ whiteSpace: "pre-line" }}>
        {form.introduction}
      </p>
    </div>
  );
};

export default Introduction;
