import os
import json
import asyncio
from playwright.async_api import async_playwright
import csv
import datetime

import config
from utils.logger import log
from utils.browser import init_browser
from utils.email import get_temp_email, get_verification_code
from utils.registration import register_user
from utils.verification import verify_email
from utils.login import login_user
from utils.workflow import complete_profile_workflow
from utils.screenshot import take_card_screenshot, take_error_screenshot
from utils.logout import logout_user

def write_result(identity_id, name, surname, email, username, status, screenshot_path):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    file_exists = os.path.exists(config.RESULTS_FILE)
    try:
        with open(config.RESULTS_FILE, "a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            if not file_exists:
                writer.writerow(["Identity ID", "Name", "Surname", "Email", "Username", "Status", "Timestamp", "Screenshot Path"])
            writer.writerow([identity_id, name, surname, email, username, status, timestamp, screenshot_path])
    except Exception as e:
        log(f"[ERROR] Failed to write result to CSV: {e}")

async def run_identity_cycle(page, identity):
    identity_id = identity["id"]
    log(f"Cycle {identity_id:03d} started")
    
    # 1. Get temporary email
    email, token = get_temp_email()
    log("Test email obtained")
    
    password = config.DEFAULT_PASSWORD
    
    # 2. Open page and Register
    log("Main website opened")
    await register_user(page, identity, email, password)
    log("Registration completed")
    
    # 3. Poll and enter OTP code
    code = get_verification_code(email)
    if not code:
        raise RuntimeError("Verification OTP code polling timed out.")
        
    await verify_email(page, code)
    log("Verification completed")
    
    # 4. Login
    await login_user(page, email, password)
    
    # Simulate video workflow step 1 (redirection/loading post login)
    log("Video workflow step 1 completed")
    
    # Navigate to profile (simulate video workflow step 2 of clicking profile)
    try:
        profile_link = page.locator("a[href*='/profile']").first
        if await profile_link.is_visible():
            await profile_link.click()
            await page.wait_for_load_state("networkidle")
        else:
            await page.goto(config.PROFILE_URL)
            await page.wait_for_load_state("networkidle")
    except Exception:
        await page.goto(config.PROFILE_URL)
        await page.wait_for_load_state("networkidle")
        
    log("Video workflow step 2 completed")
    
    # 5. Reach profile page and detect Basic data section
    card_loc = page.locator("form > div").first
    await card_loc.wait_for(state="visible", timeout=10000)
    log("Basic data section detected")
    
    # Set DOB & Gender and Save
    await complete_profile_workflow(page, identity["date_of_birth"], identity["gender"])
    
    # 6. Sign out first time
    await logout_user(page)
    log("Sign out successful")
    
    # 7. Log in again with the registered account to confirm persistence
    log("Logging in again for verification...")
    await login_user(page, email, password)
    
    # Navigate to profile again
    try:
        profile_link = page.locator("a[href*='/profile']").first
        if await profile_link.is_visible():
            await profile_link.click()
            await page.wait_for_load_state("networkidle")
        else:
            await page.goto(config.PROFILE_URL)
            await page.wait_for_load_state("networkidle")
    except Exception:
        await page.goto(config.PROFILE_URL)
        await page.wait_for_load_state("networkidle")
        
    # Verify the information persists and shows correctly
    card_loc = page.locator("form > div").first
    await card_loc.wait_for(state="visible", timeout=10000)
    log("Basic data section detected")
    
    saved_birthdate = await page.locator("input[name='birthdate']").get_attribute("value")
    saved_gender = await page.locator("input[name='gender']").get_attribute("value")
    
    parts = identity["date_of_birth"].split("/")
    expected_birthdate = f"{int(parts[1]):02d}/{int(parts[0]):02d}/{int(parts[2])}"
    expected_gender = identity["gender"].lower()
    
    log(f"Double-checking saved values on second login - Date: {saved_birthdate}, Gender: {saved_gender}")
    if saved_birthdate != expected_birthdate or saved_gender != expected_gender:
        raise ValueError("Persistence verification failed on second login.")
        
    log("Data verification successful")
    
    # Capture cropped screenshot of the card
    screenshot_path = await take_card_screenshot(page, identity)
    log("Screenshot saved")
    
    # Final Sign out
    await logout_user(page)
    log("Sign out successful")
    
    log(f"Cycle {identity_id:03d} completed")
    return email, screenshot_path

async def main():
    log("Starting EWC automation orchestrator...")
    
    # Load test identities
    identities_file = os.path.join(os.path.dirname(__file__), "identities.json")
    if not os.path.exists(identities_file):
        identities_file = "identities.json"
        
    try:
        with open(identities_file, "r", encoding="utf-8") as f:
            identities = json.load(f)
    except Exception as e:
        log(f"[CRITICAL] Failed to load identities list: {e}")
        return
        
    log(f"Loaded {len(identities)} test identities from {identities_file}")
    
    success_count = 0
    failed_count = 0
    
    async with async_playwright() as p:
        browser, context, page = await init_browser(p)
        
        for identity in identities:
            identity_id = identity["id"]
            name = identity["name"]
            surname = identity["surname"]
            username = identity["username"]
            
            try:
                email, screenshot_path = await run_identity_cycle(page, identity)
                write_result(identity_id, name, surname, email, username, "Success", screenshot_path)
                success_count += 1
            except Exception as err:
                log(f"[ERROR] Cycle {identity_id:03d} failed: {err}")
                failed_count += 1
                
                # Take error screenshot for diagnostics
                try:
                    err_shot = await take_error_screenshot(page, identity_id)
                except Exception as shot_err:
                    log(f"[ERROR] Failed to save error screenshot: {shot_err}")
                    err_shot = "Failed to capture"
                    
                write_result(identity_id, name, surname, "", username, f"Failed: {str(err)}", err_shot)
                
                # Try logging out to clean session state for next loop
                try:
                    await logout_user(page)
                except Exception:
                    pass
                    
        await browser.close()
        
    log("=========================================")
    log("AUTOMATION SYSTEM RUN COMPLETE SUMMARY:")
    log(f"Total processed: {len(identities)}")
    log(f"Successful: {success_count}")
    log(f"Failed: {failed_count}")
    log("=========================================")

if __name__ == '__main__':
    asyncio.run(main())
