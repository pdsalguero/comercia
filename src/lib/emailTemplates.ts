const BASE_STYLES = `
  body { margin: 0; padding: 0; background: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  table { border-spacing: 0; }
  td { padding: 0; }
  img { border: 0; }
  .wrapper { width: 100%; background: #f1f5f9; padding: 32px 16px; box-sizing: border-box; }
  .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #1E5BA8 0%, #0f172a 100%); padding: 32px 40px; text-align: center; }
  .logo { font-size: 22px; font-weight: 900; color: #FF8C00; letter-spacing: 0.04em; }
  .logo span { color: #fff; }
  .content { padding: 40px; }
  .title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 12px; }
  .text { font-size: 15px; color: #475569; line-height: 1.7; margin: 0 0 16px; }
  .btn-wrap { text-align: center; margin: 32px 0; }
  .btn { display: inline-block; background: #FF8C00; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 10px; }
  .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin: 24px 0; }
  .card-title { font-size: 13px; font-weight: 700; color: #1E5BA8; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px; }
  .tip { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; font-size: 14px; color: #374151; line-height: 1.5; }
  .footer { background: #0f172a; padding: 24px 40px; text-align: center; }
  .footer p { font-size: 12px; color: #475569; margin: 4px 0; }
  .footer a { color: #64748b; text-decoration: none; }
  @media (max-width: 600px) {
    .content { padding: 24px 20px !important; }
    .header { padding: 24px 20px !important; }
    .footer { padding: 20px !important; }
  }
`;

function shell(headerContent: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">Comerx<span>IA</span></div>
        ${headerContent}
      </div>
      <div class="content">
        ${bodyContent}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} ComerxIA · San Juan, Argentina</p>
        <p><a href="https://comerxia.com.ar">comerxia.com.ar</a> · <a href="https://comerxia.com.ar/privacidad">Privacidad</a> · <a href="https://comerxia.com.ar/terminos">Términos</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ── Template 1: Publicación en vivo ───────────────────────────────────────────

interface ListingPublishedParams {
  userName: string;
  listingTitle: string;
  listingUrl: string;
}

export function listingPublishedTemplate({ userName, listingTitle, listingUrl }: ListingPublishedParams): {
  subject: string;
  html: string;
} {
  const html = shell(
    `<p style="color:#94a3b8; font-size:13px; margin:8px 0 0;">Tu aviso ya está en vivo</p>`,
    `
    <h1 class="title">🎉 ¡Tu publicación está en vivo!</h1>
    <p class="text">Hola <strong>${userName}</strong>, tu aviso fue publicado exitosamente en ComerxIA y ya es visible para miles de compradores.</p>

    <div class="card">
      <div class="card-title">📋 Tu publicación</div>
      <p style="font-size:15px; font-weight:700; color:#0f172a; margin:0;">${listingTitle}</p>
    </div>

    <div class="btn-wrap">
      <a href="${listingUrl}" class="btn">Ver tu publicación →</a>
    </div>

    <div class="card">
      <div class="card-title">💡 Consejos para vender más rápido</div>
      <div class="tip"><span>📸</span><span>Agregá más fotos desde distintos ángulos — los avisos con +5 fotos reciben 3× más consultas.</span></div>
      <div class="tip"><span>✏️</span><span>Describí el estado, marca y modelo con detalle. Cuanta más info, más confianza genera.</span></div>
      <div class="tip"><span>💬</span><span>Respondé las consultas rápido — los compradores contactan al primero que responde.</span></div>
      <div class="tip"><span>⭐</span><span>Destacá tu aviso para aparecer primero en los resultados y recibir 5× más visitas.</span></div>
    </div>

    <p class="text" style="font-size:13px; color:#94a3b8;">Si necesitás editar o pausar tu aviso, podés hacerlo desde <a href="https://comerxia.com.ar/dashboard/my-listings" style="color:#1E5BA8;">Mis avisos</a>.</p>
    `
  );

  return { subject: "🎉 Tu publicación está en vivo — ComerxIA", html };
}

// ── Template 2: Bienvenida ────────────────────────────────────────────────────

export function welcomeEmailTemplate(userName: string): {
  subject: string;
  html: string;
} {
  const html = shell(
    `
    <p style="color:#94a3b8; font-size:13px; margin:16px 0 4px; letter-spacing:0.04em; text-transform:uppercase;">Bienvenido/a</p>
    <p style="color:#ffffff; font-size:26px; font-weight:800; margin:0 0 6px; line-height:1.2;">${userName} 👋</p>
    <p style="color:#93c5fd; font-size:14px; margin:0; line-height:1.5;">Tu marketplace con IA ya te espera.<br>Publicá, vendé y conectá con compradores cerca tuyo.</p>
    `,
    `
    <h1 class="title">Vendé más rápido: publicá clasificados inteligentes en 30 segundos</h1>
    <p class="text">La IA de ComerxIA genera el título, la descripción y el precio sugerido por vos — solo subís una foto. Llegá a compradores cerca tuyo sin perder tiempo.</p>

    <!-- Feature cards -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td style="padding:0 0 12px;">
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-left:4px solid #1E5BA8; border-radius:10px; padding:16px 20px;">
            <p style="margin:0 0 4px; font-size:13px; font-weight:700; color:#1E5BA8; text-transform:uppercase; letter-spacing:0.5px;">📸 Publicar gratis</p>
            <p style="margin:0; font-size:14px; color:#374151; line-height:1.5;">Subí hasta 10 fotos y la IA genera el título, descripción y precio automáticamente. Sin formularios largos.</p>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 12px;">
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-left:4px solid #1E5BA8; border-radius:10px; padding:16px 20px;">
            <p style="margin:0 0 4px; font-size:13px; font-weight:700; color:#1E5BA8; text-transform:uppercase; letter-spacing:0.5px;">🏪 Tu tienda virtual gratis</p>
            <p style="margin:0; font-size:14px; color:#374151; line-height:1.5;">Página propia con tu marca personal y catálogo ilimitado. Compartila con un link y vendé también fuera de ComerxIA.</p>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 12px;">
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-left:4px solid #1E5BA8; border-radius:10px; padding:16px 20px;">
            <p style="margin:0 0 4px; font-size:13px; font-weight:700; color:#1E5BA8; text-transform:uppercase; letter-spacing:0.5px;">💬 Mensajes directos</p>
            <p style="margin:0; font-size:14px; color:#374151; line-height:1.5;">Hablá con compradores y vendedores sin salir de la plataforma. Rápido, seguro y sin dar tu número.</p>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-left:4px solid #FF8C00; border-radius:10px; padding:16px 20px;">
            <p style="margin:0 0 4px; font-size:13px; font-weight:700; color:#FF8C00; text-transform:uppercase; letter-spacing:0.5px;">⭐ Destacar avisos</p>
            <p style="margin:0; font-size:14px; color:#374151; line-height:1.5;">Aparecé primero en los resultados y vendé hasta <strong>5× más rápido</strong>.</p>
          </div>
        </td>
      </tr>
    </table>

    <!-- CTA principal -->
    <div class="btn-wrap" style="margin:36px 0 16px;">
      <a href="https://comerxia.com.ar/listings/new" class="btn" style="font-size:16px; padding:16px 40px;">Crear mi primera publicación →</a>
    </div>

    <!-- CTA secundario -->
    <p style="text-align:center; margin:0 0 32px;">
      <a href="https://comerxia.com.ar/listings" style="font-size:13px; color:#1E5BA8; text-decoration:none;">O primero explorá qué están vendiendo cerca tuyo →</a>
    </p>

    <p class="text" style="font-size:13px; color:#94a3b8; text-align:center; margin:0;">¿Tenés alguna duda? Escribinos a <a href="mailto:contacto@comerxia.com.ar" style="color:#1E5BA8;">contacto@comerxia.com.ar</a> — respondemos en menos de 24 hs.</p>
    `
  );

  return { subject: `Ya podés vender en ComerxIA, ${userName} 🚀`, html };
}

// ── Template 3: Destacado activado ───────────────────────────────────────────

const PLAN_LABEL: Record<string, string> = {
  bronze: "Esencial",
  silver: "Destacado",
  gold:   "Premium",
};

interface DestacadoActivadoParams {
  userName: string;
  listingTitle: string;
  listingUrl: string;
  planLevel: string; // bronze | silver | gold
  planDays: number;
  expiresAt: Date;
}

export function destacadoActivadoTemplate({
  userName,
  listingTitle,
  listingUrl,
  planLevel,
  planDays,
  expiresAt,
}: DestacadoActivadoParams): { subject: string; html: string } {
  const planName = PLAN_LABEL[planLevel] ?? planLevel;
  const expiresStr = expiresAt.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });

  const html = shell(
    `<p style="color:#94a3b8; font-size:13px; margin:8px 0 0;">Tu pago fue procesado con éxito</p>`,
    `
    <h1 class="title">⭐ ¡Tu aviso ahora está destacado!</h1>
    <p class="text">Hola <strong>${userName}</strong>, tu plan <strong>${planName} ${planDays} días</strong> fue activado correctamente. Tu aviso va a aparecer destacado hasta el <strong>${expiresStr}</strong>.</p>

    <div class="card">
      <div class="card-title">📋 Aviso destacado</div>
      <p style="font-size:15px; font-weight:700; color:#0f172a; margin:0;">${listingTitle}</p>
    </div>

    <div class="btn-wrap">
      <a href="${listingUrl}" class="btn">Ver mi aviso →</a>
    </div>

    <p class="text" style="font-size:13px; color:#94a3b8;">Te avisaremos 3 días antes de que venza tu destacado para que puedas renovarlo y no perder visibilidad.</p>
    `
  );

  return { subject: `⭐ Tu aviso está destacado — vence el ${expiresStr}`, html };
}

// ── Template 4: Aviso por vencer en 3 días ───────────────────────────────────

interface DestacadoPorVencerParams {
  userName: string;
  listingTitle: string;
  listingUrl: string;
  upgradeUrl: string;
  expiresAt: Date;
}

export function destacadoPorVencerTemplate({
  userName,
  listingTitle,
  listingUrl,
  upgradeUrl,
  expiresAt,
}: DestacadoPorVencerParams): { subject: string; html: string } {
  const expiresStr = expiresAt.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });

  const html = shell(
    `<p style="color:#94a3b8; font-size:13px; margin:8px 0 0;">Tu destacado está por vencer</p>`,
    `
    <h1 class="title">⏰ Tu aviso destacado vence en 3 días</h1>
    <p class="text">Hola <strong>${userName}</strong>, el destacado de tu aviso vence el <strong>${expiresStr}</strong>. Si no renovás, va a dejar de aparecer primero en los resultados.</p>

    <div class="card">
      <div class="card-title">📋 Aviso por vencer</div>
      <p style="font-size:15px; font-weight:700; color:#0f172a; margin:0;">${listingTitle}</p>
    </div>

    <div class="btn-wrap">
      <a href="${upgradeUrl}" class="btn">Renovar destacado →</a>
    </div>

    <p style="text-align:center; margin:0 0 32px;">
      <a href="${listingUrl}" style="font-size:13px; color:#1E5BA8; text-decoration:none;">O ver el aviso →</a>
    </p>

    <p class="text" style="font-size:13px; color:#94a3b8;">Si no renovás, tu aviso seguirá publicado pero sin visibilidad destacada.</p>
    `
  );

  return { subject: `⏰ Tu destacado vence el ${expiresStr} — renovalo ahora`, html };
}

// ── Template 5: Nuevo mensaje recibido ───────────────────────────────────────

interface NuevoMensajeParams {
  userName: string;
  senderName: string;
  listingTitle: string;
  messagePreview: string;
  threadUrl: string;
}

export function nuevoMensajeTemplate({
  userName,
  senderName,
  listingTitle,
  messagePreview,
  threadUrl,
}: NuevoMensajeParams): { subject: string; html: string } {
  const preview = messagePreview.length > 120 ? messagePreview.slice(0, 120) + "…" : messagePreview;

  const html = shell(
    `<p style="color:#94a3b8; font-size:13px; margin:8px 0 0;">Tienes un mensaje nuevo</p>`,
    `
    <h1 class="title">💬 Nuevo mensaje de ${senderName}</h1>
    <p class="text">Hola <strong>${userName}</strong>, recibiste un mensaje sobre tu aviso <strong>${listingTitle}</strong>.</p>

    <div class="card">
      <div class="card-title">✉️ Mensaje</div>
      <p style="font-size:15px; color:#374151; margin:0; line-height:1.6; font-style:italic;">"${preview}"</p>
    </div>

    <div class="btn-wrap">
      <a href="${threadUrl}" class="btn">Responder →</a>
    </div>

    <p class="text" style="font-size:13px; color:#94a3b8; text-align:center;">Responder rápido aumenta tus chances de cerrar la venta. Los compradores suelen contactar a varios vendedores a la vez.</p>
    `
  );

  return { subject: `💬 ${senderName} te escribió sobre "${listingTitle}"`, html };
}
