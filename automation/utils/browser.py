from playwright.async_api import async_playwright
import config
from utils.logger import log

async def init_browser(playwright_instance):
    log("Launching Chromium browser...")
    browser = await playwright_instance.chromium.launch(
        headless=config.HEADLESS
    )
    context = await browser.new_context(
        viewport={"width": 1280, "height": 1000},
        ignore_https_errors=True
    )
    page = await context.new_page()
    # Configure default timeout from config
    page.set_default_timeout(config.TIMEOUT)
    log(f"Browser launched (Headless={config.HEADLESS}, Viewport=1280x1000)")
    return browser, context, page
