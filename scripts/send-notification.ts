/**
 * Script para enviar notificaciones por email a usuarios de Forgia.
 *
 * Uso:
 *   npx tsx scripts/send-notification.ts --target all --subject "Asunto" --html emails/notification.html
 *   npx tsx scripts/send-notification.ts --target not_onboarded --subject "Asunto" --html emails/notification.html --dry-run
 *   npx tsx scripts/send-notification.ts --csv emails_filtrados.csv --subject "Asunto" --html emails/notification.html
 *
 * Flags:
 *   --target    all | onboarded | not_onboarded (default: all). Se ignora si se usa --csv.
 *   --csv       Ruta a archivo CSV con emails (columna "email" requerida, "display_name" opcional)
 *   --subject   Asunto del email (requerido)
 *   --html      Ruta a archivo HTML con el cuerpo del email (requerido)
 *   --dry-run   Solo muestra destinatarios, no envía
 *   --exclude   Emails a excluir, separados por coma
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { sendBulkEmail } from '../src/lib/email';

// --- Parse CLI args ---

function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= process.argv.length) return undefined;
  return process.argv[idx + 1];
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

const target = (getArg('target') || 'all') as 'all' | 'onboarded' | 'not_onboarded';
const csvPath = getArg('csv');
const subject = getArg('subject');
const htmlPath = getArg('html');
const dryRun = hasFlag('dry-run');
const excludeRaw = getArg('exclude');
const excludeEmails = excludeRaw ? excludeRaw.split(',').map((e) => e.trim().toLowerCase()) : [];

// --- CSV parser ---

function parseCsv(filePath: string): { email: string; displayName: string | null }[] {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);

  if (lines.length < 2) {
    console.error('Error: El CSV está vacío o solo tiene encabezado.');
    process.exit(1);
  }

  const header = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/"/g, ''));
  const emailIdx = header.indexOf('email');

  if (emailIdx === -1) {
    console.error('Error: El CSV debe tener una columna "email".');
    process.exit(1);
  }

  const nameIdx = header.indexOf('display_name');

  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim().replace(/"/g, ''));
    return {
      email: cols[emailIdx],
      displayName: nameIdx !== -1 ? cols[nameIdx] || null : null,
    };
  }).filter((r) => r.email && r.email.includes('@'));
}

// --- Validate ---

if (!subject) {
  console.error('Error: --subject es requerido.');
  console.error('Uso: npx tsx scripts/send-notification.ts --target all --subject "Asunto" --html emails/notification.html');
  process.exit(1);
}

if (!htmlPath && !dryRun) {
  console.error('Error: --html es requerido (ruta al archivo HTML del email).');
  console.error('Uso: npx tsx scripts/send-notification.ts --target all --subject "Asunto" --html emails/notification.html');
  process.exit(1);
}

// --- Validate env vars ---

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos en .env.local');
  process.exit(1);
}

if (!dryRun && (!process.env.SES_SMTP_HOST || !process.env.SES_SMTP_USER || !process.env.SES_SMTP_PASS)) {
  console.error('Error: SES_SMTP_HOST, SES_SMTP_USER y SES_SMTP_PASS son requeridos en .env.local');
  process.exit(1);
}

// --- Main ---

async function main() {
  let recipients: { email: string; displayName: string | null }[];
  let sourceLabel: string;

  if (csvPath) {
    // Mode: CSV file
    const csvRecipients = parseCsv(csvPath);
    recipients = csvRecipients.filter(
      (r) => !excludeEmails.includes(r.email.toLowerCase())
    );
    sourceLabel = `csv: ${csvPath}`;
  } else {
    // Mode: Supabase query
    const supabase = createClient(supabaseUrl!, serviceRoleKey!);

    let query = supabase.from('profiles').select('email, display_name, onboarding_completed');

    if (target === 'onboarded') {
      query = query.eq('onboarding_completed', true);
    } else if (target === 'not_onboarded') {
      query = query.eq('onboarding_completed', false);
    }

    const { data: profiles, error } = await query.order('created_at', { ascending: true });

    if (error) {
      console.error('Error al consultar perfiles:', error.message);
      process.exit(1);
    }

    if (!profiles || profiles.length === 0) {
      console.log('No se encontraron perfiles para el grupo:', target);
      process.exit(0);
    }

    recipients = profiles
      .filter((p) => !excludeEmails.includes(p.email.toLowerCase()))
      .map((p) => ({ email: p.email, displayName: p.display_name }));
    sourceLabel = `target: ${target}`;
  }

  if (recipients.length === 0) {
    console.log('No hay destinatarios después de aplicar filtros.');
    process.exit(0);
  }

  console.log(`\n📋 Destinatarios (${sourceLabel}): ${recipients.length}`);
  console.log('─'.repeat(60));
  for (const r of recipients) {
    console.log(`  📧 ${r.displayName || '(sin nombre)'} — ${r.email}`);
  }
  console.log('─'.repeat(60));

  if (dryRun) {
    console.log('\n🔍 Modo dry-run: no se enviaron emails.');
    console.log(`   Total: ${recipients.length} destinatarios`);
    process.exit(0);
  }

  // Read HTML template
  const htmlContent = readFileSync(htmlPath!, 'utf-8');

  // Check if template uses {{nombre}} placeholder
  const usesPlaceholder = htmlContent.includes('{{nombre}}');

  console.log(`\n📧 Enviando "${subject}" a ${recipients.length} destinatarios...`);
  console.log(`   From: ${process.env.EMAIL_FROM || 'Forgia <hola@forgia.fit>'}\n`);

  const result = await sendBulkEmail(
    recipients,
    subject!,
    (name) => usesPlaceholder ? htmlContent.replace(/\{\{nombre\}\}/g, name) : htmlContent
  );

  console.log('\n📊 Resultado:');
  console.log(`   ✅ Enviados: ${result.sent}`);
  console.log(`   ❌ Fallidos: ${result.failed}`);

  if (result.errors.length > 0) {
    console.log('\n   Errores:');
    for (const err of result.errors) {
      console.log(`   - ${err}`);
    }
  }

  console.log('');
}

main().catch((err) => {
  console.error('Error fatal:', err);
  process.exit(1);
});
