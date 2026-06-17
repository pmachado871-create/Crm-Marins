import React, { useState, useEffect, useMemo } from 'react';
import { Users, BarChart3, MessageCircleQuestion, Trophy, Plus, Search, Upload, Download, X, Check, ChevronRight, MapPin, TrendingUp, AlertCircle, MessageCircle, Layers, LogOut, Lock, Mail } from 'lucide-react';
import { db, auth } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

// ---------- Constants ----------

const BAIRROS_FRIBURGO = [
  'Centro', 'Olaria', 'Alto de Olaria', 'Conselheiro Paulino', 'Riograndina',
  'Cônego', 'Cascatinha', 'Bom Jardim', 'Campo do Coelho', 'São Geraldo',
  'Cantagalo', 'Amparo', 'Mury', 'Vila Amélia', 'Caxangá', 'Lumiar',
  'Sans Souci', 'Duas Pedras', 'Não informado'
];

const STATUS_OPTIONS = [
  { value: 'nao_enviado', label: 'Não enviado', color: '#9AA5B8' },
  { value: 'aguardando', label: 'Aguardando', color: '#F5A623' },
  { value: 'interagiu', label: 'Interagiu', color: '#00AACC' },
  { value: 'nao_interagiu', label: 'Não interagiu', color: '#D64545' },
];

const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map(s => [s.value, s]));

const PAUTAS = [
  'Saúde', 'Transporte', 'Educação', 'Segurança', 'Emprego',
  'Infraestrutura/Obras', 'Meio ambiente', 'Esporte e lazer', 'Outro / não informado'
];

// ---------- Firestore helpers ----------
// Todos os dados do CRM ficam num único documento compartilhado,
// assim toda a equipe (Estado-Maior) vê e edita a mesma base em tempo real.

const CRM_DOC_REF = doc(db, 'crm', 'dados-gerais');

async function loadData() {
  try {
    const snap = await getDoc(CRM_DOC_REF);
    if (snap.exists()) return snap.data();
  } catch (e) {
    console.error('Erro ao carregar dados do Firestore', e);
  }
  return null;
}

async function saveData(data) {
  try {
    await setDoc(CRM_DOC_REF, data);
  } catch (e) {
    console.error('Erro ao salvar no Firestore', e);
  }
}

function subscribeToData(callback) {
  return onSnapshot(CRM_DOC_REF, (snap) => {
    if (snap.exists()) callback(snap.data());
  }, (error) => {
    console.error('Erro na escuta em tempo real', error);
  });
}

// ---------- Main App ----------


export default function AppWrapper() {
  const [user, setUser] = useState(undefined); // undefined = carregando, null = não logado

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
    });
    return () => unsubscribe();
  }, []);

  if (user === undefined) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: '#0A1226' }}>
        <div className="font-mono text-sm" style={{ color: '#00AACC' }}>CARREGANDO...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <App user={user} />;
}

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('E-mail ou senha incorretos.');
      } else if (err.code === 'auth/invalid-email') {
        setError('E-mail inválido.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Aguarde um momento e tente novamente.');
      } else {
        setError('Não foi possível entrar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4" style={{ background: '#0A1226', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');
        .font-display { font-family: 'Rajdhani', sans-serif; }
        .font-mono { font-family: 'Share Tech Mono', monospace; }
      `}</style>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="font-mono text-xs tracking-widest mb-1" style={{ color: '#00AACC' }}>QG MARINS 2026 · ACESSO RESTRITO</div>
          <h1 className="font-display text-2xl font-bold text-white">CRM Pré-Campanha</h1>
          <p className="text-sm text-gray-400 mt-1">Nova Friburgo</p>
        </div>
        <form onSubmit={handleLogin} className="rounded-lg p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,170,204,0.2)' }}>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">E-mail</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-9 pr-3 py-2.5 rounded text-sm text-white"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Senha</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded text-sm text-white"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
          </div>
          {error && (
            <div className="text-xs px-3 py-2 rounded" style={{ background: 'rgba(214,69,69,0.1)', color: '#D64545', border: '1px solid rgba(214,69,69,0.3)' }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-display font-semibold"
            style={{ background: '#00AACC', color: '#0A1226', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="text-center text-xs text-gray-500 mt-4">
          Acesso restrito ao Estado-Maior da campanha. Contas criadas pelo administrador.
        </p>
      </div>
    </div>
  );
}

function App({ user }) {
  const [contacts, setContacts] = useState([]);
  const [enquetes, setEnquetes] = useState([]);
  const [tab, setTab] = useState('painel');
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Carrega dados iniciais e escuta atualizações em tempo real do Firestore
  useEffect(() => {
    let firstLoad = true;
    const unsubscribe = subscribeToData((data) => {
      setContacts(data.contacts || []);
      setEnquetes(data.enquetes || []);
      if (firstLoad) {
        setLoaded(true);
        firstLoad = false;
      }
    });

    // Garante que o documento existe; se não existir, cria vazio
    (async () => {
      const data = await loadData();
      if (!data) {
        await saveData({ contacts: [], enquetes: [] });
      }
      setLoaded(true);
    })();

    return () => unsubscribe();
  }, []);

  // Salva no Firestore sempre que contatos ou enquetes mudam localmente
  useEffect(() => {
    if (!loaded) return;
    setSyncing(true);
    const timeout = setTimeout(() => {
      saveData({ contacts, enquetes }).finally(() => setSyncing(false));
    }, 400); // pequeno debounce para não disparar uma escrita por tecla digitada
    return () => clearTimeout(timeout);
  }, [contacts, enquetes, loaded]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  async function handleLogout() {
    if (!window.confirm('Deseja realmente encerrar a sessão?')) return;
    await signOut(auth);
  }

  const tabs = [
    { id: 'painel', label: 'Painel', icon: BarChart3 },
    { id: 'liderancas', label: 'Lideranças', icon: Trophy },
    { id: 'fontes', label: 'Fontes', icon: Layers },
    { id: 'enquetes', label: 'Enquetes', icon: MessageCircleQuestion },
  ];

  return (
    <div className="min-h-screen w-full" style={{ background: '#0A1226', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');
        .font-display { font-family: 'Rajdhani', sans-serif; }
        .font-mono { font-family: 'Share Tech Mono', monospace; }
        .scrollbar-thin::-webkit-scrollbar { height: 6px; width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #1565C0; border-radius: 3px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: #0D1E6E; }
        select.crm-select {
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          appearance: none !important;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='%2300AACC' d='M4 6l4 4 4-4'/%3e%3c/svg%3e") !important;
          background-repeat: no-repeat !important;
          background-position: right 0.7rem center !important;
          background-size: 14px !important;
          padding-right: 2.25rem !important;
        }
        select.crm-select::-ms-expand {
          display: none;
        }
        select.crm-select option {
          background: #0D1E6E;
          color: #ffffff;
        }
      `}</style>

      <Header user={user} syncing={syncing} onLogout={handleLogout} />

      <div className="max-w-6xl mx-auto px-4 pb-24">
        <nav className="flex gap-2 mt-4 mb-6 overflow-x-auto scrollbar-thin">
          {tabs.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-display font-semibold text-sm tracking-wide whitespace-nowrap transition-colors"
                style={{
                  background: active ? '#1565C0' : 'rgba(255,255,255,0.04)',
                  color: active ? '#fff' : '#9AA5B8',
                  border: active ? '1px solid #00AACC' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Icon size={16} />
                {t.label.toUpperCase()}
              </button>
            );
          })}
        </nav>

        {!loaded ? (
          <div className="text-center py-20 text-gray-500 font-mono">CARREGANDO DADOS...</div>
        ) : (
          <>
            {tab === 'painel' && <Painel contacts={contacts} enquetes={enquetes} />}
            {tab === 'liderancas' && <Ranking contacts={contacts} setContacts={setContacts} showToast={showToast} />}
            {tab === 'fontes' && <Fontes contacts={contacts} setContacts={setContacts} showToast={showToast} />}
            {tab === 'enquetes' && <Enquetes enquetes={enquetes} setEnquetes={setEnquetes} contacts={contacts} setContacts={setContacts} showToast={showToast} />}
          </>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-lg font-medium text-sm shadow-lg z-50"
          style={{ background: '#00AACC', color: '#0A1226' }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ---------- Header ----------

function Header({ user, syncing, onLogout }) {
  return (
    <header style={{ background: 'linear-gradient(135deg, #0D1E6E 0%, #0A1226 100%)', borderBottom: '1px solid rgba(0,170,204,0.3)' }}>
      <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-xs tracking-widest" style={{ color: '#00AACC' }}>QG MARINS 2026 · MÓDULO S5</div>
          <h1 className="font-display text-2xl font-bold text-white mt-1 truncate">CRM Pré-Campanha — Nova Friburgo</h1>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden md:flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded" style={{ background: 'rgba(0,170,204,0.1)', color: '#00AACC', border: '1px solid rgba(0,170,204,0.3)' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: syncing ? '#F5A623' : '#00AACC' }}></span>
            {syncing ? 'SINCRONIZANDO...' : 'OPERACIONAL'}
          </div>
          {user?.email && (
            <span className="hidden lg:inline text-xs text-gray-400 max-w-[160px] truncate">{user.email}</span>
          )}
          <button
            onClick={onLogout}
            title="Encerrar sessão"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#9AA5B8', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Saída</span>
          </button>
        </div>
      </div>
    </header>
  );
}

// ---------- Painel (Dashboard) ----------

function Painel({ contacts, enquetes }) {
  const total = contacts.length;
  const meta = 8000;

  const bairroStats = useMemo(() => {
    const counts = {};
    contacts.forEach(c => {
      const b = c.bairro || 'Não informado';
      counts[b] = (counts[b] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [contacts]);

  const naoInformado = bairroStats.find(([b]) => b === 'Não informado')?.[1] || 0;
  const coberturaPct = total > 0 ? Math.round(((total - naoInformado) / total) * 100) : 0;

  const statusStats = useMemo(() => {
    const counts = {};
    STATUS_OPTIONS.forEach(s => counts[s.value] = 0);
    contacts.forEach(c => { counts[c.status || 'nao_enviado'] = (counts[c.status || 'nao_enviado'] || 0) + 1; });
    return counts;
  }, [contacts]);

  const pautaStats = useMemo(() => {
    const counts = {};
    contacts.forEach(c => {
      const p = c.pauta || 'Outro / não informado';
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [contacts]);

  const totalRespostas = enquetes.reduce((sum, e) => sum + (e.respostas || 0), 0);
  const taxaResposta = total > 0 ? Math.round((totalRespostas / total) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Base atual" value={total.toLocaleString('pt-BR')} sub={`Meta: ${meta.toLocaleString('pt-BR')}`} accent="#00AACC" />
        <StatCard label="Progresso da meta" value={`${Math.round((total / meta) * 100)}%`} sub={`Faltam ${(meta - total).toLocaleString('pt-BR')}`} accent="#1565C0" />
        <StatCard label="Cobertura por bairro" value={`${coberturaPct}%`} sub={`${naoInformado} sem bairro`} accent={coberturaPct < 50 ? '#D64545' : '#00AACC'} />
        <StatCard label="Taxa de resposta" value={`${taxaResposta}%`} sub={`${totalRespostas} respostas / ${enquetes.length} enquetes`} accent="#F5A623" />
      </div>

      {/* Progress bar to goal */}
      <Panel title="Crescimento da base — 3.000 → 8.000 contatos">
        <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, (total / meta) * 100)}%`, background: 'linear-gradient(90deg, #1565C0, #00AACC)' }}></div>
        </div>
        <div className="flex justify-between mt-2 font-mono text-xs text-gray-400">
          <span>0</span>
          <span>{total.toLocaleString('pt-BR')} cadastrados</span>
          <span>{meta.toLocaleString('pt-BR')}</span>
        </div>
      </Panel>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Status distribution */}
        <Panel title="Distribuição por status">
          <div className="space-y-3">
            {STATUS_OPTIONS.map(s => {
              const count = statusStats[s.value] || 0;
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={s.value}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{s.label}</span>
                    <span className="font-mono text-gray-400">{count} ({Math.round(pct)}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Bairro coverage */}
        <Panel title="Cobertura por bairro (top 8)">
          {bairroStats.length === 0 ? (
            <EmptyState text="Nenhum contato cadastrado ainda." />
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin pr-1">
              {bairroStats.slice(0, 8).map(([bairro, count]) => {
                const pct = total > 0 ? (count / total) * 100 : 0;
                const isUnknown = bairro === 'Não informado';
                return (
                  <div key={bairro} className="flex items-center gap-3">
                    <MapPin size={14} style={{ color: isUnknown ? '#D64545' : '#00AACC', flexShrink: 0 }} />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span className={isUnknown ? 'text-red-400' : 'text-gray-300'}>{bairro}</span>
                        <span className="font-mono text-gray-400">{count}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden mt-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: isUnknown ? '#D64545' : '#1565C0' }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </div>

      {/* Pautas */}
      <Panel title="Top pautas de interesse">
        {pautaStats.length === 0 ? (
          <EmptyState text="Sem dados de pauta ainda." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {pautaStats.map(([pauta, count]) => (
              <div key={pauta} className="rounded-lg p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="font-display text-2xl font-bold" style={{ color: '#00AACC' }}>{count}</div>
                <div className="text-xs text-gray-400 mt-1">{pauta}</div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {naoInformado > 0 && (
        <div className="flex items-start gap-3 rounded-lg p-4" style={{ background: 'rgba(214,69,69,0.08)', border: '1px solid rgba(214,69,69,0.3)' }}>
          <AlertCircle size={18} style={{ color: '#D64545', flexShrink: 0, marginTop: 2 }} />
          <div className="text-sm text-gray-300">
            <strong style={{ color: '#D64545' }}>{naoInformado} contatos sem bairro definido.</strong> Recomendado: disparar a enquete "Censo de bairros" para esses contatos via WhatsApp.
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="text-xs font-mono text-gray-400 uppercase tracking-wide">{label}</div>
      <div className="font-display text-3xl font-bold mt-1" style={{ color: accent }}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{sub}</div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="text-center py-6 text-gray-500 text-sm">{text}</div>;
}

// ---------- Contatos ----------

function Contatos({ contacts, setContacts, showToast }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterBairro, setFilterBairro] = useState('todos');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showImport, setShowImport] = useState(false);

  const filtered = useMemo(() => {
    return contacts.filter(c => {
      const matchSearch = !search || c.nome.toLowerCase().includes(search.toLowerCase()) || c.telefone.includes(search);
      const matchStatus = filterStatus === 'todos' || c.status === filterStatus;
      const matchBairro = filterBairro === 'todos' || c.bairro === filterBairro;
      return matchSearch && matchStatus && matchBairro;
    });
  }, [contacts, search, filterStatus, filterBairro]);

  function handleSave(contact) {
    if (contact.id) {
      setContacts(prev => prev.map(c => c.id === contact.id ? contact : c));
      showToast('Contato atualizado');
    } else {
      setContacts(prev => [...prev, { ...contact, id: `c-${Date.now()}`, criadoEm: new Date().toISOString() }]);
      showToast('Contato adicionado');
    }
    setShowForm(false);
    setEditing(null);
  }

  function handleDelete(id) {
    setContacts(prev => prev.filter(c => c.id !== id));
    showToast('Contato removido');
  }

  function exportCSV() {
    const header = 'Nome,Telefone,Bairro,Status,Pauta,Liderança,Origem,Última Enquete\n';
    const rows = contacts.map(c =>
      [c.nome, c.telefone, c.bairro, STATUS_MAP[c.status]?.label || c.status, c.pauta, c.lideranca, c.origem, c.ultimaEnquete]
        .map(v => `"${(v || '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contatos_crm_friburgo.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exportado');
  }

  function handleImport(newContacts) {
    setContacts(prev => [...prev, ...newContacts]);
    showToast(`${newContacts.length} contatos importados`);
    setShowImport(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome ou telefone..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 rounded-lg text-sm text-white focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <option value="todos">Todos os status</option>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={filterBairro} onChange={e => setFilterBairro(e.target.value)}
            className="px-3 py-2.5 rounded-lg text-sm text-white focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <option value="todos">Todos os bairros</option>
            {BAIRROS_FRIBURGO.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Upload size={16} /> Importar
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Download size={16} /> Exportar
          </button>
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-display font-semibold"
            style={{ background: '#1565C0', color: '#fff' }}>
            <Plus size={16} /> Novo contato
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-500 font-mono">{filtered.length} de {contacts.length} contatos</div>

      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                <th className="text-left px-3 py-2.5 font-display text-xs uppercase tracking-wide text-gray-400">Nome</th>
                <th className="text-left px-3 py-2.5 font-display text-xs uppercase tracking-wide text-gray-400">Telefone</th>
                <th className="text-left px-3 py-2.5 font-display text-xs uppercase tracking-wide text-gray-400">Bairro</th>
                <th className="text-left px-3 py-2.5 font-display text-xs uppercase tracking-wide text-gray-400">Status</th>
                <th className="text-left px-3 py-2.5 font-display text-xs uppercase tracking-wide text-gray-400">Liderança</th>
                <th className="text-left px-3 py-2.5 font-display text-xs uppercase tracking-wide text-gray-400"></th>
                <th className="text-left px-3 py-2.5 font-display text-xs uppercase tracking-wide text-gray-400"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">Nenhum contato encontrado.</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <td className="px-3 py-2.5 text-white">{c.nome}</td>
                  <td className="px-3 py-2.5 text-gray-400 font-mono">{c.telefone}</td>
                  <td className="px-3 py-2.5">
                    <span className={c.bairro === 'Não informado' ? 'text-red-400' : 'text-gray-300'}>{c.bairro}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: `${STATUS_MAP[c.status]?.color}22`, color: STATUS_MAP[c.status]?.color }}>
                      {STATUS_MAP[c.status]?.label || c.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-gray-400">{c.lideranca}</td>
                  <td className="px-3 py-2.5">
                    <a
                      href={`https://wa.me/55${c.telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-display font-semibold w-fit"
                      style={{ background: '#25D36622', color: '#25D366' }}
                      title="Abrir conversa no WhatsApp"
                    >
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button onClick={() => { setEditing(c); setShowForm(true); }} className="text-gray-400 hover:text-white text-xs mr-3">Editar</button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-300 text-xs">Remover</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <ContactForm contact={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />
      )}
      {showImport && (
        <ImportModal onImport={handleImport} onClose={() => setShowImport(false)} />
      )}
    </div>
  );
}

function ImportModal({ onImport, onClose, liderancaFixa }) {
  const [rows, setRows] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const fields = [
    { key: 'nome', label: 'Nome', required: true },
    { key: 'telefone', label: 'Telefone', required: true },
    { key: 'bairro', label: 'Bairro', required: false },
    { key: 'status', label: 'Status', required: false },
    { key: 'pauta', label: 'Pauta de interesse', required: false },
    { key: 'ultimaMensagem', label: 'Última mensagem recebida', required: false },
    ...(liderancaFixa ? [] : [{ key: 'lideranca', label: 'Liderança responsável', required: false }]),
  ];

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setFileName(file.name);

    try {
      const XLSX = await import('xlsx');
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      if (json.length < 2) {
        setError('Planilha vazia ou sem dados.');
        return;
      }

      const headerRow = json[0].map(h => String(h || '').trim());
      const dataRows = json.slice(1).filter(r => r.some(cell => String(cell || '').trim() !== ''));

      setHeaders(headerRow);
      setRows(dataRows);

      // Auto-map by guessing column names
      const autoMap = {};
      fields.forEach(f => {
        const idx = headerRow.findIndex(h => {
          const norm = h.toLowerCase();
          if (f.key === 'nome') return norm.includes('nome');
          if (f.key === 'telefone') return norm.includes('telefone') || norm.includes('fone') || norm.includes('whatsapp') || norm.includes('celular');
          if (f.key === 'bairro') return norm.includes('bairro');
          if (f.key === 'status') return norm.includes('status');
          if (f.key === 'pauta') return norm.includes('pauta');
          if (f.key === 'lideranca') return norm.includes('lideran') || norm.includes('indica');
          if (f.key === 'ultimaMensagem') return norm.includes('mensagem') || norm.includes('observa');
          return false;
        });
        autoMap[f.key] = idx >= 0 ? idx : '';
      });
      setMapping(autoMap);
    } catch (err) {
      setError('Não foi possível ler o arquivo. Verifique se é um .xlsx, .xls ou .csv válido.');
    }
  }

  function updateMapping(field, value) {
    setMapping(prev => ({ ...prev, [field]: value === '' ? '' : Number(value) }));
  }

  function normalizeStatus(value) {
    if (!value) return 'nao_enviado';
    const v = String(value).toLowerCase().trim();
    const found = STATUS_OPTIONS.find(s => s.value === v || s.label.toLowerCase() === v);
    return found ? found.value : 'nao_enviado';
  }

  function normalizeBairro(value) {
    if (!value) return 'Não informado';
    const v = String(value).trim();
    const found = BAIRROS_FRIBURGO.find(b => b.toLowerCase() === v.toLowerCase());
    return found || v;
  }

  function normalizePhone(value) {
    return String(value || '').replace(/\D/g, '');
  }

  function confirmImport() {
    if (mapping.nome === '' || mapping.telefone === '') {
      setError('É necessário mapear ao menos Nome e Telefone.');
      return;
    }

    const newContacts = rows
      .map((r, i) => {
        const nome = String(r[mapping.nome] || '').trim();
        const telefone = normalizePhone(r[mapping.telefone]);
        if (!nome || !telefone) return null;
        return {
          id: `import-${Date.now()}-${i}`,
          nome,
          telefone,
          bairro: mapping.bairro !== '' ? normalizeBairro(r[mapping.bairro]) : 'Não informado',
          status: mapping.status !== '' ? normalizeStatus(r[mapping.status]) : 'nao_enviado',
          pauta: mapping.pauta !== '' ? String(r[mapping.pauta] || '') : '',
          ultimaMensagem: mapping.ultimaMensagem !== '' ? String(r[mapping.ultimaMensagem] || '') : '',
          lideranca: liderancaFixa || (mapping.lideranca !== '' ? String(r[mapping.lideranca] || '') : ''),
          origem: 'Importação planilha',
          ultimaEnquete: '',
          criadoEm: new Date().toISOString(),
        };
      })
      .filter(Boolean);

    if (newContacts.length === 0) {
      setError('Nenhum contato válido encontrado (nome e telefone obrigatórios).');
      return;
    }

    onImport(newContacts);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-lg rounded-lg p-5 max-h-[90vh] overflow-y-auto scrollbar-thin" style={{ background: '#0D1E6E', border: '1px solid rgba(0,170,204,0.3)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-white text-lg">Importar contatos</h3>
            {liderancaFixa && <p className="text-xs mt-0.5" style={{ color: '#00AACC' }}>Liderança: {liderancaFixa}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={18} /></button>
        </div>

        {!rows ? (
          <div>
            <p className="text-sm text-gray-400 mb-3">
              Envie um arquivo .xlsx, .xls ou .csv com seus contatos. A primeira linha deve conter os títulos das colunas (ex: Nome, Telefone, Bairro...).
            </p>
            <label className="flex flex-col items-center justify-center gap-2 py-8 rounded-lg cursor-pointer text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.2)' }}>
              <Upload size={28} style={{ color: '#00AACC' }} />
              <span className="text-sm text-gray-300 font-medium">Clique para escolher o arquivo</span>
              <span className="text-xs text-gray-500">.xlsx, .xls ou .csv</span>
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
            </label>
            {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-300">
              Arquivo: <span className="font-mono" style={{ color: '#00AACC' }}>{fileName}</span> — {rows.length} linhas detectadas
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-2 font-medium">Mapeie as colunas da sua planilha para os campos do CRM:</p>
              <div className="space-y-2">
                {fields.map(f => (
                  <div key={f.key} className="flex items-center gap-3">
                    <span className="text-sm text-gray-300 w-40 flex-shrink-0">
                      {f.label} {f.required && <span style={{ color: '#D64545' }}>*</span>}
                    </span>
                    <select
                      value={mapping[f.key] ?? ''}
                      onChange={e => updateMapping(f.key, e.target.value)}
                      className="crm-select flex-1 px-2 py-1.5 rounded text-sm text-white"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <option value="">— não importar —</option>
                      {headers.map((h, idx) => (
                        <option key={idx} value={idx}>{h || `Coluna ${idx + 1}`}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div>
              <p className="text-xs text-gray-400 mb-2 font-medium">Pré-visualização (3 primeiras linhas):</p>
              <div className="rounded overflow-x-auto scrollbar-thin" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                      {fields.map(f => <th key={f.key} className="text-left px-2 py-1.5 text-gray-400 whitespace-nowrap">{f.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 3).map((r, i) => (
                      <tr key={i} className="border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        {fields.map(f => (
                          <td key={f.key} className="px-2 py-1.5 text-gray-300 whitespace-nowrap">
                            {mapping[f.key] !== '' && mapping[f.key] !== undefined ? String(r[mapping[f.key]] ?? '') : '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex gap-2 pt-2">
              <button onClick={() => { setRows(null); setHeaders([]); setMapping({}); setError(''); }} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-300" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>Voltar</button>
              <button onClick={confirmImport} className="flex-1 py-2.5 rounded-lg text-sm font-display font-semibold flex items-center justify-center gap-2" style={{ background: '#00AACC', color: '#0A1226' }}>
                <Check size={16} /> Importar {rows.length} contatos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ContactForm({ contact, liderancaFixa, onSave, onClose }) {
  const [form, setForm] = useState(contact || {
    nome: '', telefone: '', bairro: 'Não informado', status: 'nao_enviado', pauta: '', lideranca: liderancaFixa || '', origem: 'Manual', ultimaEnquete: '', ultimaMensagem: '', ultimaMensagemData: ''
  });

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function submit(e) {
    e.preventDefault();
    if (!form.nome || !form.telefone) return;
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-md rounded-lg p-5 max-h-[90vh] overflow-y-auto scrollbar-thin" style={{ background: '#0D1E6E', border: '1px solid rgba(0,170,204,0.3)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-white text-lg">{contact ? 'Editar contato' : 'Novo contato'}</h3>
            {liderancaFixa && <p className="text-xs mt-0.5" style={{ color: '#00AACC' }}>Liderança: {liderancaFixa}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Nome *">
            <input required value={form.nome} onChange={e => update('nome', e.target.value)} className="w-full px-3 py-2 rounded text-sm text-white" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </Field>
          <Field label="Telefone *">
            <input required value={form.telefone} onChange={e => update('telefone', e.target.value)} placeholder="22999999999" className="w-full px-3 py-2 rounded text-sm text-white font-mono" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </Field>
          <Field label="Bairro">
            <select value={form.bairro} onChange={e => update('bairro', e.target.value)} className="crm-select w-full px-3 py-2 rounded text-sm text-white" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {BAIRROS_FRIBURGO.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={e => update('status', e.target.value)} className="crm-select w-full px-3 py-2 rounded text-sm text-white" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Pauta de interesse">
            <select value={form.pauta} onChange={e => update('pauta', e.target.value)} className="crm-select w-full px-3 py-2 rounded text-sm text-white" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <option value="">Não informado</option>
              {PAUTAS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Última mensagem recebida">
            <textarea
              value={form.ultimaMensagem || ''}
              onChange={e => update('ultimaMensagem', e.target.value)}
              placeholder="Cole ou digite a última mensagem recebida deste contato..."
              rows={3}
              className="w-full px-3 py-2 rounded text-sm text-white resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </Field>
          <Field label="Data da mensagem">
            <input
              type="date"
              value={form.ultimaMensagemData || ''}
              onChange={e => update('ultimaMensagemData', e.target.value)}
              className="w-full px-3 py-2 rounded text-sm text-white"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </Field>
          {!liderancaFixa && (
            <Field label="Liderança responsável">
              <input value={form.lideranca} onChange={e => update('lideranca', e.target.value)} placeholder="Ex: Marcelo" className="w-full px-3 py-2 rounded text-sm text-white" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </Field>
          )}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-300" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-display font-semibold" style={{ background: '#00AACC', color: '#0A1226' }}>Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1 font-medium">{label}</label>
      {children}
    </div>
  );
}

// ---------- Enquetes ----------

function Enquetes({ enquetes, setEnquetes, contacts, setContacts, showToast }) {
  const [showForm, setShowForm] = useState(false);
  const [applying, setApplying] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [envioTab, setEnvioTab] = useState({});
  const [searchEnvio, setSearchEnvio] = useState({});

  function handleCreate(enquete) {
    setEnquetes(prev => [{
      ...enquete,
      id: `enq-${Date.now()}`,
      criadoEm: new Date().toISOString(),
      respostas: 0,
      enviados: [],   // array of contact ids
    }, ...prev]);
    setShowForm(false);
    showToast('Enquete criada');
  }

  function handleDelete(id) {
    setEnquetes(prev => prev.filter(e => e.id !== id));
    if (expanded === id) setExpanded(null);
  }

  function toggleExpanded(id) {
    setExpanded(prev => prev === id ? null : id);
    setEnvioTab(prev => ({ ...prev, [id]: prev[id] || 'nao_enviado' }));
  }

  function markSent(enqueteId, contactId) {
    setEnquetes(prev => prev.map(e => {
      if (e.id !== enqueteId) return e;
      const enviados = e.enviados || [];
      return { ...e, enviados: enviados.includes(contactId) ? enviados.filter(x => x !== contactId) : [...enviados, contactId] };
    }));
  }

  function markAllSent(enqueteId, contactIds) {
    setEnquetes(prev => prev.map(e => {
      if (e.id !== enqueteId) return e;
      const enviados = e.enviados || [];
      const allAlreadySent = contactIds.every(id => enviados.includes(id));
      return {
        ...e,
        enviados: allAlreadySent
          ? enviados.filter(id => !contactIds.includes(id))
          : [...new Set([...enviados, ...contactIds])]
      };
    }));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-white">Enquetes</h2>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-display font-semibold" style={{ background: '#1565C0', color: '#fff' }}>
          <Plus size={16} /> Nova enquete
        </button>
      </div>

      <div className="rounded-lg p-3 text-sm text-gray-300" style={{ background: 'rgba(0,170,204,0.06)', border: '1px solid rgba(0,170,204,0.2)' }}>
        Crie a enquete, marque os contatos como <strong>Enviado</strong> conforme for disparando no WhatsApp, depois registre as respostas.
      </div>

      {enquetes.length === 0 ? (
        <EmptyState text="Nenhuma enquete criada ainda." />
      ) : (
        <div className="space-y-3">
          {enquetes.map(e => {
            const enviados = e.enviados || [];
            const naoEnviados = contacts.filter(c => !enviados.includes(c.id));
            const enviadosList = contacts.filter(c => enviados.includes(c.id));
            const isExpanded = expanded === e.id;
            const tab = envioTab[e.id] || 'nao_enviado';
            const search = searchEnvio[e.id] || '';
            const listaAtiva = tab === 'nao_enviado' ? naoEnviados : enviadosList;
            const listaFiltrada = listaAtiva.filter(c =>
              !search || c.nome.toLowerCase().includes(search.toLowerCase()) || c.telefone.includes(search)
            );
            const pctEnviado = contacts.length > 0 ? Math.round((enviados.length / contacts.length) * 100) : 0;

            return (
              <div key={e.id} className="rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${isExpanded ? '#1565C0' : 'rgba(255,255,255,0.08)'}` }}>

                {/* Header */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 cursor-pointer" onClick={() => toggleExpanded(e.id)}>
                      <h3 className="font-display font-semibold text-white">{e.titulo}</h3>
                      <p className="text-sm text-gray-400 mt-1">{e.pergunta}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {e.opcoes.map((o, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: '#9AA5B8' }}>{o}</span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => handleDelete(e.id)} className="text-gray-500 hover:text-red-400 flex-shrink-0"><X size={16} /></button>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{enviados.length} enviados de {contacts.length}</span>
                      <span className="font-mono" style={{ color: pctEnviado === 100 ? '#00AACC' : '#F5A623' }}>{pctEnviado}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pctEnviado}%`, background: pctEnviado === 100 ? '#00AACC' : '#F5A623' }}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button
                      onClick={() => toggleExpanded(e.id)}
                      className="flex items-center gap-1 text-xs font-display font-semibold px-3 py-1.5 rounded"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#9AA5B8' }}
                    >
                      {isExpanded ? 'Fechar' : 'Gerenciar envios'} <ChevronRight size={14} style={{ transform: isExpanded ? 'rotate(90deg)' : 'none' }} />
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => setShowAnalytics(e)} className="flex items-center gap-1 text-xs font-display font-semibold px-3 py-1.5 rounded" style={{ background: '#1565C033', color: '#00AACC' }}>
                        📊 Gráficos
                      </button>
                      <button onClick={() => setApplying(e)} className="flex items-center gap-1 text-xs font-display font-semibold px-3 py-1.5 rounded" style={{ background: '#00AACC22', color: '#00AACC' }}>
                        Lançar respostas <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded envio manager */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    {/* Sub-tabs */}
                    <div className="flex">
                      {[
                        { id: 'nao_enviado', label: `Não enviado (${naoEnviados.length})` },
                        { id: 'enviado', label: `Enviado (${enviadosList.length})` },
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => setEnvioTab(prev => ({ ...prev, [e.id]: t.id }))}
                          className="flex-1 py-2.5 text-xs font-display font-semibold uppercase tracking-wide transition-colors"
                          style={{
                            background: tab === t.id ? 'rgba(21,101,192,0.2)' : 'rgba(255,255,255,0.02)',
                            color: tab === t.id ? '#00AACC' : '#9AA5B8',
                            borderBottom: tab === t.id ? '2px solid #00AACC' : '2px solid transparent',
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    <div className="p-3 space-y-2">
                      {/* Search + mark all */}
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input
                            value={search}
                            onChange={ev => setSearchEnvio(prev => ({ ...prev, [e.id]: ev.target.value }))}
                            placeholder="Buscar contato..."
                            className="w-full pl-8 pr-3 py-2 rounded text-xs text-white"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                          />
                        </div>
                        <button
                          onClick={() => markAllSent(e.id, listaFiltrada.map(c => c.id))}
                          className="px-3 py-2 rounded text-xs font-display font-semibold whitespace-nowrap"
                          style={{ background: tab === 'nao_enviado' ? '#1565C022' : '#D6454522', color: tab === 'nao_enviado' ? '#00AACC' : '#D64545' }}
                        >
                          {tab === 'nao_enviado' ? '✓ Marcar todos' : '✕ Desmarcar todos'}
                        </button>
                      </div>

                      {/* Contact list */}
                      <div className="max-h-64 overflow-y-auto scrollbar-thin space-y-1 pr-1">
                        {listaFiltrada.length === 0 ? (
                          <div className="text-center py-4 text-xs text-gray-500">
                            {tab === 'nao_enviado' ? 'Todos os contatos já foram enviados.' : 'Nenhum envio registrado ainda.'}
                          </div>
                        ) : listaFiltrada.map(c => (
                          <div key={c.id} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-sm text-white truncate">{c.nome}</span>
                              <span className="text-xs text-gray-500 flex-shrink-0">{c.bairro !== 'Não informado' ? c.bairro : ''}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <a
                                href={`https://wa.me/55${c.telefone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs px-2 py-1 rounded"
                                style={{ background: '#25D36622', color: '#25D366' }}
                              >
                                WA
                              </a>
                              <button
                                onClick={() => markSent(e.id, c.id)}
                                className="text-xs px-2 py-1 rounded font-medium"
                                style={
                                  tab === 'nao_enviado'
                                    ? { background: '#1565C022', color: '#00AACC' }
                                    : { background: '#D6454522', color: '#D64545' }
                                }
                              >
                                {tab === 'nao_enviado' ? 'Enviado ✓' : 'Desfazer'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && <EnqueteForm onSave={handleCreate} onClose={() => setShowForm(false)} />}
      {showAnalytics && (
        <EnqueteAnalytics
          enquete={showAnalytics}
          contacts={contacts}
          onClose={() => setShowAnalytics(null)}
        />
      )}
      {applying && (
        <ApplyEnquete
          enquete={applying}
          contacts={contacts}
          setContacts={setContacts}
          setEnquetes={setEnquetes}
          onClose={() => setApplying(null)}
          showToast={showToast}
        />
      )}
    </div>
  );
}

function EnqueteForm({ onSave, onClose }) {
  const [titulo, setTitulo] = useState('');
  const [pergunta, setPergunta] = useState('');
  const [opcoes, setOpcoes] = useState(['', '']);

  function updateOpcao(i, value) {
    setOpcoes(prev => prev.map((o, idx) => idx === i ? value : o));
  }

  function addOpcao() {
    if (opcoes.length < 12) setOpcoes(prev => [...prev, '']);
  }

  function removeOpcao(i) {
    setOpcoes(prev => prev.filter((_, idx) => idx !== i));
  }

  function submit(e) {
    e.preventDefault();
    const cleanOpcoes = opcoes.map(o => o.trim()).filter(Boolean);
    if (!titulo || !pergunta || cleanOpcoes.length < 2) return;
    onSave({ titulo, pergunta, opcoes: cleanOpcoes });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-md rounded-lg p-5 max-h-[90vh] overflow-y-auto scrollbar-thin" style={{ background: '#0D1E6E', border: '1px solid rgba(0,170,204,0.3)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-white text-lg">Nova enquete</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Título interno *">
            <input required value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Censo de bairros" className="w-full px-3 py-2 rounded text-sm text-white" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </Field>
          <Field label="Pergunta (texto da enquete no WhatsApp) *">
            <textarea required value={pergunta} onChange={e => setPergunta(e.target.value)} rows={3} className="w-full px-3 py-2 rounded text-sm text-white resize-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </Field>
          <Field label={`Opções (2 a 12) — ${opcoes.length}/12`}>
            <div className="space-y-2">
              {opcoes.map((o, i) => (
                <div key={i} className="flex gap-2">
                  <input value={o} onChange={e => updateOpcao(i, e.target.value)} placeholder={`Opção ${i + 1}`} className="flex-1 px-3 py-2 rounded text-sm text-white" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                  {opcoes.length > 2 && (
                    <button type="button" onClick={() => removeOpcao(i)} className="text-gray-500 hover:text-red-400 px-1"><X size={16} /></button>
                  )}
                </div>
              ))}
            </div>
            {opcoes.length < 12 && (
              <button type="button" onClick={addOpcao} className="mt-2 text-xs font-medium" style={{ color: '#00AACC' }}>+ Adicionar opção</button>
            )}
          </Field>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-300" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-display font-semibold" style={{ background: '#00AACC', color: '#0A1226' }}>Criar enquete</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------- Enquete Analytics ----------

const CHART_COLORS = ['#00AACC', '#1565C0', '#F5A623', '#00CC88', '#CC4488', '#9966CC', '#FF6633', '#33CCFF', '#FFCC00', '#66CC33', '#FF3366', '#3366FF'];

function EnqueteAnalytics({ enquete, contacts, onClose }) {
  const [viewTab, setViewTab] = useState('geral');
  const [filterBairro, setFilterBairro] = useState('todos');

  const respostasMap = enquete.respostasMap || {};
  const enviados = enquete.enviados || [];

  // Build enriched responses: { contactId, opcao, bairro, lideranca }
  const respostas = useMemo(() => {
    return Object.entries(respostasMap)
      .filter(([, v]) => v)
      .map(([cid, opcao]) => {
        const c = contacts.find(x => x.id === cid) || {};
        return { cid, opcao, bairro: c.bairro || 'Não informado', lideranca: c.lideranca || 'Sem indicação' };
      });
  }, [respostasMap, contacts]);

  const totalRespostas = respostas.length;
  const totalEnviados = enviados.length;
  const taxaResposta = totalEnviados > 0 ? Math.round((totalRespostas / totalEnviados) * 100) : 0;

  // Geral: count per opcao
  const geralData = useMemo(() => {
    const counts = {};
    enquete.opcoes.forEach(o => counts[o] = 0);
    respostas.forEach(r => { counts[r.opcao] = (counts[r.opcao] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [respostas, enquete.opcoes]);

  const maxGeral = Math.max(...geralData.map(([, v]) => v), 1);

  // Bairros disponíveis com respostas
  const bairrosComRespostas = useMemo(() => {
    const set = new Set(respostas.map(r => r.bairro));
    return ['todos', ...Array.from(set).sort()];
  }, [respostas]);

  // Por bairro: para cada bairro, count per opcao
  const porBairroData = useMemo(() => {
    const bairros = {};
    respostas.forEach(r => {
      if (!bairros[r.bairro]) bairros[r.bairro] = {};
      bairros[r.bairro][r.opcao] = (bairros[r.bairro][r.opcao] || 0) + 1;
    });
    return Object.entries(bairros)
      .filter(([b]) => filterBairro === 'todos' || b === filterBairro)
      .sort((a, b) => Object.values(b[1]).reduce((s, v) => s + v, 0) - Object.values(a[1]).reduce((s, v) => s + v, 0));
  }, [respostas, filterBairro]);

  // Por liderança: count per opcao
  const porLiderancaData = useMemo(() => {
    const lids = {};
    respostas.forEach(r => {
      if (!lids[r.lideranca]) lids[r.lideranca] = {};
      lids[r.lideranca][r.opcao] = (lids[r.lideranca][r.opcao] || 0) + 1;
    });
    return Object.entries(lids).sort((a, b) =>
      Object.values(b[1]).reduce((s, v) => s + v, 0) - Object.values(a[1]).reduce((s, v) => s + v, 0)
    );
  }, [respostas]);

  // Taxa de resposta por bairro
  const taxaPorBairro = useMemo(() => {
    const enviMap = {};
    enviados.forEach(cid => {
      const c = contacts.find(x => x.id === cid);
      const b = c?.bairro || 'Não informado';
      if (!enviMap[b]) enviMap[b] = { enviados: 0, responderam: 0 };
      enviMap[b].enviados += 1;
    });
    respostas.forEach(r => {
      if (!enviMap[r.bairro]) enviMap[r.bairro] = { enviados: 0, responderam: 0 };
      enviMap[r.bairro].responderam += 1;
    });
    return Object.entries(enviMap)
      .map(([b, v]) => ({ bairro: b, ...v, taxa: v.enviados > 0 ? Math.round((v.responderam / v.enviados) * 100) : 0 }))
      .sort((a, b) => b.taxa - a.taxa);
  }, [enviados, respostas, contacts]);

  const subtabs = [
    { id: 'geral', label: 'Geral' },
    { id: 'bairro', label: 'Por bairro' },
    { id: 'lideranca', label: 'Por liderança' },
    { id: 'taxa', label: 'Taxa de resposta' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-2xl rounded-lg flex flex-col max-h-[90vh]" style={{ background: '#0D1E6E', border: '1px solid rgba(0,170,204,0.3)' }}>

        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3">
          <div>
            <div className="font-mono text-xs tracking-widest mb-1" style={{ color: '#00AACC' }}>ANÁLISE DE ENQUETE</div>
            <h3 className="font-display font-bold text-white text-xl">{enquete.titulo}</h3>
            <p className="text-xs text-gray-400 mt-1">{enquete.pergunta}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white ml-4 flex-shrink-0"><X size={20} /></button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3 px-5 pb-3">
          {[
            { label: 'Respostas', value: totalRespostas },
            { label: 'Enviados', value: totalEnviados },
            { label: 'Taxa de resposta', value: `${taxaResposta}%` },
          ].map(k => (
            <div key={k.label} className="rounded-lg p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="font-display text-2xl font-bold" style={{ color: '#00AACC' }}>{k.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Sub-tabs */}
        <div className="flex px-5 gap-1 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {subtabs.map(t => (
            <button key={t.id} onClick={() => setViewTab(t.id)}
              className="px-3 py-2 text-xs font-display font-semibold uppercase tracking-wide"
              style={{ color: viewTab === t.id ? '#00AACC' : '#9AA5B8', borderBottom: viewTab === t.id ? '2px solid #00AACC' : '2px solid transparent' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
          {totalRespostas === 0 ? (
            <EmptyState text="Nenhuma resposta registrada ainda. Lance as respostas para ver os gráficos." />
          ) : (
            <>
              {/* GERAL */}
              {viewTab === 'geral' && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-400">Total de votos por opção</p>
                  {geralData.map(([opcao, count], i) => {
                    const pct = Math.round((count / totalRespostas) * 100);
                    const barW = Math.round((count / maxGeral) * 100);
                    return (
                      <div key={opcao}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-200">{opcao}</span>
                          <span className="font-mono text-gray-400">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-6 rounded overflow-hidden flex items-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <div className="h-full rounded flex items-center px-2 transition-all"
                            style={{ width: `${barW}%`, background: CHART_COLORS[i % CHART_COLORS.length], minWidth: count > 0 ? '2px' : '0' }}>
                            {barW > 15 && <span className="text-xs font-bold text-white">{count}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* POR BAIRRO */}
              {viewTab === 'bairro' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Filtrar bairro:</span>
                    <select value={filterBairro} onChange={e => setFilterBairro(e.target.value)}
                      className="crm-select px-2 py-1 rounded text-xs text-white"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {bairrosComRespostas.map(b => <option key={b} value={b}>{b === 'todos' ? 'Todos os bairros' : b}</option>)}
                    </select>
                  </div>
                  {porBairroData.length === 0 ? (
                    <EmptyState text="Nenhuma resposta para este bairro." />
                  ) : porBairroData.map(([bairro, counts]) => {
                    const total = Object.values(counts).reduce((s, v) => s + v, 0);
                    const dominante = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
                    return (
                      <div key={bairro} className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-display font-semibold text-white flex items-center gap-1"><MapPin size={13} style={{ color: '#00AACC' }} />{bairro}</span>
                          <span className="text-xs text-gray-400 font-mono">{total} respostas</span>
                        </div>
                        <div className="space-y-1.5">
                          {enquete.opcoes.map((opcao, i) => {
                            const count = counts[opcao] || 0;
                            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                            return (
                              <div key={opcao} className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 w-28 truncate flex-shrink-0">{opcao}</span>
                                <div className="flex-1 h-4 rounded overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                  <div className="h-full rounded" style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }}></div>
                                </div>
                                <span className="text-xs font-mono text-gray-400 w-10 text-right flex-shrink-0">{count > 0 ? `${pct}%` : '—'}</span>
                              </div>
                            );
                          })}
                        </div>
                        {dominante && dominante[1] > 0 && (
                          <div className="mt-2 text-xs" style={{ color: '#00AACC' }}>
                            ↑ Predomina: <strong>{dominante[0]}</strong> ({dominante[1]} votos)
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* POR LIDERANÇA */}
              {viewTab === 'lideranca' && (
                <div className="space-y-3">
                  {porLiderancaData.map(([lid, counts]) => {
                    const total = Object.values(counts).reduce((s, v) => s + v, 0);
                    const dominante = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
                    return (
                      <div key={lid} className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-display font-semibold text-white">{lid}</span>
                          <span className="text-xs text-gray-400 font-mono">{total} respostas</span>
                        </div>
                        <div className="space-y-1.5">
                          {enquete.opcoes.map((opcao, i) => {
                            const count = counts[opcao] || 0;
                            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                            return (
                              <div key={opcao} className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 w-28 truncate flex-shrink-0">{opcao}</span>
                                <div className="flex-1 h-4 rounded overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                  <div className="h-full rounded" style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }}></div>
                                </div>
                                <span className="text-xs font-mono text-gray-400 w-10 text-right flex-shrink-0">{count > 0 ? `${pct}%` : '—'}</span>
                              </div>
                            );
                          })}
                        </div>
                        {dominante && <div className="mt-2 text-xs" style={{ color: '#00AACC' }}>↑ Predomina: <strong>{dominante[0]}</strong></div>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAXA DE RESPOSTA POR BAIRRO */}
              {viewTab === 'taxa' && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 mb-3">Bairros com mais contatos que não responderam = prioridade para novo disparo.</p>
                  {taxaPorBairro.length === 0 ? (
                    <EmptyState text="Marque os envios na aba 'Gerenciar envios' para ver a taxa por bairro." />
                  ) : taxaPorBairro.map(t => (
                    <div key={t.bairro} className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-white flex items-center gap-1"><MapPin size={12} style={{ color: '#00AACC' }} />{t.bairro}</span>
                        <span className="font-mono text-sm font-bold" style={{ color: t.taxa >= 70 ? '#00AACC' : t.taxa >= 40 ? '#F5A623' : '#D64545' }}>{t.taxa}%</span>
                      </div>
                      <div className="w-full h-2 rounded overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded" style={{ width: `${t.taxa}%`, background: t.taxa >= 70 ? '#00AACC' : t.taxa >= 40 ? '#F5A623' : '#D64545' }}></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>{t.responderam} responderam de {t.enviados} enviados</span>
                        {t.taxa < 40 && <span style={{ color: '#D64545' }}>⚠ Redisparar</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ApplyEnquete({ enquete, contacts, setContacts, setEnquetes, onClose, showToast }) {
  const [search, setSearch] = useState('');
  const existing = enquete.respostasMap || {};
  const [responses, setResponses] = useState(existing);

  const filtered = useMemo(() => {
    return contacts.filter(c => !search || c.nome.toLowerCase().includes(search.toLowerCase()));
  }, [contacts, search]);

  function setResponse(contactId, opcao) {
    setResponses(prev => ({ ...prev, [contactId]: opcao }));
  }

  function submit() {
    const newEntries = Object.entries(responses).filter(([, v]) => v);
    if (newEntries.length === 0) return;

    setContacts(prev => prev.map(c => {
      if (!(c.id in responses) || !responses[c.id]) return c;
      const resposta = responses[c.id];
      const updates = { ultimaEnquete: enquete.titulo };
      if (BAIRROS_FRIBURGO.includes(resposta)) updates.bairro = resposta;
      else if (PAUTAS.includes(resposta)) updates.pauta = resposta;
      return { ...c, ...updates };
    }));

    setEnquetes(prev => prev.map(e => e.id === enquete.id
      ? { ...e, respostas: newEntries.length, respostasMap: responses }
      : e
    ));
    showToast(`${newEntries.length} respostas registradas`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-lg rounded-lg p-5 max-h-[85vh] flex flex-col" style={{ background: '#0D1E6E', border: '1px solid rgba(0,170,204,0.3)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-display font-bold text-white text-lg">Lançar respostas</h3>
            <p className="text-xs text-gray-400 mt-0.5">{enquete.titulo}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={18} /></button>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar contato..."
          className="w-full px-3 py-2 rounded text-sm text-white mb-3"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 pr-1">
          {filtered.map(c => (
            <div key={c.id} className="flex items-center justify-between gap-2 p-2 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="min-w-0">
                <span className="text-sm text-white truncate block">{c.nome}</span>
                <span className="text-xs text-gray-500">{c.bairro !== 'Não informado' ? c.bairro : 'Bairro não definido'}</span>
              </div>
              <select
                value={responses[c.id] || ''}
                onChange={e => setResponse(c.id, e.target.value)}
                className="crm-select text-xs px-2 py-1 rounded text-white flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <option value="">— sem resposta —</option>
                {enquete.opcoes.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-300" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>Cancelar</button>
          <button onClick={submit} className="flex-1 py-2.5 rounded-lg text-sm font-display font-semibold flex items-center justify-center gap-2" style={{ background: '#00AACC', color: '#0A1226' }}>
            <Check size={16} /> Registrar respostas
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Lideranças ----------

function Ranking({ contacts, setContacts, showToast }) {
  const [expanded, setExpanded] = useState(null);
  const [metas, setMetas] = useState({});
  const [showMeta, setShowMeta] = useState(null);
  const [editMeta, setEditMeta] = useState({ meta: '', prazo: '' });
  const [showNovaLideranca, setShowNovaLideranca] = useState(false);
  const [novaLiderancaNome, setNovaLiderancaNome] = useState('');
  const [showAddContato, setShowAddContato] = useState(null); // nome da liderança
  const [editingContato, setEditingContato] = useState(null);
  const [showImportContato, setShowImportContato] = useState(null); // nome da liderança
  const [searchMap, setSearchMap] = useState({});
  const [statusTabMap, setStatusTabMap] = useState({}); // liderança -> status atual selecionado

  const liderancas = useMemo(() => {
    const map = {};
    contacts.forEach(c => {
      const lid = c.lideranca || 'Sem indicação';
      if (!map[lid]) map[lid] = { nome: lid, total: 0, interagiu: 0, comBairro: 0, contatos: [] };
      map[lid].total += 1;
      if (c.status === 'interagiu') map[lid].interagiu += 1;
      if (c.bairro && c.bairro !== 'Não informado') map[lid].comBairro += 1;
      map[lid].contatos.push(c);
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [contacts]);

  function criarLideranca() {
    const nome = novaLiderancaNome.trim();
    if (!nome) return;
    // Add a placeholder contact so the liderança appears
    setContacts(prev => [...prev, {
      id: `lid-placeholder-${Date.now()}`,
      nome: `(sem contatos)`,
      telefone: '',
      bairro: 'Não informado',
      status: 'nao_enviado',
      pauta: '',
      lideranca: nome,
      origem: 'Manual',
      ultimaEnquete: '',
      criadoEm: new Date().toISOString(),
      placeholder: true,
    }]);
    setShowNovaLideranca(false);
    setNovaLiderancaNome('');
    showToast(`Liderança "${nome}" criada`);
  }

  function handleSaveContato(contato, liderancaNome) {
    const c = { ...contato, lideranca: liderancaNome };
    if (c.id) {
      setContacts(prev => prev.map(x => x.id === c.id ? c : x));
      showToast('Contato atualizado');
    } else {
      setContacts(prev => [
        ...prev.filter(x => !(x.placeholder && x.lideranca === liderancaNome)),
        { ...c, id: `c-${Date.now()}`, criadoEm: new Date().toISOString() }
      ]);
      showToast('Contato adicionado');
    }
    setShowAddContato(null);
    setEditingContato(null);
  }

  function handleDeleteContato(id) {
    setContacts(prev => prev.filter(c => c.id !== id));
    showToast('Contato removido');
  }

  function handleImportContatos(newContacts) {
    setContacts(prev => [
      ...prev.filter(x => !(x.placeholder && x.lideranca === showImportContato)),
      ...newContacts
    ]);
    showToast(`${newContacts.length} contatos importados`);
    setShowImportContato(null);
  }

  function toggleStatus(c) {
    const ordem = ['nao_enviado', 'aguardando', 'interagiu', 'nao_interagiu'];
    const atual = ordem.indexOf(c.status || 'nao_enviado');
    const novoStatus = ordem[(atual + 1) % ordem.length];
    setContacts(prev => prev.map(x => x.id === c.id ? { ...x, status: novoStatus } : x));
    showToast(`${c.nome} → ${STATUS_MAP[novoStatus]?.label}`);
  }

  function saveMeta(nome) {
    setMetas(prev => ({ ...prev, [nome]: { meta: Number(editMeta.meta) || 0, prazo: editMeta.prazo } }));
    setShowMeta(null);
    showToast('Meta salva');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-white">Lideranças</h2>
          <p className="text-sm text-gray-400 mt-0.5">Clique numa liderança para ver e gerenciar os contatos.</p>
        </div>
        <button
          onClick={() => setShowNovaLideranca(true)}
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-display font-semibold"
          style={{ background: '#1565C0', color: '#fff' }}
        >
          <Plus size={16} /> Nova liderança
        </button>
      </div>

      {liderancas.length === 0 ? (
        <EmptyState text="Nenhuma liderança registrada ainda." />
      ) : (
        <div className="space-y-2">
          {liderancas.map(l => {
            const m = metas[l.nome] || {};
            const meta = m.meta || 0;
            const pct = meta > 0 ? Math.min(100, Math.round((l.total / meta) * 100)) : 0;
            const isOpen = expanded === l.nome;
            const search = searchMap[l.nome] || '';
            const contatosReais = l.contatos.filter(c => !c.placeholder);
            const statusAtivo = statusTabMap[l.nome] || 'nao_enviado';
            const contatosFiltrados = contatosReais.filter(c =>
              (c.status || 'nao_enviado') === statusAtivo &&
              (!search || c.nome.toLowerCase().includes(search.toLowerCase()) || c.telefone.includes(search))
            );
            const contagemPorStatus = STATUS_OPTIONS.reduce((acc, s) => {
              acc[s.value] = contatosReais.filter(c => (c.status || 'nao_enviado') === s.value).length;
              return acc;
            }, {});

            return (
              <div key={l.nome} className="rounded-lg overflow-hidden"
                style={{ border: isOpen ? '1px solid #1565C0' : '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>

                {/* Liderança header — clicável */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : l.nome)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <ChevronRight size={16} className="flex-shrink-0 transition-transform" style={{ color: '#00AACC', transform: isOpen ? 'rotate(90deg)' : 'none' }} />
                    <div className="flex-1 min-w-0">
                      <span className="font-display font-bold text-white text-base">{l.nome}</span>
                      <div className="flex gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1"><Users size={11} /> {contatosReais.length} contatos</span>
                        <span style={{ color: l.interagiu > 0 ? '#00AACC' : undefined }}>{l.interagiu} interagiram</span>
                        <span className="flex items-center gap-1"><MapPin size={11} /> {l.comBairro} c/ bairro</span>
                      </div>
                      {meta > 0 && (
                        <div className="mt-2">
                          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 100 ? '#00AACC' : '#1565C0' }}></div>
                          </div>
                          <div className="flex justify-between mt-0.5 text-xs text-gray-500">
                            <span>{contatosReais.length}/{meta} contatos ({pct}%)</span>
                            {m.prazo && <span>Prazo: {m.prazo}</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => { setShowMeta(l.nome); setEditMeta({ meta: m.meta || '', prazo: m.prazo || '' }); }}
                      className="text-xs px-2 py-1 rounded"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#9AA5B8' }}
                    >
                      {meta > 0 ? `Meta: ${meta}` : 'Definir meta'}
                    </button>
                  </div>
                </div>

                {/* Contatos expandidos */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="p-3 flex gap-2">
                      <div className="relative flex-1">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          value={search}
                          onChange={e => setSearchMap(prev => ({ ...prev, [l.nome]: e.target.value }))}
                          placeholder="Buscar contato..."
                          className="w-full pl-8 pr-3 py-2 rounded text-xs text-white"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                      </div>
                      <button
                        onClick={() => setShowImportContato(l.nome)}
                        className="flex items-center gap-1 px-3 py-2 rounded text-xs font-display font-semibold flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.06)', color: '#9AA5B8', border: '1px solid rgba(255,255,255,0.12)' }}
                      >
                        <Upload size={14} /> Planilha
                      </button>
                      <button
                        onClick={() => { setShowAddContato(l.nome); setEditingContato(null); }}
                        className="flex items-center gap-1 px-3 py-2 rounded text-xs font-display font-semibold flex-shrink-0"
                        style={{ background: '#1565C0', color: '#fff' }}
                      >
                        <Plus size={14} /> Contato
                      </button>
                    </div>

                    {/* Sub-abas de status */}
                    <div className="flex px-3 gap-1 pb-2">
                      {STATUS_OPTIONS.map(s => (
                        <button
                          key={s.value}
                          onClick={() => setStatusTabMap(prev => ({ ...prev, [l.nome]: s.value }))}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-display font-semibold uppercase tracking-wide transition-colors"
                          style={{
                            background: statusAtivo === s.value ? `${s.color}22` : 'rgba(255,255,255,0.03)',
                            color: statusAtivo === s.value ? s.color : '#9AA5B8',
                            border: statusAtivo === s.value ? `1px solid ${s.color}` : '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          {s.label}
                          <span className="font-mono" style={{ opacity: 0.8 }}>{contagemPorStatus[s.value] || 0}</span>
                        </button>
                      ))}
                    </div>

                    <div className="max-h-72 overflow-y-auto scrollbar-thin">
                      {contatosFiltrados.length === 0 ? (
                        <div className="text-center py-6 text-xs text-gray-500">
                          {contatosReais.length === 0
                            ? 'Nenhum contato ainda. Adicione o primeiro.'
                            : search
                              ? 'Nenhum resultado para a busca.'
                              : `Nenhum contato em "${STATUS_MAP[statusAtivo]?.label}".`}
                        </div>
                      ) : contatosFiltrados.map(c => (
                        <div
                          key={c.id}
                          className="flex items-start gap-2 px-3 py-2.5 border-t cursor-pointer transition-colors hover:bg-white/5"
                          style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                          onClick={() => { setEditingContato(c); setShowAddContato(l.nome); }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white truncate">{c.nome}</div>
                            <div className="flex gap-2 mt-0.5 text-xs text-gray-400">
                              <span className="font-mono">{c.telefone}</span>
                              {c.bairro && c.bairro !== 'Não informado' ? (
                                <span>· {c.bairro}</span>
                              ) : (
                                <span style={{ color: '#F5A623' }}>· bairro pendente</span>
                              )}
                              {c.pauta && <span>· {c.pauta}</span>}
                            </div>
                            {c.ultimaMensagem && (
                              <div className="flex items-start gap-1 mt-1.5 text-xs" style={{ color: '#9AA5B8' }}>
                                <MessageCircle size={11} className="mt-0.5 flex-shrink-0" style={{ color: '#00AACC' }} />
                                <span className="truncate">{c.ultimaMensagem}</span>
                                {c.ultimaMensagemData && (
                                  <span className="flex-shrink-0 text-gray-500">
                                    · {new Date(c.ultimaMensagemData + 'T00:00:00').toLocaleDateString('pt-BR')}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => toggleStatus(c)}
                              className="text-xs px-2 py-1 rounded font-medium"
                              style={{ background: `${STATUS_MAP[c.status]?.color}22`, color: STATUS_MAP[c.status]?.color }}
                            >
                              {STATUS_MAP[c.status]?.label || c.status}
                            </button>
                            {c.telefone && (
                              <a
                                href={`https://wa.me/55${c.telefone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs px-2 py-1 rounded"
                                style={{ background: '#25D36622', color: '#25D366' }}
                              >
                                WA
                              </a>
                            )}
                            <button
                              onClick={() => { setEditingContato(c); setShowAddContato(l.nome); }}
                              className="text-xs text-gray-400 hover:text-white px-1"
                            >✎</button>
                            <button
                              onClick={() => handleDeleteContato(c.id)}
                              className="text-xs text-gray-500 hover:text-red-400 px-1"
                            >✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: nova liderança */}
      {showNovaLideranca && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm rounded-lg p-5" style={{ background: '#0D1E6E', border: '1px solid rgba(0,170,204,0.3)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-white">Nova liderança</h3>
              <button onClick={() => setShowNovaLideranca(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            <Field label="Nome da liderança">
              <input
                autoFocus
                value={novaLiderancaNome}
                onChange={e => setNovaLiderancaNome(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && criarLideranca()}
                placeholder="Ex: Marcelo"
                className="w-full px-3 py-2 rounded text-sm text-white"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </Field>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowNovaLideranca(false)} className="flex-1 py-2.5 rounded-lg text-sm text-gray-300" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>Cancelar</button>
              <button onClick={criarLideranca} className="flex-1 py-2.5 rounded-lg text-sm font-display font-semibold" style={{ background: '#00AACC', color: '#0A1226' }}>Criar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: adicionar/editar contato */}
      {showAddContato && (
        <ContactForm
          contact={editingContato}
          liderancaFixa={showAddContato}
          onSave={c => handleSaveContato(c, showAddContato)}
          onClose={() => { setShowAddContato(null); setEditingContato(null); }}
        />
      )}

      {/* Modal: importar contatos via planilha */}
      {showImportContato && (
        <ImportModal
          liderancaFixa={showImportContato}
          onImport={handleImportContatos}
          onClose={() => setShowImportContato(null)}
        />
      )}

      {/* Modal: meta */}
      {showMeta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm rounded-lg p-5" style={{ background: '#0D1E6E', border: '1px solid rgba(0,170,204,0.3)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-white">Meta — {showMeta}</h3>
              <button onClick={() => setShowMeta(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <Field label="Contatos a trazer">
                <input type="number" min="1" value={editMeta.meta} onChange={e => setEditMeta(p => ({ ...p, meta: e.target.value }))} placeholder="Ex: 50" className="w-full px-3 py-2 rounded text-sm text-white" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </Field>
              <Field label="Prazo (opcional)">
                <input type="date" value={editMeta.prazo} onChange={e => setEditMeta(p => ({ ...p, prazo: e.target.value }))} className="w-full px-3 py-2 rounded text-sm text-white" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </Field>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowMeta(null)} className="flex-1 py-2.5 rounded-lg text-sm text-gray-300" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>Cancelar</button>
                <button onClick={() => saveMeta(showMeta)} className="flex-1 py-2.5 rounded-lg text-sm font-display font-semibold" style={{ background: '#00AACC', color: '#0A1226' }}>Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Fontes (Sources) ----------

function Fontes({ contacts, setContacts, showToast }) {
  const [selected, setSelected] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const fontes = useMemo(() => {
    const map = {};
    contacts.forEach(c => {
      const origem = c.origem || 'Sem origem definida';
      if (!map[origem]) map[origem] = { nome: origem, total: 0, interagiu: 0, comBairro: 0 };
      map[origem].total += 1;
      if (c.status === 'interagiu') map[origem].interagiu += 1;
      if (c.bairro && c.bairro !== 'Não informado') map[origem].comBairro += 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);const total = contacts.length;

  const selectedContacts = useMemo(() => {
    if (!selected) return [];
    return contacts.filter(c => (c.origem || 'Sem origem definida') === selected);
  }, [contacts, selected]);

  function startRename(fonte) {
    setRenaming(fonte);
    setRenameValue(fonte);
  }

  function confirmRename() {
    const novo = renameValue.trim();
    if (!novo || novo === renaming) {
      setRenaming(null);
      return;
    }
    setContacts(prev => prev.map(c => (c.origem || 'Sem origem definida') === renaming ? { ...c, origem: novo } : c));
    if (selected === renaming) setSelected(novo);
    showToast('Fonte renomeada');
    setRenaming(null);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-bold text-white">Fontes de contato</h2>
        <p className="text-sm text-gray-400 mt-1">Acompanhe de onde vêm os contatos da base e o desempenho de cada origem.</p>
      </div>

      {fontes.length === 0 ? (
        <EmptyState text="Nenhuma fonte registrada ainda." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {fontes.map(f => {
            const pct = total > 0 ? Math.round((f.total / total) * 100) : 0;
            const isSelected = selected === f.nome;
            return (
              <div
                key={f.nome}
                className="rounded-lg p-4 cursor-pointer transition-colors"
                style={{
                  background: isSelected ? 'rgba(0,170,204,0.08)' : 'rgba(255,255,255,0.02)',
                  border: isSelected ? '1px solid #00AACC' : '1px solid rgba(255,255,255,0.08)',
                }}
                onClick={() => setSelected(isSelected ? null : f.nome)}
              >
                <div className="flex items-start justify-between gap-2">
                  {renaming === f.nome ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      onBlur={confirmRename}
                      onKeyDown={e => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setRenaming(null); }}
                      className="flex-1 px-2 py-1 rounded text-sm text-white font-display font-semibold"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid #00AACC' }}
                    />
                  ) : (
                    <span className="font-display font-semibold text-white">{f.nome}</span>
                  )}
                  <span className="font-mono text-sm flex-shrink-0" style={{ color: '#00AACC' }}>{f.total}</span>
                </div>

                <div className="w-full h-1.5 rounded-full overflow-hidden mt-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#1565C0' }}></div>
                </div>

                <div className="flex gap-4 mt-2 text-xs text-gray-400"><span>{pct}% da base</span>
                  <span>{f.interagiu} interagiram</span>
                  <span>{f.comBairro} c/ bairro</span>
                </div>

                {renaming !== f.nome && (
                  <button
                    onClick={e => { e.stopPropagation(); startRename(f.nome); }}
                    className="text-xs mt-2"
                    style={{ color: '#9AA5B8' }}
                  >
                    Renomear fonte
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wide">
              Contatos — {selected} ({selectedContacts.length})
            </h3>
            <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white"><X size={16} /></button>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <th className="text-left px-3 py-2 font-display text-xs uppercase tracking-wide text-gray-400">Nome</th>
                  <th className="text-left px-3 py-2 font-display text-xs uppercase tracking-wide text-gray-400">Telefone</th>
                  <th className="text-left px-3 py-2 font-display text-xs uppercase tracking-wide text-gray-400">Bairro</th>
                  <th className="text-left px-3 py-2 font-display text-xs uppercase tracking-wide text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {selectedContacts.slice(0, 50).map(c => (
                  <tr key={c.id} className="border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <td className="px-3 py-2 text-white">{c.nome}</td>
                    <td className="px-3 py-2 text-gray-400 font-mono">{c.telefone}</td>
                    <td className={`px-3 py-2 ${c.bairro === 'Não informado' ? 'text-red-400' : 'text-gray-300'}`}>{c.bairro}</td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: `${STATUS_MAP[c.status]?.color}22`, color: STATUS_MAP[c.status]?.color }}>
                        {STATUS_MAP[c.status]?.label || c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selectedContacts.length > 50 && (
            <p className="text-xs text-gray-500 mt-2 text-center">Mostrando 50 de {selectedContacts.length} contatos.</p>
          )}
        </div>
      )}
    </div>
  );
}
                  
