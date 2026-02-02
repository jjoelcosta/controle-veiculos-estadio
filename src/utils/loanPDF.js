import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateLoanPDF = (loan) => {
  const doc = new jsPDF();
  
  // Configurações
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPos = 20;

  // ============================================
  // HEADER - LOGO E TÍTULO
  // ============================================
  
  // Título Principal
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 102, 204); // Azul
  doc.text('ARENA BRB', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 8;
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Estádio Nacional Mané Garrincha', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('TERMO DE RESPONSABILIDADE', pageWidth / 2, yPos, { align: 'center' });
  doc.text('EMPRÉSTIMO DE MATERIAIS', pageWidth / 2, yPos + 8, { align: 'center' });
  
  // Linha separadora
  yPos += 15;
  doc.setDrawColor(0, 102, 204);
  doc.setLineWidth(1);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 10;

  // ============================================
  // INFORMAÇÕES DO EMPRÉSTIMO
  // ============================================
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  
  // Número do Empréstimo e Data
  const loanNumber = loan.id.substring(0, 8).toUpperCase();
  const loanDate = new Date(loan.loanDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  doc.text(`Nº: ${loanNumber}`, margin, yPos);
  doc.text(`Data: ${loanDate}`, pageWidth - margin - 50, yPos);
  
  yPos += 15;

  // ============================================
  // DADOS DO SOLICITANTE
  // ============================================
  
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('DADOS DO SOLICITANTE', margin + 2, yPos);
  
  yPos += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  doc.text(`Empresa: ${loan.company}`, margin, yPos);
  yPos += 6;
  doc.text(`Responsável: ${loan.requesterName}`, margin, yPos);
  yPos += 6;
  
  if (loan.requesterCpf) {
    doc.text(`CPF: ${loan.requesterCpf}`, margin, yPos);
    yPos += 6;
  }
  
  if (loan.requesterPhone) {
    doc.text(`Telefone: ${loan.requesterPhone}`, margin, yPos);
    yPos += 6;
  }
  
  doc.text(`Local de Utilização: ${loan.location}`, margin, yPos);
  
  yPos += 15;

  // ============================================
  // ITENS EMPRESTADOS - TABELA
  // ============================================
  
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('ITENS EMPRESTADOS', margin + 2, yPos);
  
  yPos += 10;

  const tableData = loan.items.map(item => [
    item.name,
    item.category,
    item.quantityBorrowed.toString(),
    `R$ ${item.unitValue?.toFixed(2) || '0.00'}`
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['Item', 'Categoria', 'Quantidade', 'Valor Unit.']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 102, 204],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' }
    },
    margin: { left: margin, right: margin }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // ============================================
  // DATAS E RESPONSÁVEIS
  // ============================================
  
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('DATAS E RESPONSÁVEIS', margin + 2, yPos);
  
  yPos += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  doc.text(`Data de Retirada: ${new Date(loan.loanDate).toLocaleDateString('pt-BR')}`, margin, yPos);
  yPos += 6;
  
  if (loan.expectedReturnDate) {
    doc.text(`Previsão de Devolução: ${new Date(loan.expectedReturnDate).toLocaleDateString('pt-BR')}`, margin, yPos);
    yPos += 6;
  }
  
  doc.text(`Entregue por (Arena): ${loan.deliveredBy}`, margin, yPos);
  
  yPos += 15;

  // ============================================
  // TERMO DE RESPONSABILIDADE
  // ============================================
  
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TERMO DE RESPONSABILIDADE', margin + 2, yPos);
  
  yPos += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  
  const termoText = [
    'Pelo presente instrumento, declaro que recebi os materiais acima relacionados em perfeito',
    'estado de conservação, comprometendo-me a devolvê-los nas mesmas condições em que foram',
    'recebidos, responsabilizando-me por eventuais danos, perdas ou extravios.',
    '',
    'Estou ciente de que:',
    '• Os materiais devem ser utilizados exclusivamente no local indicado;',
    '• Em caso de dano ou perda, será cobrada taxa equivalente ao valor do material;',
    '• A devolução deve ocorrer na data prevista, sob pena de cobrança de multa;',
    '• Os materiais permanecem sob propriedade da Arena BRB/Arena 360.'
  ];

  termoText.forEach(line => {
    doc.text(line, margin, yPos);
    yPos += 5;
  });

  yPos += 10;

  // ============================================
  // ASSINATURAS
  // ============================================
  
  // Linha para assinatura do solicitante
  const signatureY = yPos + 20;
  const signatureWidth = 70;
  const leftSignatureX = margin + 10;
  const rightSignatureX = pageWidth - margin - signatureWidth - 10;
  
  // Assinatura Solicitante
  doc.line(leftSignatureX, signatureY, leftSignatureX + signatureWidth, signatureY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(loan.requesterName, leftSignatureX + signatureWidth / 2, signatureY + 5, { align: 'center' });
  doc.text(`${loan.company}`, leftSignatureX + signatureWidth / 2, signatureY + 10, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('SOLICITANTE', leftSignatureX + signatureWidth / 2, signatureY + 15, { align: 'center' });
  
  // Assinatura Arena
  doc.line(rightSignatureX, signatureY, rightSignatureX + signatureWidth, signatureY);
  doc.setFont('helvetica', 'normal');
  doc.text(loan.deliveredBy, rightSignatureX + signatureWidth / 2, signatureY + 5, { align: 'center' });
  doc.text('Arena BRB', rightSignatureX + signatureWidth / 2, signatureY + 10, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('RESPONSÁVEL ARENA', rightSignatureX + signatureWidth / 2, signatureY + 15, { align: 'center' });

  // ============================================
  // RODAPÉ
  // ============================================
  
  const footerY = doc.internal.pageSize.height - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text(
    'Arena BRB - Estádio Nacional Mané Garrincha | SRPN - Brasília/DF',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );
  doc.text(
    `Documento gerado em: ${new Date().toLocaleString('pt-BR')}`,
    pageWidth / 2,
    footerY + 4,
    { align: 'center' }
  );

  // ============================================
  // GERAR PDF
  // ============================================
  
  const fileName = `Emprestimo_${loanNumber}_${loan.company.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
  
  return fileName;
};

// Função auxiliar para gerar PDF de devolução (com taxas)
export const generateReturnPDF = (loan) => {
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 153, 0); // Verde
  doc.text('ARENA BRB', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 8;
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Estádio Nacional Mané Garrincha', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('COMPROVANTE DE DEVOLUÇÃO', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;
  doc.setDrawColor(0, 153, 0);
  doc.setLineWidth(1);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 15;

  // Informações
  const loanNumber = loan.id.substring(0, 8).toUpperCase();
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  doc.text(`Empréstimo Nº: ${loanNumber}`, margin, yPos);
  doc.text(`Empresa: ${loan.company}`, margin, yPos + 6);
  doc.text(`Solicitante: ${loan.requesterName}`, margin, yPos + 12);
  
  if (loan.actualReturnDate) {
    doc.text(`Data de Devolução: ${new Date(loan.actualReturnDate).toLocaleString('pt-BR')}`, margin, yPos + 18);
  }
  
  if (loan.returnedBy) {
    doc.text(`Recebido por: ${loan.returnedBy}`, margin, yPos + 24);
  }
  
  yPos += 40;

  // Tabela de itens devolvidos
  const tableData = loan.items.map(item => {
    const statusIcon = item.condition === 'OK' ? '✓' : 
                       item.condition === 'Danificado' ? '⚠' : '✗';
    
    return [
      item.name,
      item.quantityBorrowed.toString(),
      item.quantityReturned?.toString() || '0',
      `${statusIcon} ${item.condition}`,
      item.damageFee > 0 ? `R$ ${item.damageFee.toFixed(2)}` : '-'
    ];
  });

  doc.autoTable({
    startY: yPos,
    head: [['Item', 'Emprest.', 'Devol.', 'Condição', 'Taxa']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 153, 0],
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'right' }
    },
    margin: { left: margin, right: margin }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Total de taxas
  const totalFees = loan.items.reduce((sum, item) => sum + (item.damageFee || 0), 0);
  
  if (totalFees > 0) {
    doc.setFillColor(255, 240, 240);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 15, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL DE TAXAS:', margin + 5, yPos + 10);
    doc.setTextColor(200, 0, 0);
    doc.text(`R$ ${totalFees.toFixed(2)}`, pageWidth - margin - 5, yPos + 10, { align: 'right' });
  }

  // Rodapé
  const footerY = doc.internal.pageSize.height - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Documento gerado em: ${new Date().toLocaleString('pt-BR')}`,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  const fileName = `Devolucao_${loanNumber}_${loan.company.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
  
  return fileName;
};