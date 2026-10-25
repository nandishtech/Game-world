import requests
import re
import time
import config
from utils.logger import log

def get_temp_email():
    log("Requesting new temporary email from API...")
    url = f"{config.TEMP_MAIL_API_URL}/email/new"
    try:
        response = requests.post(url, json={"min_key_len": 10, "max_key_len": 10}, timeout=10)
        response.raise_for_status()
        data = response.json()
        email = data["email"]
        token = data["token"]
        log(f"Test email obtained: {email}")
        return email, token
    except Exception as e:
        log(f"Error obtaining test email: {e}")
        raise

def get_verification_code(email, max_retries=30, delay=2):
    log(f"Polling verification email for {email}...")
    url = f"{config.TEMP_MAIL_API_URL}/email/{email}/messages"
    for i in range(max_retries):
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            messages = response.json()
            if messages:
                for msg in messages:
                    subject = msg.get("subject", "")
                    body = msg.get("body_text", "") or msg.get("body_html", "") or ""
                    # Search for 6-digit OTP verification code
                    match = re.search(r'\b\d{6}\b', subject + "\n" + body)
                    if match:
                        code = match.group(0)
                        log(f"Verification code found: {code}")
                        return code
        except Exception as e:
            log(f"Error polling emails: {e}")
        time.sleep(delay)
    log("Failed to retrieve verification code (timeout reached).")
    return None
