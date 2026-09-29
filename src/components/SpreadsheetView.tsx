import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Table, 
  Download, 
  Search, 
  Trash2, 
  UserCheck, 
  UserX, 
  Users, 
  Phone, 
  MessageSquare, 
  RefreshCw, 
  Plus, 
  ExternalLink, 
  Settings, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Calendar,
  Waves,
  Copy,
  Check,
  Lock,
  KeyRound
} from 'lucide-react';
import { RsvpEntry, fetchRsvps, deleteRsvp, submitRsvp, getSettings, saveSettings } from '../services/rsvpService';
import { sound } from '../utils/audio';

interface SpreadsheetViewProps {
  onBack: () => void;
  onOpenNewRsvp: () => void;
}

export const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({ onBack, onOpenNewRsvp }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('duda_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [rsvps, setRsvps] = useState<RsvpEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'confirmed' | 'declined'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSaved, setWebhookSaved] = useState(false);

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === '1515' || pinInput.trim() === '2026') {
      sound.playCelebration();
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('duda_admin_auth', 'true');
      } catch {
        //
      }
      setPinError(false);
    } else {
      sound.playClick();
      setPinError(true);
    }
  };

  const loadData = async () => {
    setLoading(true);
    const data = await fetchRsvps();
    setRsvps(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    getSettings().then((s) => setWebhookUrl(s.googleSheetsWebhookUrl || ''));
  }, []);

  const handleDelete = async (id: string, name: string) => {
    sound.playClick();
    if (confirm(`Tem certeza que deseja remover "${name}" da lista?`)) {
      await deleteRsvp(id);
      setRsvps((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleCopyPhone = (phone: string) => {
    sound.playClick();
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const handleSaveWebhook = async () => {
    sound.playClick();
    await saveSettings({ googleSheetsWebhookUrl: webhookUrl.trim() });
    setWebhookSaved(true);
    setTimeout(() => setWebhookSaved(false), 2500);
  };

  // Filtros
  const filteredRsvps = rsvps.filter((item) => {
    if (filterTab === 'confirmed' && item.status !== 'confirmed') return false;
    if (filterTab === 'declined' && item.status !== 'declined') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchPhone = item.phone.toLowerCase().includes(q);
      const matchMsg = item.message?.toLowerCase().includes(q);
      return matchName || matchPhone || matchMsg;
    }
    return true;
  });

  // Estatísticas calculadas
  const totalResponses = rsvps.length;
  const confirmedList = rsvps.filter((r) => r.status === 'confirmed');
  const declinedList = rsvps.filter((r) => r.status === 'declined');

  const totalAdultsConfirmed = confirmedList.reduce((acc, curr) => acc + (curr.adults || 0), 0);
  const totalKidsConfirmed = confirmedList.reduce((acc, curr) => acc + (curr.kids || 0), 0);
  const totalConfirmedPeople = totalAdultsConfirmed + totalKidsConfirmed;
  const poolCount = confirmedList.filter((r) => r.bringingSwimwear).length;

  if (!isAuthenticated) {
    return (
      <div className="relative w-full h-full min-h-[640px] flex flex-col justify-between p-6 bg-[#1f0e12] text-stone-100">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-white py-1 px-2.5 rounded-lg bg-black/40"
          >
            <ArrowLeft size={14} />
            <span>Voltar ao Convite</span>
          </button>
        </div>

        <div className="max-w-xs w-full mx-auto p-6 rounded-2xl bg-black/50 border border-rose-600/30 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-rose-600/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-3">
            <Lock size={26} />
          </div>

          <h3 className="font-serif-display text-lg text-rose-100 font-semibold">
            Área da Anfitriã
          </h3>
          <p className="text-xs text-stone-400 mt-1 mb-4 leading-relaxed">
            Digite a senha para acessar a planilha completa com os números de telefone e recados dos convidados.
          </p>

          <form onSubmit={handleVerifyPin} className="space-y-3">
            <div className="relative">
              <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="password"
                autoFocus
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="Digite a senha de anfitriã"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-900 border border-white/15 text-stone-100 text-xs tracking-widest text-center focus:outline-hidden focus:border-rose-500 font-mono"
              />
            </div>

            {pinError && (
              <p className="text-[11px] text-rose-400 font-medium">
                Senha incorreta. Verifique com a anfitriã.
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Acessar Planilha
            </button>
          </form>
        </div>

        <div className="text-center text-[11px] text-stone-500">
          Privacidade protegida • XV da Duda
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[640px] flex flex-col bg-[#1c1214] text-stone-100 overflow-hidden select-none">
      {/* Top Header */}
      <div className="p-4 bg-[#2b0f14] border-b border-rose-900/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-stone-300 hover:text-white transition-colors"
            title="Voltar ao Convite"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-serif-display font-semibold text-rose-100 flex items-center gap-2">
              <Table size={18} className="text-rose-400" />
              <span>Planilha de Convidados</span>
            </h2>
            <p className="text-[11px] text-rose-300/80">
              Controle de presença e ausências do XV da Duda
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setShowConfigModal(true);
            }}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1.5 border border-white/10"
            title="Conectar com Google Sheets"
          >
            <Settings size={14} className="text-rose-400" />
            <span className="hidden sm:inline">Google Planilhas</span>
          </button>

          <a
            href="/api/rsvps/export.csv"
            download="XV_da_Duda_Convidados.csv"
            onClick={() => sound.playClick()}
            className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            title="Baixar planilha para Excel e Google Planilhas"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Baixar Excel / CSV</span>
            <span className="sm:hidden">Baixar</span>
          </a>
        </div>
      </div>

      {/* KPI Cards / Resumo */}
      <div className="p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 bg-black/20 border-b border-white/5 shrink-0">
        <div className="p-2.5 rounded-xl bg-stone-900/60 border border-white/10 flex flex-col justify-between">
          <span className="text-[11px] text-stone-400">Total de Respostas</span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-stone-100 mt-1">
            {totalResponses}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-emerald-300">
            <span>Confirmados (Vão)</span>
            <UserCheck size={14} />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-200 mt-1">
            {totalConfirmedPeople} <span className="text-xs font-normal text-emerald-300">pessoas</span>
          </div>
          <span className="text-[10px] text-emerald-400/80">
            {totalAdultsConfirmed} convidados principais, {totalKidsConfirmed} crianças
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-rose-300">
            <span>Não Vão (Recusados)</span>
            <UserX size={14} />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-rose-200 mt-1">
            {declinedList.length} <span className="text-xs font-normal text-rose-300">respostas</span>
          </div>
          <span className="text-[10px] text-rose-400/80">Nomes e telefones listados</span>
        </div>

        <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-cyan-300">
            <span>Roupa de Banho</span>
            <Waves size={14} />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-200 mt-1">
            {poolCount} <span className="text-xs font-normal text-cyan-300">levarão</span>
          </div>
          <span className="text-[10px] text-cyan-400/80">Piscina liberada</span>
        </div>
      </div>

      {/* Barra de Filtros, Abas e Busca */}
      <div className="p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-b border-white/5 shrink-0 bg-stone-900/40">
        {/* Abas */}
        <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => {
              sound.playClick();
              setFilterTab('all');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filterTab === 'all'
                ? 'bg-rose-700 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Todos ({totalResponses})
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setFilterTab('confirmed');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              filterTab === 'confirmed'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-stone-400 hover:text-emerald-300'
            }`}
          >
            <CheckCircle2 size={12} />
            <span>Confirmados ({confirmedList.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setFilterTab('declined');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              filterTab === 'declined'
                ? 'bg-rose-800 text-white shadow-sm'
                : 'text-stone-400 hover:text-rose-300'
            }`}
          >
            <XCircle size={12} />
            <span>Não Confirmados ({declinedList.length})</span>
          </button>
        </div>

        {/* Busca e Botão Novo */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome ou fone..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-hidden focus:border-rose-500"
            />
          </div>

          <button
            onClick={() => {
              sound.playClick();
              loadData();
            }}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            title="Atualizar dados"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenNewRsvp();
            }}
            className="py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center gap-1 shadow-sm whitespace-nowrap"
          >
            <Plus size={14} />
            <span>Registrar</span>
          </button>
        </div>
      </div>

      {/* TABELA DE DADOS (ESTILO SPREADSHEET GOOGLE PLANILHAS) */}
      <div className="flex-1 overflow-auto p-2 sm:p-4">
        {filteredRsvps.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-stone-400 border border-dashed border-white/10 rounded-2xl">
            <Table size={32} className="text-stone-600 mb-2" />
            <p className="text-sm font-medium text-stone-300">
              {searchQuery ? 'Nenhum convidado encontrado para a busca' : 'Nenhuma resposta nessa categoria ainda'}
            </p>
            <p className="text-xs text-stone-500 mt-1">
              Os convidados que responderem no convite aparecerão aqui automaticamente.
            </p>
          </div>
        ) : (
          <div className="border border-white/10 rounded-xl overflow-hidden bg-black/30 shadow-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-900/90 text-stone-400 border-b border-white/10 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Nome do Convidado</th>
                  <th className="py-2.5 px-3">Telefone / WhatsApp</th>
                  <th className="py-2.5 px-3 text-center">Pessoas</th>
                  <th className="py-2.5 px-3 text-center">Piscina</th>
                  <th className="py-2.5 px-3">Recado / Motivo</th>
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredRsvps.map((entry) => {
                  const isConfirmed = entry.status === 'confirmed';
                  const dateStr = new Date(entry.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  // Limpar telefone para WhatsApp URL
                  const cleanPhone = entry.phone.replace(/\D/g, '');
                  const waLink = `https://wa.me/55${cleanPhone}`;

                  return (
                    <tr
                      key={entry.id}
                      className={`hover:bg-white/[0.03] transition-colors ${
                        !isConfirmed ? 'bg-rose-950/15' : ''
                      }`}
                    >
                      {/* Status */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {isConfirmed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-semibold text-[10.5px]">
                            <CheckCircle2 size={11} className="text-emerald-400" />
                            CONFIRMADO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950 border border-rose-500/40 text-rose-300 font-semibold text-[10.5px]">
                            <XCircle size={11} className="text-rose-400" />
                            NÃO VAI
                          </span>
                        )}
                      </td>

                      {/* Nome */}
                      <td className="py-2.5 px-3 font-medium text-stone-100 whitespace-nowrap">
                        {entry.name}
                      </td>

                      {/* Telefone */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-stone-300">
                          <span>{entry.phone}</span>
                          <button
                            onClick={() => handleCopyPhone(entry.phone)}
                            className="p-1 rounded hover:bg-white/10 text-stone-400 hover:text-stone-200"
                            title="Copiar telefone"
                          >
                            {copiedPhone === entry.phone ? (
                              <Check size={12} className="text-emerald-400" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded hover:bg-emerald-900/40 text-emerald-400"
                            title="Conversar no WhatsApp"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </td>

                      {/* Pessoas */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {isConfirmed ? (
                          <span className="font-mono font-semibold text-emerald-200">
                            {entry.adults + entry.kids}{' '}
                            <span className="text-[10px] text-stone-400 font-normal">
                              ({entry.adults}A{entry.kids > 0 ? ` + ${entry.kids}C` : ''})
                            </span>
                          </span>
                        ) : (
                          <span className="text-stone-500">-</span>
                        )}
                      </td>

                      {/* Piscina */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {isConfirmed ? (
                          entry.bringingSwimwear ? (
                            <span className="text-cyan-300 font-medium">Sim 👙</span>
                          ) : (
                            <span className="text-stone-500">Não</span>
                          )
                        ) : (
                          <span className="text-stone-500">-</span>
                        )}
                      </td>

                      {/* Mensagem */}
                      <td className="py-2.5 px-3 max-w-xs truncate text-stone-300 text-[11.5px]" title={entry.message}>
                        {entry.message || <span className="text-stone-600 italic">Sem mensagem</span>}
                      </td>

                      {/* Data */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-stone-500 text-[11px]">
                        {dateStr}
                      </td>

                      {/* Ações */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(entry.id, entry.name)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                          title="Excluir resposta"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Integração Google Sheets */}
      <AnimatePresence>
        {showConfigModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setShowConfigModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#240a0e] border border-rose-600/40 rounded-2xl max-w-md w-full p-5 text-stone-100 shadow-2xl relative"
            >
              <h3 className="font-serif-display text-lg text-rose-100 font-semibold mb-2">
                Conectar com Google Planilhas
              </h3>

              <div className="space-y-3 text-xs text-stone-300">
                <p>
                  Você pode exportar a qualquer momento a lista de convidados clicando em <strong>"Baixar Excel / CSV"</strong> e abrir no Google Drive / Google Sheets com todas as colunas já formatadas.
                </p>

                <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <span className="font-semibold text-rose-300 block">Sincronização em tempo real (Webhook):</span>
                  <p className="text-[11px] text-stone-400">
                    Se você criar um Webhook (via Google Apps Script, SheetDB ou Make) para a sua planilha pessoal do Google Sheets, cole a URL abaixo. Cada nova confirmação ou recusa será enviada automaticamente!
                  </p>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-stone-100 placeholder:text-stone-500 text-xs font-mono"
                  />
                  <button
                    onClick={handleSaveWebhook}
                    className="py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium flex items-center gap-1.5 text-xs transition-colors"
                  >
                    {webhookSaved ? <Check size={13} className="text-white" /> : null}
                    <span>{webhookSaved ? 'Salvo!' : 'Salvar URL do Webhook'}</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="py-1.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
