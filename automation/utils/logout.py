import config
from utils.logger import log

async def logout_user(page):
    log("Logging out current user...")
    try:
        # Navigate to profile to ensure the SIGN OUT button is accessible
        if config.PROFILE_URL not in page.url:
            log("Navigating to profile page to locate SIGN OUT button...")
            await page.goto(config.PROFILE_URL)
            await page.wait_for_load_state("networkidle")
            
        signout_btn = page.locator("button:has-text('SIGN OUT')").first
        await signout_btn.click()
        log("Clicked SIGN OUT button.")
        
        log("Waiting for redirection to login page after logout...")
        await page.wait_for_url("**/login**", timeout=15000)
        log("Successfully logged out and redirected to login page.")
    except Exception as e:
        log(f"[ERROR] Failed to logout user: {e}")
        raise
