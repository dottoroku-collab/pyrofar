from fastapi import APIRouter, Depends, HTTPException
from livekit import api
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.core.config import settings

router = APIRouter()

@router.get("/token")
async def get_ptt_token(current_user: User = Depends(get_current_user)):
    """
    Generate a LiveKit access token for the user.
    """
    # In dev mode, these are the default credentials
    api_key = "devkey"
    api_secret = "secret"

    # We use a global channel for testing: "command-center-global"
    room_name = "command-center-global"
    participant_identity = str(current_user.id)
    participant_name = current_user.nama

    token = api.AccessToken(api_key, api_secret)\
        .with_identity(participant_identity)\
        .with_name(participant_name)\
        .with_grants(api.VideoGrants(
            room_join=True,
            room=room_name,
            can_publish=True,
            can_publish_data=True,
            can_subscribe=True,
        ))
    
    # Generate the JWT string
    jwt_token = token.to_jwt()

    return {
        "token": jwt_token,
        "room": room_name,
        "identity": participant_identity,
        "name": participant_name
    }
