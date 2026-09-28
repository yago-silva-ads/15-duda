/**
 * XV da Duda — Google Sheets como base oficial de RSVP.
 *
 * 1) Abra a planilha "XV Duda".
 * 2) Extensões -> Apps Script.
 * 3) Substitua o conteúdo por este arquivo e execute configurarPlanilha().
 * 4) Implantar -> Nova implantação -> Aplicativo da Web.
 *    Executar como: você | Quem pode acessar: Qualquer pessoa.
 * 5) Use a URL /exec como VITE_RSVP_WEBHOOK_URL na hospedagem.
 */

const SHEET_RESPONSES = 'Respostas';
const SHEET_CONFIRMED = 'Confirmados';
const SHEET_DECLINED = 'Não vão';
const SHEET_SUMMARY = 'Resumo';

function configurarPlanilha() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Abra o Apps Script a partir da planilha XV Duda.');

  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  ss.setSpreadsheetTimeZone('America/Sao_Paulo');
  ensureResponses_(ss);
  updateViews_(ss);
  updateSummary_(ss);
  SpreadsheetApp.getUi().alert('Planilha pronta. Agora publique como Aplicativo da Web.');
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'XV da Duda RSVP' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const name = sanitize_(payload.name, 120);
    const phone = normalizePhone_(payload.phone);
    const status = payload.status === 'confirmed' ? 'confirmed' : payload.status === 'declined' ? 'declined' : '';
    const adults = status === 'confirmed' ? clamp_(payload.adults, 1, 10) : 0;
    const kids = status === 'confirmed' ? clamp_(payload.kids, 0, 10) : 0;
    const swimwear = status === 'confirmed' ? Boolean(payload.bringingSwimwear) : false;
    const message = sanitize_(payload.message, 500);

    if (name.length < 3) throw new Error('Nome inválido.');
    if (phone.length < 10 || phone.length > 13) throw new Error('Telefone inválido.');
    if (!status) throw new Error('Status inválido.');

    const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    if (!id) throw new Error('Execute configurarPlanilha() primeiro.');

    const ss = SpreadsheetApp.openById(id);
    const sheet = ensureResponses_(ss);
    const now = new Date();
    const rows = sheet.getDataRange().getValues();
    let rowIndex = 0;

    // Telefone é a chave: responder novamente atualiza o mesmo convidado.
    for (let i = 1; i < rows.length; i++) {
      if (normalizePhone_(rows[i][1]) === phone) {
        rowIndex = i + 1;
        break;
      }
    }

    const firstResponse = rowIndex ? (sheet.getRange(rowIndex, 9).getValue() || now) : now;
    const row = [
      status === 'confirmed' ? 'CONFIRMADO' : 'NÃO VAI',
      phone,
      name,
      adults,
      kids,
      adults + kids,
      swimwear ? 'SIM' : 'NÃO',
      message,
      firstResponse,
      now,
    ];

    if (rowIndex) sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
    else {
      sheet.appendRow(row);
      rowIndex = sheet.getLastRow();
    }

    styleResponseRow_(sheet, rowIndex, status);
    updateViews_(ss);
    updateSummary_(ss);
    SpreadsheetApp.flush();

    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error(error);
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: error.message })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function ensureResponses_(ss) {
  let sheet = ss.getSheetByName(SHEET_RESPONSES);
  if (!sheet) sheet = ss.insertSheet(SHEET_RESPONSES);

  const headers = [
    'Status', 'WhatsApp', 'Nome', 'Adultos', 'Crianças', 'Total de pessoas',
    'Roupa de banho', 'Observação', 'Primeira resposta', 'Última atualização'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  styleHeader_(sheet, headers.length);
  sheet.getRange('I:J').setNumberFormat('dd/MM/yyyy HH:mm');
  sheet.setColumnWidths(1, headers.length, 130);
  sheet.setColumnWidth(2, 150);
  sheet.setColumnWidth(3, 220);
  sheet.setColumnWidth(8, 300);
  return sheet;
}

function updateViews_(ss) {
  const source = ensureResponses_(ss);
  const data = source.getLastRow() > 1 ? source.getRange(2, 1, source.getLastRow() - 1, 10).getValues() : [];
  writeView_(ss, SHEET_CONFIRMED, data.filter(row => row[0] === 'CONFIRMADO'), '#e9f7ee');
  writeView_(ss, SHEET_DECLINED, data.filter(row => row[0] === 'NÃO VAI'), '#fbecee');
}

function writeView_(ss, name, rows, color) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  sheet.clearContents().clearFormats();
  const headers = ['Nome', 'WhatsApp', 'Adultos', 'Crianças', 'Total', 'Observação', 'Atualizado em'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  styleHeader_(sheet, headers.length);
  sheet.setFrozenRows(1);

  const mapped = rows.map(row => [row[2], row[1], row[3], row[4], row[5], row[7], row[9]]);
  if (mapped.length) {
    sheet.getRange(2, 1, mapped.length, headers.length).setValues(mapped).setBackground(color);
    sheet.getRange(2, 7, mapped.length, 1).setNumberFormat('dd/MM/yyyy HH:mm');
  }
  sheet.autoResizeColumns(1, headers.length);
}

function updateSummary_(ss) {
  const source = ensureResponses_(ss);
  const data = source.getLastRow() > 1 ? source.getRange(2, 1, source.getLastRow() - 1, 10).getValues() : [];
  const confirmed = data.filter(row => row[0] === 'CONFIRMADO');
  const declined = data.filter(row => row[0] === 'NÃO VAI');
  const people = confirmed.reduce((sum, row) => sum + Number(row[5] || 0), 0);

  let sheet = ss.getSheetByName(SHEET_SUMMARY);
  if (!sheet) sheet = ss.insertSheet(SHEET_SUMMARY, 0);
  sheet.clearContents().clearFormats();
  sheet.getRange('A1:B1').setValues([['XV da Duda — RSVP', 'Quantidade']]);
  styleHeader_(sheet, 2);
  sheet.getRange('A3:B7').setValues([
    ['Respostas recebidas', data.length],
    ['Convidados confirmados', confirmed.length],
    ['Não vão', declined.length],
    ['Pessoas esperadas', people],
    ['Atualizado em', new Date()],
  ]);
  sheet.getRange('B7').setNumberFormat('dd/MM/yyyy HH:mm');
  sheet.setColumnWidth(1, 250);
  sheet.setColumnWidth(2, 150);
}

function styleHeader_(sheet, columns) {
  sheet.getRange(1, 1, 1, columns)
    .setFontWeight('bold')
    .setBackground('#7b071c')
    .setFontColor('#ffffff');
}

function styleResponseRow_(sheet, row, status) {
  sheet.getRange(row, 1, 1, 10).setBackground(status === 'confirmed' ? '#e9f7ee' : '#fbecee');
  sheet.getRange(row, 1).setFontWeight('bold');
}

function normalizePhone_(value) { return String(value || '').replace(/\D/g, ''); }
function sanitize_(value, max) { return String(value || '').replace(/[<>]/g, '').trim().slice(0, max); }
function clamp_(value, min, max) {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? min : Math.max(min, Math.min(max, parsed));
}
