import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Função para detectar se é Safari (mais precisa)
  const isSafari = () => {
    if (Platform.OS !== 'web') return false;
    
    const userAgent = navigator.userAgent;
    const isChrome = userAgent.includes('Chrome') || userAgent.includes('CriOS');
    const isSafari = !isChrome;
    return isSafari;
  };

  // Função para forçar download do arquivo (WEB)
  const forceDownloadWeb = (blob, filename = 'simulacao.pdf') => {
    // Garante que o blob tenha o tipo correto
    const pdfBlob = new Blob([blob], { type: 'application/pdf' });

    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`; // força extensão .pdf

    // Necessário para alguns navegadores (Safari, Firefox)
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Libera o objeto após um pequeno delay (para evitar "revoked before download")
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Função para abrir PDF em nova aba
  const openPDFInNewTab = (blob) => {
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    
    // Limpar URL após um tempo
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
    
    return newWindow;
  };

  // Função para abrir PDF no visualizador do navegador (usando iframe)
  const openPDFInViewer = (blob) => {
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.height = '100vh';
    iframe.style.border = 'none';
    
    const viewerWindow = window.open('', '_blank');
    viewerWindow.document.body.appendChild(iframe);
    viewerWindow.document.title = 'Visualização do PDF';
    
    // Limpar URL após um tempo
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  // Função para lidar com download em React Native
  const handleNativeDownload = async (blob) => {
    try {
      // Converter blob para base64
      const base64data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      // Extrair apenas a parte base64 (remover o prefixo data:application/pdf;base64,)
      const base64 = base64data.split(',')[1];
      
      // Criar nome do arquivo
      const fileName = `Simulação_${nomeCliente}_${new Date().toISOString().slice(0, 10)}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Escrever arquivo
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Compartilhar/abrir o arquivo
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Salvar Simulação de Venda',
          UTI: 'com.adobe.pdf'
        });
      } else {
        Alert.alert('Sucesso', `PDF salvo em: ${fileUri}`);
      }
      
    } catch (err) {
      console.error('Erro ao salvar PDF:', err);
      Alert.alert('Erro', 'Não foi possível salvar o PDF.');
      throw err;
    }
  };

  const handleGeneratePDF = async () => {
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

  setIsGenerating(true);
  setError(null);

  try {
    // Preparar os dados para enviar para o Django
    const pdfData = {
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

    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

    // URL base
    const API_BASE_URL = isHttps
  ? 'https://eaatainterno.duckdns.org'
  : 'http://82.25.71.76';

    // Fazer a requisição POST para sua API Django - HEADERS CORRIGIDOS
    const response = await fetch(`${API_BASE_URL}/api/generate-pdf/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // REMOVER o header 'Accept' que estava causando erro 406
      },
      body: JSON.stringify(pdfData),
    });

    // Verificar se a resposta é válida
    if (!response.ok) {
      // Tentar obter mais informações sobre o erro
      const errorText = await response.text();
      console.error('Erro detalhado:', response.status, errorText);
      
      if (response.status === 406) {
        throw new Error('Formato não aceito pelo servidor. O servidor pode estar esperando dados diferentes.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro na geração do PDF: ${response.status} ${response.statusText}`);
    }

    // Obter o PDF como blob
    const pdfBlob = await response.blob();
    const filename = `Simulacao_${nomeCliente.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
forceDownloadWeb(pdfBlob, filename);

    
    // Plataforma específica
    if (Platform.OS === 'web') {
      // Para Safari: fazer download diretamente
      if (isSafari()) {
        forceDownloadWeb(pdfBlob, filename);
        Alert.alert('Sucesso', 'PDF baixado com sucesso!');
      } else {
        // Para outros navegadores: tentar abrir em nova aba primeiro
        try {
          const newWindow = openPDFInNewTab(pdfBlob);
          
          // Verificar se a nova aba foi bloqueada pelo navegador/popup blocker
          if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            throw new Error('Popup bloqueado. Tentando visualizador alternativo.');
          }
          
          Alert.alert('Sucesso', 'PDF aberto em nova aba!');
        } catch (tabError) {
          console.log('Erro ao abrir em nova aba, tentando visualizador:', tabError);
          
          // Se não conseguiu abrir em nova aba, tentar visualizador
          try {
            openPDFInViewer(pdfBlob);
            Alert.alert('Sucesso', 'PDF aberto no visualizador!');
          } catch (viewerError) {
            // Se não conseguiu abrir no visualizador, fazer download
            console.log('Erro ao abrir no visualizador, fazendo download:', viewerError);
            forceDownloadWeb(pdfBlob, filename);
            Alert.alert('Sucesso', 'PDF baixado com sucesso!');
          }
        }
      }
    } else {
      // Para React Native
      await handleNativeDownload(pdfBlob);
    }

  } catch (err) {
    console.error('Erro na geração do PDF:', err);
    setError(err.message);
    
    // Mensagem específica para erro 406
    if (err.message.includes('406')) {
      Alert.alert(
        'Erro de Formato',
        'O servidor não aceitou o formato da requisição. Entre em contato com o suporte técnico.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Erro',
        `Não foi possível gerar o PDF: ${err.message}`,
        [{ text: 'OK' }]
      );
    }
  } finally {
    setIsGenerating(false);
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
          <Text style={styles.buttonText}>
            {Platform.OS === 'web' ? 'VISUALIZAR PDF' : 'GERAR PDF'}
          </Text>
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