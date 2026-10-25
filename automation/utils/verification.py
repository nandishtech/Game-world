import config
from utils.logger import log

async def verify_email(page, code):
    log(f"Entering verification OTP code: {code}...")
    
    confirm_inputs = await page.query_selector_all("input")
    code_field = None
    for inp in confirm_inputs:
        if await inp.is_visible():
            inp_type = await inp.get_attribute("type")
            if inp_type in [None, "text", "number"]:
                code_field = inp
                break
                
    if not code_field:
        log("[WARNING] Could not find specific visible verification input by attribute search. Falling back.")
        code_field = page.locator("input[type='text'], input[type='number']").first
        
    await code_field.fill(str(code))
    log("Verification code filled.")
    
    log("Clicking VERIFY EMAIL button...")
    await page.click("button:has-text('VERIFY EMAIL')")
    
    log("Waiting for redirection to login page...")
    await page.wait_for_url("**/login**", timeout=15000)
    log("Successfully navigated to login page.")
