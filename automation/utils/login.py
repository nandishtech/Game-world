import config
from utils.logger import log

async def login_user(page, email, password):
    log("Navigating to login page...")
    await page.goto(config.LOGIN_URL)
    await page.wait_for_load_state("networkidle")
    
    try:
        accept_btn = page.locator("button:has-text('ACCEPT')")
        if await accept_btn.is_visible():
            await accept_btn.click()
            log("Clicked cookie consent ACCEPT button.")
    except Exception as e:
        pass
        
    log(f"Entering credentials to login: {email}...")
    await page.fill("input[name='username']", email)
    await page.fill("input[name='password']", password)
    
    log("Clicking LOGIN button...")
    await page.click("button[type='submit']:has-text('LOGIN')")
    
    # Wait for login action to settle
    log("Waiting for login session initialization...")
    await page.wait_for_timeout(4000)
    log(f"Login process finished. Current URL: {page.url}")
