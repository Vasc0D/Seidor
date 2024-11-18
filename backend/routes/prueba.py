import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

def send_email_from_gmail(to_email, subject, body):
    # Configuración del servidor SMTP de Gmail
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    from_email = "xasco2004@gmail.com"  # Cambia esto por tu correo de Gmail
    password = "vgsy srqw zqkz lyyw"  # Usa tu contraseña de Gmail o contraseña de aplicación

    # Configurar el mensaje de correo
    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        # Conectar al servidor SMTP de Gmail y enviar el correo
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Iniciar conexión segura
        server.login(from_email, password)
        server.sendmail(from_email, to_email, msg.as_string())
        server.quit()
        print("Correo enviado exitosamente.")
    except Exception as e:
        print(f"Error al enviar el correo: {e}")

# # Ejemplo de uso
# send_email_from_gmail("vdiaz4@seidor.es", "Asunto del correo", "Cuerpo del mensaje")
