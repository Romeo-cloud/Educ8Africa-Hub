# app/utils/referral_code.py
import random
import string


def generate_referral_code(name: str, length: int = 9) -> str:
    """
    Generate a unique referral code based on the user's name.
    Format: First part of name (uppercase) + random alphanumeric characters.
    Example: ROMEO92XA
    """
    # Take first 5 characters of the name (or less if name is shorter)
    name_part = "".join(c for c in name if c.isalpha())[:5].upper()

    # Generate random alphanumeric characters for the remaining length
    remaining_length = length - len(name_part)
    if remaining_length < 2:
        remaining_length = 4

    random_part = "".join(
        random.choices(string.ascii_uppercase + string.digits, k=remaining_length)
    )

    return f"{name_part}{random_part}"