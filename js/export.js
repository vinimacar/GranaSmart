// Funcionalidades de exportação (PDF, Excel, PNG)

// Exportar transações como PDF
async function exportToPDF() {
    try {
        // Verificar se o usuário está autenticado
        const userId = getCurrentUserId();
        if (!userId) return;
        
        // Obter todas as transações do usuário
        const snapshot = await getUserTransactionsRef().orderBy('date', 'desc').get();
        
        if (snapshot.empty) {
            alert('Não há transações para exportar.');
            return;
        }
        
        // Inicializar jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configurações do documento
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let y = 20;
        
        // Título
        doc.setFontSize(18);
        doc.text('Relatório de Transações Financeiras', pageWidth / 2, y, { align: 'center' });
        y += 10;
        
        // Data de geração
        doc.setFontSize(10);
        const today = new Date().toLocaleDateString('pt-BR');
        doc.text(`Gerado em: ${today}`, pageWidth / 2, y, { align: 'center' });
        y += 15;
        
        // Resumo financeiro
        let totalIncome = 0;
        let totalExpense = 0;
        const transactions = [];
        
        snapshot.forEach(doc => {
            const transaction = doc.data();
            transactions.push(transaction);
            
            if (transaction.type === 'receita') {
                totalIncome += parseFloat(transaction.value);
            } else {
                totalExpense += parseFloat(transaction.value);
            }
        });
        
        const balance = totalIncome - totalExpense;
        
        doc.setFontSize(12);
        doc.text(`Saldo: ${formatCurrency(balance)}`, margin, y);
        y += 7;
        doc.text(`Total de Receitas: ${formatCurrency(totalIncome)}`, margin, y);
        y += 7;
        doc.text(`Total de Despesas: ${formatCurrency(totalExpense)}`, margin, y);
        y += 15;
        
        // Tabela de transações
        doc.setFontSize(12);
        doc.text('Transações:', margin, y);
        y += 10;
        
        // Cabeçalho da tabela
        doc.setFillColor(230, 230, 230);
        doc.rect(margin, y - 5, pageWidth - (margin * 2), 7, 'F');
        
        doc.setFontSize(10);
        doc.text('Data', margin + 5, y);
        doc.text('Tipo', margin + 30, y);
        doc.text('Categoria', margin + 55, y);
        doc.text('Valor', margin + 100, y);
        doc.text('Observação', margin + 130, y);
        y += 7;
        
        // Linhas da tabela
        doc.setFontSize(9);
        
        transactions.forEach((transaction, index) => {
            // Verificar se precisa de nova página
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            
            // Alternar cor de fundo
            if (index % 2 === 0) {
                doc.setFillColor(245, 245, 245);
                doc.rect(margin, y - 5, pageWidth - (margin * 2), 7, 'F');
            }
            
            // Formatar data
            const date = new Date(transaction.date);
            const formattedDate = date.toLocaleDateString('pt-BR');
            
            // Formatar tipo
            const type = transaction.type === 'receita' ? 'Receita' : 'Despesa';
            
            // Formatar valor
            const value = formatCurrency(transaction.value);
            
            // Adicionar linha
            doc.text(formattedDate, margin + 5, y);
            doc.text(type, margin + 30, y);
            doc.text(transaction.category, margin + 55, y);
            doc.text(value, margin + 100, y);
            doc.text(transaction.note || '-', margin + 130, y);
            
            y += 7;
        });
        
        // Rodapé
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, 290);
        }
        
        // Salvar o PDF
        doc.save('transacoes_financeiras.pdf');
        
    } catch (error) {
        console.error('Erro ao exportar para PDF:', error);
        alert('Erro ao exportar para PDF. Tente novamente.');
    }
}

// Exportar transações como Excel
async function exportToExcel() {
    try {
        // Verificar se o usuário está autenticado
        const userId = getCurrentUserId();
        if (!userId) return;
        
        // Obter todas as transações do usuário
        const snapshot = await getUserTransactionsRef().orderBy('date', 'desc').get();
        
        if (snapshot.empty) {
            alert('Não há transações para exportar.');
            return;
        }
        
        // Preparar dados para o Excel
        const data = [];
        
        // Cabeçalho
        data.push(['Data', 'Tipo', 'Categoria', 'Valor', 'Observação']);
        
        // Linhas de dados
        snapshot.forEach(doc => {
            const transaction = doc.data();
            
            // Formatar data
            const date = new Date(transaction.date);
            const formattedDate = date.toLocaleDateString('pt-BR');
            
            // Formatar tipo
            const type = transaction.type === 'receita' ? 'Receita' : 'Despesa';
            
            // Adicionar linha
            data.push([
                formattedDate,
                type,
                transaction.category,
                parseFloat(transaction.value),
                transaction.note || ''
            ]);
        });
        
        // Criar planilha
        const ws = XLSX.utils.aoa_to_sheet(data);
        
        // Configurar largura das colunas
        const wscols = [
            { wch: 12 }, // Data
            { wch: 10 }, // Tipo
            { wch: 15 }, // Categoria
            { wch: 12 }, // Valor
            { wch: 30 }  // Observação
        ];
        ws['!cols'] = wscols;
        
        // Criar workbook e adicionar a planilha
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Transações');
        
        // Salvar o arquivo
        XLSX.writeFile(wb, 'transacoes_financeiras.xlsx');
        
    } catch (error) {
        console.error('Erro ao exportar para Excel:', error);
        alert('Erro ao exportar para Excel. Tente novamente.');
    }
}

// Exportar gráfico como PNG
function exportChartAsPNG() {
    try {
        const canvas = document.getElementById('financial-chart');
        if (!canvas) {
            alert('Gráfico não encontrado.');
            return;
        }
        
        // Criar link para download
        const link = document.createElement('a');
        link.download = 'grafico_financeiro.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        
    } catch (error) {
        console.error('Erro ao exportar gráfico:', error);
        alert('Erro ao exportar gráfico. Tente novamente.');
    }
}

// Event Listeners
document.getElementById('export-pdf').addEventListener('click', function(e) {
    e.preventDefault();
    exportToPDF();
});

document.getElementById('export-excel').addEventListener('click', function(e) {
    e.preventDefault();
    exportToExcel();
});