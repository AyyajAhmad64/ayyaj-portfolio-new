import React, { useState, useEffect } from "react";

export default function AdminBulkActionsBar({
  selectedIds = [],
  totalCount = 0,
  onSelectAll,
  onDeselectAll,
  onBulkPublish,
  onBulkDraft,
  onBulkDelete,
  itemTypeLabel = "items",
  selectedItems = [] // optional array of { id, title/name }
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const count = selectedIds.length;
  const allSelected = totalCount > 0 && count === totalCount;

  // Handle ESC key to close modal or deselect
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (showDeleteModal) {
          setShowDeleteModal(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showDeleteModal]);

  if (count === 0) return null;

  const handleConfirmDelete = async () => {
    if (!onBulkDelete) return;
    setIsProcessing(true);
    try {
      await onBulkDelete(selectedIds);
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Bulk delete error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAction = async (actionFn) => {
    if (!actionFn) return;
    setIsProcessing(true);
    try {
      await actionFn(selectedIds);
    } catch (err) {
      console.error("Bulk action error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <aside
        className="admin-bulk-toolbar"
        role="region"
        aria-label="Bulk actions toolbar"
        style={{
          position: "sticky",
          bottom: "20px",
          zIndex: 90,
          background: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--accent-cyan)",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(56, 189, 248, 0.2)",
          borderRadius: "var(--radius-md, 8px)",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          margin: "16px 0",
          animation: "fadeIn 0.2s ease-out"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "999px",
              background: "rgba(56, 189, 248, 0.15)",
              border: "1px solid var(--accent-cyan)",
              color: "var(--accent-cyan)",
              fontSize: "12px",
              fontWeight: "700",
              fontFamily: "var(--font-mono, monospace)"
            }}
          >
            <span>✓</span> {count} of {totalCount} {itemTypeLabel} selected
          </span>

          <button
            type="button"
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: "12px", color: "var(--text-muted)" }}
          >
            {allSelected ? "Deselect All" : `Select All (${totalCount})`}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {onBulkPublish && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleAction(onBulkPublish)}
              className="btn btn-outline btn-sm"
              style={{
                borderColor: "var(--accent-emerald, #10b981)",
                color: "var(--accent-emerald, #10b981)",
                fontSize: "12px"
              }}
            >
              ✓ Publish Selected
            </button>
          )}

          {onBulkDraft && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleAction(onBulkDraft)}
              className="btn btn-outline btn-sm"
              style={{
                borderColor: "var(--accent-amber, #f59e0b)",
                color: "var(--accent-amber, #f59e0b)",
                fontSize: "12px"
              }}
            >
              ✎ Draft Selected
            </button>
          )}

          {onBulkDelete && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-danger btn-sm"
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                borderColor: "var(--accent-rose, #ef4444)",
                color: "var(--accent-rose, #ef4444)",
                fontSize: "12px"
              }}
            >
              🗑 Delete Selected ({count})
            </button>
          )}

          <button
            type="button"
            onClick={onDeselectAll}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: "12px", color: "var(--text-dim)" }}
            aria-label="Cancel selection"
          >
            ✕ Clear
          </button>
        </div>
      </aside>

      {/* Confirmation Modal for Bulk Delete */}
      {showDeleteModal && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-delete-dialog-title"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px"
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: "500px",
              width: "100%",
              background: "var(--bg-card, #1e293b)",
              border: "1px solid var(--accent-rose, #ef4444)",
              boxShadow: "0 20px 30px rgba(0,0,0,0.5)",
              padding: "24px",
              borderRadius: "var(--radius-md, 8px)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <span style={{ fontSize: "24px" }}>⚠️</span>
              <div>
                <h3
                  id="bulk-delete-dialog-title"
                  style={{ fontSize: "18px", color: "var(--text-bright, #fff)", margin: 0, fontWeight: 700 }}
                >
                  Confirm Bulk Deletion
                </h3>
                <span style={{ fontSize: "12px", color: "var(--accent-rose, #ef4444)", fontFamily: "var(--font-mono)" }}>
                  PERMANENT DATABASE ACTION
                </span>
              </div>
            </div>

            <p style={{ color: "var(--text-muted, #94a3b8)", fontSize: "14px", lineHeight: 1.5, marginBottom: "16px" }}>
              You are about to permanently delete <strong style={{ color: "var(--text-bright)" }}>{count} {itemTypeLabel}</strong> from the database. This action cannot be reversed.
            </p>

            {selectedItems && selectedItems.length > 0 && (
              <div
                style={{
                  maxHeight: "150px",
                  overflowY: "auto",
                  background: "var(--bg-base, #0f172a)",
                  borderRadius: "var(--radius-sm, 4px)",
                  padding: "10px 12px",
                  marginBottom: "20px",
                  border: "1px solid var(--border-subtle, #334155)"
                }}
              >
                <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: "6px" }}>
                  Items to be deleted:
                </div>
                <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "var(--text-bright)" }}>
                  {selectedItems.map((it, idx) => (
                    <li key={it.id || idx} style={{ marginBottom: "3px" }}>
                      {it.title || it.name || it.id}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowDeleteModal(false)}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleConfirmDelete}
                disabled={isProcessing}
                style={{
                  background: "var(--accent-rose, #ef4444)",
                  color: "#fff",
                  borderColor: "var(--accent-rose, #ef4444)"
                }}
              >
                {isProcessing ? "Deleting..." : `Yes, Delete ${count} Items`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

