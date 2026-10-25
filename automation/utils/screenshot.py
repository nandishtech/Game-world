import os
import datetime
import config
from utils.logger import log

def ensure_directories():
    os.makedirs(config.SCREENSHOTS_DIR, exist_ok=True)
    os.makedirs(config.ERROR_SCREENSHOTS_DIR, exist_ok=True)

async def take_card_screenshot(page, identity):
    ensure_directories()
    
    identity_id = identity["id"]
    filename = f"identity_{identity_id:03d}.png"
    filepath = os.path.join(config.SCREENSHOTS_DIR, filename)
    
    log(f"Capturing screenshot of Basic data card for identity ID {identity_id}...")
    
    card = page.locator("form > div").first
    await card.scroll_into_view_if_needed()
    
    await card.screenshot(path=filepath)
    log(f"Screenshot successfully saved to: {filepath}")
    return filepath

async def take_error_screenshot(page, identity_id):
    ensure_directories()
    
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"error_{identity_id:03d}_{timestamp}.png"
    filepath = os.path.join(config.ERROR_SCREENSHOTS_DIR, filename)
    
    log(f"[ERROR] Capturing page error screenshot for identity ID {identity_id}...")
    await page.screenshot(path=filepath)
    log(f"Error screenshot saved to: {filepath}")
    return filepath
