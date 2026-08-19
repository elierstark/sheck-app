import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { User, EventItem, Option, VoteRecord, CreateEventPayload, NotificationItem, FCMDeviceToken } from './src/types';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// In-Memory Database (mimicking SQL relational tables)
const usersTable: User[] = [
  {
    id: 'usr_1',
    google_id: '109876543210987654321',
    name: 'Elie Rivero',
    email: 'elierivero91@gmail.com',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  {
    id: 'usr_2',
    google_id: '109876543210987654322',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@techdev.io',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'usr_3',
    google_id: '109876543210987654323',
    name: 'Sofía Valenzuela',
    email: 'sofia.valenzuela@designstudio.com',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

const now = Date.now();

// Firebase Cloud Messaging Device Tokens Table
const fcmTokensTable: FCMDeviceToken[] = [
  {
    token: 'fcm_token_web_usr1_android_emulator_sheck_app',
    user_id: 'usr_1',
    platform: 'android',
    created_at: new Date(now - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    token: 'fcm_token_web_usr2_chrome_desktop',
    user_id: 'usr_2',
    platform: 'web',
    created_at: new Date(now - 1000 * 60 * 60 * 12).toISOString()
  }
];

// In-App & Push Notifications Table
const notificationsTable: NotificationItem[] = [
  {
    id: 'notif_1',
    user_id: 'usr_1',
    event_id: 'evt_1',
    type: 'event_upcoming',
    title: '⏰ Evento próximo a iniciar: Hackathon Mobile 2026',
    body: 'La votación en vivo para la Mejor App de Inteligencia Artificial está por abrir. ¡Prepárate para emitir tu voto!',
    read: false,
    created_at: new Date(now - 1000 * 60 * 25).toISOString(),
    data: {
      event_id: 'evt_1',
      event_title: 'Hackathon Mobile 2026: Mejor App de Inteligencia Artificial',
      start_time: new Date(now - 1000 * 60 * 30).toISOString()
    }
  },
  {
    id: 'notif_2',
    user_id: 'usr_1',
    event_id: 'evt_3',
    type: 'event_closed',
    title: '🏆 Votación finalizada: Sede Encuentro 2026',
    body: 'El evento en el que votaste ha concluido. La opción ganadora es "Tokio, Japón (Shibuya Hub)" con el 58% de los votos.',
    read: true,
    created_at: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
    data: {
      event_id: 'evt_3',
      event_title: 'Sede para el Encuentro Global de Desarrolladores 2026',
      winner_option_title: 'Tokio, Japón (Shibuya Hub)',
      winner_option_percentage: 58
    }
  }
];

let eventsTable: EventItem[] = [
  {
    id: 'evt_1',
    user_id: 'usr_1',
    creator_name: 'Elie Rivero',
    creator_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Hackathon Mobile 2026: Mejor App de Inteligencia Artificial',
    description: 'Vota en tiempo real por el proyecto más innovador desarrollado durante las 48 horas de hackathon. La votación se cerrará automáticamente.',
    image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    start_time: new Date(now - 1000 * 60 * 30).toISOString(), // started 30 mins ago
    end_time: new Date(now + 1000 * 60 * 45).toISOString(), // ends in 45 mins
    status: 'active',
    voting_rule: 'single',
    options: [
      {
        id: 'opt_1_1',
        event_id: 'evt_1',
        title: 'MedSync AI – Triaje Clínico Predictivo',
        image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&auto=format&fit=crop&q=80',
        votes_count: 42,
        percentage: 42
      },
      {
        id: 'opt_1_2',
        event_id: 'evt_1',
        title: 'EcoRoute – Movilidad Eléctrica Inteligente',
        image_url: 'https://images.unsplash.com/photo-1558441719-2347b73f861b?w=400&auto=format&fit=crop&q=80',
        votes_count: 35,
        percentage: 35
      },
      {
        id: 'opt_1_3',
        event_id: 'evt_1',
        title: 'NeuroLearn – Tutor Adaptativo en Realidad Aumentada',
        image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&auto=format&fit=crop&q=80',
        votes_count: 23,
        percentage: 23
      }
    ],
    total_votes: 100,
    created_at: new Date(now - 1000 * 60 * 60).toISOString()
  },
  {
    id: 'evt_2',
    user_id: 'usr_3',
    creator_name: 'Sofía Valenzuela',
    creator_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    title: 'Elección de Framework Móvil: Próximo Proyecto Core',
    description: 'Definición de la arquitectura base para la nueva generación de aplicaciones de la empresa. Puedes votar por múltiples opciones.',
    image_url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=80',
    start_time: new Date(now - 1000 * 60 * 120).toISOString(),
    end_time: new Date(now + 1000 * 60 * 180).toISOString(), // ends in 3 hours
    status: 'active',
    voting_rule: 'multiple',
    options: [
      {
        id: 'opt_2_1',
        event_id: 'evt_2',
        title: 'Kotlin Multiplatform (KMP) + Jetpack Compose',
        image_url: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=400&auto=format&fit=crop&q=80',
        votes_count: 58,
        percentage: 51
      },
      {
        id: 'opt_2_2',
        event_id: 'evt_2',
        title: 'Flutter 3.x (Dart) con Impeller Engine',
        image_url: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=400&auto=format&fit=crop&q=80',
        votes_count: 40,
        percentage: 35
      },
      {
        id: 'opt_2_3',
        event_id: 'evt_2',
        title: 'React Native New Architecture (Fabric + TurboModules)',
        image_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&auto=format&fit=crop&q=80',
        votes_count: 15,
        percentage: 14
      }
    ],
    total_votes: 113,
    created_at: new Date(now - 1000 * 60 * 150).toISOString()
  },
  {
    id: 'evt_3',
    user_id: 'usr_2',
    creator_name: 'Carlos Mendoza',
    creator_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Sede para el Encuentro Global de Desarrolladores 2026',
    description: 'Evento concluido. Los votos han sido consolidados y la sede ganadora fue confirmada.',
    image_url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80',
    start_time: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
    end_time: new Date(now - 1000 * 60 * 60 * 2).toISOString(), // closed 2 hours ago
    status: 'closed',
    voting_rule: 'single',
    options: [
      {
        id: 'opt_3_1',
        event_id: 'evt_3',
        title: 'Tokio, Japón (Shibuya Hub)',
        image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&auto=format&fit=crop&q=80',
        votes_count: 145,
        percentage: 58
      },
      {
        id: 'opt_3_2',
        event_id: 'evt_3',
        title: 'Barcelona, España (Tech City Hub)',
        image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&auto=format&fit=crop&q=80',
        votes_count: 75,
        percentage: 30
      },
      {
        id: 'opt_3_3',
        event_id: 'evt_3',
        title: 'San Francisco, EE.UU. (Moscone Center)',
        image_url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&auto=format&fit=crop&q=80',
        votes_count: 30,
        percentage: 12
      }
    ],
    total_votes: 250,
    winning_option_id: 'opt_3_1',
    created_at: new Date(now - 1000 * 60 * 60 * 50).toISOString()
  }
];

const votesTable: VoteRecord[] = [
  {
    id: 'vote_init_1',
    event_id: 'evt_1',
    option_id: 'opt_1_1',
    user_id: 'usr_2',
    user_name: 'Carlos Mendoza',
    timestamp: new Date(now - 1000 * 60 * 20).toISOString()
  },
  {
    id: 'vote_init_2',
    event_id: 'evt_1',
    option_id: 'opt_1_2',
    user_id: 'usr_3',
    user_name: 'Sofía Valenzuela',
    timestamp: new Date(now - 1000 * 60 * 15).toISOString()
  }
];

// SSE listeners map for real-time live voting broadcast
const sseClients = new Map<string, Response[]>();

// Global notification broadcast stream listeners
const notificationSseClients = new Map<string, Response[]>();

function broadcastEventUpdate(eventId: string) {
  const event = getCalculatedEvent(eventId);
  if (!event) return;

  const clients = sseClients.get(eventId) || [];
  const payload = JSON.stringify({ type: 'EVENT_UPDATE', data: event });

  clients.forEach((client) => {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      // client disconnected
    }
  });
}

function dispatchNotification(notificationData: Omit<NotificationItem, 'id' | 'created_at' | 'read'>) {
  const newNotif: NotificationItem = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    user_id: notificationData.user_id,
    event_id: notificationData.event_id,
    type: notificationData.type,
    title: notificationData.title,
    body: notificationData.body,
    read: false,
    created_at: new Date().toISOString(),
    data: notificationData.data
  };

  notificationsTable.unshift(newNotif);

  // Send SSE push to user if connected
  const userClients = notificationSseClients.get(newNotif.user_id) || [];
  const payload = JSON.stringify({ type: 'NEW_NOTIFICATION', data: newNotif });

  userClients.forEach((client) => {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      // client disconnected
    }
  });

  return newNotif;
}

function getCalculatedEvent(eventId: string): EventItem | undefined {
  const event = eventsTable.find((e) => e.id === eventId);
  if (!event) return undefined;

  const currentNow = Date.now();
  const startTime = new Date(event.start_time).getTime();
  const endTime = new Date(event.end_time).getTime();

  let calculatedStatus: 'upcoming' | 'active' | 'closed' = event.status;
  if (currentNow < startTime) {
    calculatedStatus = 'upcoming';
  } else if (currentNow >= startTime && currentNow <= endTime) {
    calculatedStatus = 'active';
  } else {
    calculatedStatus = 'closed';
  }

  // Recalculate vote counts directly from votesTable for consistency
  const eventVotes = votesTable.filter((v) => v.event_id === eventId);
  const totalVotes = eventVotes.length;

  let maxVotes = -1;
  let winningId: string | undefined = undefined;

  const updatedOptions = event.options.map((opt) => {
    const count = eventVotes.filter((v) => v.option_id === opt.id).length;
    const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
    if (count > maxVotes && count > 0) {
      maxVotes = count;
      winningId = opt.id;
    }
    return {
      ...opt,
      votes_count: count,
      percentage
    };
  });

  return {
    ...event,
    status: calculatedStatus,
    options: updatedOptions,
    total_votes: totalVotes,
    winning_option_id: calculatedStatus === 'closed' ? winningId : undefined
  };
}

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// Auth / Google Sign-In Endpoint (Used by Android Credential Manager & Web)
app.post('/api/auth/google', (req: Request, res: Response) => {
  const { id_token, google_id, email, name, avatar_url } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email requerido para autenticación.' });
  }

  // Find or create user
  const effectiveGoogleId = google_id || (id_token ? `google_${id_token.substring(0, 16)}` : `gid_${Date.now()}`);
  let user = usersTable.find((u) => u.google_id === effectiveGoogleId || u.email === email);

  if (user) {
    // Update existing user with freshest profile info
    if (name) user.name = name;
    if (avatar_url) user.avatar_url = avatar_url;
  } else {
    user = {
      id: `usr_${Date.now()}`,
      google_id: effectiveGoogleId,
      name: name || email.split('@')[0],
      email: email,
      avatar_url: avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      created_at: new Date().toISOString()
    };
    usersTable.push(user);
  }

  return res.json({
    message: 'Autenticación exitosa',
    user,
    token: `bearer_token_${user.id}_${Date.now()}`
  });
});

// List users for demo switching
app.get('/api/users', (req: Request, res: Response) => {
  res.json({ users: usersTable });
});

// Get all events
app.get('/api/events', (req: Request, res: Response) => {
  const { status, user_id } = req.query;

  let calculatedEvents = eventsTable.map((e) => getCalculatedEvent(e.id)!);

  if (status && typeof status === 'string') {
    calculatedEvents = calculatedEvents.filter((e) => e.status === status);
  }

  if (user_id && typeof user_id === 'string') {
    calculatedEvents = calculatedEvents.filter((e) => e.user_id === user_id);
  }

  // Sort: active first, then upcoming, then closed
  calculatedEvents.sort((a, b) => {
    const order = { active: 0, upcoming: 1, closed: 2 };
    return order[a.status] - order[b.status];
  });

  res.json({ events: calculatedEvents });
});

// Get single event by ID (with user vote status)
app.get('/api/events/:id', (req: Request, res: Response) => {
  const event = getCalculatedEvent(req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Evento no encontrado' });
  }

  const { user_id } = req.query;
  let userVotedOptionIds: string[] = [];

  if (user_id && typeof user_id === 'string') {
    userVotedOptionIds = votesTable
      .filter((v) => v.event_id === event.id && v.user_id === user_id)
      .map((v) => v.option_id);
  }

  res.json({
    event,
    user_voted_options: userVotedOptionIds,
    has_voted: userVotedOptionIds.length > 0
  });
});

// Create new event
app.post('/api/events', (req: Request, res: Response) => {
  const payload: CreateEventPayload = req.body;

  if (!payload.title || !payload.start_time || !payload.end_time || !payload.options || payload.options.length < 2) {
    return res.status(400).json({ error: 'El evento debe incluir título, fechas y al menos 2 opciones de votación.' });
  }

  const creator = usersTable.find((u) => u.id === payload.user_id) || usersTable[0];
  const newEventId = `evt_${Date.now()}`;

  const options: Option[] = payload.options.map((opt, idx) => ({
    id: `opt_${newEventId}_${idx + 1}`,
    event_id: newEventId,
    title: opt.title,
    image_url: opt.image_url || undefined,
    votes_count: 0,
    percentage: 0
  }));

  const newEvent: EventItem = {
    id: newEventId,
    user_id: creator.id,
    creator_name: creator.name,
    creator_avatar: creator.avatar_url,
    title: payload.title,
    description: payload.description || '',
    image_url: payload.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    start_time: new Date(payload.start_time).toISOString(),
    end_time: new Date(payload.end_time).toISOString(),
    status: 'active',
    voting_rule: payload.voting_rule || 'single',
    options,
    total_votes: 0,
    created_at: new Date().toISOString()
  };

  eventsTable.unshift(newEvent);

  // Auto-dispatch push notification for other users about the new/upcoming event
  usersTable.forEach((u) => {
    if (u.id !== creator.id) {
      dispatchNotification({
        user_id: u.id,
        event_id: newEventId,
        type: 'event_upcoming',
        title: `🗳️ Nuevo evento disponible: ${newEvent.title}`,
        body: `Creado por ${creator.name}. ¡Ingresa para conocer las opciones y participar en la votación!`,
        data: {
          event_id: newEventId,
          event_title: newEvent.title,
          start_time: newEvent.start_time
        }
      });
    }
  });

  const calculated = getCalculatedEvent(newEventId);
  res.status(201).json({ message: 'Evento creado exitosamente', event: calculated });
});

// Vote in an event
app.post('/api/events/:id/vote', (req: Request, res: Response) => {
  const eventId = req.params.id;
  const { optionIds, userId }: { optionIds: string[]; userId: string } = req.body;

  const event = getCalculatedEvent(eventId);
  if (!event) {
    return res.status(404).json({ error: 'Evento no encontrado' });
  }

  if (event.status === 'closed') {
    return res.status(400).json({ error: 'La votación ha concluido. No se aceptan más votos.' });
  }

  if (event.status === 'upcoming') {
    return res.status(400).json({ error: 'El evento aún no ha iniciado.' });
  }

  if (!optionIds || !Array.isArray(optionIds) || optionIds.length === 0) {
    return res.status(400).json({ error: 'Debes seleccionar al menos una opción.' });
  }

  const user = usersTable.find((u) => u.id === userId);
  const userName = user ? user.name : 'Usuario Anónimo';

  // Check if user already voted in this event
  const existingUserVotes = votesTable.filter((v) => v.event_id === eventId && v.user_id === userId);

  if (event.voting_rule === 'single') {
    if (existingUserVotes.length > 0) {
      return res.status(409).json({ error: 'Ya has emitido tu voto en este evento (Regla de Voto Único).' });
    }
    if (optionIds.length > 1) {
      return res.status(400).json({ error: 'Este evento solo permite elegir 1 sola opción.' });
    }
  }

  // Record votes
  for (const optId of optionIds) {
    const validOption = event.options.find((o) => o.id === optId);
    if (!validOption) continue;

    // In multi-vote, avoid voting twice for the exact same option
    const alreadyVotedThisOption = existingUserVotes.some((v) => v.option_id === optId);
    if (!alreadyVotedThisOption) {
      votesTable.push({
        id: `vote_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        event_id: eventId,
        option_id: optId,
        user_id: userId,
        user_name: userName,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Recalculate event and broadcast SSE
  const updated = getCalculatedEvent(eventId);
  broadcastEventUpdate(eventId);

  const userVotedOptionIds = votesTable
    .filter((v) => v.event_id === eventId && v.user_id === userId)
    .map((v) => v.option_id);

  res.json({
    message: '¡Voto registrado con éxito!',
    event: updated,
    user_voted_options: userVotedOptionIds
  });
});

// SSE Live Stream for Real-time Vote Counts
app.get('/api/events/:id/stream', (req: Request, res: Response) => {
  const eventId = req.params.id;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  if (!sseClients.has(eventId)) {
    sseClients.set(eventId, []);
  }
  sseClients.get(eventId)!.push(res);

  // Send initial state immediately
  const event = getCalculatedEvent(eventId);
  if (event) {
    res.write(`data: ${JSON.stringify({ type: 'EVENT_UPDATE', data: event })}\n\n`);
  }

  req.on('close', () => {
    const clients = sseClients.get(eventId) || [];
    sseClients.set(
      eventId,
      clients.filter((c) => c !== res)
    );
  });
});

// Force finish/close event (for testing countdown / winner highlight)
app.post('/api/events/:id/close', (req: Request, res: Response) => {
  const event = eventsTable.find((e) => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Evento no encontrado' });

  event.end_time = new Date(Date.now() - 1000).toISOString();
  event.status = 'closed';

  const calculated = getCalculatedEvent(req.params.id);
  broadcastEventUpdate(req.params.id);

  // Find all unique users who voted in this event
  const voterUserIds = Array.from(
    new Set(votesTable.filter((v) => v.event_id === req.params.id).map((v) => v.user_id))
  );

  const winningOption = calculated?.options.find((o) => o.id === calculated.winning_option_id);
  const winnerTitle = winningOption ? winningOption.title : 'Sin votos registrados';
  const winnerPct = winningOption ? winningOption.percentage : 0;

  // Send push notification to every voter alerting them the event ended
  voterUserIds.forEach((voterId) => {
    dispatchNotification({
      user_id: voterId,
      event_id: req.params.id,
      type: 'event_closed',
      title: `🏆 Votación finalizada: ${event.title}`,
      body: `El evento en el que participaste ha concluido. Ganador: "${winnerTitle}" con el ${winnerPct}% de los votos.`,
      data: {
        event_id: req.params.id,
        event_title: event.title,
        winner_option_title: winnerTitle,
        winner_option_percentage: winnerPct
      }
    });
  });

  // Also notify the event creator if they haven't voted
  if (!voterUserIds.includes(event.user_id)) {
    dispatchNotification({
      user_id: event.user_id,
      event_id: req.params.id,
      type: 'event_closed',
      title: `🏆 Tu evento ha concluido: ${event.title}`,
      body: `La votación se cerró con ${calculated?.total_votes || 0} votos. Opción líder: "${winnerTitle}".`,
      data: {
        event_id: req.params.id,
        event_title: event.title,
        winner_option_title: winnerTitle,
        winner_option_percentage: winnerPct
      }
    });
  }

  res.json({ message: 'Evento finalizado y notificaciones enviadas', event: calculated, votersNotified: voterUserIds.length });
});

// -------------------------------------------------------------
// NOTIFICATIONS & FIREBASE CLOUD MESSAGING (FCM) ENDPOINTS
// -------------------------------------------------------------

// Get notifications for a user
app.get('/api/notifications/user/:userId', (req: Request, res: Response) => {
  const userId = req.params.userId;
  const userNotifs = notificationsTable
    .filter((n) => n.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const unreadCount = userNotifs.filter((n) => !n.read).length;

  res.json({
    notifications: userNotifs,
    unread_count: unreadCount
  });
});

// Register FCM Device Token for Web / Android
app.post('/api/notifications/fcm/token', (req: Request, res: Response) => {
  const { token, user_id, platform } = req.body;

  if (!token || !user_id) {
    return res.status(400).json({ error: 'Token y user_id requeridos' });
  }

  // Remove existing token record if re-registering
  const existingIdx = fcmTokensTable.findIndex((t) => t.token === token);
  if (existingIdx !== -1) {
    fcmTokensTable.splice(existingIdx, 1);
  }

  const newDeviceToken: FCMDeviceToken = {
    token,
    user_id,
    platform: platform || 'web',
    created_at: new Date().toISOString()
  };

  fcmTokensTable.push(newDeviceToken);

  res.json({
    message: 'Token de dispositivo FCM registrado exitosamente',
    device: newDeviceToken
  });
});

// Get registered FCM tokens list
app.get('/api/notifications/fcm/tokens', (req: Request, res: Response) => {
  res.json({ tokens: fcmTokensTable });
});

// Mark single notification as read
app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  const notif = notificationsTable.find((n) => n.id === req.params.id);
  if (!notif) return res.status(404).json({ error: 'Notificación no encontrada' });

  notif.read = true;
  res.json({ message: 'Notificación marcada como leída', notification: notif });
});

// Mark all notifications as read for a user
app.post('/api/notifications/mark-all-read', (req: Request, res: Response) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id requerido' });

  notificationsTable.forEach((n) => {
    if (n.user_id === user_id) {
      n.read = true;
    }
  });

  res.json({ message: 'Todas las notificaciones marcadas como leídas' });
});

// Trigger a Test FCM Notification
app.post('/api/notifications/send-test', (req: Request, res: Response) => {
  const { user_id, type, event_id } = req.body;
  const targetUser = usersTable.find((u) => u.id === user_id) || usersTable[0];
  const targetEvent = eventsTable.find((e) => e.id === event_id) || eventsTable[0];

  let title = '🔔 Alerta de prueba SHECK (FCM)';
  let body = 'Las notificaciones push de Firebase Cloud Messaging están conectadas correctamente.';
  let notifType: 'event_upcoming' | 'event_closed' | 'fcm_system_alert' = type || 'event_upcoming';

  if (notifType === 'event_upcoming') {
    title = `⏰ Evento próximo a iniciar: ${targetEvent.title}`;
    body = `La votación abrirá pronto. Entra ahora para participar con tu cuenta de Google.`;
  } else if (notifType === 'event_closed') {
    const winning = targetEvent.options[0];
    title = `🏆 Votación finalizada: ${targetEvent.title}`;
    body = `El evento en el que votaste ha concluido. La opción ganadora es "${winning?.title || 'Opción 1'}" con el 55% de los votos.`;
  }

  const newNotif = dispatchNotification({
    user_id: targetUser.id,
    event_id: targetEvent.id,
    type: notifType,
    title,
    body,
    data: {
      event_id: targetEvent.id,
      event_title: targetEvent.title,
      winner_option_title: targetEvent.options[0]?.title,
      winner_option_percentage: 55
    }
  });

  res.json({
    message: 'Notificación push simulada con éxito',
    notification: newNotif,
    fcm_target_user: targetUser.name
  });
});

// SSE Live Stream for Instant User Notifications
app.get('/api/notifications/stream/:userId', (req: Request, res: Response) => {
  const userId = req.params.userId;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  if (!notificationSseClients.has(userId)) {
    notificationSseClients.set(userId, []);
  }
  notificationSseClients.get(userId)!.push(res);

  // Send ping message
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', userId })}\n\n`);

  req.on('close', () => {
    const clients = notificationSseClients.get(userId) || [];
    notificationSseClients.set(
      userId,
      clients.filter((c) => c !== res)
    );
  });
});

// Reset votes for an event (for testing repeated votes)
app.post('/api/events/:id/reset-votes', (req: Request, res: Response) => {
  const eventId = req.params.id;
  const initialLength = votesTable.length;

  for (let i = votesTable.length - 1; i >= 0; i--) {
    if (votesTable[i].event_id === eventId) {
      votesTable.splice(i, 1);
    }
  }

  const calculated = getCalculatedEvent(eventId);
  broadcastEventUpdate(eventId);

  res.json({ message: 'Votos reiniciados', event: calculated, removed: initialLength - votesTable.length });
});

// Delete event
app.delete('/api/events/:id', (req: Request, res: Response) => {
  const eventId = req.params.id;
  const idx = eventsTable.findIndex((e) => e.id === eventId);
  if (idx === -1) return res.status(404).json({ error: 'Evento no encontrado' });

  eventsTable.splice(idx, 1);
  res.json({ message: 'Evento eliminado' });
});

// Get user votes history
app.get('/api/votes/user/:userId', (req: Request, res: Response) => {
  const userId = req.params.userId;
  const userVotes = votesTable.filter((v) => v.user_id === userId);

  const history = userVotes.map((v) => {
    const event = eventsTable.find((e) => e.id === v.event_id);
    const option = event?.options.find((o) => o.id === v.option_id);
    return {
      vote_id: v.id,
      event_id: v.event_id,
      event_title: event ? event.title : 'Evento Desconocido',
      event_status: event ? event.status : 'closed',
      option_id: v.option_id,
      option_title: option ? option.title : 'Opción',
      timestamp: v.timestamp
    };
  });

  res.json({ votes: history });
});

// SQL Schema & Android technical docs API
app.get('/api/docs/schema', (req: Request, res: Response) => {
  const postgresSql = `
-- ========================================================
-- ESQUEMA DE BASE DE DATOS: EVENTOS Y VOTACIONES (PostgreSQL)
-- ========================================================

-- 1. Tabla de Usuarios (Sincronizada con Google Credential Manager)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    google_id VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Eventos de Votación
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

-- 4. Tabla de Votos (Prevención de duplicidad y auditoría)
CREATE TABLE votes (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event_id VARCHAR(36) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    option_id VARCHAR(36) NOT NULL REFERENCES options(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_vote_per_option UNIQUE(event_id, option_id, user_id)
);

-- Índices de Rendimiento para Consultas en Tiempo Real
CREATE INDEX idx_events_status_time ON events(status, start_time, end_time);
CREATE INDEX idx_options_event ON options(event_id);
CREATE INDEX idx_votes_event ON votes(event_id);
CREATE INDEX idx_votes_user ON votes(user_id);
`;

  const mysqlSql = `
-- ========================================================
-- ESQUEMA DE BASE DE DATOS: EVENTOS Y VOTACIONES (MySQL 8.0+)
-- ========================================================

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    google_id VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE events (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    voting_rule ENUM('single', 'multiple') DEFAULT 'single',
    status ENUM('upcoming', 'active', 'closed') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE options (
    id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE votes (
    id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    option_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_option_vote (event_id, option_id, user_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES options(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

  res.json({ postgresSql, mysqlSql });
});

// -------------------------------------------------------------
// VITE SPA & STATIC ASSETS SETUP
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor de Eventos y Votaciones activo en http://localhost:${PORT}`);
  });
}

startServer();
