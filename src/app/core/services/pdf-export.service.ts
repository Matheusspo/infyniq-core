import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OrderService } from '../../features/orders/models/order-service.model';

@Injectable({
  providedIn: 'root',
})
export class PDFExportService {
  /**
   * Gera um relatório PDF premium para a Ordem de Serviço
   */
  generateOSReport(os: OrderService) {
    const doc = new jsPDF();
    const primaryColor: [number, number, number] = [30, 41, 59]; // Slate 900
    const accentColor: [number, number, number] = [37, 99, 235]; // Blue 600
    const slate200: [number, number, number] = [226, 232, 240];

    // --- CABEÇALHO (Branding) ---
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.circle(25, 25, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('RE', 21, 27);

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(22);
    doc.text('REPAR', 42, 22);
    doc.setFontSize(18);
    doc.setTextColor(100, 116, 139); // Slate 400
    doc.text('ELEVADORES', 42, 29);

    doc.setDrawColor(slate200[0], slate200[1], slate200[2]);
    doc.line(15, 42, 195, 42);

    // --- INFOS DA O.S. ---
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`NÚMERO DA O.S.:`, 140, 20);
    doc.setFontSize(14);
    doc.text(`${os.osNumber}`, 140, 27);

    doc.setFontSize(10);
    doc.text(`DATA: ${new Date(os.createdAt).toLocaleDateString('pt-BR')}`, 140, 34);

    // --- BLOCO: DADOS DO CLIENTE & EQUIPAMENTO ---
    autoTable(doc, {
      startY: 50,
      head: [[{ content: 'DETALHES DO ATENDIMENTO', colSpan: 2 }]],
      body: [
        ['Condomínio:', os.customerName],
        ['Endereço:', os.customerAddress || 'N/A'],
        ['Equipamento:', os.equipmentName],
        ['Tipo de Serviço:', this.translateType(os.type)],
        ['Técnico Responsável:', os.technicianName],
      ],
      theme: 'grid',
      headStyles: { fillColor: primaryColor, fontSize: 10, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 } },
    });

    // --- BLOCO: DESCRIÇÃO DO SERVIÇO ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIÇÃO TÉCNICA DO SERVIÇO:', 15, finalY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const splitDescription = doc.splitTextToSize(os.description || 'Nenhum detalhe adicional informado.', 170);
    doc.text(splitDescription, 15, finalY + 7);

    // --- BLOCO: PEÇAS UTILIZADAS ---
    if (os.parts && os.parts.length > 0) {
      autoTable(doc, {
        startY: finalY + 20 + (splitDescription.length * 5),
        head: [['PEÇA / COMPONENTE', 'QUANTIDADE']],
        body: os.parts.map(p => [p.name, p.requestedQuantity.toString()]),
        theme: 'striped',
        headStyles: { fillColor: accentColor, fontSize: 10, fontStyle: 'bold' },
        styles: { fontSize: 8 },
      });
    }

    // --- ASSINATURAS ---
    const pageHeight = doc.internal.pageSize.height;
    const sigY = pageHeight - 50;

    // Linha de Assinatura Técnico
    doc.setDrawColor(30, 41, 59);
    doc.line(20, sigY, 90, sigY);
    doc.setFontSize(8);
    doc.text('ASSINATURA DO TÉCNICO', 35, sigY + 5);
    doc.text(os.technicianName || '', 35, sigY + 10);

    // Linha de Assinatura Cliente
    doc.line(120, sigY, 190, sigY);
    doc.text('ASSINATURA DO CLIENTE', 135, sigY + 5);
    doc.text(os.customerName || '', 135, sigY + 10);

    // Renderizar a Assinatura Digital se existir
    if (os.customerSignature) {
      try {
        doc.addImage(os.customerSignature, 'PNG', 130, sigY - 25, 50, 20);
      } catch (e) {
        console.error('Erro ao incluir assinatura no PDF', e);
      }
    }

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('Relatório gerado automaticamente pelo Sistema Infyniq Service - Gestão Inteligente de Manutenção', 105, pageHeight - 10, { align: 'center' });

    // Download
    doc.save(`OS-${os.osNumber}-${os.customerName}.pdf`);
  }

  private translateType(type: string): string {
    const types: any = {
      'PREVENTIVE': 'Manutenção Preventiva',
      'CORRECTIVE': 'Manutenção Corretiva',
      'EMERGENCY': 'Atendimento Emergencial',
      'INSTALLATION': 'Instalação/Modernização'
    };
    return types[type] || type;
  }
}
