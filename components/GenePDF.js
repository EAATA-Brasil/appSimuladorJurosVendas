import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

      // URL base ajustável para diferentes ambientes
     const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

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
      
      // Criar URL para o blob e abrir em nova aba
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Para web: abrir em nova aba
      if (typeof window !== 'undefined') {
        window.open(pdfUrl, '_blank');
      }
      
      Alert.alert('Sucesso', 'PDF gerado com sucesso!');

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