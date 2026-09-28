import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Diretório de dados persistentes
const DATA_DIR = path.resolve(__dirname, 'data');
const RSVPS_FILE = path.resolve(DATA_DIR, 'rsvps.json');
const SETTINGS_FILE = path.resolve(DATA_DIR, 'settings.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Inicializar com exemplos se não existir
if (!fs.existsSync(RSVPS_FILE)) {
  const initialRSVPs = [
    {
      id: 'demo-1',
      name: 'Camila Andrade',
      phone: '(11) 98712-3456',
      status: 'confirmed',
      adults: 2,
      kids: 0,
      bringingSwimwear: true,
      message: 'Amigaaa, ansiosa pelo XV! Look 2000s já tá separado! 🎉',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'demo-2',
      name: 'Matheus Guimarães',
      phone: '(11) 97123-8899',
      status: 'declined',
      adults: 1,
      kids: 0,
      bringingSwimwear: false,
      message: 'Duda, infelizmente vou estar viajando no fim de semana, mas mando seu presente com a Ju! Parabéns antecipado ❤️',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
    {
      id: 'demo-3',
      name: 'Larissa & Família',
      phone: '(11) 99345-1278',
      status: 'confirmed',
      adults: 2,
      kids: 1,
      bringingSwimwear: true,
      message: 'Vamos todos comemorar com você! Criança vai levar boia!',
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
    {
      id: 'demo-4',
      name: 'Rodrigo Silveira',
      phone: '(11) 98234-5678',
      status: 'declined',
      adults: 1,
      kids: 0,
      bringingSwimwear: false,
      message: 'Poxa Duda, terei plantão no dia. Aproveita muito sua festa!',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    }
  ];
  fs.writeFileSync(RSVPS_FILE, JSON.stringify(initialRSVPs, null, 2), 'utf-8');
}

if (!fs.existsSync(SETTINGS_FILE)) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify({ googleSheetsWebhookUrl: '' }, null, 2), 'utf-8');
}

function readRSVPs() {
  try {
    const content = fs.readFileSync(RSVPS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    return [];
  }
}

function writeRSVPs(data: any[]) {
  fs.writeFileSync(RSVPS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function readSettings() {
  try {
    const content = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    return { googleSheetsWebhookUrl: '' };
  }
}

function writeSettings(data: any) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// API: Listar RSVPs
app.get('/api/rsvps', (req, res) => {
  const rsvps = readRSVPs();
  res.json({ success: true, data: rsvps });
});

// API: Salvar/Adicionar RSVP
app.post('/api/rsvps', async (req, res) => {
  try {
    const { name, phone, status, adults, kids, bringingSwimwear, message } = req.body;

    if (!name || !phone || !status) {
      return res.status(400).json({ success: false, error: 'Nome, telefone e status são obrigatórios.' });
    }

    const newRsvp = {
      id: 'rsvp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: name.trim(),
      phone: phone.trim(),
      status: status === 'confirmed' ? 'confirmed' : 'declined',
      adults: status === 'confirmed' ? Number(adults) || 1 : 0,
      kids: status === 'confirmed' ? Number(kids) || 0 : 0,
      bringingSwimwear: Boolean(bringingSwimwear),
      message: message ? message.trim() : '',
      createdAt: new Date().toISOString(),
    };

    const rsvps = readRSVPs();
    rsvps.unshift(newRsvp);
    writeRSVPs(rsvps);

    // Se houver Google Sheets Webhook configurado, sincronizar em segundo plano
    const settings = readSettings();
    if (settings.googleSheetsWebhookUrl && settings.googleSheetsWebhookUrl.startsWith('http')) {
      try {
        fetch(settings.googleSheetsWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRsvp),
        }).catch((err) => console.error('Webhook sync failed:', err));
      } catch (e) {
        console.error('Webhook fetch error:', e);
      }
    }

    res.json({ success: true, data: newRsvp });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Deletar RSVP
app.delete('/api/rsvps/:id', (req, res) => {
  const { id } = req.params;
  let rsvps = readRSVPs();
  rsvps = rsvps.filter((item: any) => item.id !== id);
  writeRSVPs(rsvps);
  res.json({ success: true });
});

// API: Exportar CSV formatado para Google Sheets e Excel (com BOM UTF-8)
app.get('/api/rsvps/export.csv', (req, res) => {
  const rsvps = readRSVPs();
  
  // Headers CSV
  const headers = ['Status', 'Nome Completo', 'Telefone', 'Total Adultos', 'Total Criancas', 'Roupa de Banho', 'Mensagem / Observacao', 'Data e Hora'];
  
  const rows = rsvps.map((r: any) => {
    const statusLabel = r.status === 'confirmed' ? 'CONFIRMADO (VAI)' : 'NAO CONFIRMADO (NAO VAI)';
    const swimwearLabel = r.bringingSwimwear ? 'SIM' : 'NAO';
    const dateFormatted = new Date(r.createdAt).toLocaleString('pt-BR');
    
    // Escapar aspas duplas
    const escapeCsv = (str: string | number) => `"${String(str || '').replace(/"/g, '""')}"`;

    return [
      escapeCsv(statusLabel),
      escapeCsv(r.name),
      escapeCsv(r.phone),
      escapeCsv(r.adults),
      escapeCsv(r.kids),
      escapeCsv(swimwearLabel),
      escapeCsv(r.message),
      escapeCsv(dateFormatted),
    ].join(';');
  });

  // UTF-8 BOM (\uFEFF) para abrir com acentuação correta no Excel e Google Sheets
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="XV_da_Duda_Convidados.csv"');
  res.send(csvContent);
});

// API: Configurações (ex: Webhook Google Sheets)
app.get('/api/settings', (req, res) => {
  res.json({ success: true, data: readSettings() });
});

app.post('/api/settings', (req, res) => {
  const { googleSheetsWebhookUrl } = req.body;
  writeSettings({ googleSheetsWebhookUrl: googleSheetsWebhookUrl || '' });
  res.json({ success: true });
});

// Configuração do Vite ou Static Files
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
