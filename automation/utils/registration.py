import config
from utils.logger import log

async def register_user(page, identity, email, password):
    log("Navigating to signup page...")
    await page.goto(config.BASE_URL)
    await page.wait_for_load_state("networkidle")
    
    # 1. Accept cookie consent if visible
    try:
        accept_btn = page.locator("button:has-text('ACCEPT')")
        if await accept_btn.is_visible():
            await accept_btn.click()
            log("Clicked cookie consent ACCEPT button.")
    except Exception as e:
        log(f"No cookie consent button clicked or failed: {e}")
        
    # 2. Fill registration details
    name = identity["name"]
    surname = identity["surname"]
    username = identity["username"]
    
    log(f"Filling registration details for: {name} {surname} (username: {username})...")
    await page.fill("input[name='email']", email)
    await page.fill("input[name='name']", name)
    await page.fill("input[name='surname']", surname)
    await page.fill("input[name='username']", username)
    await page.fill("input[name='password']", password)
    await page.fill("input[name='passwordConfirm']", password)
    
    # 3. Select Country: India
    log("Selecting country: India...")
    country_input = page.locator("#react-select-3-input")
    await country_input.click()
    await country_input.fill("India")
    await page.wait_for_timeout(1000) # Wait for option to render
    
    country_option = page.locator("div[id*='-option-']").filter(has_text="India").first
    await country_option.click()
    log("Country selected successfully.")
    
    # 4. Accept checkboxes: Terms & Privacy
    log("Checking Terms and Privacy checkboxes...")
    # Label 0: Terms & conditions, Label 1: Privacy policy
    await page.locator("form label").nth(0).click()
    await page.locator("form label").nth(1).click()
    log("Checkboxes checked.")
    
    # 5. Click submit
    log("Submitting registration form...")
    await page.click("button[type='submit']:has-text('CREATE ACCOUNT')")
    
    # 6. Wait for redirect
    log("Waiting for confirmation page URL redirection...")
    await page.wait_for_url("**/confirm-email**", timeout=15000)
    log("Successfully navigated to confirmation page.")
