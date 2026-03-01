# app/schemas/payment.py
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class PaymentInitializeRequest(BaseModel):
    registration_id: UUID


class PaymentInitializeResponse(BaseModel):
    authorization_url: str
    reference: str
    access_code: str


class PaymentVerifyResponse(BaseModel):
    status: str
    message: str
    reference: str
    amount: float


class PaymentResponse(BaseModel):
    id: UUID
    user_id: UUID
    course_id: UUID
    amount: float
    reference: str
    status: str
    paid_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True