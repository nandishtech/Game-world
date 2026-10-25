import re
import config
from utils.logger import log

MONTHS_MAP = {
    1: "January", 2: "February", 3: "March", 4: "April",
    5: "May", 6: "June", 7: "July", 8: "August",
    9: "September", 10: "October", 11: "November", 12: "December"
}

async def complete_profile_workflow(page, dob_str, gender):
    log("Navigating to profile page...")
    await page.goto(config.PROFILE_URL)
    await page.wait_for_load_state("networkidle")
    
    # 1. Parse Date of Birth (Format: DD/MM/YYYY)
    try:
        parts = dob_str.split("/")
        day = int(parts[0])
        month = int(parts[1])
        year = int(parts[2])
    except Exception as e:
        log(f"[ERROR] Failed to parse date of birth string '{dob_str}': {e}")
        raise ValueError(f"Invalid date of birth format: {dob_str}")

    log(f"Setting profile parameters - Date of Birth: {day}/{month}/{year}, Gender: {gender}")

    # 2. Set Gender using react-select dropdown
    log(f"Selecting Gender dropdown option: {gender}...")
    gender_input = page.locator("#react-select-3-input")
    await gender_input.click()
    await gender_input.fill(gender)
    await page.wait_for_timeout(1000)
    
    # Click the option matching the gender text
    gender_option = page.locator("div[id*='-option-']").filter(has_text=gender).first
    await gender_option.click()
    log("Gender dropdown value selected.")

    # 3. Set Date of Birth using custom calendar picker
    log("Opening Date of Birth calendar picker...")
    birthdate_btn = page.locator("div:has(> input[name='birthdate']) button")
    await birthdate_btn.click()
    await page.wait_for_timeout(1000)

    # 3a. Select Year dropdown option
    log(f"Selecting Year: {year}...")
    await page.select_option("select.rdp-years_dropdown", str(year))
    await page.wait_for_timeout(500)

    # 3b. Navigate Month (clicking previous/next month buttons)
    target_month_name = MONTHS_MAP[month]
    log(f"Navigating month to: {target_month_name}...")
    
    month_found = False
    for _ in range(24): # Max 2 years month navigation clicks to avoid infinite loop
        caption_el = page.locator(".rdp-month_caption")
        caption_text = await caption_el.inner_text()
        
        lines = [line.strip() for line in caption_text.split("\n") if line.strip()]
        current_month_name = lines[0] if lines else ""
        
        if target_month_name.lower() == current_month_name.lower():
            month_found = True
            break
            
        current_month_idx = next((idx for idx, name in MONTHS_MAP.items() if name.lower() == current_month_name.lower()), None)
        if not current_month_idx:
            log(f"[WARNING] Could not parse current calendar month name: '{current_month_name}'")
            break
            
        if month < current_month_idx:
            await page.click("button.rdp-button_previous")
        else:
            await page.click("button.rdp-button_next")
        await page.wait_for_timeout(500)
        
    if not month_found:
        raise RuntimeError("Failed to navigate to target birthdate month in calendar picker.")
        
    log("Target month reached in calendar picker.")

    # 3c. Click active day button matching the day
    log(f"Clicking day: {day}...")
    day_loc = page.locator("button.rdp-day_button").filter(has_text=re.compile(rf"^{day}$"))
    await day_loc.click()
    await page.wait_for_timeout(1000)
    log("Date of Birth selection completed.")

    # 4. Save Profile Changes
    save_btn = page.locator("button[type='submit']:has-text('Save')")
    if await save_btn.is_disabled():
        log("[WARNING] Save button is disabled even after filling profile fields.")
        
    log("Clicking Save button...")
    await save_btn.click()
    
    # Wait for network and database changes to save
    await page.wait_for_timeout(3000)
    log("Save request completed.")

    # 5. Verify the updated information
    log("Verifying profile changes by reloading...")
    await page.reload()
    await page.wait_for_load_state("networkidle")
    
    saved_birthdate = await page.locator("input[name='birthdate']").get_attribute("value")
    saved_gender = await page.locator("input[name='gender']").get_attribute("value")
    
    # The website saves the birthdate in MM/DD/YYYY format in the hidden input
    expected_birthdate = f"{month:02d}/{day:02d}/{year}"
    expected_gender = gender.lower()
    
    log(f"Verification - Expected birthdate: {expected_birthdate}, Got: {saved_birthdate}")
    log(f"Verification - Expected gender: {expected_gender}, Got: {saved_gender}")
    
    if saved_birthdate != expected_birthdate or saved_gender != expected_gender:
        raise ValueError(
            f"Verification failed. Expected Birthdate: {expected_birthdate} (got {saved_birthdate}), "
            f"Expected Gender: {expected_gender} (got {saved_gender})"
        )
        
    log("Profile information verified successfully!")
