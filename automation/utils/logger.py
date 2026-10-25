import datetime
import os
import config

def get_timestamp():
    return datetime.datetime.now().strftime("%H:%M:%S")

def log(message):
    timestamp = get_timestamp()
    log_line = f"[{timestamp}] {message}"
    print(log_line, flush=True)
    try:
        # Resolve log path relative to config.py or working directory
        log_path = config.LOG_FILE
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(log_line + "\n")
    except Exception as e:
        print(f"[{timestamp}] [ERROR] Failed to write to log file: {e}", flush=True)
