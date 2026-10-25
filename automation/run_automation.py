import asyncio
import re
import os
import sys
import time
import requests
from playwright.async_api import async_playwright

# ==========================================
# 1. CONFIGURATION (Edit these links here)
# ==========================================
SIGNUP_URL = "https://esportsworldcup.com/signup?ref_club=godlike"
TEMP_MAIL_API_URL = "https://api.internal.temp-mail.io/api/v3"
# ==========================================

# Default Test Identity (used if identities.json is not found)
DEFAULT_IDENTITY = {
    "id": 1,
    "name": "Rahul",
    "surname": "Sharma",
    "username": "testusr" + str(int(time.time()))[-5:],
    "date_of_birth": "05/04/1998",
    "gender": "Male"
}

MONTHS_MAP = {
    1: "January", 2: "February", 3: "March", 4: "April",
    5: "May", 6: "June", 7: "July", 8: "August",
    9: "September", 10: "October", 11: "November", 12: "December"
}

def log(msg):
    timestamp = time.strftime("%H:%M:%S")
    print(f"[{timestamp}] {msg}", flush=True)

# Email API Helper
def get_temp_email():
    log("Obtaining new temporary email...")
    url = f"{TEMP_MAIL_API_URL}/email/new"
    try:
        response = requests.post(url, json={"min_key_len": 10, "max_key_len": 10}, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data["email"]
    except Exception as e:
        log(f"Error connecting to temp-mail API: {e}")
        raise

def get_verification_code(email, max_retries=30, delay=2):
    log(f"Polling verification email for {email}...")
    url = f"{TEMP_MAIL_API_URL}/email/{email}/messages"
    for _ in range(max_retries):
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            messages = response.json()
            if messages:
                subject = messages[0].get("subject", "")
                body = messages[0].get("body_text", "") or messages[0].get("body_html", "") or ""
                match = re.search(r'\b\d{6}\b', subject + "\n" + body)
                if match:
                    code = match.group(0)
                    log(f"Verification code found: {code}")
                    return code
        except Exception as e:
            pass
        time.sleep(delay)
    log("Failed to find verification code (timeout).")
    return None

async def main():
    log("Starting EWC standalone automation script...")
    
    # 1. Resolve Target Identity
    identity = DEFAULT_IDENTITY
    log(f"Using identity: {identity['name']} {identity['surname']} (DOB: {identity['date_of_birth']}, Gender: {identity['gender']})")
    
    # 2. Get email credentials
    try:
        email = get_temp_email()
        log(f"Email generated: {email}")
    except Exception:
        log("[CRITICAL] Could not generate test email. Verify your network or the TEMP_MAIL_API_URL.")
        return
        
    password = "TestPassword@123"
    
    async with async_playwright() as p:
        log("Launching Chromium browser...")
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1280, "height": 1000},
            ignore_https_errors=True
        )
        page = await context.new_page()
        page.set_default_timeout(30000)
        
        try:
            # 1. Go to signup and register
            log("Navigating to signup page...")
            await page.goto(SIGNUP_URL)
            await page.wait_for_load_state("networkidle")
            
            # Click accept cookies
            try:
                await page.locator("button:has-text('ACCEPT')").click(timeout=3000)
            except:
                pass
                
            log("Filling registration form...")
            await page.fill("input[name='email']", email)
            await page.fill("input[name='name']", identity["name"])
            await page.fill("input[name='surname']", identity["surname"])
            await page.fill("input[name='username']", identity["username"])
            await page.fill("input[name='password']", password)
            await page.fill("input[name='passwordConfirm']", password)
            
            # Country dropdown selection
            log("Selecting country: India...")
            await page.click("#react-select-3-input")
            await page.fill("#react-select-3-input", "India")
            await page.wait_for_timeout(1000)
            await page.click("div[id*='-option-'] >> text=India")
            
            # Form checkboxes
            await page.locator("form label").nth(0).click()
            await page.locator("form label").nth(1).click()
            
            log("Submitting registration form...")
            await page.click("button[type='submit']:has-text('CREATE ACCOUNT')")
            await page.wait_for_url("**/confirm-email**")
            log("Registration submitted.")
            
            # 2. Get and submit verification code
            code = get_verification_code(email)
            if not code:
                raise RuntimeError("Failed to receive OTP code.")
                
            confirm_inputs = await page.query_selector_all("input")
            for inp in confirm_inputs:
                if await inp.is_visible():
                    inp_type = await inp.get_attribute("type")
                    if inp_type in [None, "text", "number"]:
                        await inp.fill(code)
                        break
            await page.click("button:has-text('VERIFY EMAIL')")
            await page.wait_for_url("**/login**")
            log("Email verification complete.")
            
            # 3. Login
            log("Logging in...")
            await page.fill("input[name='username']", email)
            await page.fill("input[name='password']", password)
            await page.click("button[type='submit']:has-text('LOGIN')")
            await page.wait_for_timeout(4000)
            
            # 4. Navigate to profile
            log("Navigating to profile page...")
            # Try to click profile link first to match video flow, fallback to direct navigation
            try:
                profile_link = page.locator("a[href*='/profile']").first
                if await profile_link.is_visible():
                    await profile_link.click()
                    await page.wait_for_load_state("networkidle")
                else:
                    await page.goto("https://esportsworldcup.com/en/profile")
                    await page.wait_for_load_state("networkidle")
            except:
                await page.goto("https://esportsworldcup.com/en/profile")
                await page.wait_for_load_state("networkidle")
                
            # 5. Fill Date of Birth and Gender
            log("Filling profile details...")
            gender = identity["gender"]
            dob_str = identity["date_of_birth"]
            
            # Set Gender
            await page.click("#react-select-3-input")
            await page.fill("#react-select-3-input", gender)
            await page.wait_for_timeout(1000)
            await page.click(f"div[id*='-option-'] >> text={gender}")
            
            # Set DOB (Calendar picker navigation)
            parts = dob_str.split("/")
            day, month, year = int(parts[0]), int(parts[1]), int(parts[2])
            
            await page.click("div:has(> input[name='birthdate']) button")
            await page.wait_for_timeout(1000)
            await page.select_option("select.rdp-years_dropdown", str(year))
            await page.wait_for_timeout(500)
            
            target_month_name = MONTHS_MAP[month]
            for _ in range(24):
                caption_text = await page.locator(".rdp-month_caption").inner_text()
                lines = [line.strip() for line in caption_text.split("\n") if line.strip()]
                current_month_name = lines[0] if lines else ""
                
                if target_month_name.lower() == current_month_name.lower():
                    break
                
                current_month_idx = next(idx for idx, name in MONTHS_MAP.items() if name.lower() == current_month_name.lower())
                if month < current_month_idx:
                    await page.click("button.rdp-button_previous")
                else:
                    await page.click("button.rdp-button_next")
                await page.wait_for_timeout(500)
                
            await page.locator("button.rdp-day_button").filter(has_text=re.compile(rf"^{day}$")).click()
            await page.wait_for_timeout(1000)
            
            log("Saving profile...")
            await page.click("button[type='submit']:has-text('Save')")
            await page.wait_for_timeout(3000)
            
            # 6. Logout and log back in to verify persistence
            log("Logging out...")
            await page.click("button:has-text('SIGN OUT')")
            await page.wait_for_url("**/login**")
            
            log("Logging in again for verification...")
            await page.fill("input[name='username']", email)
            await page.fill("input[name='password']", password)
            await page.click("button[type='submit']:has-text('LOGIN')")
            await page.wait_for_timeout(4000)
            
            # Go back to profile page
            await page.goto("https://esportsworldcup.com/en/profile")
            await page.wait_for_load_state("networkidle")
            
            # Verify details are correct
            saved_birthdate = await page.locator("input[name='birthdate']").get_attribute("value")
            saved_gender = await page.locator("input[name='gender']").get_attribute("value")
            
            expected_birthdate = f"{month:02d}/{day:02d}/{year}"
            expected_gender = gender.lower()
            
            log(f"Verification - Expected: DOB={expected_birthdate}, Gender={expected_gender}")
            log(f"Verification - Found in DOM: DOB={saved_birthdate}, Gender={saved_gender}")
            
            if saved_birthdate != expected_birthdate or saved_gender != expected_gender:
                raise ValueError("Verification failed. Data did not persist correctly.")
            log("Data verification successful!")
            
            # 7. Take screenshot of basic data container
            log("Saving cropped profile card screenshot...")
            card = page.locator("form > div").first
            await card.scroll_into_view_if_needed()
            
            output_filepath = "profile_verification.png"
            await card.screenshot(path=output_filepath)
            log(f"Screenshot successfully saved to: {os.path.abspath(output_filepath)}")
            
            # Final sign out
            await page.click("button:has-text('SIGN OUT')")
            await page.wait_for_url("**/login**")
            log("Workflow completed successfully!")
            
        except Exception as err:
            log(f"Error during execution: {err}")
            err_filepath = "error_screenshot.png"
            try:
                await page.screenshot(path=err_filepath)
                log(f"Diagnostics error screenshot saved to: {os.path.abspath(err_filepath)}")
            except Exception as e:
                log(f"Failed to capture error screenshot: {e}")
                
        finally:
            await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
