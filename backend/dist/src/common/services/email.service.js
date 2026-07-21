"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let EmailService = class EmailService {
    constructor(config) {
        this.config = config;
        this.fromEmail = this.config.get('EMAIL_FROM', 'noreply@gestionar2.com');
        this.appUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000');
    }
    async sendPasswordResetEmail(email, name, token) {
        const resetUrl = `${this.appUrl}/auth/reset-password?token=${token}`;
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperar Contraseña - GESTIONAR2</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            color: #333;
            margin-bottom: 20px;
          }
          .message {
            font-size: 16px;
            color: #666;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .button {
            display: inline-block;
            padding: 15px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
          }
          .button:hover {
            opacity: 0.9;
          }
          .alternative {
            font-size: 14px;
            color: #666;
            margin-top: 20px;
            padding: 15px;
            background-color: #f8f8f8;
            border-radius: 5px;
            word-break: break-all;
          }
          .footer {
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #eee;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .warning-text {
            color: #856404;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>GESTIONAR2</h1>
          </div>
          <div class="content">
            <div class="greeting">Hola ${name},</div>
            <div class="message">
              Recibimos una solicitud para restablecer la contraseña de tu cuenta.
              Si realizaste esta solicitud, hacé clic en el siguiente botón para crear una nueva contraseña:
            </div>
            <div class="button-container">
              <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            </div>
            <div class="message">
              Este enlace expirará en <strong>1 hora</strong> por razones de seguridad.
            </div>
            <div class="warning">
              <div class="warning-text">
                <strong>⚠️ Si no solicitaste este cambio, podés ignorar este correo de forma segura.</strong>
                Tu contraseña no será modificada.
              </div>
            </div>
            <div class="message">
              <strong>Enlace alternativo:</strong><br>
              Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br>
              <div class="alternative">${resetUrl}</div>
            </div>
          </div>
          <div class="footer">
            <p>Este correo fue enviado por GESTIONAR2</p>
            <p>Si tenés preguntas, contactá con nuestro equipo de soporte.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        console.log('========================================');
        console.log('📧 EMAIL DE RECUPERACIÓN DE CONTRASEÑA');
        console.log('========================================');
        console.log(`Para: ${email}`);
        console.log(`Nombre: ${name}`);
        console.log(`URL de recuperación: ${resetUrl}`);
        console.log(`Token: ${token}`);
        console.log('========================================');
        console.log('Contenido HTML del email:');
        console.log(html);
        console.log('========================================');
        return { success: true, message: 'Email de recuperación enviado (simulado)' };
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map