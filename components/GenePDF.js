import React, { useEffect, useState } from 'react';
import { Button, View, Alert, Platform } from 'react-native';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import logoImage from '../assets/images/logo.jpg';

export default function PDFSimulacao({
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
}) {
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'O app precisa de permissão para salvar o PDF na pasta Downloads.');
      } else {
        setPermissionGranted(true);
      }
    };
    requestPermission();
  }, []);

  const getBase64Logo = async () => {
    const asset = Asset.fromModule(logoImage);
    await asset.downloadAsync();
    const base64 = await FileSystem.readAsStringAsync(asset.localUri || '', {
      encoding: FileSystem.EncodingType.Base64,
    });
    // Use extensão .jpg pois seu logo é jpg
    return `data:image/jpeg;base64,${base64}`;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const gerarPDF = async () => {
    if (!permissionGranted) {
      Alert.alert('Sem permissão', 'Não foi possível salvar o PDF porque a permissão não foi concedida.');
      return;
    }

    try {
      const logoBase64 = await getBase64Logo();

      const linhasEquipamentos = equipamentos.map((equipamento, index) => {
        const quantidade = quantidades[index] || 1;
        let valorUnit;

        if (localizacao === 'SP') {
          valorUnit = equipamento.custo_geral;
        } else if (faturamento === 'CPF') {
          valorUnit = equipamento.custo_cpf;
        } else {
          valorUnit = equipamento.custo_cnpj;
        }

        const totalItem = valorUnit * quantidade;

        return `
          <tr>
            <td>${quantidade}x ${equipamento.nome}</td>
            <td>${formatCurrency(valorUnit)}</td>
            <td>${formatCurrency(totalItem)}</td>
          </tr>
        `;
      }).join('');

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; background-color: #f5f7fa; color: #333; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { max-width: 150px; margin-bottom: 10px; }
              h1 { color: #2c3e50; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
              th { background-color: #3498db; color: white; }
              .sectionTitle { font-size: 18px; margin-top: 30px; color: #2C3E50; }
              .divider { height: 1px; background-color: #dee2e6; margin: 20px 0; }
              .bold { font-weight: bold; }
              .primaryText { color: #2980b9; }
              .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; }
            </style>
          </head>
          <body>
            <div class="header">
              <img src="${logoBase64}" class="logo" />
              <h1>Relatório de Simulação Financeira</h1>
            </div>

            <h2 class="sectionTitle">Equipamentos</h2>
            <table>
              <thead>
                <tr>
                  <th>Equipamento</th>
                  <th>Valor Unitário</th>
                  <th>Valor Total</th>
                </tr>
              </thead>
              <tbody>
                ${linhasEquipamentos}
              </tbody>
            </table>

            <h2 class="sectionTitle">Resultados</h2>
            <table>
              <tbody>
                <tr><td>Valor da Parcela:</td><td>${formatCurrency(valorParcela)}</td></tr>
                <tr><td>Desconto:</td><td>${formatCurrency(desconto)}</td></tr>
                <tr><td>Base NF:</td><td>${formatCurrency(baseNF)}</td></tr>
                <tr><td>NF Produto:</td><td>${formatCurrency(produtoNF)}</td></tr>
                <tr><td>NF Serviço:</td><td>${formatCurrency(servicoNF)}</td></tr>
                <tr><td>Desc. Fiscal:</td><td>${formatCurrency(descFiscal)}</td></tr>
                <tr><td class="bold">À Vista:</td><td class="bold">${formatCurrency(valorTotal)}</td></tr>
                <tr><td class="bold">Total ${parcelas}x:</td><td class="bold primaryText">${formatCurrency(valorParcelado)}</td></tr>
              </tbody>
            </table>

            <div class="footer">
              Relatório gerado automaticamente pelo app de simulação.
            </div>
          </body>
        </html>
      `;

      // Gera o PDF temporário
      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      const now = new Date();
      const timestamp = now.toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
      const fileName = `Simulacao_EAATA_${timestamp}.pdf`;

      // Caminho dentro do sandbox do app
      const fileUri = FileSystem.documentDirectory + fileName;

      // Copia o arquivo para local com nome fixo
      await FileSystem.copyAsync({ from: uri, to: fileUri });

      try {
        // Salva na galeria (fotos no iOS, downloads no Android)
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        if (Platform.OS === 'android') {
          try {
            await MediaLibrary.createAlbumAsync('Download', asset, false);
          } catch {
            // Album já existe ou erro ignorado
          }
        }
        Alert.alert('PDF Salvo', 'O PDF foi salvo no dispositivo.');
      } catch (saveError) {
        console.warn('Não foi possível salvar o PDF na galeria:', saveError);
        Alert.alert('Aviso', 'Não foi possível salvar o PDF, mas você pode compartilhá-lo.');
      }

      // Abre o compartilhamento
      await Sharing.shareAsync(fileUri);

    } catch (error) {
      console.error('Erro ao gerar ou salvar PDF:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao gerar o PDF.');
    }
  };

  return (
    <View style={{ marginTop: 20 }}>
      <Button title="Gerar PDF da Simulação" onPress={gerarPDF} />
    </View>
  );
}
