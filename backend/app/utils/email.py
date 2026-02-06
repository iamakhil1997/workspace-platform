import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from ..config import settings

# For development, we will just print the OTP to the console
SMTP_SERVER = settings.SMTP_SERVER
SMTP_PORT = settings.SMTP_PORT
SMTP_USERNAME = settings.SMTP_USERNAME
SMTP_PASSWORD = settings.SMTP_PASSWORD

def send_email(to_email: str, subject: str, body: str):
    # Always log the email content for debugging/admin access so OTP is never lost
    print(f"==========================================")
    print(f"EMAIL TO: {to_email}")
    print(f"SUBJECT: {subject}")
    print(f"BODY: {body}")
    print(f"==========================================")

    if not SMTP_USERNAME:
        print("MOCK MODE: No SMTP credentials provided.")
        return True

    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(SMTP_USERNAME, to_email, text)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
