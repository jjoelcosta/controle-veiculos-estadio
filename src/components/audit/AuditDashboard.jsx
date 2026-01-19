import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, Activity, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AuditDashboard({ onBack }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'INSERT': return 'bg-green-100 text-green-700';
      case 'UPDATE': return 'bg-blue-100 text-blue-700';
      case 'DELETE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'INSERT': return '➕';
      case 'UPDATE': return '✏️';
      case 'DELETE': return '🗑️';
      default: return '📝';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <button
                onClick={onBack}
                className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <ArrowLeft size={20} />
                Voltar
              </button>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Activity className="text-purple-600" size={36} />
                Auditoria do Sistema
              </h1>
              <p className="text-gray-600 mt-2">
                Registro completo de todas as ações realizadas
              </p>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border-2 border-green-200">
              <div className="text-green-700 text-sm font-medium">Criações</div>
              <div className="text-3xl font-bold text-green-800">
                {logs.filter(l => l.action === 'INSERT').length}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200">
              <div className="text-blue-700 text-sm font-medium">Atualizações</div>
              <div className="text-3xl font-bold text-blue-800">
                {logs.filter(l => l.action === 'UPDATE').length}
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border-2 border-red-200">
              <div className="text-red-700 text-sm font-medium">Exclusões</div>
              <div className="text-3xl font-bold text-red-800">
                {logs.filter(l => l.action === 'DELETE').length}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border-2 border-purple-200">
              <div className="text-purple-700 text-sm font-medium">Total</div>
              <div className="text-3xl font-bold text-purple-800">
                {logs.length}
              </div>
            </div>
          </div>

          {/* Timeline de Logs */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Carregando logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Nenhuma ação registrada ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div 
                  key={log.id}
                  className="bg-gray-50 border-l-4 border-purple-500 p-4 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getActionColor(log.action)}`}>
                          {getActionIcon(log.action)} {log.action}
                        </span>
                        <span className="text-sm font-semibold text-gray-700">
                          {log.table_name}
                        </span>
                        {log.record_id && (
                          <span className="text-xs text-gray-500 font-mono">
                            ID: {log.record_id.substring(0, 8)}...
                          </span>
                        )}
                      </div>
                      
                      {log.new_data && (
                        <div className="text-sm text-gray-600 mt-2">
                          <strong>Dados:</strong> {log.new_data.plate || log.new_data.name || 'N/A'}
                        </div>
                      )}
                    </div>

                    <div className="text-right text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}