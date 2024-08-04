from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from posthog.batch_exports.service import backfill_export
from posthog.client import sync_connect

router = APIRouter()

class BackfillRequest(BaseModel):
    start_at: str
    end_at: str

@router.post("/projects/{project_id}/batch_exports/{batch_export_id}/backfill")
async def backfill_batch_export(project_id: int, batch_export_id: int, request: BackfillRequest):
    temporal = sync_connect()
    try:
        workflow_id = backfill_export(
            temporal,
            batch_export_id,
            project_id,
            request.start_at,
            request.end_at,
       )
       return {"workflow_id": workflow_id}