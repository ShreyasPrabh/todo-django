import React from "react";
import { X, Sparkles, Flame, CheckCircle, Target, Award } from "lucide-react";

export default function ProductivityModal({
  isOpen,
  onClose,
  stats,
}) {
  if (!isOpen || !stats) return null;

  const dailyProgressPercent = Math.min(
    100,
    Math.round((stats.today_completed / (stats.daily_goal || 5)) * 100)
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: "480px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={18} color="var(--color-primary)" />
            <h3>Productivity & Karma</h3>
          </div>
          <button className="section-icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ gap: "20px" }}>
          {/* Karma Score Card */}
          <div
            style={{
              backgroundColor: "var(--color-primary-light)",
              border: "1px solid rgba(219, 64, 53, 0.2)",
              borderRadius: "var(--radius-lg)",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--color-primary)",
                  letterSpacing: "0.5px",
                }}
              >
                Karma Level: {stats.karma_level}
              </span>
              <div
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 800,
                  color: "var(--text-main)",
                  marginTop: "2px",
                }}
              >
                {stats.karma_points} pts
              </div>
            </div>
            <Award size={40} color="var(--color-primary)" />
          </div>

          {/* Goals & Streaks Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            {/* Daily Goal */}
            <div
              style={{
                backgroundColor: "var(--bg-app)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600 }}>
                <Target size={15} color="#246fe0" /> Daily Goal
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                {stats.today_completed} / {stats.daily_goal} tasks
              </div>
              <div
                style={{
                  width: "100%",
                  height: "6px",
                  backgroundColor: "var(--border-color)",
                  borderRadius: "var(--radius-full)",
                  overflow: "hidden",
                  marginTop: "4px",
                }}
              >
                <div
                  style={{
                    width: `${dailyProgressPercent}%`,
                    height: "100%",
                    backgroundColor: "var(--color-primary)",
                    borderRadius: "var(--radius-full)",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>

            {/* Streak */}
            <div
              style={{
                backgroundColor: "var(--bg-app)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600 }}>
                <Flame size={15} color="#ff9900" /> Current Streak
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                {stats.streak_days} {stats.streak_days === 1 ? "day" : "days"}
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Keep completing tasks daily!
              </span>
            </div>
          </div>

          {/* All-time Summary */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              borderTop: "1px solid var(--border-subtle)",
              paddingTop: "12px",
              textAlign: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                {stats.week_completed}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Completed this week
              </div>
            </div>
            <div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                {stats.total_completed}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Total completed
              </div>
            </div>
            <div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                {stats.total_pending}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Total pending
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
