import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
// Importações específicas do Expo para manipulação de arquivos e compartilhamento
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Componente responsável por gerar e gerenciar o download/visualização de um PDF de simulação.
 * Ele interage com uma API externa (Django) para criar o PDF a partir dos dados da simulação.
 *
 * @param {Array<Object>} equipamentos - Lista de equipamentos incluídos na simulação.
 * @param {number} entrada - Valor da entrada.
 * @param {number} parcelas - Número de parcelas.
 * @param {string} localizacao - Localização do cliente.
 * @param {string} faturamento - Informação de faturamento.
 * @param {Array<number>} quantidades - Quantidades de cada equipamento.
 * @param {number} valorParcela - Valor de cada parcela.
 * @param {number} valorTotal - Valor total da simulação.
 * @param {number} desconto - Valor do desconto aplicado.
 * @param {string} observacao - Observações adicionais.
 * @param {string} descricao - Descrição da simulação.
 * @param {string} tipoPagamento - Tipo de pagamento.
 * @param {string} nomeVendedor - Nome do vendedor.
 * @param {Function} validarNomeVendedor - Função para validar o nome do vendedor.
 * @param {string} nomeCNPJ - CPF/CNPJ do cliente.
 * @param {Function} validarNomeCNPJ - Função para validar o CPF/CNPJ.
 * @param {string} nomeCliente - Nome do cliente.
 * @param {Function} validarNomeCliente - Função para validar o nome do cliente.
 */
const PDFSimulacao = ({
  equipamentos,
  entrada,
  parcelas,
  localizacao,
  faturamento,
  quantidades,
  valorParcela,
  valorTotal,
  desconto,
  observacao,
  descricao,
  tipoPagamento,
  nomeVendedor,
  validarNomeVendedor,
  nomeCNPJ,
  validarNomeCNPJ,
  nomeCliente,
  validarNomeCliente,
}) => {
  // Estado para controlar se a geração do PDF está em andamento (para desabilitar o botão)
  const [isGenerating, setIsGenerating] = useState(false);
  // Estado para armazenar e exibir mensagens de erro
  const [error, setError] = useState(null);

  /**
   * Função para detectar se o navegador é o Safari (apenas na web).
   * Isso é importante porque o Safari tem um comportamento diferente de outros navegadores
   * ao tentar abrir PDFs em novas abas ou forçar o download.
   * @returns {boolean} True se for Safari na plataforma web, False caso contrário.
   */
  const isSafari = () => {
    if (Platform.OS !== 'web') return false;
    
    // Lógica para detectar Safari (baseada na ausência de Chrome/CriOS no UserAgent)
    const userAgent = navigator.userAgent;
    const isChrome = userAgent.includes('Chrome') || userAgent.includes('CriOS');
    const isSafari = !isChrome;
    return isSafari;
  };

  /**
   * Força o download de um Blob (PDF) no navegador web.
   * Método padrão para garantir o download em todos os navegadores, especialmente no Safari.
   * @param {Blob} blob - O objeto Blob contendo os dados do PDF.
   * @param {string} [filename='simulacao.pdf'] - O nome do arquivo para download.
   */
  const forceDownloadWeb = (blob, filename = 'simulacao.pdf') => {
    // Garante que o blob tenha o tipo correto (application/pdf)
    const pdfBlob = new Blob([blob], { type: 'application/pdf' });

    // Cria uma URL temporária para o Blob
    const url = URL.createObjectURL(pdfBlob);
    // Cria um elemento <a> (link) invisível
    const a = document.createElement('a');
    a.href = url;
    // Define o nome do arquivo, garantindo a extensão .pdf
    a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`; 

    // Simula o clique no link para iniciar o download
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Libera a URL temporária para evitar vazamento de memória (depois de um pequeno delay)
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  /**
   * Tenta abrir o PDF em uma nova aba do navegador.
   * @param {Blob} blob - O objeto Blob contendo os dados do PDF.
   * @returns {Window | null} O objeto Window da nova aba, ou null se falhar.
   */
  const openPDFInNewTab = (blob) => {
    const url = URL.createObjectURL(blob);
    // Tenta abrir em nova aba. Pode ser bloqueado pelo popup blocker.
    const newWindow = window.open(url, '_blank');
    
    // Limpa a URL temporária após um tempo
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
    
    return newWindow;
  };

  /**
   * Abre o PDF em um visualizador simples dentro de uma nova janela pop-up (usando iframe).
   * Método alternativo caso 'openPDFInNewTab' falhe devido a bloqueio de pop-up.
   * @param {Blob} blob - O objeto Blob contendo os dados do PDF.
   */
  const openPDFInViewer = (blob) => {
    const url = URL.createObjectURL(blob);
    // Cria um iframe para embutir o PDF
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.height = '100vh';
    iframe.style.border = 'none';
    
    // Abre uma nova janela vazia e insere o iframe
    const viewerWindow = window.open('', '_blank');
    viewerWindow.document.body.appendChild(iframe);
    viewerWindow.document.title = 'Visualização do PDF';
    
    // Limpa a URL temporária após um tempo
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  /**
   * Lida com o download e compartilhamento do PDF em ambientes React Native (iOS/Android).
   * Utiliza o FileSystem para salvar o arquivo e o Sharing para abrir o menu de compartilhamento.
   * @param {Blob} blob - O objeto Blob contendo os dados do PDF.
   */
  const handleNativeDownload = async (blob) => {
    try {
      // 1. Converter Blob para Base64
      // O FileSystem do Expo geralmente precisa do conteúdo em formato Base64 para escrita.
      const base64data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      // 2. Extrair a string Base64 pura
      // Remove o prefixo de metadados (e.g., 'data:application/pdf;base64,')
      const base64 = base64data.split(',')[1];
      
      // 3. Definir nome e URI do arquivo
      const fileName = `Simulação_${nomeCliente}_${new Date().toISOString().slice(0, 10)}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`; // Salva no diretório de documentos do app
      
      // 4. Escrever o arquivo no sistema de arquivos do dispositivo
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // 5. Compartilhar/Abrir o arquivo
      if (await Sharing.isAvailableAsync()) {
        // Abre o menu de compartilhamento do sistema operacional
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Salvar Simulação de Venda',
          UTI: 'com.adobe.pdf' // Tipo de arquivo para iOS (Uniform Type Identifier)
        });
      } else {
        // Caso o compartilhamento não esteja disponível (raro)
        Alert.alert('Sucesso', `PDF salvo em: ${fileUri}`);
      }
      
    } catch (err) {
      console.error('Erro ao salvar PDF:', err);
      Alert.alert('Erro', 'Não foi possível salvar o PDF.');
      // Propaga o erro para ser capturado no handleGeneratePDF
      throw err; 
    }
  };

  /**
   * Função principal para iniciar o processo de geração do PDF.
   * Inclui validações, chamada à API e tratamento de resposta específico por plataforma.
   */
  const handleGeneratePDF = async () => {
    // --- 1. Validações Iniciais ---
    if (!validarNomeVendedor()) {
      Alert.alert('Aviso', 'Por favor, preencha o nome do vendedor antes de gerar o PDF.');
      return;
    }
    if (!validarNomeCliente()) {
      Alert.alert('Aviso', 'Por favor, preencha o nome do cliente antes de gerar o PDF.');
      return;
    }
    if (!validarNomeCNPJ()) {
      Alert.alert('Aviso', 'Por favor, preencha o CPF/CNPJ do cliente antes de gerar o PDF.');
      return;
    }

    // Define o estado de carregamento
    setIsGenerating(true);
    setError(null);

    try {
      // --- 2. Preparação dos Dados para a API ---
      const pdfData = {
        // Mapeia apenas os IDs dos equipamentos
        equipamentos: equipamentos.map(equip => equip.id), 
        quantidades: quantidades,
        entrada: entrada,
        parcelas: parcelas,
        localizacao: localizacao,
        faturamento: faturamento,
        valorParcela: valorParcela,
        valorTotal: valorTotal,
        desconto: desconto,
        observacao: observacao,
        descricao: descricao,
        tipoPagamento: tipoPagamento,
        nomeVendedor: nomeVendedor,
        nomeCNPJ: nomeCNPJ,
        nomeCliente: nomeCliente
      };

      // --- 3. Determinação da URL Base da API ---
      // Verifica se a aplicação está rodando em HTTPS (apenas na web)
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

      // Define a URL base da API (alternando entre HTTPS e HTTP)
      const API_BASE_URL = "/api"

      // --- 4. Requisição POST para a API Django ---
      const response = await fetch(`${API_BASE_URL}/generate-pdf/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // O comentário indica que o header 'Accept' foi removido para evitar erro 406
        },
        body: JSON.stringify(pdfData),
      });

      // --- 5. Tratamento de Erros da Resposta da API ---
      if (!response.ok) {
        // Tenta obter o texto do erro para depuração
        const errorText = await response.text();
        console.error('Erro detalhado:', response.status, errorText);
        
        if (response.status === 406) {
          // Erro 406 (Not Acceptable) é tratado especificamente
          throw new Error('Formato não aceito pelo servidor. O servidor pode estar esperando dados diferentes.');
        }
        
        // Tenta obter um JSON de erro, se falhar, retorna um objeto vazio
        const errorData = await response.json().catch(() => ({})); 
        throw new Error(errorData.error || `Erro na geração do PDF: ${response.status} ${response.statusText}`);
      }

      // --- 6. Processamento da Resposta (PDF Blob) ---
      const pdfBlob = await response.blob(); // Obtém o corpo da resposta como Blob
      // Cria um nome de arquivo padronizado
      const filename = `Simulacao_${nomeCliente.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      
      // A linha abaixo parece ser um resquício de teste e pode ser redundante/removida,
      // pois a lógica de plataforma específica logo abaixo já trata o download.
      // forceDownloadWeb(pdfBlob, filename);

      // --- 7. Lógica de Download/Visualização por Plataforma ---
      if (Platform.OS === 'web') {
        // --- Lógica Web ---
        if (isSafari()) {
          // Safari: Força o download (o Safari tem problemas com openPDFInNewTab)
          forceDownloadWeb(pdfBlob, filename);
          Alert.alert('Sucesso', 'PDF baixado com sucesso!');
        } else {
          // Outros navegadores (Chrome, Firefox, etc.): Tenta abrir em nova aba primeiro
          try {
            const newWindow = openPDFInNewTab(pdfBlob);
            
            // Verifica se o popup blocker impediu a abertura
            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
              throw new Error('Popup bloqueado. Tentando visualizador alternativo.');
            }
            
            Alert.alert('Sucesso', 'PDF aberto em nova aba!');
          } catch (tabError) {
            console.log('Erro ao abrir em nova aba, tentando visualizador:', tabError);
            
            // Se falhar (popup bloqueado), tenta o visualizador (iframe)
            try {
              openPDFInViewer(pdfBlob);
              Alert.alert('Sucesso', 'PDF aberto no visualizador!');
            } catch (viewerError) {
              // Se o visualizador também falhar, força o download como último recurso
              console.log('Erro ao abrir no visualizador, fazendo download:', viewerError);
              forceDownloadWeb(pdfBlob, filename);
              Alert.alert('Sucesso', 'PDF baixado com sucesso!');
            }
          }
        }
      } else {
        // --- Lógica React Native (iOS/Android) ---
        await handleNativeDownload(pdfBlob);
      }

    } catch (err) {
      // --- 8. Tratamento de Erros Finais ---
      console.error('Erro na geração do PDF:', err);
      setError(err.message);
      
      // Exibe um alerta específico para o erro 406
      if (err.message.includes('406')) {
        Alert.alert(
          'Erro de Formato',
          'O servidor não aceitou o formato da requisição. Entre em contato com o suporte técnico.',
          [{ text: 'OK' }]
        );
      } else {
        // Exibe um alerta genérico para outros erros
        Alert.alert(
          'Erro',
          `Não foi possível gerar o PDF: ${err.message}`,
          [{ text: 'OK' }]
        );
      }
    } finally {
      // Garante que o estado de carregamento seja desativado, independentemente do sucesso ou falha
      setIsGenerating(false);
    }
  };

  // --- Renderização do Componente ---
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleGeneratePDF} // Chama a função de geração de PDF
        disabled={isGenerating} // Desabilita enquanto estiver gerando
        style={[styles.button, isGenerating && styles.buttonDisabled]}
      >
        {isGenerating ? (
          // Exibe um indicador de atividade (loading spinner)
          <ActivityIndicator color="white" />
        ) : (
          // Exibe o texto do botão
          <Text style={styles.buttonText}>
            {/* Texto dinâmico: "VISUALIZAR PDF" na web, "GERAR PDF" no nativo */}
            {Platform.OS === 'web' ? 'VISUALIZAR PDF' : 'GERAR PDF'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Exibe a mensagem de erro, se houver */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// --- Definições de Estilos (StyleSheet) ---
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
    backgroundColor: '#95a5a6', // Cor mais escura/cinza quando desabilitado
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: '#e74c3c', // Cor vermelha para erros
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
  },
});

export default PDFSimulacao;
