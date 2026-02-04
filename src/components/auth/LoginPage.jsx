import React, { useState } from 'react';
import { Car, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (!result.success) {
        setError(result.error || 'Email ou senha incorretos');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        
        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          
          {/* Logo e Título */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Car className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Sistema de Veículos e Acervo
            </h1>
            <p className="text-gray-600">
              ARENA BRB
            </p>
          </div>

          {/* Formulário */}
          <div>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle size={20} />
                  <p className="font-medium">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                    placeholder="seu@email.com"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Botão */}
              <button
                onClick={handleSubmit}
                disabled={loading || !email || !password}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>

            {/* Credenciais de Teste */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-2">
                🔑 SEGURANÇA ARENA 360
              </p>
              <p className="text-xs text-blue-700 font-mono">
                Ambiente de desenvolvimento
              </p>
              <p className="text-xs text-blue-700 font-mono">
                Gerência de Segurança
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-white text-sm">
          <p>Sistema de Controle de Acesso</p>
          <p className="opacity-75">© 2025 - Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
}