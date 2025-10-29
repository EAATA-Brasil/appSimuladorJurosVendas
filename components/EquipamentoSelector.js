import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Rect, Svg, Path, G } from 'react-native-svg';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

/**
 * Componente seletor de equipamento.
 * Exibe um botão que abre um modal para selecionar um equipamento de uma lista.
 * Permite filtrar por marca/grupo e pesquisar por texto.
 *
 * @param {Array<Object>} equipamentos - Lista completa de todos os equipamentos disponíveis.
 * @param {Array<Object>} marcas - Lista de marcas/grupos para filtragem.
 * @param {Object|null} selectedEquipamento - O equipamento atualmente selecionado.
 * @param {Function} onSelect - Função de callback chamada ao selecionar um equipamento.
 * @param {Array<Object>} disabledEquipamentos - Lista de equipamentos que não devem ser exibidos (já selecionados em outro lugar).
 */
const EquipamentoSelector = ({
  equipamentos,
  marcas,
  selectedEquipamento,
  onSelect,
  disabledEquipamentos = [],
}) => {
  // Estado para controlar a visibilidade do modal de seleção
  const [modalVisible, setModalVisible] = useState(false);
  // Estado para armazenar o ID da marca/grupo selecionado para filtragem
  const [selectedGrupo, setSelectedGrupo] = useState(null);
  // Estado para armazenar o texto digitado na barra de pesquisa
  const [searchText, setSearchText] = useState('');
  // Estado que armazena a lista de equipamentos filtrados para exibição no FlatList
  const [filteredEquipamentos, setFilteredEquipamentos] = useState([]);

  /**
   * Hook useEffect para aplicar os filtros sempre que houver mudança nos estados de filtro
   * (selectedGrupo, searchText) ou nas props (equipamentos, disabledEquipamentos).
   */
  useEffect(() => {
    let result = [...equipamentos];
    
    // 1. Filtro por marca/grupo
    if (selectedGrupo) {
      // Filtra os equipamentos cuja propriedade 'marca' (que deve ser um ID)
      // corresponde ao 'selectedGrupo' (que também é um ID de marca).
      result = result.filter(equip => equip.marca === selectedGrupo);
    }
    
    // 2. Filtro por texto de pesquisa
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      // Filtra por nome ou código do equipamento (se o código existir)
      result = result.filter(equip => 
        equip.nome.toLowerCase().includes(searchLower) ||
        (equip.codigo && equip.codigo.toLowerCase().includes(searchLower))
      );
    }
    
    // 3. Remover equipamentos já selecionados (desativados)
    // Mapeia os IDs dos equipamentos que devem ser desativados.
    const disabledIds = disabledEquipamentos.map(equip => equip.id);
    // Filtra a lista, mantendo apenas os equipamentos cujo ID NÃO está na lista de desativados.
    result = result.filter(equip => !disabledIds.includes(equip.id));
    
    // Atualiza o estado com a lista final de equipamentos filtrados
    setFilteredEquipamentos(result);
  }, [selectedGrupo, searchText, equipamentos, disabledEquipamentos]);

  /**
   * Função chamada ao selecionar um equipamento na lista.
   * @param {Object} equipamento - O equipamento selecionado.
   */
  const handleSelect = (equipamento) => {
    onSelect(equipamento); // Chama o callback da prop
    setModalVisible(false); // Fecha o modal
    setSearchText(''); // Limpa o texto de pesquisa
    setSelectedGrupo(null); // Limpa o filtro de grupo
  };

  // 1. Define a ordem personalizada para as marcas/grupos
  const ordemPersonalizada = {
    "EAATA": 1,
    "THINKCAR": 2,
    "ACESSÓRIOS": 3,
    "OUTROS EQUIPAMENTOS": 4,
    "BATERIA": 5,
    "TPMS": 6,
    "ADAS": 7,
    "ATUALIZAÇÕES": 8,
    "SUPORTE TÉCNICO": 9
  };

  // 2. Ordena o array `marcas` conforme a ordem personalizada
  const marcasOrdenadas = [...marcas].sort((a, b) => {
    // Busca a prioridade no objeto 'ordemPersonalizada'. Se não encontrar, usa 999 (vai para o final).
    const prioridadeA = ordemPersonalizada[a.nome] || 999; 
    const prioridadeB = ordemPersonalizada[b.nome] || 999;
    // A função de comparação ordena de forma crescente (menor prioridade primeiro)
    return prioridadeA - prioridadeB;
  });

  // --- Renderização do Componente ---
  return (
    <View style={styles.container}>
      {/* Botão que aciona a abertura do Modal */}
      <TouchableOpacity 
        style={[
          styles.selectorButton,
          // Estilo adicional se nenhum equipamento estiver selecionado
          !selectedEquipamento && styles.selectorButtonEmpty
        ]}
        onPress={() => setModalVisible(true)} // Abre o modal
      >
        {/* Texto exibindo o equipamento selecionado ou um placeholder */}
        <Text 
          style={[
            styles.selectorButtonText,
            // Estilo de placeholder se nenhum equipamento estiver selecionado
            !selectedEquipamento && styles.selectorButtonPlaceholder
          ]}
          numberOfLines={1}
        >
          {selectedEquipamento ? selectedEquipamento.nome : 'Selecione um equipamento...'}
        </Text>
        {/* Ícone de seta para baixo (indicando que é um seletor/dropdown) */}
        <Svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
          <Rect x="0" fill="none" width="24" height="24" />
          <G>
            <Path d="M7 10l5 5 5-5" />
          </G>
        </Svg>
      </TouchableOpacity>

      {/* Modal de Seleção de Equipamento */}
      <Modal
        visible={modalVisible} // Controlado pelo estado 'modalVisible'
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)} // Permite fechar com o botão 'Voltar' do Android
      >
        <View style={styles.modalContainer}>
          {/* Cabeçalho do Modal */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Equipamento</Text>
            {/* Botão de Fechar (X) */}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              {/* Ícone de Fechar (X) em formato SVG */}
              <Svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24px" 
                height="24px" 
                viewBox="0 0 1024 1024"
              >
                <Path 
                  fill="#2c3e50" 
                  d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504 738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512 828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496 285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512 195.2 285.696a64 64 0 0 1 0-90.496z"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Campo de Busca (TextInput) */}
          <TextInput
            style={styles.searchInput}
            placeholder="Digite para buscar..."
            placeholderTextColor="#95a5a6"
            value={searchText}
            onChangeText={setSearchText} // Atualiza o estado 'searchText'
            autoCapitalize="none"
          />

          {/* ScrollView Horizontal para os botões de Marca/Grupo (Filtros) */}
          <ScrollView 
            horizontal 
            style={styles.marcasScroll}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.marcasContainer}
          >
            {/* Botão "Todos" (para limpar o filtro de marca) */}
            <TouchableOpacity
              style={[
                styles.marcaButton,
                !selectedGrupo && styles.marcaButtonActive // Ativo se selectedGrupo for null
              ]}
              onPress={() => setSelectedGrupo(null)}
            >
              <Text style={[
                styles.marcaButtonText,
                !selectedGrupo && styles.marcaButtonTextActive
              ]}>
                Todos
              </Text>
            </TouchableOpacity>
            
            {/* Mapeamento e renderização dos botões de marca ordenados */}
            {marcasOrdenadas.map((marca) => (
              <TouchableOpacity
                key={`marca-${marca.id}`}
                style={[
                  styles.marcaButton,
                  // Ativo se o ID da marca corresponder ao estado 'selectedGrupo'
                  selectedGrupo === marca.id && styles.marcaButtonActive,
                ]}
                onPress={() => setSelectedGrupo(marca.id)} // Define o filtro de grupo
              >
                <Text
                  style={[
                    styles.marcaButtonText,
                    selectedGrupo === marca.id && styles.marcaButtonTextActive,
                  ]}
                >
                  {marca.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* FlatList para exibir a lista de equipamentos filtrados */}
          <FlatList
            data={filteredEquipamentos} // Usa a lista filtrada pelo useEffect
            keyExtractor={(item) => `equip-${item.id}`}
            contentContainerStyle={styles.listContent}
            // Componente exibido quando a lista está vazia
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                {/* Ícone de lupa (SVG) */}
                <Svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" viewBox="0 0 24 24" fill="none">
                <Path d="M16.6725 16.6412L21 21M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="#bdc3c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></Svg>
                {/* Mensagem de lista vazia */}
                <Text style={styles.emptyText}>
                  {/* Mensagem dinâmica dependendo se há filtros ativos */}
                  {searchText || selectedGrupo 
                    ? "Nenhum equipamento encontrado com esses filtros"
                    : "Todos os equipamentos já foram selecionados"}
                </Text>
              </View>
            }
            // Função para renderizar cada item da lista
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.equipamentoItem}
                onPress={() => handleSelect(item)} // Seleciona o item e fecha o modal
              >
                <Text style={styles.equipamentoNome}>{item.nome}</Text>
                {/* Exibe o código se ele existir */}
                {item.codigo && (
                  <Text style={styles.equipamentoCodigo}>Código: {item.codigo}</Text>
                )}
                {/* Exibe o nome da marca/grupo, buscando-o na lista 'marcas' pela ID */}
                <Text style={styles.equipamentoGrupo}>
                  Marca: {marcas.find(g => g.id === item.marca)?.nome || 'N/A'}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
};

// --- Definições de Estilos (StyleSheet) ---
const styles = StyleSheet.create({
  // Estilo do container principal, adicionando margem inferior
  container: {
    marginBottom: 5,
  },
  // Estilo do botão seletor (o que fica visível fora do modal)
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  // Estilo adicional para o botão seletor quando está vazio
  selectorButtonEmpty: {
    backgroundColor: '#f1f1f1',
  },
  // Estilo do texto dentro do botão seletor
  selectorButtonText: {
    flex: 1, // Permite que o texto ocupe o espaço disponível
    fontSize: 16,
    color: '#2c3e50',
    marginRight: 10,
  },
  // Estilo para o texto placeholder (quando nada está selecionado)
  selectorButtonPlaceholder: {
    color: '#95a5a6',
  },
  // Estilo do container do modal (tela cheia)
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Estilo do cabeçalho do modal
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  // Estilo do título do modal
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  // Estilo do botão de fechar (X)
  closeButton: {
    padding: 5,
  },
  // Estilo do campo de busca (TextInput)
  searchInput: {
    margin: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  // Estilo do container ScrollView para as marcas (altura fixa)
  marcasScroll: {
    minHeight: 50,
    maxHeight: 50,
    marginHorizontal: 15,
  },
  // Estilo do conteúdo do ScrollView (para padding inferior)
  marcasContainer: {
    paddingBottom: 10,
  },
  // Estilo base para os botões de filtro de marca
  marcaButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
  },
  // Estilo para o botão de marca ativo (selecionado)
  marcaButtonActive: {
    backgroundColor: '#3498db', // Cor azul primária
  },
  // Estilo do texto do botão de marca
  marcaButtonText: {
    color: '#7f8c8d',
  },
  // Estilo do texto do botão de marca ativo
  marcaButtonTextActive: {
    color: 'white',
  },
  // Estilo do container de conteúdo da FlatList (para padding inferior)
  listContent: {
    paddingBottom: 20,
  },
  // Estilo do container exibido quando a lista está vazia
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  // Estilo do texto de lista vazia
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
  },
  // Estilo de cada item de equipamento na FlatList
  equipamentoItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  // Estilo do nome do equipamento
  equipamentoNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  // Estilo do código do equipamento
  equipamentoCodigo: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  // Estilo do grupo/marca do equipamento
  equipamentoGrupo: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
});

export default EquipamentoSelector;
