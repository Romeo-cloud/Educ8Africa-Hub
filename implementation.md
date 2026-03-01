# Implementation Document: Educ8Africa Registration System

This document details the backend and frontend changes required to fix the payment registration flow and dashboard statistics display.

---

## Overview

The Educ8Africa system is a training registration platform with:
- **Backend**: FastAPI (Python) with PostgreSQL database
- **Frontend**: React + Vite with React Router
- **Payment**: Paystack integration for payments
- **Features**: Course registration, payment processing, referral system, admin dashboard

---

## Table of Contents

1. [Backend Changes](#part-1-backend-changes)
2. [Frontend Changes](#part-2-frontend-changes)
3. [API Endpoints Summary](#api-endpoints-summary)
4. [Payment Integration](#payment-integration)
5. [User Roles and Permissions](#user-roles-and-permissions)
6. [Environment Variables](#environment-variables)
7. [Testing Guidelines](#testing-guidelines)
8. [Response Schemas](#response-schemas)

---

## Recent Updates

### Course Registration Status Display (New!)

**Backend Changes:**
- No backend changes required - existing `/api/registrations` endpoint is used

**Frontend Changes:**
- Updated `Courses.jsx` to fetch user's registrations on mount
- Passes `isRegistered` prop to `CourseCard` component
- Updated `CourseCard.jsx` to show "Registered" button state for already registered courses

### Profile Update Functionality (New!)

**Backend Changes:**
- Added new `PATCH /api/auth/profile` endpoint to update user profile
- Accepts `full_name` and `phone_number` fields
- Returns updated user object

**Frontend Changes:**
- Updated Profile.jsx to call the new API endpoint when saving
- Properly updates AuthContext with server response

### Payment Page Updates

**Frontend Changes:**
- Simplified payment verification call
- Backend handles payment-to-registration linking automatically

---

## Part 1: Backend Changes

### 1.1 Profile Update Endpoint (`app/routers/auth.py`)

**New Endpoint Added:**

```
python
# Profile update request schema
class ProfileUpdateRequest(BaseModel):
    full_name: str
    phone_number: str

@router.patch("/profile", response_model=UserResponse)
def update_profile(
    request: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update current user's profile.
    
    - Updates full_name and phone_number
    - Email cannot be changed
    """
    current_user.full_name = request.full_name
    current_user.phone_number = request.phone_number
    
    try:
        db.commit()
        db.refresh(current_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )
    
    return UserResponse.model_validate(current_user)
```

**File:** `Educ8Africa/app/routers/auth.py`

### 1.2 Payment Router (`app/routers/payment.py`)

**Status:** Existing implementation handles payment verification and linking automatically.

**Endpoints:**
- `POST /api/payment/initialize` - Initialize Paystack payment
- `GET /api/payment/verify/{reference}` - Verify payment status
- `POST /api/payment/webhook` - Paystack webhook handler
- `GET /api/payment/history` - Get user's payment history

### 1.3 Dashboard Router (`app/routers/dashboard.py`)

**Status:** No changes required - the existing implementation provides:
- Registered courses with status
- Payment history
- Referral code, count, and earnings
- Welcome notes from paid courses
- Course enrollment statistics (total, paid, pending)
- Total paid amount

**Endpoint:** `GET /api/dashboard`

### 1.4 Registration Router (`app/routers/registration.py`)

**Status:** Existing implementation provides:
- `POST /api/course/select` - Register for a course
- `POST /api/student/profile` - Create/update student profile
- `GET /api/student/profile` - Get student profile
- `GET /api/registrations` - Get all user registrations (used by frontend to determine registered courses)

---

## Part 2: Frontend Changes

### 2.1 Courses Page (`src/pages/Courses.jsx`)

**Changes Made:**
- Added `registeredCourseIds` state to track user's registered courses
- Added `useEffect` to fetch user's registrations on mount
- Passes `isRegistered` prop to `CourseCard` component

**Key Implementation:**

```
javascript
// Fetch user's registrations to know which courses they're already registered for
useEffect(() => {
  const fetchRegistrations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const res = await api.get("/registrations");
      const registrations = res.data || [];
      
      // Extract course IDs from registrations
      const courseIds = new Set(
        registrations
          .map(reg => reg.course_id)
          .filter(Boolean)
      );
      
      setRegisteredCourseIds(courseIds);
    } catch (err) {
      console.error("[Courses] Failed to fetch registrations:", err);
    }
  };

  fetchRegistrations();
}, [user]);
```

**Rendering with registered status:**

```
javascript
<div className="courses-grid">
  {filtered.map((course, i) => (
    <CourseCard 
      key={course.id || i} 
      course={course} 
      index={i}
      isRegistered={registeredCourseIds.has(course.id)}
    />
  ))}
</div>
```

### 2.2 Course Card Component (`src/components/ui/CourseCard.jsx`)

**Changes Made:**
- Added `isRegistered` prop (defaults to `false`)
- Modified button to show "Registered" state when already registered
- Added disabled state styling for registered courses

**Key Implementation:**

```
javascript
export default function CourseCard({ course, index = 0, onRegister, isRegistered = false }) {
  const navigate = useNavigate();
  
  // ... existing code ...

  const handleRegister = () => {
    if (isRegistered) return;
    if (onRegister) return onRegister(course);
    navigate(`/dashboard/register/${course.id}`);
  };

  // ... existing code ...

  return (
    // ... existing JSX ...
    
    <button
      onClick={handleRegister}
      disabled={isRegistered}
      className={isRegistered ? "btn-disabled btn-full" : "btn-primary btn-full"}
      style={{ 
        fontSize: 14, 
        padding: "10px 24px", 
        marginTop: 4,
        background: isRegistered ? "var(--success)" : undefined,
        cursor: isRegistered ? "not-allowed" : "pointer"
      }}
    >
      {isRegistered ? "Registered" : "Register Now"}
    </button>
    
    // ... rest of JSX ...
  );
}
```

### 2.3 Profile Page (`src/pages/Profile.jsx`)

**Changes Made:**
- Updated to call new `PATCH /api/auth/profile` endpoint
- Properly handles API response and updates AuthContext
- Added error handling with toast notifications

**Key Implementation:**

```
javascript
const save = async () => {
  setSaving(true);
  try {
    // Call the backend API to update profile
    const res = await api.patch("/auth/profile", {
      full_name: form.name,
      phone_number: form.phone,
    });
    
    // Update user context with the response from server
    updateUser({
      ...user,
      name: res.data.full_name,
      full_name: res.data.full_name,
      phone_number: res.data.phone_number,
      phone: res.data.phone_number,
    });
    
    setEditing(false);
    toast.success("Profile updated successfully!");
  } catch (error) {
    console.error("Failed to update profile:", error);
    toast.error(error.response?.data?.detail || "Failed to update profile");
  } finally {
    setSaving(false);
  }
};
```

### 2.4 Payment Page (`src/pages/Payment.jsx`)

**Changes Made:**
- Simplified payment verification to just pass reference
- Backend automatically handles payment-to-registration linking

**Key Implementation:**

```
javascript
const onSuccess = (response) => {
  (async () => {
    try {
      toast.info("Verifying payment...");
      
      // Call the backend to verify payment
      // The backend will link the payment to the registration based on user and course
      await api.verifyPayment(response.reference);
      
      toast.success("Payment verified and recorded!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Verification failed", error);
      toast.error("Payment verified but server update failed.");
      navigate("/dashboard");
    } finally {
      setProcessing(false);
    }
  })();
};
```

### 2.5 API Service Updates (`src/services/api.js`)

**Existing Implementation:**

```javascript
// Verify Payment Method
instance.verifyPayment = async (reference) => {
  console.log(`[API] Verifying payment reference: ${reference}`);
  return await instance.get(`/payment/verify/${reference}`);
};
```

---

## API Endpoints Summary

### Authentication Routes (`app/routers/auth.py`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PATCH | `/api/auth/profile` | Update user profile | Yes |

### Course Routes (`app/routers/courses.py`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/courses` | List all active courses | No |
| GET | `/api/courses/{course_id}` | Get course details | No |

### Registration Routes (`app/routers/registration.py`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/course/select` | Register for a course | Yes |
| POST | `/api/student/profile` | Create/update profile | Yes |
| GET | `/api/student/profile` | Get student profile | Yes |
| GET | `/api/registrations` | Get user's registrations | Yes |

### Payment Routes (`app/routers/payment.py`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payment/initialize` | Initialize Paystack payment | Yes |
| GET | `/api/payment/verify/{reference}` | Verify payment status | No |
| POST | `/api/payment/webhook` | Paystack webhook handler | No |
| GET | `/api/payment/history` | Get user's payment history | Yes |

### Dashboard Routes (`app/routers/dashboard.py`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/dashboard` | Get user dashboard data | Yes |

### Referral Routes (`app/routers/referral.py`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/referrals` | Get user's referral summary | Yes |

### Admin Routes (`app/routers/admin.py`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/dashboard` | Admin dashboard stats | Admin |
| GET | `/api/admin/users` | List all users | Admin |
| GET | `/api/admin/users/{user_id}` | Get user details | Admin |
| PATCH | `/api/admin/users/{user_id}/role` | Assign user role | Admin |
| GET | `/api/admin/ambassadors` | List all ambassadors | Admin |
| GET | `/api/admin/courses` | List all courses | Admin |
| POST | `/api/admin/courses` | Create new course | Admin |
| PUT | `/api/admin/courses/{course_id}` | Update course | Admin |
| DELETE | `/api/admin/courses/{course_id}` | Deactivate course | Admin |
| GET | `/api/admin/payments` | List all payments | Admin |
| GET | `/api/admin/referrals` | List all referrals | Admin |
| GET | `/api/admin/export/students` | Export students | Admin |
| GET | `/api/admin/export/payments` | Export payments | Admin |
| GET | `/api/admin/export/referrals` | Export referrals | Admin |

---

## Payment Integration

### Flow: Inline Payment (Current Implementation)

1. User selects course → Frontend calls `/api/course/select`
2. Frontend initializes Paystack inline directly
3. On success, frontend calls `/api/payment/verify/{reference}`
4. Backend handles verification and links payment to course

### Payment Service (`app/services/payment_service.py`)

Key methods:

```
python
class PaymentService:
    @staticmethod
    async def initialize_payment(db: Session, user: User, registration_id: uuid.UUID) -> dict:
        """Initialize payment via Paystack (Backend flow)"""
        
    @staticmethod
    async def verify_payment(db: Session, reference: str) -> dict:
        """Verify payment via Paystack"""
        # 1. Call Paystack API to verify
        # 2. Update payment status to SUCCESS
        # 3. Mark registration as PAID
        # 4. Process referral commission if applicable
        # 5. Send welcome email
        
    @staticmethod
    async def handle_webhook(db: Session, payload: dict, signature: str) -> dict:
        """Handle Paystack webhook events"""
```

---

## User Roles and Permissions

| Role | Permissions |
|------|-------------|
| USER | Browse courses, register, make payments, view own dashboard |
| AMBASSADOR | All USER permissions + referral code, view earnings |
| ADMIN | All permissions + manage users, courses, payments, view all data |

---

## Environment Variables

### Backend (.env)

```
DATABASE_URL=postgresql://user:password@localhost:5432/educ8africa
PAYSTACK_SECRET_KEY=sk_test_xxxxx
PAYSTACK_BASE_URL=https://api.paystack.co
FRONTEND_URL=http://localhost:5173
SECRET_KEY=your-secret-key-here
APP_NAME=Educ8Africa Training System
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:8000/api
VITE_PAYSTACK_KEY=pk_test_xxxxx
```

---

## Testing Guidelines

### Backend Testing

1. Start the backend server:
   
```
bash
cd Educ8Africa
uvicorn app.main:app --reload
```

2. Open browser to `http://localhost:8000/docs`

3. Test the new profile endpoint:
   - `PATCH /api/auth/profile` - Update profile

### Frontend Testing

1. Start the frontend server:
   
```
bash
cd E8A-Registration
npm run dev
```

2. Test flows:
   - **Course Registration Status**: Navigate to courses page, verify registered courses show "Registered" button
   - Profile update (navigate to Profile, click Edit, modify fields, click Save)
   - Payment flow (use Paystack test mode)

---

## Response Schemas

### UserResponse
```
json
{
  "id": "uuid",
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone_number": "08012345678",
  "referral_code": "JOHN2024",
  "role": "user",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### CourseResponse
```
json
{
  "id": "uuid",
  "course_name": "Web Development",
  "description": "Learn web dev",
  "amount": 75000,
  "welcome_note": "Welcome!",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### RegistrationResponse
```
json
{
  "id": "uuid",
  "user_id": "uuid",
  "course_id": "uuid",
  "status": "pending",
  "referral_code_used": null,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### PaymentResponse
```
json
{
  "id": "uuid",
  "user_id": "uuid",
  "course_id": "uuid",
  "amount": 75000,
  "reference": "TRN-XXXXX",
  "status": "success",
  "paid_at": "2024-01-01T00:00:00Z",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## Common Issues and Solutions

### Issue: Course shows "Register Now" even after registration

**Solution:**
1. Ensure the user is logged in (AuthContext has user data)
2. Verify `/api/registrations` endpoint returns correct data
3. Check that `registeredCourseIds.has(course.id)` is working correctly
4. Ensure CourseCard receives `isRegistered` prop

### Issue: Payment verification fails

**Solution:**
1. Check Paystack keys are correct in .env
2. Verify the reference format matches backend expectations
3. Check network tab for API response errors
4. Ensure webhook is configured in Paystack dashboard

### Issue: Profile update not reflecting

**Solution:**
1. Verify PATCH endpoint returns updated user data
2. Check AuthContext updateUser function is called correctly
3. Ensure the form data is properly formatted before sending

---

## Conclusion

This implementation guide covers the recent updates to the Educ8Africa Training Registration System:

1. **Course Registration Status**: Frontend now shows "Registered" button for already registered courses
2. **Profile Update**: New backend endpoint and frontend integration for updating user profiles
3. **Payment Flow**: Simplified payment verification with automatic registration linking
4. **Dashboard Data**: Enhanced statistics including course enrollment counts and total paid amounts

For any issues or questions, refer to the testing guidelines or check the common issues section in this documentation.
