import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

from ..config import settings

def send_email(to_email: str, subject: str, body: str):
    # Always log the email content for debugging/admin access
    print(f"==========================================")
    print(f"EMAIL TO: {to_email}")
    print(f"SUBJECT: {subject}")
    print(f"BODY: {body}")
    print(f"==========================================")

    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        print("MOCK MODE: No SMTP credentials provided.")
        return True

    try:
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_FROM_EMAIL or settings.SMTP_USERNAME
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(settings.SMTP_USERNAME, to_email, text)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
