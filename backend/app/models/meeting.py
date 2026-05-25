import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class MeetingStatus(str, enum.Enum):
    UPLOADED = "uploaded"       # transcript received, not yet processed
    PROCESSING = "processing"   # AI analysis in progress
    COMPLETED = "completed"     # AI analysis done
    FAILED = "failed"           # processing error


class Meeting(Base):
    __tablename__ = "meetings"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    owner_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    transcript: Mapped[str | None] = mapped_column(Text, nullable=True)
    original_filename: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[MeetingStatus] = mapped_column(
        SAEnum(MeetingStatus), default=MeetingStatus.UPLOADED, nullable=False
    )

    # ─── AI Analysis Fields ───────────────────────────────────────────────────
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    action_items: Mapped[str | None] = mapped_column(Text, nullable=True)
    decisions: Mapped[str | None] = mapped_column(Text, nullable=True)
    analyzed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationship back to User
    owner: Mapped["User"] = relationship("User", back_populates="meetings")  # noqa: F821

    def __repr__(self) -> str:
        return f"<Meeting id={self.id} title={self.title!r} status={self.status}>"
