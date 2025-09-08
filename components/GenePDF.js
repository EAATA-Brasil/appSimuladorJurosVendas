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

  // Função para detectar se é Safari
  const detectSafari = () => {
    if (Platform.OS !== 'web') return false;
    
    const userAgent = navigator.userAgent;
    const isChrome = userAgent.includes('Chrome') || userAgent.includes('CriOS');
    const isSafari = !isChrome;
    return isSafari;
  };

  // Função para forçar download do arquivo (WEB)
  const forceDownloadWeb = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'simulacao.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Função para abrir PDF no visualizador do navegador
  const openPDFInViewer = (blob) => {
    const url = URL.createObjectURL(blob);
    
    // Abrir o PDF no visualizador do navegador
    window.open(url, '_blank');
    
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

      // URL base
      const API_BASE_URL = 'http://82.25.71.76';

      // Fazer a requisição POST para sua API Django
      const response = await fetch(`${API_BASE_URL}/api/generate-pdf/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pdfData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro na geração do PDF: ${response.status}`);
      }

      // Obter o PDF como blob
      const pdfBlob = await response.blob();
      const filename = `simulacao_${nomeCliente}_${new Date().toISOString().slice(0, 10)}.pdf`;
      
      // Plataforma específica
      if (Platform.OS === 'web') {
        if(detectSafari()){
          forceDownloadWeb(pdfBlob, filename);
        }else{
          // Para todos os navegadores: tentar abrir no visualizador primeiro
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
      } else {
        // Para React Native
        await handleNativeDownload(pdfBlob);
      }

    } catch (err) {
      console.error('Erro na geração do PDF:', err);
      setError(err.message);
      
      Alert.alert(
        'Erro',
        `Não foi possível gerar o PDF: ${err.message}`,
        [{ text: 'OK' }]
      );
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