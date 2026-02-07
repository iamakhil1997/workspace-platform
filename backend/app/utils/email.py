import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..config import settings
import sys

def send_email(to_email: str, subject: str, body: str):
    # Always log the email content clearly for debugging
    # Using flush=True to ensure it appears in Render logs immediately
    print(f"==========================================", flush=True)
    print(f"EMAIL TO: {to_email}", flush=True)
    print(f"SUBJECT: {subject}", flush=True)
    print(f"BODY: {body}", flush=True)
    print(f"==========================================", flush=True)

    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        print("MOCK MODE: No SMTP credentials provided. OTP will only be in logs.", flush=True)
        return True

    try:
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_FROM_EMAIL or settings.SMTP_USERNAME
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'plain'))

        # Use SSL for port 465, TLS for others (usually 587)
        if settings.SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(settings.SMTP_SERVER, settings.SMTP_PORT)
        else:
            server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
            server.starttls()
            
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(settings.SMTP_USERNAME, to_email, text)
        server.quit()
        return True
    except Exception as e:
        print(f"CRITICAL: Failed to send email: {e}", flush=True)
        return False
