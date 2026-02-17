import React, { useMemo, useState } from 'react';
import {
  Car, Package, Calendar, UserCheck, Truck, Users,
  AlertCircle, AlertTriangle, CheckCircle, Clock,
  TrendingUp, ArrowRight, Sun, FileText, BarChart2,
  Activity, Shield
} from 'lucide-react';

export default function Dashboard({
  vehicles,
  owners,
  thirdPartyVehicles,
  loans,
  events,
  staff,
  onNavigate
}) {

  const formatCurrency = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR');
  };

  const today = new Date();
  const todayStr = today.toLocaleDateString('pt-BR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  // Capitaliza primeira letra
  const todayFormatted = todayStr.charAt(0).toUpperCase() + todayStr.slice(1);

  // ─────────────────────────────────────────
  // CÁLCULOS
  // ─────────────────────────────────────────

  const stats = useMemo(() => {
    // Empréstimos
    const activeLoans = loans.filter(l => l.status === 'emprestado');
    const lateLoans = loans.filter(l => l.status === 'atrasado');

    // Eventos próximos 15 dias
    const in15 = new Date(today);
    in15.setDate(in15.getDate() + 15);
    const upcomingEvents = events
      .filter(e => {
        const d = new Date(e.startDate + 'T12:00:00');
        return d >= today && d <= in15;
      })
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    // Gastos do mês atual
    const thisMonth = today.toISOString().substring(0, 7);
    const monthEvents = events.filter(e => e.startDate?.substring(0, 7) === thisMonth);
    const monthExpenses = monthEvents.reduce((sum, e) => sum + (e.totalExpenses || 0), 0);

    // Pessoal
    const activeStaff = (staff || []).filter(s => s.status === 'ativo');
    const absentStaff = (staff || []).filter(s => s.status === 'afastado');
    const vacationStaff = (staff || []).filter(s => s.status === 'férias');

    // Alertas de férias — vencendo em até 90 dias ou vencidas
    const vacationAlerts = (staff || []).filter(s => {
      if (!s.hire_date || s.status === 'desligado') return false;
      const hire = new Date(s.hire_date + 'T12:00:00');
      const totalMonths =
        (today.getFullYear() - hire.getFullYear()) * 12 +
        (today.getMonth() - hire.getMonth());
      if (totalMonths < 12) return false;
      const periods = Math.floor(totalMonths / 12);
      const lastPeriodEnd = new Date(hire);
      lastPeriodEnd.setFullYear(lastPeriodEnd.getFullYear() + periods);
      const expiresOn = new Date(lastPeriodEnd);
      expiresOn.setFullYear(expiresOn.getFullYear() + 1);
      const daysUntil = Math.round((expiresOn - today) / (1000 * 60 * 60 * 24));
      return daysUntil <= 90;
    });

    return {
      // Veículos
      totalVehicles: vehicles.length,
      totalOwners: owners.length,
      totalThirdParty: thirdPartyVehicles.length,
      // Empréstimos
      activeLoans,
      lateLoans,
      totalLoans: loans.length,
      // Eventos
      upcomingEvents,
      totalEvents: events.length,
      monthExpenses,
      // Pessoal
      activeStaff,
      absentStaff,
      vacationStaff,
      vacationAlerts,
      totalStaff: (staff || []).length,
    };
  }, [vehicles, owners, thirdPartyVehicles, loans, events, staff]);

  // Total de alertas críticos
  const totalAlerts =
    stats.lateLoans.length +
    stats.vacationAlerts.length +
    stats.absentStaff.length;

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── BOAS-VINDAS ── */}
        <div className="bg-gradient-to-r from-gray-700 via-blue-400 to-indigo-700 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
            <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold">
                {new Date().getHours() < 12
                    ? 'Bom dia! ☀️'
                    : new Date().getHours() < 18
                    ? 'Boa tarde! 🌤️'
                    : 'Boa noite! 🌙'}
                </h2>
            </div>
            <p className="text-blue-200 text-sm">{todayFormatted}</p>
            </div>
          {totalAlerts > 0 && (
            <div className="bg-red-500/30 border border-red-400/50 rounded-xl px-4 py-3 flex items-center gap-3">
              <AlertTriangle size={24} className="text-red-300 flex-shrink-0" />
              <div>
                <div className="font-bold text-white text-lg">{totalAlerts}</div>
                <div className="text-red-200 text-xs">alerta(s) crítico(s)</div>
              </div>
            </div>
          )}
          {totalAlerts === 0 && (
            <div className="bg-green-500/30 border border-green-400/50 rounded-xl px-4 py-3 flex items-center gap-3">
              <CheckCircle size={24} className="text-green-300 flex-shrink-0" />
              <div className="text-green-200 text-sm font-medium">Tudo em ordem</div>
            </div>
          )}
        </div>
      </div>

      {/* ── CARDS DE MÓDULOS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">

        {/* Veículos */}
        <button
          onClick={() => onNavigate('vehicles')}
          className="bg-white rounded-xl border-2 border-blue-200 p-4 text-left hover:shadow-lg hover:border-blue-400 transition-all group"
        >
          <Car size={22} className="text-blue-600 mb-2" />
          <div className="text-2xl font-bold text-gray-800">{stats.totalVehicles}</div>
          <div className="text-xs text-gray-500">Veículos</div>
          <div className="text-xs text-blue-600 mt-1">{stats.totalOwners} proprietários</div>
        </button>

        {/* Terceiros */}
        <button
          onClick={() => onNavigate('thirdparty')}
          className="bg-white rounded-xl border-2 border-orange-200 p-4 text-left hover:shadow-lg hover:border-orange-400 transition-all group"
        >
          <Truck size={22} className="text-orange-600 mb-2" />
          <div className="text-2xl font-bold text-gray-800">{stats.totalThirdParty}</div>
          <div className="text-xs text-gray-500">Terceiros</div>
          <div className="text-xs text-orange-600 mt-1">veículos externos</div>
        </button>

        {/* Empréstimos */}
        <button
          onClick={() => onNavigate('loans')}
          className={`bg-white rounded-xl border-2 p-4 text-left hover:shadow-lg transition-all ${
            stats.lateLoans.length > 0
              ? 'border-red-300 hover:border-red-500'
              : 'border-yellow-200 hover:border-yellow-400'
          }`}
        >
          <Package size={22} className={stats.lateLoans.length > 0 ? 'text-red-600 mb-2' : 'text-yellow-600 mb-2'} />
          <div className="text-2xl font-bold text-gray-800">{stats.activeLoans.length}</div>
          <div className="text-xs text-gray-500">Empréstimos ativos</div>
          {stats.lateLoans.length > 0 ? (
            <div className="text-xs text-red-600 mt-1 font-bold flex items-center gap-1">
              <AlertCircle size={10} /> {stats.lateLoans.length} atrasado(s)
            </div>
          ) : (
            <div className="text-xs text-yellow-600 mt-1">{stats.totalLoans} no total</div>
          )}
        </button>

        {/* Eventos */}
        <button
          onClick={() => onNavigate('events')}
          className="bg-white rounded-xl border-2 border-emerald-200 p-4 text-left hover:shadow-lg hover:border-emerald-400 transition-all"
        >
          <Calendar size={22} className="text-emerald-600 mb-2" />
          <div className="text-2xl font-bold text-gray-800">{stats.upcomingEvents.length}</div>
          <div className="text-xs text-gray-500">Próx. 15 dias</div>
          <div className="text-xs text-emerald-600 mt-1">{stats.totalEvents} no total</div>
        </button>

        {/* Pessoal */}
        <button
          onClick={() => onNavigate('staff')}
          className={`bg-white rounded-xl border-2 p-4 text-left hover:shadow-lg transition-all ${
            stats.vacationAlerts.length > 0 || stats.absentStaff.length > 0
              ? 'border-orange-300 hover:border-orange-500'
              : 'border-purple-200 hover:border-purple-400'
          }`}
        >
          <UserCheck size={22} className="text-purple-600 mb-2" />
          <div className="text-2xl font-bold text-gray-800">{stats.activeStaff.length}</div>
          <div className="text-xs text-gray-500">Pessoal ativo</div>
          {(stats.vacationAlerts.length > 0 || stats.absentStaff.length > 0) ? (
            <div className="text-xs text-orange-600 mt-1 font-bold flex items-center gap-1">
              <AlertCircle size={10} />
              {stats.vacationAlerts.length + stats.absentStaff.length} alerta(s)
            </div>
          ) : (
            <div className="text-xs text-purple-600 mt-1">{stats.totalStaff} cadastrados</div>
          )}
        </button>

        {/* Relatórios */}
        <button
          onClick={() => onNavigate('reports')}
          className="bg-white rounded-xl border-2 border-indigo-200 p-4 text-left hover:shadow-lg hover:border-indigo-400 transition-all"
        >
          <BarChart2 size={22} className="text-indigo-600 mb-2" />
          <div className="text-2xl font-bold text-gray-800">
            {formatCurrency(stats.monthExpenses).replace('R$', '').trim()}
          </div>
          <div className="text-xs text-gray-500">Gastos este mês</div>
          <div className="text-xs text-indigo-600 mt-1">ver relatórios</div>
        </button>

      </div>

      {/* ── LINHA 3: ALERTAS + PRÓXIMOS EVENTOS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ALERTAS CRÍTICOS */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 px-4 py-3 flex items-center gap-2">
            <AlertTriangle size={18} className="text-white" />
            <h3 className="font-bold text-white">Alertas Críticos</h3>
            {totalAlerts > 0 && (
              <span className="ml-auto bg-white/30 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {totalAlerts}
              </span>
            )}
          </div>
          <div className="p-4 space-y-2">

            {/* Empréstimos atrasados */}
            {stats.lateLoans.length > 0 ? (
              <button
                onClick={() => onNavigate('loans')}
                className="w-full flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors text-left"
              >
                <Package size={16} className="text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-bold text-red-700">
                    {stats.lateLoans.length} empréstimo(s) atrasado(s)
                  </div>
                  <div className="text-xs text-red-500">Clique para ver detalhes</div>
                </div>
                <ArrowRight size={14} className="text-red-400" />
              </button>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                <div className="text-sm text-green-700">Nenhum empréstimo atrasado</div>
              </div>
            )}

            {/* Férias vencendo */}
            {stats.vacationAlerts.length > 0 ? (
              <button
                onClick={() => onNavigate('staff')}
                className="w-full flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl hover:bg-yellow-100 transition-colors text-left"
              >
                <Sun size={16} className="text-yellow-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-bold text-yellow-700">
                    {stats.vacationAlerts.length} funcionário(s) com férias vencendo
                  </div>
                  <div className="text-xs text-yellow-500">
                    {stats.vacationAlerts.slice(0, 2).map(s => s.name.split(' ')[0]).join(', ')}
                    {stats.vacationAlerts.length > 2 && ` e mais ${stats.vacationAlerts.length - 2}`}
                  </div>
                </div>
                <ArrowRight size={14} className="text-yellow-400" />
              </button>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                <div className="text-sm text-green-700">Nenhuma férias vencendo</div>
              </div>
            )}

            {/* Funcionários afastados */}
            {stats.absentStaff.length > 0 ? (
              <button
                onClick={() => onNavigate('staff')}
                className="w-full flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors text-left"
              >
                <UserCheck size={16} className="text-orange-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-bold text-orange-700">
                    {stats.absentStaff.length} funcionário(s) afastado(s)
                  </div>
                  <div className="text-xs text-orange-500">
                    {stats.absentStaff.slice(0, 2).map(s => s.name.split(' ')[0]).join(', ')}
                    {stats.absentStaff.length > 2 && ` e mais ${stats.absentStaff.length - 2}`}
                  </div>
                </div>
                <ArrowRight size={14} className="text-orange-400" />
              </button>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                <div className="text-sm text-green-700">Nenhum funcionário afastado</div>
              </div>
            )}

          </div>
        </div>

        {/* PRÓXIMOS EVENTOS */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-white" />
              <h3 className="font-bold text-white">Próximos 15 Dias</h3>
            </div>
            <button
              onClick={() => onNavigate('events')}
              className="text-emerald-200 hover:text-white text-xs flex items-center gap-1"
            >
              Ver todos <ArrowRight size={12} />
            </button>
          </div>
          <div className="p-4">
            {stats.upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Calendar size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum evento nos próximos 15 dias</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.upcomingEvents.slice(0, 6).map(e => {
                  const eventDate = new Date(e.startDate + 'T12:00:00');
                  const daysUntil = Math.round((eventDate - today) / (1000 * 60 * 60 * 24));
                  return (
                    <button
                      key={e.id}
                      onClick={() => onNavigate('events')}
                      className="w-full flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors text-left"
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex flex-col items-center justify-center text-white font-bold text-xs ${
                        daysUntil === 0 ? 'bg-red-500'
                        : daysUntil <= 3 ? 'bg-orange-500'
                        : 'bg-emerald-600'
                      }`}>
                        <span className="text-sm font-bold leading-none">
                          {eventDate.getDate().toString().padStart(2, '0')}
                        </span>
                        <span className="text-xs opacity-80">
                          {eventDate.toLocaleString('pt-BR', { month: 'short' }).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 text-sm truncate">{e.name}</div>
                        <div className="text-xs text-gray-500">{e.category}</div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className={`text-xs font-bold ${
                          daysUntil === 0 ? 'text-red-600'
                          : daysUntil <= 3 ? 'text-orange-600'
                          : 'text-emerald-600'
                        }`}>
                          {daysUntil === 0 ? 'HOJE' : `em ${daysUntil}d`}
                        </div>
                      </div>
                    </button>
                  );
                })}
                {stats.upcomingEvents.length > 6 && (
                  <button
                    onClick={() => onNavigate('events')}
                    className="w-full text-center text-xs text-emerald-600 hover:text-emerald-800 py-2 font-medium"
                  >
                    + {stats.upcomingEvents.length - 6} eventos a mais →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── LINHA 4: PESSOAL + GASTOS DO MÊS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* STATUS DO PESSOAL */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck size={18} className="text-white" />
              <h3 className="font-bold text-white">Pessoal Operacional</h3>
            </div>
            <button
              onClick={() => onNavigate('staff')}
              className="text-purple-200 hover:text-white text-xs flex items-center gap-1"
            >
              Gerenciar <ArrowRight size={12} />
            </button>
          </div>
          <div className="p-4">
            {stats.totalStaff === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <UserCheck size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum funcionário cadastrado</p>
                <button
                  onClick={() => onNavigate('staff')}
                  className="mt-2 text-xs text-purple-600 hover:text-purple-800 font-medium"
                >
                  Cadastrar agora →
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Ativos', value: stats.activeStaff.length, color: 'bg-green-50 text-green-700 border-green-200' },
                    { label: 'Férias', value: stats.vacationStaff.length, color: 'bg-blue-50 text-blue-700 border-blue-200' },
                    { label: 'Afastados', value: stats.absentStaff.length, color: 'bg-orange-50 text-orange-700 border-orange-200' },
                  ].map(s => (
                    <div key={s.label} className={`rounded-xl p-3 text-center border ${s.color}`}>
                      <div className="text-xl font-bold">{s.value}</div>
                      <div className="text-xs">{s.label}</div>
                    </div>
                  ))}
                </div>
                {stats.vacationAlerts.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle size={14} className="text-yellow-600" />
                      <span className="text-xs font-bold text-yellow-700">
                        Férias vencendo em até 90 dias
                      </span>
                    </div>
                    <div className="space-y-1">
                      {stats.vacationAlerts.slice(0, 3).map(s => (
                        <div key={s.id} className="text-xs text-yellow-700 flex items-center gap-1">
                          <span>•</span>
                          <span>{s.name} — {s.position}</span>
                        </div>
                      ))}
                      {stats.vacationAlerts.length > 3 && (
                        <div className="text-xs text-yellow-600 font-medium">
                          + {stats.vacationAlerts.length - 3} funcionário(s)
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* GASTOS DO MÊS */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-white" />
              <h3 className="font-bold text-white">
                Gastos — {new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
              </h3>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-indigo-200 hover:text-white text-xs flex items-center gap-1"
            >
              Relatórios <ArrowRight size={12} />
            </button>
          </div>
          <div className="p-4">
            {stats.monthExpenses === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <TrendingUp size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum gasto registrado este mês</p>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-gray-800 mb-4">
                  {formatCurrency(stats.monthExpenses)}
                </div>
                <div className="space-y-2">
                  {(() => {
                    const thisMonth = today.toISOString().substring(0, 7);
                    const monthEvents = events.filter(e => e.startDate?.substring(0, 7) === thisMonth);
                    const pessoal = monthEvents.reduce((sum, e) =>
                      sum + (e.expenses?.filter(ex => ex.expenseCategory === 'pessoal')
                        .reduce((s, ex) => s + (ex.totalValue || 0), 0) || 0), 0);
                    const aluguel = monthEvents.reduce((sum, e) =>
                      sum + (e.expenses?.filter(ex => ex.expenseCategory === 'aluguel')
                        .reduce((s, ex) => s + (ex.totalValue || 0), 0) || 0), 0);
                    const total = pessoal + aluguel;
                    return (
                      <>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Pessoal</span>
                          <span className="font-medium text-emerald-700">{formatCurrency(pessoal)}</span>
                        </div>
                        {total > 0 && (
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-emerald-500 h-2 rounded-full"
                              style={{ width: `${(pessoal / total) * 100}%` }}
                            />
                          </div>
                        )}
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Aluguel</span>
                          <span className="font-medium text-orange-600">{formatCurrency(aluguel)}</span>
                        </div>
                        {total > 0 && (
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-orange-400 h-2 rounded-full"
                              style={{ width: `${(aluguel / total) * 100}%` }}
                            />
                          </div>
                        )}
                        <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-2 mt-2">
                          <span className="font-bold text-gray-700">
                            {monthEvents.length} evento(s) este mês
                          </span>
                          <button
                            onClick={() => onNavigate('events')}
                            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                          >
                            Ver eventos <ArrowRight size={11} />
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── ACESSO RÁPIDO ── */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4">
        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Activity size={16} className="text-blue-600" /> Acesso Rápido
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {[
            { label: 'Buscar Veículo', icon: Car, color: 'hover:bg-blue-50 hover:border-blue-300', nav: 'vehicles' },
            { label: 'Novo Empréstimo', icon: Package, color: 'hover:bg-yellow-50 hover:border-yellow-300', nav: 'loans' },
            { label: 'Novo Evento', icon: Calendar, color: 'hover:bg-emerald-50 hover:border-emerald-300', nav: 'events' },
            { label: 'Ver Pessoal', icon: UserCheck, color: 'hover:bg-purple-50 hover:border-purple-300', nav: 'staff' },
            { label: 'Terceiros', icon: Truck, color: 'hover:bg-orange-50 hover:border-orange-300', nav: 'thirdparty' },
            { label: 'Relatórios', icon: BarChart2, color: 'hover:bg-indigo-50 hover:border-indigo-300', nav: 'reports' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => onNavigate(item.nav)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-gray-100 transition-all text-center ${item.color}`}
              >
                <Icon size={20} className="text-gray-600" />
                <span className="text-xs text-gray-600 font-medium leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}