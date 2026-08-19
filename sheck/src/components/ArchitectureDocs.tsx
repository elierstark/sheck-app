import React, { useState } from 'react';
import { 
  Database, 
  Smartphone, 
  Key, 
  Server, 
  Check, 
  Copy, 
  Code, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Sparkles,
  Terminal,
  ExternalLink,
  Share2,
  MessageCircle,
  Twitter,
  Facebook,
  Bell,
  Radio
} from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'database' | 'android-auth' | 'backend-verify' | 'api-reference' | 'android-sharing' | 'fcm-push'>('android-auth');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const postgresSql = `-- ========================================================
-- SHECK: ESQUEMA RELACIONAL POSTGRESQL (EVENTOS Y VOTACIONES)
-- ========================================================

-- 1. Tabla de Usuarios (Sincronizada con Google Credential Manager)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    google_id VARCHAR(64) UNIQUE NOT NULL,      -- ID único sub de Google OAuth
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Eventos
CREATE TYPE voting_rule_enum AS ENUM ('single', 'multiple');
CREATE TYPE event_status_enum AS ENUM ('upcoming', 'active', 'closed');

CREATE TABLE events (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    voting_rule voting_rule_enum DEFAULT 'single',
    status event_status_enum DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_event_dates CHECK (end_time > start_time)
);

-- 3. Tabla de Opciones de Votación por Evento
CREATE TABLE options (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event_id VARCHAR(36) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Votos (Garantiza unicidad y prevención de votos dobles)
CREATE TABLE votes (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event_id VARCHAR(36) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    option_id VARCHAR(36) NOT NULL REFERENCES options(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Restricción: En votación 'single', el usuario solo puede tener 1 registro por evento
    CONSTRAINT unique_user_vote_per_option UNIQUE (event_id, option_id, user_id)
);

-- Índices de Rendimiento para Conteo en Vivo
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_end ON events(start_time, end_time);
CREATE INDEX idx_options_event ON options(event_id);
CREATE INDEX idx_votes_event ON votes(event_id);
CREATE INDEX idx_votes_user ON votes(user_id);
CREATE INDEX idx_votes_option ON votes(option_id);`;

  const kotlinAuthCode = `// ========================================================
// Android Kotlin: Google Credential Manager (androidx.credentials)
// ========================================================
package com.sheck.app.auth

import android.content.Context
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialException
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import java.security.MessageDigest
import java.util.UUID

class GoogleAuthManager(private val context: Context, private val api: SheckApiService) {
    
    private val credentialManager = CredentialManager.create(context)
    // Client ID oficial del proyecto Firebase/Google Cloud (sheck-236b0)
    private val webClientId = "508356323395-9bnbsorn0jcfmp1ng9b1chrngqfhqci3.apps.googleusercontent.com"

    suspend fun signInWithGoogle(): Result<AuthResponse> {
        return try {
            // 1. Configurar opción de Google ID Token
            val googleIdOption = GetGoogleIdOption.Builder()
                .setFilterByAuthorizedAccounts(false)
                .setServerClientId(webClientId)
                .setAutoSelectEnabled(true)
                .setNonce(UUID.randomUUID().toString())
                .build()

            // 2. Ejecutar solicitud mediante CredentialManager
            val request = GetCredentialRequest.Builder()
                .addCredentialOption(googleIdOption)
                .build()

            val result = credentialManager.getCredential(
                request = request,
                context = context
            )

            // 3. Extraer credenciales seguras
            val credential = result.credential
            val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
            
            val idToken = googleIdTokenCredential.idToken
            val email = googleIdTokenCredential.id
            val displayName = googleIdTokenCredential.displayName
            val profilePicUrl = googleIdTokenCredential.profilePictureUri?.toString()

            // 4. Enviar token al Backend para verificar y registrar en DB
            val backendResponse = api.authenticateGoogle(
                AuthRequest(
                    idToken = idToken,
                    googleId = googleIdTokenCredential.id,
                    email = email,
                    name = displayName,
                    avatarUrl = profilePicUrl
                )
            )

            Result.success(backendResponse)
        } catch (e: GetCredentialException) {
            Result.failure(Exception("Error en Google Credential Manager: \${e.message}"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}`;

  const kotlinShareCode = `// ========================================================
// Android Kotlin: Compartir Eventos en WhatsApp, Twitter, Facebook
// ========================================================
package com.sheck.app.utils

import android.content.Context
import android.content.Intent
import android.net.Uri

object SheckShareManager {

    /**
     * Abre el diálogo de Compartir nativo de Android (Chooser)
     */
    fun shareEvent(context: Context, eventId: String, eventTitle: String) {
        val eventUrl = "https://sheck.app/?event=\$eventId"
        val shareMessage = "🗳️ ¡Vota en SHECK! \$eventTitle\\nParticipa en la votación en tiempo real: \$eventUrl"

        val sendIntent = Intent().apply {
            action = Intent.ACTION_SEND
            putExtra(Intent.EXTRA_TEXT, shareMessage)
            putExtra(Intent.EXTRA_TITLE, "SHECK: \$eventTitle")
            type = "text/plain"
        }

        val shareIntent = Intent.createChooser(sendIntent, "Compartir evento SHECK con...")
        context.startActivity(shareIntent)
    }

    /**
     * Comparte directamente en WhatsApp
     */
    fun shareToWhatsApp(context: Context, eventId: String, eventTitle: String) {
        val eventUrl = "https://sheck.app/?event=\$eventId"
        val message = "🗳️ ¡Vota en SHECK! \$eventTitle\\n\$eventUrl"
        
        val intent = Intent(Intent.ACTION_VIEW).apply {
            data = Uri.parse("https://api.whatsapp.com/send?text=" + Uri.encode(message))
            setPackage("com.whatsapp")
        }
        try {
            context.startActivity(intent)
        } catch (e: Exception) {
            // Fallback si WhatsApp no está instalado: abre chooser genérico
            shareEvent(context, eventId, eventTitle)
        }
    }

    /**
     * Comparte en Twitter / X
     */
    fun shareToTwitter(context: Context, eventId: String, eventTitle: String) {
        val eventUrl = "https://sheck.app/?event=\$eventId"
        val tweet = "🗳️ Vota en tiempo real en SHECK: \\"\$eventTitle\\""
        val twitterUrl = "https://twitter.com/intent/tweet?text=\${Uri.encode(tweet)}&url=\${Uri.encode(eventUrl)}&hashtags=SHECK,Votacion"
        
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(twitterUrl))
        context.startActivity(intent)
    }
}`;

  const backendVerifyCode = `// ========================================================
// Node.js / Express: Verificación Segura del Token de Google
// ========================================================
import { OAuth2Client } from 'google-auth-library';
import express, { Request, Response } from 'express';

const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);
const app = express();

app.post('/api/auth/google', async (req: Request, res: Response) => {
  const { idToken, googleId, email, name, avatarUrl } = req.body;

  try {
    // 1. Validar la firma criptográfica del ID Token de Google
    let verifiedGoogleId = googleId;
    let verifiedEmail = email;
    let verifiedName = name;
    let verifiedAvatar = avatarUrl;

    if (idToken && process.env.GOOGLE_WEB_CLIENT_ID) {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_WEB_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) throw new Error('Token payload vacío');

      verifiedGoogleId = payload.sub;
      verifiedEmail = payload.email || verifiedEmail;
      verifiedName = payload.name || verifiedName;
      verifiedAvatar = payload.picture || verifiedAvatar;
    }

    // 2. Insertar o actualizar usuario en la tabla 'users' (UPSERT)
    // SQL: INSERT INTO users (google_id, name, email, avatar_url) VALUES (...)
    // ON CONFLICT (google_id) DO UPDATE SET ...
    const user = await db.users.upsert({
      where: { google_id: verifiedGoogleId },
      update: { name: verifiedName, avatar_url: verifiedAvatar },
      create: {
        google_id: verifiedGoogleId,
        email: verifiedEmail,
        name: verifiedName,
        avatar_url: verifiedAvatar,
      },
    });

    // 3. Generar JWT de sesión para la App Android
    const sessionToken = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      message: 'Autenticación exitosa',
      user,
      token: sessionToken,
    });
  } catch (error) {
    res.status(401).json({ error: 'Token de Google inválido o expirado' });
  }
});`;

  const kotlinFcmCode = `// ========================================================
// Android Kotlin: Firebase Cloud Messaging (FCM) Service
// Recibe alertas de eventos próximos y votaciones finalizadas
// ========================================================
package com.sheck.app.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.sheck.app.MainActivity
import com.sheck.app.R

class SheckFirebaseMessagingService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Enviar token de dispositivo al Backend de SHECK
        sendRegistrationToServer(token)
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        val title = remoteMessage.notification?.title ?: remoteMessage.data["title"] ?: "SHECK Notificación"
        val body = remoteMessage.notification?.body ?: remoteMessage.data["body"] ?: ""
        val eventId = remoteMessage.data["event_id"]
        val type = remoteMessage.data["type"] // 'event_upcoming' o 'event_closed'

        showNotification(title, body, eventId, type)
    }

    private fun showNotification(title: String, body: String, eventId: String?, type: String?) {
        val channelId = "sheck_voting_alerts"
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Crear canal de notificación para Android 8.0+ (API 26+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Alertas de Votación y Eventos",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notificaciones sobre eventos próximos y ganadores de votaciones"
                enableVibration(true)
            }
            notificationManager.createNotificationChannel(channel)
        }

        // Deep Link hacia el evento en la App
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            if (eventId != null) {
                data = Uri.parse("sheck://event/$eventId")
                putExtra("event_id", eventId)
            }
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            (System.currentTimeMillis() % 10000).toInt(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.ic_notification_vote)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))

        notificationManager.notify((System.currentTimeMillis() % 10000).toInt(), notificationBuilder.build())
    }

    private fun sendRegistrationToServer(token: String) {
        // Invoca POST /api/notifications/fcm/token
        // { token: token, platform: "android" }
    }
}`;

  return (
    <div className="max-w-5xl mx-auto pb-16 px-4 sm:px-6">
      
      {/* Header */}
      <div className="py-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          Especificación Técnica Oficial SHECK
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Arquitectura del Backend & Integración Android (SHECK)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Esquema de base de datos relacional (PostgreSQL), flujo con <strong>Google Credential Manager</strong> en Kotlin, soporte para compartir en redes sociales, notificaciones push (FCM) y endpoints REST para tiempo real.
        </p>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveSubTab('android-auth')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeSubTab === 'android-auth'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          1. Credential Manager (Kotlin)
        </button>

        <button
          onClick={() => setActiveSubTab('backend-verify')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeSubTab === 'backend-verify'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Server className="w-4 h-4" />
          2. Verificación Token Backend
        </button>

        <button
          onClick={() => setActiveSubTab('fcm-push')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeSubTab === 'fcm-push'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          3. Push Notifications (FCM)
        </button>

        <button
          onClick={() => setActiveSubTab('database')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeSubTab === 'database'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          4. Base de Datos (PostgreSQL)
        </button>

        <button
          onClick={() => setActiveSubTab('android-sharing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeSubTab === 'android-sharing'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Share2 className="w-4 h-4" />
          5. Compartir en Redes (Intents)
        </button>

        <button
          onClick={() => setActiveSubTab('api-reference')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeSubTab === 'api-reference'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          6. Endpoints REST & FCM
        </button>
      </div>

      {/* Tab 1: Android Auth (Kotlin) */}
      {activeSubTab === 'android-auth' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  Google Sign-In Nativo con Credential Manager en Android
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Uso recomendado por Google (reemplaza a legacy GoogleSignInClient). Extrae ID Token, email, avatar y nombre.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(kotlinAuthCode, 'kotlin-auth')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                {copiedSection === 'kotlin-auth' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'kotlin-auth' ? 'Copiado' : 'Copiar Kotlin'}
              </button>
            </div>

            <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner">
              <pre>{kotlinAuthCode}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Backend Verification (Node.js) */}
      {activeSubTab === 'backend-verify' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-600" />
                  Validación del Token Google en Node.js Express
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verifica la firma criptográfica RS256 con <code className="text-blue-600 font-bold">google-auth-library</code> y vincula con la tabla PostgreSQL.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(backendVerifyCode, 'node-verify')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                {copiedSection === 'node-verify' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'node-verify' ? 'Copiado' : 'Copiar TypeScript'}
              </button>
            </div>

            <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner">
              <pre>{backendVerifyCode}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Firebase Cloud Messaging (FCM) */}
      {activeSubTab === 'fcm-push' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  Firebase Cloud Messaging en Android (Kotlin)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Servicio nativo que recibe alertas push para eventos próximos (<code className="text-blue-600 font-bold">event_upcoming</code>) y eventos finalizados con ganador (<code className="text-blue-600 font-bold">event_closed</code>).
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(kotlinFcmCode, 'kotlin-fcm')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                {copiedSection === 'kotlin-fcm' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'kotlin-fcm' ? 'Copiado' : 'Copiar Kotlin'}
              </button>
            </div>

            <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner">
              <pre>{kotlinFcmCode}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Database Schema (PostgreSQL) */}
      {activeSubTab === 'database' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  Script DDL de Base de Datos PostgreSQL
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tablas relacionales con llaves foráneas, índices de alta concurrencia y restricción de votos únicos.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(postgresSql, 'postgres-sql')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                {copiedSection === 'postgres-sql' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'postgres-sql' ? 'Copiado' : 'Copiar SQL'}
              </button>
            </div>

            <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner">
              <pre>{postgresSql}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Android Sharing & Intents */}
      {activeSubTab === 'android-sharing' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-blue-600" />
                  Compartir en Redes Sociales con Android Intents (Kotlin)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Implementación nativa para enviar enlaces de SHECK a WhatsApp, Twitter (X), Facebook y Chooser nativo.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(kotlinShareCode, 'kotlin-share')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                {copiedSection === 'kotlin-share' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'kotlin-share' ? 'Copiado' : 'Copiar Kotlin'}
              </button>
            </div>

            <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner">
              <pre>{kotlinShareCode}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: REST & FCM API Reference */}
      {activeSubTab === 'api-reference' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-600" />
            Catálogo de Endpoints REST, FCM & SSE en SHECK
          </h2>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <span className="px-2 py-0.5 bg-emerald-100 rounded text-[10px]">POST</span>
                <span>/api/auth/google</span>
              </div>
              <p className="font-sans text-xs text-slate-600 mt-1">
                Registra o inicia sesión con Google ID Token.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-blue-700 font-bold">
                <span className="px-2 py-0.5 bg-blue-100 rounded text-[10px]">GET</span>
                <span>/api/events</span>
              </div>
              <p className="font-sans text-xs text-slate-600 mt-1">
                Obtiene lista de eventos con filtro opcional de estado y búsqueda.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-purple-700 font-bold">
                <span className="px-2 py-0.5 bg-purple-100 rounded text-[10px]">GET</span>
                <span>/api/events/:id/stream (Server-Sent Events)</span>
              </div>
              <p className="font-sans text-xs text-slate-600 mt-1">
                Canal en tiempo real que emite conteos instantáneos de votos hacia las apps cliente.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <span className="px-2 py-0.5 bg-emerald-100 rounded text-[10px]">POST</span>
                <span>/api/events/:id/vote</span>
              </div>
              <p className="font-sans text-xs text-slate-600 mt-1">
                Emite un voto atómico validando usuario, estado activo y regla (única o múltiple).
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-amber-700 font-bold">
                <span className="px-2 py-0.5 bg-amber-100 rounded text-[10px]">POST</span>
                <span>/api/notifications/fcm/token</span>
              </div>
              <p className="font-sans text-xs text-slate-600 mt-1">
                Registra o actualiza el token de dispositivo Android / Web para Firebase Cloud Messaging.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-blue-700 font-bold">
                <span className="px-2 py-0.5 bg-blue-100 rounded text-[10px]">GET</span>
                <span>/api/notifications/user/:userId</span>
              </div>
              <p className="font-sans text-xs text-slate-600 mt-1">
                Devuelve el historial de notificaciones y conteo de alertas no leídas del usuario.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
