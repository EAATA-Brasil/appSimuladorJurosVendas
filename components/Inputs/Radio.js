import { Text, TouchableOpacity, View, StyleSheet } from "react-native"
import { MaterialIcons } from "@expo/vector-icons" // Importação não utilizada, mas mantida no código original

/**
 * Componente de Grupo de Radio Buttons customizado.
 * Permite a seleção de uma única opção dentro de um conjunto.
 *
 * @param {Array<Object>} options - Array de objetos { label: string, value: any } para as opções.
 * @param {any} checkedValue - O valor da opção atualmente selecionada.
 * @param {Function} onChange - Callback chamado ao selecionar uma nova opção. Recebe o 'value' da opção.
 * @param {Object} containerStyle - Estilos adicionais para o container principal (View).
 * @param {number} maxWidth - Largura máxima para cada item de opção.
 */
const Radio = ({ options, checkedValue, onChange, containerStyle, maxWidth }) => {
  
  return (
    
    // Container principal que agrupa todas as opções
    <View style={[
      containerStyle,
      // Estilo para definir o espaçamento entre as opções
      {gap: '40%'} 
    ]}>
      {/* Mapeia o array de opções para renderizar cada Radio Button */}
      {options.map((option) => {
        // Verifica se o valor da opção atual corresponde ao valor selecionado
        const active = checkedValue === option.value;
        
        return (
          // Container clicável para cada opção
          <TouchableOpacity
            key={option.value} // Chave única para o mapeamento
            style={[
              styles.optionContainer,
              // Aplica largura máxima se a prop for fornecida
              maxWidth && { maxWidth: maxWidth }
            ]}
            onPress={() => onChange(option.value)} // Chama o callback com o valor da opção
            // Propriedades de acessibilidade para leitores de tela
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
          >
            
            {/* 1. Radio Button Customizado (Círculo Externo) */}
            <View style={[
              styles.radioButton,
              // Aplica estilo de borda ativa se a opção estiver selecionada
              active && styles.radioButtonActive
            ]}>
              {/* 2. Círculo Interno (Ponto de seleção) */}
              {active && <View style={styles.radioButtonInner} />}
            </View>
            
            {/* Rótulo da Opção */}
            <Text style={[
              styles.optionLabel, 
              // Aplica estilo de texto ativo se a opção estiver selecionada
              active && styles.activeLabel
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  )
}

// --- Definições de Estilos (StyleSheet) ---
const styles = StyleSheet.create({
  // Estilo do container de cada opção (Botão + Texto)
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Alinha o círculo e o texto verticalmente (centro)
    marginVertical: 8, // Espaçamento vertical entre as opções
    alignSelf: 'flex-start', // Garante que o container não ocupe toda a largura se não for necessário
    maxWidth: '100%', // Permite que o texto quebre a linha dentro do limite
    flexShrink: 1, // Permite que o container encolha
  },
  
  // Estilo do círculo externo do Radio Button
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10, // Torna o View um círculo
    borderWidth: 2,
    borderColor: '#6c757d', // Cor da borda padrão (cinza)
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2, // Pequeno ajuste vertical para melhor alinhamento com o texto
  },
  // Estilo da borda quando o Radio Button está ativo
  radioButtonActive: {
    borderColor: '#0d6efd', // Cor da borda ativa (azul)
  },
  // Estilo do círculo interno (ponto de seleção)
  radioButtonInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#0d6efd', // Cor do ponto interno (azul)
  },
  // Estilo do rótulo de texto da opção
  optionLabel: {
    fontSize: 16,
    color: '#212529',
    flex: 1, // Permite que o texto use o espaço restante
    flexWrap: 'wrap', // Permite quebra de linha para textos longos
  },
  // Estilo do rótulo de texto quando a opção está ativa
  activeLabel: {
    color: '#0d6efd', // Cor do texto ativo (azul)
    fontWeight: "bold",
  },
});

export default Radio
