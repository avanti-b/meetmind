from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.meeting import (
    MeetingCreateRequest,
    MeetingUpdateRequest,
    MeetingResponse,
    MeetingListResponse,
    MeetingDeleteResponse,
    AnalysisResponse,
)
from app.services.meeting_service import MeetingService

router = APIRouter(prefix="/meetings", tags=["Meetings"])


@router.post("", response_model=MeetingResponse, status_code=201)
def create_meeting(
    payload: MeetingCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = MeetingService(db)
    meeting = service.create_meeting(payload, current_user)
    return MeetingResponse.model_validate(meeting)


@router.get("", response_model=MeetingListResponse)
def list_meetings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = MeetingService(db)
    meetings, total = service.get_all_meetings(current_user)
    return MeetingListResponse(
        meetings=[MeetingResponse.model_validate(m) for m in meetings],
        total=total,
    )


@router.get("/{meeting_id}", response_model=MeetingResponse)
def get_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = MeetingService(db)
    meeting = service.get_meeting(meeting_id, current_user)
    return MeetingResponse.model_validate(meeting)


@router.put("/{meeting_id}", response_model=MeetingResponse)
def update_meeting(
    meeting_id: str,
    payload: MeetingUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = MeetingService(db)
    meeting = service.update_meeting(meeting_id, payload, current_user)
    return MeetingResponse.model_validate(meeting)


@router.delete("/{meeting_id}", response_model=MeetingDeleteResponse)
def delete_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = MeetingService(db)
    deleted_id = service.delete_meeting(meeting_id, current_user)
    return MeetingDeleteResponse(message="Meeting deleted successfully", id=deleted_id)


@router.post("/{meeting_id}/transcript", response_model=MeetingResponse)
async def upload_transcript(
    meeting_id: str,
    file: UploadFile = File(..., description="Plain text transcript file (.txt)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = MeetingService(db)
    meeting = await service.upload_transcript(meeting_id, file, current_user)
    return MeetingResponse.model_validate(meeting)


@router.post("/{meeting_id}/analyze", response_model=AnalysisResponse)
def analyze_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = MeetingService(db)
    meeting = service.analyze_meeting(meeting_id, current_user)
    return AnalysisResponse(
        meeting_id=meeting.id,
        summary=meeting.summary,
        action_items=meeting.action_items,
        decisions=meeting.decisions,
        analyzed_at=meeting.analyzed_at,
    )
