import os

# Target URLs
BASE_URL = "https://esportsworldcup.com/signup?ref_club=godlike"
LOGIN_URL = "https://esportsworldcup.com/en/login"
PROFILE_URL = "https://esportsworldcup.com/en/profile"
TEMP_MAIL_API_URL = "https://api.internal.temp-mail.io/api/v3"

# Directories & Files
SCREENSHOTS_DIR = "screenshots"
ERROR_SCREENSHOTS_DIR = os.path.join(SCREENSHOTS_DIR, "errors")
LOG_FILE = "automation.log"
RESULTS_FILE = "results.csv"

# Browser Config
HEADLESS = True  # Runs headless to avoid visual interruptions, set to False for viewing
TIMEOUT = 30000  # Default timeout in milliseconds

# Secure Credentials
# We read the test password from environment variables if set, otherwise fallback to a secure test password.
DEFAULT_PASSWORD = os.environ.get("TEST_ACCOUNT_PASSWORD", "TestPassword@123")
