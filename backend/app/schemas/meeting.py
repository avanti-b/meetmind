from datetime import datetime
from pydantic import BaseModel, field_validator
from app.models.meeting import MeetingStatus


# ─── Request Schemas ──────────────────────────────────────────────────────────

class MeetingCreateRequest(BaseModel):
    title: str

    @field_validator("title")
    @classmethod
    def title_must_not_be_empty(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Title must be at least 3 characters")
        if len(v) > 500:
            raise ValueError("Title must be under 500 characters")
        return v


class MeetingUpdateRequest(BaseModel):
    title: str | None = None
    transcript: str | None = None

    @field_validator("title")
    @classmethod
    def title_not_empty_if_provided(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip()
            if len(v) < 3:
                raise ValueError("Title must be at least 3 characters")
        return v


# ─── Response Schemas ─────────────────────────────────────────────────────────

class MeetingResponse(BaseModel):
    id: str
    owner_id: str
    title: str
    transcript: str | None
    original_filename: str | None
    status: MeetingStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MeetingListResponse(BaseModel):
    meetings: list[MeetingResponse]
    total: int


class MeetingDeleteResponse(BaseModel):
    message: str
    id: str
