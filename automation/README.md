# Esports World Cup Profile Automation System

A Python Playwright-based automation system for registering synthetic test accounts on the Esports World Cup platform, filling profile basic data (Date of Birth & Gender), verifying data persistence through re-login, capturing cropped screenshots of the "Basic data" card, and outputting logs and structured results reports.

## Features

- **API-based Temp Mail**: Automates account confirmation OTP receipt using `temp-mail.io` REST APIs directly for 100% speed and reliability.
- **Robust DOM Selectors**: Handles React dynamically-generated country selections, Radix-based custom calendar widgets, and react-select components.
- **Persistence Verification**: Logs out and logs back in to double-check that the updated user profile values persist in the backend database.
- **Cropped Screenshot Capture**: Uses Playwright element-level screenshots to crop only the relevant "Basic data" card for output verification.
- **Log & Report Generation**: Appends timestamped execution events to `automation.log` and status results to `results.csv`.

---

## Directory Structure

```text
automation/
│
├── main.py                  # Main orchestration script
├── config.py                # Environment and selector configurations
├── requirements.txt         # Dependencies
├── README.md                # Project documentation
├── identities.json          # Synthetic test identities input list
├── automation.log           # Output timestamped events log
├── results.csv              # Output structured status results
│
├── screenshots/             # Output folder for card screenshots
│   └── errors/              # Output folder for error screenshots (for diagnostics)
│
└── utils/                   # Helper modules
    ├── browser.py           # Playwright Chromium browser launch
    ├── email.py             # Temp-mail API interactions
    ├── logger.py            # Event logging handler
    ├── login.py             # Login form filling
    ├── logout.py            # Logout redirection handler
    ├── registration.py      # Registration form & country selection
    ├── screenshot.py        # Card element and error captures
    ├── verification.py      # OTP verification page form filling
    └── workflow.py          # DOB calendar picker & Gender selection
```

---

## Setup & Installation

1. **Python**: Make sure Python 3.8+ is installed.
2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Install Playwright Browsers**:
   ```bash
   playwright install chromium
   ```

---

## Execution

To run the automation cycle across all identities configured in `identities.json`:

```bash
python main.py
```

### Configurations

You can edit `config.py` to change settings:
- `HEADLESS`: Set to `False` to watch the browser automate the UI steps in real-time.
- `DEFAULT_PASSWORD`: Custom default password for all created test accounts (can also be set via `TEST_ACCOUNT_PASSWORD` environment variable).
- `TIMEOUT`: Playwright action timeout in milliseconds.
