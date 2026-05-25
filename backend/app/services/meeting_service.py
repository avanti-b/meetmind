from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile
from app.models.meeting import Meeting, MeetingStatus
from app.models.user import User
from app.schemas.meeting import MeetingCreateRequest, MeetingUpdateRequest

# Max transcript file size: 5MB
MAX_UPLOAD_BYTES = 5 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {"text/plain"}
ALLOWED_EXTENSIONS = {".txt"}


class MeetingService:
    def __init__(self, db: Session):
        self.db = db

    # ─── Create ───────────────────────────────────────────────────────────────

    def create_meeting(self, payload: MeetingCreateRequest, owner: User) -> Meeting:
        meeting = Meeting(
            title=payload.title,
            owner_id=owner.id,
            status=MeetingStatus.UPLOADED,
        )
        self.db.add(meeting)
        self.db.commit()
        self.db.refresh(meeting)
        return meeting

    # ─── Upload Transcript ────────────────────────────────────────────────────

    async def upload_transcript(
        self, meeting_id: str, file: UploadFile, owner: User
    ) -> Meeting:
        meeting = self._get_owned_meeting(meeting_id, owner.id)

        # Validate file extension
        filename = file.filename or ""
        ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
            )

        # Read and size-check content
        content = await file.read()
        if len(content) > MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File exceeds 5MB limit",
            )

        # Decode text
        try:
            transcript_text = content.decode("utf-8")
        except UnicodeDecodeError:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="File must be UTF-8 encoded text",
            )

        if not transcript_text.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Uploaded file is empty",
            )

        meeting.transcript = transcript_text
        meeting.original_filename = filename
        meeting.status = MeetingStatus.UPLOADED
        self.db.commit()
        self.db.refresh(meeting)
        return meeting

    # ─── Read ─────────────────────────────────────────────────────────────────

    def get_all_meetings(self, owner: User) -> tuple[list[Meeting], int]:
        meetings = (
            self.db.query(Meeting)
            .filter(Meeting.owner_id == owner.id)
            .order_by(Meeting.created_at.desc())
            .all()
        )
        return meetings, len(meetings)

    def get_meeting(self, meeting_id: str, owner: User) -> Meeting:
        return self._get_owned_meeting(meeting_id, owner.id)

    # ─── Update ───────────────────────────────────────────────────────────────

    def update_meeting(
        self, meeting_id: str, payload: MeetingUpdateRequest, owner: User
    ) -> Meeting:
        meeting = self._get_owned_meeting(meeting_id, owner.id)

        if payload.title is not None:
            meeting.title = payload.title
        if payload.transcript is not None:
            if not payload.transcript.strip():
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Transcript cannot be empty",
                )
            meeting.transcript = payload.transcript
            meeting.status = MeetingStatus.UPLOADED  # reset for re-processing

        self.db.commit()
        self.db.refresh(meeting)
        return meeting

    # ─── Delete ───────────────────────────────────────────────────────────────

    def delete_meeting(self, meeting_id: str, owner: User) -> str:
        meeting = self._get_owned_meeting(meeting_id, owner.id)
        self.db.delete(meeting)
        self.db.commit()
        return meeting_id

    # ─── Private Helpers ──────────────────────────────────────────────────────

    def _get_owned_meeting(self, meeting_id: str, owner_id: str) -> Meeting:
        """
        Fetches a meeting by ID scoped to owner.
        Returns 404 for both missing AND unauthorized access —
        intentionally indistinguishable to prevent enumeration attacks.
        """
        meeting = (
            self.db.query(Meeting)
            .filter(Meeting.id == meeting_id, Meeting.owner_id == owner_id)
            .first()
        )
        if not meeting:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting not found",
            )
        return meeting

    # ─── AI Analysis ──────────────────────────────────────────────────────────

    def analyze_meeting(self, meeting_id: str, owner: "User") -> "Meeting":  # noqa: F821
        """
        Runs AI analysis on the meeting transcript.
        Sets status to PROCESSING before the call and COMPLETED/FAILED after.
        """
        from app.services.ai_service import AIService
        from app.models.meeting import MeetingStatus

        meeting = self._get_owned_meeting(meeting_id, owner.id)

        if not meeting.transcript:
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No transcript found. Upload a transcript before analyzing.",
            )

        # Mark as processing so callers can show a loading state
        meeting.status = MeetingStatus.PROCESSING
        self.db.commit()

        try:
            ai_svc = AIService()
            result = ai_svc.analyze_transcript(meeting.transcript)

            meeting.summary = result["summary"]
            meeting.action_items = result["action_items"]
            meeting.decisions = result["decisions"]
            meeting.analyzed_at = result["analyzed_at"]
            meeting.status = MeetingStatus.COMPLETED

        except Exception:
            meeting.status = MeetingStatus.FAILED
            self.db.commit()
            raise

        self.db.commit()
        self.db.refresh(meeting)
        return meeting
