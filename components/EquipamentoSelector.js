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

const EquipamentoSelector = ({
  equipamentos,
  marcas,
  selectedEquipamento,
  onSelect,
  disabledEquipamentos = [],
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGrupo, setSelectedGrupo] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredEquipamentos, setFilteredEquipamentos] = useState([]);

  useEffect(() => {
    let result = [...equipamentos];
    
    // Filtro por marca
    if (selectedGrupo) {
      result = result.filter(equip => equip.marca === selectedGrupo);
    }
    
    // Filtro por texto
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(equip => 
        equip.nome.toLowerCase().includes(searchLower) ||
        (equip.codigo && equip.codigo.toLowerCase().includes(searchLower))
      );
    }
    
    // Remover equipamentos já selecionados
    const disabledIds = disabledEquipamentos.map(equip => equip.id);
    result = result.filter(equip => !disabledIds.includes(equip.id));
    
    setFilteredEquipamentos(result);
  }, [selectedGrupo, searchText, equipamentos, disabledEquipamentos]);

  const handleSelect = (equipamento) => {
    onSelect(equipamento);
    setModalVisible(false);
    setSearchText('');
    setSelectedGrupo(null);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[
          styles.selectorButton,
          !selectedEquipamento && styles.selectorButtonEmpty
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text 
          style={[
            styles.selectorButtonText,
            !selectedEquipamento && styles.selectorButtonPlaceholder
          ]}
          numberOfLines={1}
        >
          {selectedEquipamento ? selectedEquipamento.nome : 'Selecione um equipamento...'}
        </Text>
        <Svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
          <Rect x="0" fill="none" width="24" height="24" />
          <G>
            <Path d="M7 10l5 5 5-5" />
          </G>
        </Svg>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Equipamento</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
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

          <TextInput
            style={styles.searchInput}
            placeholder="Digite para buscar..."
            placeholderTextColor="#95a5a6"
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
          />

          <ScrollView 
            horizontal 
            style={styles.marcasScroll}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.marcasContainer}
          >
            <TouchableOpacity
              style={[
                styles.marcaButton,
                !selectedGrupo && styles.marcaButtonActive
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
            
            {marcas.map(marca => (
              <TouchableOpacity
                key={`marca-${marca.id}`}
                style={[
                  styles.marcaButton,
                  selectedGrupo === marca.id && styles.marcaButtonActive
                ]}
                onPress={() => setSelectedGrupo(marca.id)}
              >
                <Text style={[
                  styles.marcaButtonText,
                  selectedGrupo === marca.id && styles.marcaButtonTextActive
                ]}>
                  {marca.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={filteredEquipamentos}
            keyExtractor={(item) => `equip-${item.id}`}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" viewBox="0 0 24 24" fill="none"><path d="M16.6725 16.6412L21 21M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="#bdc3c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <Text style={styles.emptyText}>
                  {searchText || selectedGrupo 
                    ? "Nenhum equipamento encontrado com esses filtros"
                    : "Todos os equipamentos já foram selecionados"}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.equipamentoItem}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.equipamentoNome}>{item.nome}</Text>
                {item.codigo && (
                  <Text style={styles.equipamentoCodigo}>Código: {item.codigo}</Text>
                )}
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

const styles = StyleSheet.create({
  container: {
    marginBottom: 5,
  },
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
  selectorButtonEmpty: {
    backgroundColor: '#f1f1f1',
  },
  selectorButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    marginRight: 10,
  },
  selectorButtonPlaceholder: {
    color: '#95a5a6',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 5,
  },
  searchInput: {
    margin: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  marcasScroll: {
    minHeight: 50,
    maxHeight: 50,
    marginHorizontal: 15,
  },
  marcasContainer: {
    paddingBottom: 10,
  },
  marcaButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
  },
  marcaButtonActive: {
    backgroundColor: '#3498db',
  },
  marcaButtonText: {
    color: '#7f8c8d',
  },
  marcaButtonTextActive: {
    color: 'white',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
  },
  equipamentoItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  equipamentoNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  equipamentoCodigo: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  equipamentoGrupo: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
});

export default EquipamentoSelector;