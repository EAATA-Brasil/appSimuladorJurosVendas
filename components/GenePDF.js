import React, { useState } from 'react';
import { View, Alert, Platform, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import logoImage from '../assets/images/logo.jpg';

const PDF_FILE_PREFIX = 'simulacao_eaata_';
const MAX_RETRIES = 2;

const PDFSimulacao = ({
  equipamentos,
  parcelas,
  localizacao,
  faturamento,
  quantidades,
  valorParcela,
  baseNF,
  produtoNF,
  servicoNF,
  descFiscal,
  valorTotal,
  valorParcelado,
  desconto
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

  const getBase64Logo = async () => {
    try {
      const asset = Asset.fromModule(logoImage);
      await asset.downloadAsync();
      if (!asset.localUri) return null;
      const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:image/jpeg;base64,${base64}`;
    } catch {
      return null;
    }
  };

  const generateHtmlContent = async () => {
    const logoBase64 = await getBase64Logo();

    const linhasEquipamentos = equipamentos.map((equipamento, index) => {
      const quantidade = quantidades[index] || 1;
      let valorUnit = localizacao === 'SP' ? equipamento.custo_geral : (faturamento === 'CPF' ? equipamento.custo_cpf : equipamento.custo_cnpj);
      const totalItem = valorUnit * quantidade;

      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${quantidade}x ${equipamento.nome}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(valorUnit)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(totalItem)}</td>
        </tr>
      `;
    }).join('');

    return `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; font-size: 12px; }
            .header { text-align: center; margin-bottom: 20px; }
            .logo { max-width: 150px; height: auto; margin-bottom: 10px; }
            h1 { color: #2c3e50; font-size: 18px; margin: 5px 0; }
            h2 { color: #2c3e50; font-size: 16px; margin: 15px 0 10px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #3498db; color: white; padding: 8px; text-align: left; }
            .divider { height: 1px; background-color: #dee2e6; margin: 15px 0; }
            .bold { font-weight: bold; }
            .primaryText { color: #2980b9; }
            .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #999; }
          </style>
        </head>
        <body>
          <div class="header">
            ${logoBase64 ? `<img src="${logoBase64}" class="logo" />` : ''}
            <h1>Relatório de Simulação Financeira</h1>
            <div class="divider"></div>
          </div>

          <h2>Equipamentos</h2>
          <table>
            <thead>
              <tr>
                <th>Equipamento</th>
                <th style="text-align: right;">Valor Unitário</th>
                <th style="text-align: right;">Valor Total</th>
              </tr>
            </thead>
            <tbody>
              ${linhasEquipamentos}
            </tbody>
          </table>

          <div class="divider"></div>

          <h2>Resultados Financeiros</h2>
          <table>
            <tbody>
              <tr><td style="padding: 8px; border: 1px solid #ddd;">Parcelas</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${parcelas}x</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;">Valor da Parcela</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(valorParcela)}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;">Desconto</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(desconto)}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;">Base NF</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(baseNF)}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;">NF Produto</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(produtoNF)}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;">NF Serviço</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(servicoNF)}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;">Desc. Fiscal</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(descFiscal)}</td></tr>
              <tr><td class="bold" style="padding: 8px; border: 1px solid #ddd;">À Vista</td><td class="bold" style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(valorTotal)}</td></tr>
              <tr><td class="bold" style="padding: 8px; border: 1px solid #ddd;">Total ${parcelas}x</td><td class="bold primaryText" style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(valorParcelado)}</td></tr>
            </tbody>
          </table>

          <div class="footer">
            Relatório gerado em ${new Date().toLocaleDateString()} às ${new Date().toLocaleTimeString()}
          </div>
        </body>
      </html>
    `;
  };

  const cleanTempFiles = async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(FileSystem.cacheDirectory);
      const pdfFiles = files.filter(file => file.startsWith(PDF_FILE_PREFIX));
      await Promise.all(pdfFiles.map(file =>
        FileSystem.deleteAsync(`${FileSystem.cacheDirectory}${file}`)
      ));
    } catch (cleanError) {
      console.warn('Erro ao limpar arquivos temporários:', cleanError);
    }
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permissão para acessar arquivos foi negada.');
      }

      await cleanTempFiles();

      const html = await generateHtmlContent();
      const { uri } = await Print.printToFileAsync({ html });

      const fileName = `${PDF_FILE_PREFIX}${Date.now()}.pdf`;
      let finalUri = uri;

      if (Platform.OS === 'android') {
        try {
          const downloadsDir = FileSystem.documentDirectory.replace(/Android\/data\/.*$/, '') + 'Download/';
          await FileSystem.makeDirectoryAsync(downloadsDir, { intermediates: true });
          const downloadsPath = downloadsDir + fileName;
          await FileSystem.copyAsync({ from: uri, to: downloadsPath });
          finalUri = downloadsPath;
        } catch (e) {
          console.warn('Falha ao salvar em Downloads:', e);
        }
      }

      try {
        await MediaLibrary.createAssetAsync(finalUri);
      } catch (assetError) {
        Alert.alert(
        'Erro ao Gerar PDF',
        assetError.message
      );
        console.warn('Não foi possível criar asset:', assetError);
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(finalUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Salvar ou Compartilhar PDF',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF Gerado com Sucesso', `Arquivo salvo em: ${finalUri}`);
      }

    } catch (err) {
      console.error('Erro na geração do PDF:', err);
      setError(err.message);
      Alert.alert(
        'Erro ao Gerar PDF',
        err.message || 'Erro desconhecido',
        [
          { text: 'OK' },
          { text: 'Tentar Novamente', onPress: handleGeneratePDF }
        ]
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
          <Text style={styles.buttonText}>GERAR PDF DA SIMULAÇÃO</Text>
        )}
      </TouchableOpacity>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
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
  },
  errorText: {
    color: '#e74c3c',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default PDFSimulacao;
