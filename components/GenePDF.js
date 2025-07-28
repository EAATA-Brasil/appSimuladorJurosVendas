import { useState, useRef } from 'react';
import { View, Alert, Platform, TouchableOpacity, Text, ActivityIndicator, StyleSheet, Linking } from 'react-native';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

const PDF_FILE_PREFIX = 'Simulação de Venda_';
const MAX_RETRIES = 2;

const PDFSimulacao = ({
  equipamentos,
  entrada,
  parcelas,
  localizacao,
  faturamento,
  quantidades,
  valorParcela,
  baseNF,
  produtoNF,
  valorTotal,
  valorParcelado,
  desconto,
  observacao,
  descricao,
  tipoPagamento,
  nomeVendedor,
  validarNomeVendedor,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // SVG Logo as base64
  const logoEAATA = `<svg 
 xmlns="http://www.w3.org/2000/svg"
 xmlns:xlink="http://www.w3.org/1999/xlink"
 width="270px" height="101px">
<image  x="0px" y="0px" width="270px" height="101px"  xlink:href="data:img/png;base64,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" />
</svg>`;


  const generateHtmlContent = () => {
    const equipamentosList = equipamentos.map((equipamento, index) => {
      const quantidade = quantidades[index] || 1;
      let valorUnit = localizacao === 'SP' ? equipamento.custo_geral : (faturamento === 'CPF' ? equipamento.custo_cpf : equipamento.custo_cnpj);
      const totalItem = Math.round(valorUnit * quantidade);

      return `
        <tr>
          <td style="padding: 10px; border: 1px solid #e0e0e0;">${quantidade}x ${equipamento.nome}</td>
          <td style="padding: 10px; border: 1px solid #e0e0e0; text-align: right;">${formatCurrency(Math.round(valorUnit))}</td>
          <td style="padding: 10px; border: 1px solid #e0e0e0; text-align: right;">${formatCurrency(totalItem)}</td>
        </tr>
      `;
    }).join('');

    const linhasDescricao = descricao && descricao.length >= 1 ? (
      descricao.map((linha) => linha == null || linha == '' ? '' : `<ul style="margin-bottom: 5px;">${linha}</ul>`).join('') 
    ) : '';
    

    const validadeRelatorio = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString('pt-BR');

    return `
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Simulação de venda</title>
          <style>
            @media print {
              @page {
                margin: 30px 0 0 0;
                size: auto;
              }
              body {
                margin: 0;
              }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #009EE0;
              padding-bottom: 20px;
            }
            .logo {
              width: 200px;
              height: auto;
              margin-bottom: 10px;
            }
            .title {
              font-size: 28px;
              font-weight: bold;
              color: #009EE0;
              margin: 0;
            }
            .subtitle {
              font-size: 16px;
              color: #666;
              margin: 5px 0 0 0;
            }
            .vendedor-info {
              text-align: left;
              margin-bottom: 20px;
              padding: 15px;
              background: #f0f8ff;
              border-radius: 8px;
              border-left: 4px solid #009EE0;
            }
            .vendedor-label {
              font-size: 14px;
              color: #666;
              margin-bottom: 5px;
            }
            .vendedor-nome {
              font-size: 18px;
              font-weight: bold;
              color: #009EE0;
              text-transform: capitalize;
            }
            .section {
              margin-bottom: 25px;
              background: #f9f9f9;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #009EE0;
            }
            .section-title {
              font-size: 20px;
              font-weight: bold;
              color: #009EE0;
              margin-bottom: 15px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 15px;
            }
            .info-item {
              background: white;
              padding: 12px;
              border-radius: 5px;
              border: 1px solid #e0e0e0;
            }
            .info-label {
              font-weight: bold;
              color: #555;
              font-size: 14px;
              margin-bottom: 5px;
            }
            .info-value {
              color: #333;
              font-size: 16px;
            }
            .equipment-table {
              width: 100%;
              border-collapse: collapse;
              background: white;
              border-radius: 5px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .equipment-table th {
              background: #009EE0;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: bold;
            }
            .equipment-table td {
              padding: 10px;
              border-bottom: 1px solid #eee;
            }
            .equipment-table tr:last-child td {
              border-bottom: none;
            }
            .total-row {
              background: #f0f8ff;
              font-weight: bold;
              font-size: 18px;
            }
            .total-row td {
              padding: 15px 10px;
              border-top: 2px solid #009EE0;
            }
            .payment-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
            }
            .payment-item {
              background: white;
              padding: 15px;
              border-radius: 5px;
              border: 1px solid #e0e0e0;
              text-align: center;
            }
            .payment-label {
              font-size: 14px;
              color: #666;
              margin-bottom: 5px;
            }
            .payment-value {
              font-size: 18px;
              font-weight: bold;
              color: #009EE0;
            }
            .observations {
              background: white;
              padding: 15px;
              border-radius: 5px;
              border: 1px solid #e0e0e0;
              font-style: italic;
              color: #555;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #777;
              font-size: 16px;
            }
            .footer .company {
              font-weight: bold;
              color: #009EE0;
              font-size: 14px;
            }
            @media print {
              body { margin: 0; }
              .section { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="data:image/svg+xml;base64,${btoa(logoEAATA)}" alt="Logo EAATA" class="logo"/>
            <h1 class="title">Simulação de Venda </h1>
            Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}<br>
          </div>

          <div class="vendedor-info">
            <div class="vendedor-label">Vendedor Responsável:</div>
            <div class="vendedor-nome">${nomeVendedor}</div>
          </div>

          <div class="section">
            <h2 class="section-title">Equipamentos e Valores</h2>
            <table class="equipment-table">
              <thead>
                <tr>
                  <th>Equipamento</th>
                  <th style="text-align: right;">Valor Unitário</th>
                  <th style="text-align: right;">Valor Somado</th>
                </tr>
              </thead>
              <tbody>
                ${equipamentosList}
                <tr class="total-row">
                  <td>Valor Total</td>
                  <td></td>
                  <td style="text-align: right;">${formatCurrency(valorTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2 class="section-title">Condições de Pagamento</h2>
            <div class="payment-grid">
              <div class="payment-item">
                <div class="payment-label">Tipo de Pagamento</div>
                <div class="payment-value">${tipoPagamento}</div>
              </div>
              <div class="payment-item">
                <div class="payment-label">Entrada</div>
                <div class="payment-value">${formatCurrency(entrada)}</div>
              </div>
              <div class="payment-item">
                <div class="payment-label">Parcelas</div>
                <div class="payment-value">${parcelas}x de ${formatCurrency(valorParcela)}</div>
              </div>
              ${desconto>0? `<div class="payment-item">
                <div class="payment-label">Desconto</div>
                <div class="payment-value">${formatCurrency(desconto)}</div>
              </div>` : ``}
            </div>
          </div>  

          <div class="section">
            <h2 class="section-title">Informações do Cliente</h2>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Localização:</div>
                <div class="info-value">${localizacao}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Faturamento:</div>
                <div class="info-value">${faturamento}</div>
              </div>
            </div>
            ${descricao ? `
              <div class="info-item">
                <div class="info-value">${descricao}</div>
              </div>
            ` : ''}
          </div>

          

          ${observacao ? `
            <div class="section">
              <h2 class="section-title">Observações</h2>
              <div class="observations">
                ${observacao}
              </div>
            </div>
          ` : ''}

          <div class="footer">
            <p>
            Esta é uma simulação e os valores podem sofrer alterações.<br>
            Validade do relatório: ${validadeRelatorio}<br>
            Boleto (sujeito a análise de crédito)<br>
            ${localizacao !== 'SP' ? 'Diferencial de alíquota (DIFAL) de responsabilidade do comprador.<br>' : ''}
            </p>
            <p class="company">EAATA Brasil</p>
            <a href="https://br.eaata.pro">br.eaata.pro | Número Um Em Scanner Automotivos</a>
          </div>
        </body>
      </html>
    `;
  };

  const generateWebPDF = () => {
  if (!validarNomeVendedor()) {
    alert('Por favor, preencha o nome do vendedor antes de gerar o PDF.');
    return;
  }

  setIsGenerating(true);
  try {
    const htmlContent = generateHtmlContent();
    const fileName = `${PDF_FILE_PREFIX}${new Date().toISOString().slice(0, 10)}.pdf`;
    
    // 1. Criar uma nova janela
    const printWindow = window.open('', '_blank');
    
    // 2. Adicionar um título que será usado como nome do arquivo
    const htmlWithTitle = htmlContent.replace(
      '<title>Simulação de venda</title>',
      `<title>${fileName}</title>`
    );
    
    printWindow.document.open();
    printWindow.document.write(htmlWithTitle);
    printWindow.document.close();
    
    // 3. Disparar impressão após carregamento
    printWindow.onload = function() {
  setTimeout(() => {
    try {
      // Dispara a impressão
      printWindow.print();
      
      // Solução para fechamento universal
      const checkClose = () => {
        try {
          // Tenta verificar o status da janela
          if (printWindow.closed || !printWindow.document) {
            return true;
          }
          
          // Verifica se o diálogo de impressão ainda está aberto
          // (Não há método perfeito, esta é uma aproximação)
          if (printWindow.document.visibilityState === 'hidden' || 
              printWindow.document.hidden) {
            printWindow.close();
            return true;
          }
          return false;
        } catch (e) {
          // Se houver erro ao acessar a janela, assume que foi fechada
          return true;
        }
      };
      
      // Verifica periodicamente
      const interval = setInterval(() => {
        if (checkClose()) {
          clearInterval(interval);
        }
      }, 300);
      
      // Fallback - fecha após 5 segundos mesmo que não detecte
      setTimeout(() => {
        clearInterval(interval);
        if (!printWindow.closed) {
          try {
            printWindow.close();
          } catch (e) {
            console.log('Não foi possível fechar a janela');
          }
        }
      }, 100);
      
    } catch (e) {
      console.error("Erro ao imprimir:", e);
      alert('Selecione "Salvar como PDF" na impressão. Nome sugerido: ' + fileName);
      printWindow.close();
    }
  }, 100);
};
    
  } catch (e) {
    console.error("Erro ao gerar PDF:", e);
    alert("Ocorreu um erro. Tente novamente no Chrome ou Firefox.");
  } finally {
    setIsGenerating(false);
  }
};

  const handleMobilePDF = async () => {
    if (!validarNomeVendedor()) {
      alert('Por favor, preencha o nome do vendedor antes de gerar o PDF.')
      return;
    }
    if (Platform.OS !== 'android') {
      Alert.alert('Aviso', 'Esta função está disponível apenas para Android');
      return;
    }
    
    setIsGenerating(true);
    setError(null);

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Para salvar o PDF, precisamos da permissão de armazenamento.',
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => setIsGenerating(false) },
            { text: 'Configurações', onPress: () => { Linking.openSettings(); setIsGenerating(false); } }
          ]
        );
        return;
      }

      const html = generateHtmlContent();
      const { uri } = await Print.printToFileAsync({ html });
      const fileName = `${PDF_FILE_PREFIX}${new Date().toISOString().slice(0, 10)}.pdf`;
      
      try {
        const downloadsDir = `${FileSystem.documentDirectory}../../Download/`;
        const downloadsPath = `${downloadsDir}${fileName}`;
        await FileSystem.makeDirectoryAsync(downloadsDir, { intermediates: true });
        await FileSystem.copyAsync({ from: uri, to: downloadsPath });
        
        await MediaLibrary.createAssetAsync(downloadsPath);
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadsPath, {
            mimeType: 'application/pdf',
            dialogTitle: 'Salvar Simulação de Venda',
            UTI: 'com.adobe.pdf'
          });
        } else {
          Alert.alert('PDF Gerado', `Arquivo salvo em: ${downloadsPath}`, [{ text: 'OK' }]);
        }

      } catch (e) {
        console.warn('Falha ao salvar em Downloads:', e);
        const downloadsDir = `${FileSystem.documentDirectory}`;
        const downloadsPath = `${downloadsDir}${fileName}`;
        await FileSystem.copyAsync({ from: uri, to: downloadsPath });
        await Sharing.shareAsync(downloadsPath, {
          mimeType: 'application/pdf',
          dialogTitle: 'Salvar Simulação de Venda',
          UTI: 'com.adobe.pdf'
        });
      }

    } catch (err) {
      console.error('Erro na geração do PDF:', err);
      setError(err.message);
      
      if (retryCount < MAX_RETRIES) {
        setRetryCount(retryCount + 1);
        setTimeout(handleMobilePDF, 1000);
      } else {
        Alert.alert(
          'Erro',
          'Não foi possível gerar o PDF. Verifique as permissões de armazenamento.',
          [
            { text: 'OK' },
            { text: 'Abrir Configurações', onPress: () => { Linking.openSettings(); setIsGenerating(false); } }
          ]
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (Platform.OS === 'web') {
      generateWebPDF();
    } else {
      await handleMobilePDF();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleGeneratePDF}
        disabled={isGenerating}
        style={[styles.button, isGenerating && styles.buttonDisabled]}
      >
        {isGenerating ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>GERAR PDF DA SIMULAÇÃO</Text>
        )}
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: '#e74c3c',
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
  },
});

export default PDFSimulacao;