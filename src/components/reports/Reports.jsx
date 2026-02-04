import React, { useState } from 'react';
import { ArrowLeft, FileText, Download, Calendar, Filter, TrendingUp } from 'lucide-react';
import { useToast } from '../ui/Toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Reports({ 
  vehicles,
  owners,
  thirdPartyVehicles,
  loans,
  onBack 
}) {
  const { success, error } = useToast();
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    startDate: `${new Date().getFullYear()}-01-01`,
    endDate: `${new Date().getFullYear()}-12-31`,
    reportType: 'complete'
  });

  // Filtrar dados por período
  const getFilteredData = () => {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);

    return {
      loans: loans.filter(loan => {
        const loanDate = new Date(loan.loanDate);
        return loanDate >= start && loanDate <= end;
      }),
      vehicles: vehicles,
      owners: owners,
      thirdPartyVehicles: thirdPartyVehicles.filter(v => {
        if (!v.createdAt) return true;
        const createdDate = new Date(v.createdAt);
        return createdDate >= start && createdDate <= end;
      })
    };
  };

  // Estatísticas
  const getStatistics = () => {
    const filtered = getFilteredData();
    
    const totalLoans = filtered.loans.length;
    const emprestados = filtered.loans.filter(l => l.status === 'emprestado').length;
    const devolvidos = filtered.loans.filter(l => l.status === 'devolvido').length;
    const atrasados = filtered.loans.filter(l => l.status === 'atrasado').length;
    const danificados = filtered.loans.filter(l => l.status === 'perdido_danificado').length;

    const totalTaxas = filtered.loans.reduce((sum, loan) => {
      return sum + loan.items.reduce((itemSum, item) => itemSum + (item.damageFee || 0), 0);
    }, 0);

    const empresas = [...new Set(filtered.loans.map(l => l.company))];
    
    return {
      totalLoans,
      emprestados,
      devolvidos,
      atrasados,
      danificados,
      totalTaxas,
      totalEmpresas: empresas.length,
      totalVehicles: vehicles.length,
      totalOwners: owners.length,
      totalThirdParty: filtered.thirdPartyVehicles.length
    };
  };

  // Gerar PDF Completo
  const generateCompletePDF = () => {
    try {
      const doc = new jsPDF();
      const filtered = getFilteredData();
      const stats = getStatistics();
      
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      let yPos = 20;

      // HEADER
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 102, 204);
      doc.text('ARENA BRB', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 8;
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text('RELATÓRIO ANUAL COMPLETO', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 6;
      doc.setFontSize(10);
      doc.text(`Período: ${new Date(filters.startDate).toLocaleDateString('pt-BR')} a ${new Date(filters.endDate).toLocaleDateString('pt-BR')}`, pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 10;
      doc.setDrawColor(0, 102, 204);
      doc.setLineWidth(1);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      
      yPos += 15;

      // RESUMO EXECUTIVO
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('RESUMO EXECUTIVO', margin, yPos);
      
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const resumoData = [
        ['Total de Empréstimos', stats.totalLoans.toString()],
        ['Empréstimos Ativos', stats.emprestados.toString()],
        ['Devolvidos', stats.devolvidos.toString()],
        ['Atrasados', stats.atrasados.toString()],
        ['Perdidos/Danificados', stats.danificados.toString()],
        ['Total de Taxas Cobradas', `R$ ${stats.totalTaxas.toFixed(2)}`],
        ['Empresas Atendidas', stats.totalEmpresas.toString()],
        ['Veículos Autorizados', stats.totalVehicles.toString()],
        ['Proprietários Cadastrados', stats.totalOwners.toString()],
        ['Veículos Terceiros', stats.totalThirdParty.toString()]
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['Indicador', 'Quantidade']],
        body: resumoData,
        theme: 'grid',
        headStyles: { fillColor: [0, 102, 204] },
        margin: { left: margin, right: margin }
      });

      // NOVA PÁGINA - EMPRÉSTIMOS
      doc.addPage();
      yPos = 20;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('EMPRÉSTIMOS REALIZADOS', margin, yPos);
      
      yPos += 8;
      
      const loansData = filtered.loans.map(loan => [
        new Date(loan.loanDate).toLocaleDateString('pt-BR'),
        loan.company,
        loan.requesterName,
        loan.items.length.toString(),
        loan.status === 'emprestado' ? 'Ativo' :
        loan.status === 'devolvido' ? 'Devolvido' :
        loan.status === 'atrasado' ? 'Atrasado' : 'Perdido/Danif.'
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Data', 'Empresa', 'Solicitante', 'Itens', 'Status']],
        body: loansData,
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 204] },
        margin: { left: margin, right: margin },
        styles: { fontSize: 8 }
      });

      // NOVA PÁGINA - VEÍCULOS TERCEIROS
      if (filtered.thirdPartyVehicles.length > 0) {
        doc.addPage();
        yPos = 20;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('VEÍCULOS TERCEIROS CADASTRADOS', margin, yPos);
        
        yPos += 8;
        
        const thirdPartyData = filtered.thirdPartyVehicles.map(v => [
          v.plate,
          v.company,
          v.driverName,
          v.serviceType || '-',
          new Date(v.createdAt).toLocaleDateString('pt-BR')
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Placa', 'Empresa', 'Motorista', 'Serviço', 'Data Cadastro']],
          body: thirdPartyData,
          theme: 'striped',
          headStyles: { fillColor: [255, 140, 0] },
          margin: { left: margin, right: margin },
          styles: { fontSize: 8 }
        });
      }

      // RODAPÉ
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${totalPages} | Gerado em ${new Date().toLocaleString('pt-BR')}`,
          pageWidth / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      doc.save(`Relatorio_Arena_BRB_${filters.year}.pdf`);
      success('✅ Relatório PDF gerado com sucesso!');
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      error('❌ Erro ao gerar relatório PDF');
    }
  };

  // Gerar Excel Completo
  const generateCompleteExcel = () => {
    try {
      const filtered = getFilteredData();
      const stats = getStatistics();
      
      const wb = XLSX.utils.book_new();

      // ABA 1: RESUMO
      const resumoData = [
        ['RELATÓRIO ANUAL - ARENA BRB'],
        [`Período: ${new Date(filters.startDate).toLocaleDateString('pt-BR')} a ${new Date(filters.endDate).toLocaleDateString('pt-BR')}`],
        [],
        ['RESUMO EXECUTIVO'],
        ['Indicador', 'Quantidade'],
        ['Total de Empréstimos', stats.totalLoans],
        ['Empréstimos Ativos', stats.emprestados],
        ['Devolvidos', stats.devolvidos],
        ['Atrasados', stats.atrasados],
        ['Perdidos/Danificados', stats.danificados],
        ['Total de Taxas Cobradas', stats.totalTaxas],
        ['Empresas Atendidas', stats.totalEmpresas],
        ['Veículos Autorizados', stats.totalVehicles],
        ['Proprietários Cadastrados', stats.totalOwners],
        ['Veículos Terceiros', stats.totalThirdParty]
      ];
      
      const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
      XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

      // ABA 2: EMPRÉSTIMOS
      const loansHeader = ['Data', 'Empresa', 'Solicitante', 'CPF', 'Telefone', 'Local', 'Itens', 'Status', 'Taxas'];
      const loansData = filtered.loans.map(loan => [
        new Date(loan.loanDate).toLocaleDateString('pt-BR'),
        loan.company,
        loan.requesterName,
        loan.requesterCpf || '-',
        loan.requesterPhone || '-',
        loan.location,
        loan.items.length,
        loan.status,
        loan.items.reduce((sum, item) => sum + (item.damageFee || 0), 0)
      ]);
      
      const wsLoans = XLSX.utils.aoa_to_sheet([loansHeader, ...loansData]);
      XLSX.utils.book_append_sheet(wb, wsLoans, 'Empréstimos');

      // ABA 3: VEÍCULOS AUTORIZADOS
      const vehiclesHeader = ['Placa', 'Marca', 'Modelo', 'Tipo', 'Proprietário', 'Local'];
      const vehiclesData = vehicles.map(v => {
        const owner = owners.find(o => o.id === v.ownerId);
        return [
          v.plate,
          v.brand,
          v.model,
          v.type,
          owner?.name || '-',
          v.parkingLocation
        ];
      });
      
      const wsVehicles = XLSX.utils.aoa_to_sheet([vehiclesHeader, ...vehiclesData]);
      XLSX.utils.book_append_sheet(wb, wsVehicles, 'Veículos Autorizados');

      // ABA 4: TERCEIROS
      const thirdPartyHeader = ['Placa', 'Marca', 'Modelo', 'Empresa', 'Motorista', 'Telefone', 'Serviço', 'Data Cadastro'];
      const thirdPartyData = filtered.thirdPartyVehicles.map(v => [
        v.plate,
        v.brand,
        v.model,
        v.company,
        v.driverName,
        v.driverPhone || '-',
        v.serviceType || '-',
        new Date(v.createdAt).toLocaleDateString('pt-BR')
      ]);
      
      const wsThirdParty = XLSX.utils.aoa_to_sheet([thirdPartyHeader, ...thirdPartyData]);
      XLSX.utils.book_append_sheet(wb, wsThirdParty, 'Veículos Terceiros');

      // ABA 5: PROPRIETÁRIOS
      const ownersHeader = ['Nome', 'Empresa', 'Setor', 'Cargo', 'Telefone', 'Veículos'];
      const ownersData = owners.map(o => [
        o.name,
        o.company,
        o.sector,
        o.position,
        o.phone,
        vehicles.filter(v => v.ownerId === o.id).length
      ]);
      
      const wsOwners = XLSX.utils.aoa_to_sheet([ownersHeader, ...ownersData]);
      XLSX.utils.book_append_sheet(wb, wsOwners, 'Proprietários');

      XLSX.writeFile(wb, `Relatorio_Arena_BRB_${filters.year}.xlsx`);
      success('✅ Relatório Excel gerado com sucesso!');
    } catch (err) {
      console.error('Erro ao gerar Excel:', err);
      error('❌ Erro ao gerar relatório Excel');
    }
  };

  const stats = getStatistics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={onBack}
              className="mb-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              Voltar
            </button>
            
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FileText className="text-indigo-600" size={36} />
              Relatórios e Estatísticas
            </h1>
            <p className="text-gray-600 mt-2">
              Gere relatórios completos do sistema
            </p>
          </div>

          {/* Filtros */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-200 mb-8">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Filter size={20} className="text-indigo-600" />
              Período do Relatório
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data Final
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ano de Referência
                </label>
                <input
                  type="number"
                  value={filters.year}
                  onChange={(e) => {
                    const year = parseInt(e.target.value);
                    setFilters({
                      year,
                      startDate: `${year}-01-01`,
                      endDate: `${year}-12-31`,
                      reportType: 'complete'
                    });
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  min="2020"
                  max="2030"
                />
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-800">{stats.totalLoans}</div>
              <div className="text-sm text-blue-700">Empréstimos</div>
            </div>

            <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-800">{stats.devolvidos}</div>
              <div className="text-sm text-green-700">Devolvidos</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-yellow-800">{stats.emprestados}</div>
              <div className="text-sm text-yellow-700">Ativos</div>
            </div>

            <div className="bg-gradient-to-br from-red-100 to-red-200 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-red-800">R$ {stats.totalTaxas.toFixed(2)}</div>
              <div className="text-sm text-red-700">Taxas Cobradas</div>
            </div>

            <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-800">{stats.totalEmpresas}</div>
              <div className="text-sm text-purple-700">Empresas</div>
            </div>
          </div>

          {/* Botões de Geração */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={generateCompletePDF}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-6 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <FileText size={28} />
              Gerar Relatório PDF Completo
            </button>

            <button
              onClick={generateCompleteExcel}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-6 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <Download size={28} />
              Gerar Relatório Excel Completo
            </button>
          </div>

          {/* Info */}
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <TrendingUp className="text-blue-600 flex-shrink-0" size={24} />
              <div className="text-sm text-blue-800">
                <strong>Relatório Completo inclui:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• Resumo executivo com estatísticas gerais</li>
                  <li>• Lista detalhada de todos os empréstimos realizados</li>
                  <li>• Veículos autorizados e proprietários cadastrados</li>
                  <li>• Veículos terceiros e prestadores de serviço</li>
                  <li>• Totalizadores de taxas cobradas</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}