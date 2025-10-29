import { useState, useEffect, useCallback } from 'react';
import { TextInput, View, StyleSheet, TouchableOpacity, Text } from 'react-native';

/**
 * Componente de Input Financeiro Personalizado.
 * Permite a entrada de valores como número absoluto (R$) ou porcentagem (%).
 * Internamente, sempre reporta o valor absoluto calculado via `onValueChange`.
 *
 * @param {string|number} [value=''] - O valor numérico absoluto controlado (propriedade).
 * @param {Function} onValueChange - Callback chamado com o valor numérico absoluto final.
 * @param {string} [placeholder='Qtd.'] - Texto de placeholder.
 * @param {Object} [style={}] - Estilos personalizados para o container.
 * @param {string} [tipoValor] - Se fornecido ('numero' ou 'porcentagem'), desabilita o toggle e fixa o tipo.
 * @param {number} valorTotal - O valor total base usado para calcular a porcentagem.
 * @param {Object} props - Outras props passadas diretamente para o TextInput.
 */
export default function FinanceiroInput({
  value: propValue = '',
  onValueChange,
  placeholder = "Qtd.",
  style = {},
  tipoValor,
  valorTotal,
  ...props
}) {
  // Estado que armazena o tipo de desconto/valor atual ('numero' ou 'porcentagem')
  const [tipoDesconto, setTipoDesconto] = useState(tipoValor || "numero");
  // Estado que armazena o valor a ser exibido no TextInput (pode ser o valor ou a porcentagem)
  const [displayValue, setDisplayValue] = useState('');

  /**
   * Função memorizada (useCallback) para calcular o valor absoluto (R$)
   * com base no valor exibido (`displayValue`) e no tipo atual.
   *
   * @param {string} value - O valor exibido no input (número ou porcentagem).
   * @returns {number} O valor absoluto em R$ (arredondado para inteiro).
   */
  const getAbsoluteValue = useCallback((value) => {
    // Converte o valor exibido para um inteiro (removendo formatação)
    const numericValue = parseInt(value || '0', 10);

    if (tipoDesconto === "porcentagem") {
      // Se for porcentagem, calcula o valor absoluto: (Porcentagem * Valor Total) / 100
      return Math.round((numericValue * valorTotal) / 100);
    }

    // Se for número, o valor absoluto é o próprio valor
    return numericValue;
  }, [tipoDesconto, valorTotal]); // Recalcula apenas se o tipo ou valorTotal mudar

  // Efeito para sincronizar o valor exibido com a prop `value` quando ela muda
  useEffect(() => {
    // A sincronização só ocorre se o tipo não for porcentagem (para evitar sobrescrever a porcentagem digitada)
    if (tipoDesconto !== "porcentagem") {
      setDisplayValue(propValue.toString());
    }
  }, [propValue, tipoDesconto]);

  /**
   * Função para formatar o valor a ser exibido no TextInput.
   * Aplica a formatação de moeda (R$) ou exibe a porcentagem.
   *
   * @param {string} value - O valor bruto a ser formatado.
   * @returns {string} O valor formatado para exibição.
   */
  const formatDisplayValue = (value) => {
    const numeric = parseInt(value || '0', 10);

    if (tipoDesconto === "porcentagem") {
      // Exibe a porcentagem como um número simples
      return `${numeric}`;
    }

    // Formatação de moeda brasileira (R$) sem casas decimais
    return Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numeric);
  };

  /**
   * Função chamada a cada mudança de texto no TextInput.
   * Responsável por limpar caracteres não numéricos e aplicar limites.
   *
   * @param {string} text - O texto atual do input.
   */
  const handleChange = (text) => {
    // Remove todos os caracteres que não são dígitos
    let numericValue = text.replace(/[^0-9]/g, '');

    // Limita o valor máximo a 100 se o tipo for porcentagem
    if (tipoDesconto === "porcentagem") {
      numericValue = Math.min(parseInt(numericValue || '0', 10), 100).toString();
    }

    // Atualiza o valor exibido, que será formatado na renderização
    setDisplayValue(numericValue);
    
    // A chamada ao onValueChange foi removida daqui, sendo movida para o useEffect abaixo
  };

  // Efeito para chamar onValueChange sempre que o valor exibido (displayValue) mudar
  // Isso garante que o componente pai receba o valor absoluto em tempo real (exceto para porcentagem)
  useEffect(()=>{
    // A chamada é feita aqui para evitar chamadas excessivas durante a digitação
    // e para garantir que o valor absoluto seja calculado corretamente.
    // O valor absoluto só é enviado se não for porcentagem (o que é incomum para inputs financeiros)
    if(tipoDesconto !== 'porcentagem'){
      onValueChange(getAbsoluteValue(displayValue))
    }
  },[displayValue, tipoDesconto, onValueChange, getAbsoluteValue])

  /**
   * Função chamada quando o TextInput perde o foco (onBlur).
   * Garante que o valor absoluto final seja enviado ao componente pai.
   */
  const handleBlur = () => {
    // Envia o valor absoluto calculado para o componente pai
    onValueChange?.(getAbsoluteValue(displayValue));
  };

  /**
   * Função para alternar entre os tipos 'numero' (R$) e 'porcentagem' (%).
   *
   * @param {string} type - O novo tipo ('numero' ou 'porcentagem').
   */
  const toggleTipoDesconto = (type) => {
    if (type === tipoDesconto) return; // Não faz nada se o tipo for o mesmo

    // 1. Calcula o valor absoluto atual antes de mudar o tipo
    const currentAbsoluteValue = getAbsoluteValue(displayValue);
    
    // 2. Define o novo tipo
    setTipoDesconto(type);

    // 3. Atualiza o valor exibido (`displayValue`) para refletir o novo tipo,
    // mantendo o mesmo valor absoluto (R$)
    if (type === "porcentagem") {
      // Calcula a porcentagem correspondente: (Valor Absoluto / Valor Total) * 100
      const percentage = valorTotal > 0 ? Math.round((currentAbsoluteValue / valorTotal) * 100) : 0;
      // Limita a porcentagem a 100
      setDisplayValue(Math.min(percentage, 100).toString());
    } else {
      // Se for para número, exibe o valor absoluto como string
      setDisplayValue(currentAbsoluteValue.toString());
    }

    // 4. Envia o valor absoluto (que permaneceu o mesmo) para o componente pai
    onValueChange?.(currentAbsoluteValue);
  };

  // --- Renderização do Componente ---
  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        {/* Renderiza o Toggle de R$ / % apenas se `tipoValor` não for fixo */}
        {!tipoValor && (
          <View style={styles.toggleContainer}>
            {/* Botão para alternar para 'numero' (R$) */}
            <TouchableOpacity
              style={[
                styles.toggleButton,
                styles.toggleButtonLeft,
                tipoDesconto === "numero" && styles.toggleButtonActive
              ]}
              onPress={() => toggleTipoDesconto("numero")}
            >
              <Text style={[
                styles.toggleText,
                tipoDesconto === "numero" && styles.toggleTextActive
              ]}>
                R$
              </Text>
            </TouchableOpacity>
            {/* Botão para alternar para 'porcentagem' (%) */}
            <TouchableOpacity
              style={[
                styles.toggleButton,
                styles.toggleButtonRight,
                tipoDesconto === "porcentagem" && styles.toggleButtonActive
              ]}
              onPress={() => toggleTipoDesconto("porcentagem")}
            >
              <Text style={[
                styles.toggleText,
                tipoDesconto === "porcentagem" && styles.toggleTextActive
              ]}>
                %
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Componente TextInput */}
        <TextInput
          style={[
            styles.input,
            // Adiciona padding à esquerda se o toggle estiver visível
            !tipoValor && { paddingLeft: 60 } 
          ]}
          keyboardType="number-pad" // Teclado numérico
          // O valor exibido é o formatado (R$ ou %)
          value={formatDisplayValue(displayValue)} 
          onChangeText={handleChange} // Lida com a entrada de texto
          // Envia o valor absoluto final quando o input perde o foco
          onBlur={handleBlur} 
          placeholder={placeholder}
          {...props} // Permite passar outras props (ex: autoCapitalize, maxLength)
        />
      </View>
    </View>
  );
}

// --- Definições de Estilos (StyleSheet) ---
const styles = StyleSheet.create({
  container: {
    minWidth: 80,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative', // Necessário para posicionar o toggle
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    textAlign: 'center',
    flex: 1,
  },
  // Container do toggle (R$ / %)
  toggleContainer: {
    position: 'absolute',
    left: 0,
    zIndex: 1, // Garante que fique sobre o input
    flexDirection: 'row',
    height: 38, 
    marginLeft: 1,
  },
  // Estilo base do botão de toggle
  toggleButton: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  // Borda esquerda arredondada
  toggleButtonLeft: {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    borderRightWidth: 0,
  },
  // Borda direita arredondada
  toggleButtonRight: {
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    borderLeftWidth: 0,
  },
  // Estilo para o botão ativo/selecionado
  toggleButtonActive: {
    backgroundColor: '#007AFF', // Cor de destaque
    borderColor: '#007AFF',
  },
  // Estilo do texto do botão
  toggleText: {
    color: '#333',
    fontSize: 14,
  },
  // Estilo do texto do botão ativo
  toggleTextActive: {
    color: 'white',
  },
});
