import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import EquipamentoSelector from '../components/EquipamentoSelector';
import PDFSimulacao from '../components/GenePDF';
import { FinanceiroInput, NumericInput, Radio } from '../components/Inputs';

const API_BASE_URL = 'http://82.25.71.76/api'

// process.env.NODE_ENV === 'development' 
//   ? 'http://192.168.18.150:8000/api' 
//   : 'http://82.25.71.76/api'; // Mesmo IP para APK

const equipamentos_URL = `${API_BASE_URL}/equipamentos/`;
const tipo_equipamento_URL = `${API_BASE_URL}/tipoEquipamento/`;
const marca_equipamento_URL = `${API_BASE_URL}/marcaEquipamento/`;

export default function App() {
  const taxa = 0.0292;
  const [equipamentos, setEquipamentos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [nomeVendedor, setNomeVendedor] = useState('');
  const [erroNomeVendedor, setErroNomeVendedor] = useState(false);
  const [nomeCNPJ, setNomeCNPJ] = useState('');
  const [erroNomeCNPJ, setErroNomeCNPJ] = useState(false);
  const [nomeCliente, setNomeCliente] = useState('');
  const [erroNomeCliente, setErroNomeCliente] = useState(false);

  const nomeInputRef = useRef(null);
  const scrollViewRef = useRef(null);

  // Estados para equipamentos e quantidades
  const [equipamentosSelecionados, setEquipamentosSelecionados] = useState([null]);
  const [quantidades, setQuantidades] = useState(['1']);
  const [valoresCalculados, setValoresCalculados] = useState(['1']);
  const [hasDiagnostico , setHasDiagnostico] = useState()

  const [observacao, setObservacao] = useState('')
  const [observacaoOrcamento, setObservacaoOrcamento] = useState([])

  // Estados para os radio buttons
  const [pagamento, setPagamento] = useState("Boleto");
  const [localizacao, setLocalizacao] = useState("SP");
  const [faturamento, setFaturamento] = useState("CNPJ");
  const [condicao, setCondicao] = useState("Normal");

  // Cálculo de valor final
  const [parcelas, setParcelas] = useState(12); 
  const [entrada, setEntrada] = useState(0); 
  const [desconto, setDesconto] = useState(0); 

  // Variáveis automáticas
  const [baseNF, setBaseNF] = useState(0);
  const [descFiscal, setDescFiscal] = useState(0);
  const [valorParcela, setValorParcela] = useState(0);
  const [servicoNF, setServicoNF] = useState(0);
  const [produtoNF, setProdutoNF] = useState(0);
  const [valorTotal, setValorTotal] = useState(0);
  const [valorParcelado, setValorParcelado] = useState(0);

  const tabelaTaxasCartao = {
    1: 0.0333,
    2: 0.0438,
    3: 0.0509,
    4: 0.058,
    5: 0.0652,
    6: 0.0725,
    7: 0.0837,
    8: 0.0912,
    9: 0.0989,
    10: 0.1067,
    11: 0.1146,
    12: 0.125,
    13: 0.1307,
    14: 0.139,
    15: 0.1473,
    16: 0.1558,
    17: 0.1644,
    18: 0.1732,
    19: 0.1820,
    20: 0.1910,
    21: 0.2002
  };

  const formatarMoeda = (valor) => {
    try{
      valor = Math.round(valor)
    }
    catch{
      1+1
    }
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(valor);
  };

  function formatCNPJ(value) {
    // Remove tudo que não for número
    value = value.replace(/\D/g, '');

    // Limita a 14 dígitos (tamanho do CNPJ)
    value = value.slice(0, 14);

    // Aplica máscara do CNPJ passo a passo
    if (value.length > 12) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2}).*/, '$1.$2.$3/$4-$5');
    } else if (value.length > 8) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
    } else if (value.length > 5) {
      value = value.replace(/^(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,3})/, '$1.$2');
    }

    return value;
  }


  var somaValores = useMemo(() => {
    return valoresCalculados.reduce((a, b) => a + b, 0);
  }, [valoresCalculados]);

  // Função para validar se o nome do vendedor foi preenchido
  const validarNomeCNPJ = () => {
    const nomeValido = nomeCNPJ.trim() !== '';
    setErroNomeCNPJ(!nomeValido);

    if (!nomeValido) {
      if(Platform.OS === 'web'){
        const inputElement = document.getElementById('nomeCNPJInput');      
        if (inputElement) {
          inputElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          });
          inputElement.focus();
        }
      }else{
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }

      return false;
    }
    return true;
  };
  const validarNomeVendedor = () => {
    const nomeValido = nomeVendedor.trim() !== '';
    setErroNomeVendedor(!nomeValido);

    if (!nomeValido) {
      if(Platform.OS === 'web'){
        const inputElement = document.getElementById('nomeVendedorInput');      
        if (inputElement) {
          inputElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          });
          inputElement.focus();
        }
      }else{
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }

      return false;
    }
    return true;
  };

  const validarNomeCliente = () => {
    const nomeValido = nomeCliente.trim() !== '';
    setErroNomeCliente(!nomeValido);

    if (!nomeValido) {
      if(Platform.OS === 'web'){
        const inputElement = document.getElementById('nomeClienteInput');      
        if (inputElement) {
          inputElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          });
          inputElement.focus();
        }
      }else{
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }

      return false;
    }
    return true;
  };

  // Carrega dados da API
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [resEquipamentos, resGrupos, resMarcas] = await Promise.all([
          fetch(equipamentos_URL, {mode: 'cors'}),
          fetch(tipo_equipamento_URL,{mode: 'cors'}),
          fetch(marca_equipamento_URL, {mode: 'cors'})
        ]);
        
        const dataEquipamentos = await resEquipamentos.json();
        const dataGrupos = await resGrupos.json();
        const dataMarcas = await resMarcas.json();
        
        const equipamentosDisponiveis = dataEquipamentos.filter(equip => equip.disponibilidade === true);
        setEquipamentos(equipamentosDisponiveis);
        setGrupos(dataGrupos);
        setMarcas(dataMarcas);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  // Manipula seleção de equipamento
  const handleSelectEquipamento = (index, equipamento, observacao) => {
    const novosEquipamentos = [...equipamentosSelecionados];
    novosEquipamentos[index] = equipamento;
    setEquipamentosSelecionados(novosEquipamentos);
  };

  const handleDetalhesOrcamento = (index, detalhe, equipamento) => {
  const observacoesNovas = [...observacaoOrcamento];
  
  const grupoValido = verificarGrupo(equipamento);
  const temDetalhe = detalhe && detalhe !== null;
  observacoesNovas[index] = ((temDetalhe || grupoValido) && detalhe !== 'excluir')
    ? `
      <h2 class="section-title" style='border-bottom: none; padding-bottom:0px; font-size:17px;'>
        Está incluso para o <strong>${equipamento.nome}</strong>:
      </h2>
      ${temDetalhe ? `${detalhe}<br>` : ''}
      ${grupoValido ? '2 anos de suporte' : ''}
    `
    : '';

  setObservacaoOrcamento(observacoesNovas);
};

  const handleValoresCalculados = (index, value) => {
    const novosValoresCalculados = [...valoresCalculados];
    let valorCalculado = calcularValor(equipamentosSelecionados[index], value);
    novosValoresCalculados[index] = valorCalculado;
    setValoresCalculados(novosValoresCalculados);
  };

  // Atualiza quantidade específica
  const handleQuantidadeChange = (index, value) => {
    const novasQuantidades = [...quantidades];
    novasQuantidades[index] = value;
    setQuantidades(novasQuantidades);
  };

  // Adiciona novo slot para equipamento
  const adicionarEquipamento = () => {
  // Não adiciona se já houver um slot vazio (null)
  if (equipamentosSelecionados.includes(null)) return;

  if (equipamentosSelecionados.length < equipamentos.length) {
    setEquipamentosSelecionados([...equipamentosSelecionados, null]);
    setQuantidades([...quantidades, '1']);
    setValoresCalculados([...valoresCalculados, 0]);
  }
};

  // Remove equipamento específico
  const removerEquipamento = (index) => {
    if (equipamentosSelecionados.length <= 1) return;
    
    const novosEquipamentos = [...equipamentosSelecionados];
    novosEquipamentos.splice(index, 1);
    setEquipamentosSelecionados(novosEquipamentos);
    
    const novasQuantidades = [...quantidades];
    novasQuantidades.splice(index, 1);
    setQuantidades(novasQuantidades);
    
    const novosValores = [...valoresCalculados];
    novosValores.splice(index, 1);
    setValoresCalculados(novosValores);
  };

  // Opções para os radio buttons
  const optionsPagamento = [
    {label: 'Boleto', value: 'Boleto'},
    {label: 'Cartão', value: 'Cartao'},
  ];
  
  const optionsLocalizacao = [
    {label: 'SP / Outros estados sem Inscrição Estadual ', value: 'SP'},
    {label: 'Outros estados / CNPJ com Inscrição Estadual', value: 'Outros'},
  ];
  
  const optionsFaturamento = [
    {label: 'CPF', value: 'CPF'},
    {label: 'CNPJ', value: 'CNPJ'},
  ];

  // Cálculo da base NF
  useEffect(() => {
    let total = somaValores;

    if (condicao === 'Normal') {
      total = total - desconto;
    } else {
      total = equipamentosSelecionados.reduce((sum, eq) => sum + (eq?.custo_geral || 0), 0);
    }

    setBaseNF(total);
  }, [valoresCalculados, condicao, desconto, equipamentosSelecionados, somaValores]);

  // Cálculo do desc. Fiscal
  useEffect(() => {
    let total = somaValores - desconto - baseNF;
    const percentual = localizacao === 'SP' ? 0.15 : 0.1;
    total = Math.round(total * percentual);
    setDescFiscal(total);
  }, [localizacao, baseNF, desconto, somaValores]);

  useEffect(() => {
    let defaultEntrada = 0;
    if(pagamento === "Boleto"){
      if (localizacao === "SP") {
        defaultEntrada = equipamentosSelecionados.reduce((sum, equip) => {
          if (equip && equip.entrada_sp_cnpj) {
            return sum + equip.entrada_sp_cnpj;
          }
          return sum;
        }, 0);
      } else if (localizacao === "Outros" && faturamento === "CNPJ") {
        defaultEntrada = equipamentosSelecionados.reduce((sum, equip) => {
          if (equip && equip.entrada_outros_cnpj) {
            return sum + equip.entrada_outros_cnpj;
          }
          return sum;
        }, 0);
      } else if (localizacao === "Outros" && faturamento === "CPF") {
        defaultEntrada = equipamentosSelecionados.reduce((sum, equip) => {
          if (equip && equip.entrada_outros_cpf) {
            return sum + equip.entrada_outros_cpf;
          }
          return sum;
        }, 0);
      }
    }else{
      defaultEntrada = 0
    }
    setEntrada(Math.round(defaultEntrada));
  }, [localizacao, pagamento, faturamento, equipamentosSelecionados]);
  const [boletoDisponivel, setBoletoDisponivel] = useState(true);
  const [parcelasDesabilitadas, setParcelasDesabilitadas] = useState(false);

  useEffect(() => {
      // Verifique se 'equipamentosSelecionados' é um array válido e não está vazio.
      if (!Array.isArray(equipamentosSelecionados) || equipamentosSelecionados.length === 0) {
          setBoletoDisponivel(true);
          setParcelasDesabilitadas(false);
          return;
      }

      // Filtra para remover quaisquer valores nulos ou indefinidos do array.
      const equipamentosValidos = equipamentosSelecionados.filter(equip => equip);

      // Lógica para Boleto
      // Verifica se algum equipamento não aceita boleto
      const algumEquipamentoNaoAceitaBoleto = equipamentosValidos.some(equip => !equip.boleto);
      
      // Se algum equipamento não aceita boleto, o rádio de boleto deve sumir.
      setBoletoDisponivel(!algumEquipamentoNaoAceitaBoleto);

      // Se o boleto não estiver disponível, forçar a seleção de Cartao
      if (algumEquipamentoNaoAceitaBoleto) {
          setPagamento("Cartao");
      }

      // Lógica para Parcelas
      // Verifica se todos os equipamentos são apenas à vista
      const todosSaoAVista = equipamentosValidos.every(equip => equip.avista);

      // Se todos são à vista e há pelo menos um equipamento, desabilita as parcelas
      if (todosSaoAVista) {
          setParcelasDesabilitadas(true);
          setParcelas(1); // Força para 1 parcela
      } else {
          setParcelasDesabilitadas(false);
      }
  }, [equipamentosSelecionados]);

  // Modifique o useEffect que calcula o maxParcelas para ser executado apenas se parcelas não estiver desabilitado
  useEffect(() => {
    if (!parcelasDesabilitadas) {
        let maxParcelas = 12; 
        if (equipamentosSelecionados.length > 0) {
            const validEquipments = equipamentosSelecionados.filter(e => e != null);
            if (validEquipments.length > 0) {
                // A lógica de `maxParcelas` permanece a mesma, pois é baseada no maior valor.
                maxParcelas = Math.max(...validEquipments.map(equip => equip.parcelas || 12));
            }
        }
        if(pagamento === 'Cartao'){
            // A lógica de maxParcelas para Cartão permanece inalterada
            maxParcelas = 12;
        }
        setParcelas(maxParcelas);
    }else{
      setParcelas(1)
    }
  }, [equipamentosSelecionados, pagamento, parcelasDesabilitadas]);

  // Cálculo de valor da parcela
  useEffect(() => {
    let total = somaValores - entrada - desconto - descFiscal 
    
    if (pagamento === "Boleto") {
      if (taxa <= 0) {
        setValorParcela(Math.round(total / parcelas));
      } else {
        const factor = Math.pow(1 + taxa, parcelas);
        const parcela = Math.round((total * taxa * factor) / (factor - 1));
        setValorParcela(parcela);
      }
    } else {
      const taxaTabela = tabelaTaxasCartao[parcelas] || 0;
      const divisor = 1 - taxaTabela;
      const valorCalculado = total / divisor / parcelas;
      setValorParcela(Math.round(valorCalculado));
    }
  }, [entrada, pagamento, valoresCalculados, descFiscal, parcelas, taxa, somaValores, desconto, tabelaTaxasCartao]);

  // NF Serviço
  useEffect(() => {
    setServicoNF(parseInt(entrada ? entrada : 0) + (parcelas * valorParcela) - produtoNF);
  }, [entrada, parcelas, valorParcela, produtoNF]);

  // NF Produto
  useEffect(() => {
    
    setProdutoNF((pagamento === 'Boleto' && condicao === 'Normal') ? (parseInt(entrada?entrada : 0) + (valorParcela * parcelas)) : baseNF);
  }, [condicao, pagamento, entrada, parcelas, valorParcela, baseNF]);

  useEffect(() => {
    setValorTotal(somaValores - descFiscal - desconto);
  }, [somaValores, descFiscal, desconto]);

  useEffect(() => {
    const novosValores = equipamentosSelecionados.map((equipamento, index) => {
      if (!equipamento) return 0;
      const quantidade = parseInt(quantidades[index], 10) || 0;
      return calcularValor(equipamento, quantidade);
    });
    setValoresCalculados(novosValores);
  }, [faturamento, localizacao, equipamentosSelecionados, quantidades]);

  useEffect(() => {
    setValorParcelado(parseInt(produtoNF) + parseInt(servicoNF))
  }, [produtoNF, servicoNF]);

  function verificarGrupo(equipamento){
    const tipoSelecionado = grupos.find(g => g.id === equipamento.grupo)?.nome || 'N/A'
    const diagnosticosRelevantes = ["DIAGNÓSTICO", "IMOBILIZADOR"];
    const possuiDiagnostico = diagnosticosRelevantes.some(tipo => 
      tipoSelecionado.includes(tipo)
    );
    return possuiDiagnostico
  }

  const calcularValor = (equipamento, quantidade) => {
    if (!equipamento) return 0;
    if (localizacao === 'SP') {
      return Math.round(equipamento.custo_geral * quantidade);
    } else {
      if (faturamento === "CPF") {
        return Math.round(equipamento.custo_cpf * quantidade);
      } else if (faturamento === "CNPJ") {
        return Math.round(equipamento.custo_cnpj * quantidade);
      } 
    }
    return 0;
  };

  const equipamentosValidos = equipamentosSelecionados.filter(e => e != null);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Carregando dados...</Text>
          </View>
        ) : (
          <>
            {/* Seção de Configurações */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Configurações</Text>
              <View style={styles.inputGroup} id='nomeVendedorInput'>
                <Text style={styles.radioGroupTitle}>Nome do vendedor *</Text>
                <TextInput
                  ref={nomeInputRef}
                  style={[
                    styles.input,
                    {
                      padding: 12,
                      backgroundColor: 'rgb(248, 249, 250)',
                      borderColor: erroNomeVendedor ? '#E74C3C' : '#E9ECEF',
                      borderWidth: 2,
                      borderRadius: 8,
                    },
                  ]}
                  placeholder="Digite o nome do vendedor"
                  placeholderTextColor="#95a5a6"
                  value={nomeVendedor}
                  onChangeText={(text) => {
                    setNomeVendedor(text);
                    if (text.trim() !== '') {
                      setErroNomeVendedor(false);
                    }
                  }}
                />
                {erroNomeVendedor && (
                  <Text style={styles.errorText}>
                    ⚠️ O nome do vendedor é obrigatório para gerar o PDF.
                  </Text>
                )}
              </View>
              <View style={styles.inputGroup} id='nomeClienteInput'>
                  <Text style={styles.radioGroupTitle}>Nome do cliente *</Text>
                  <TextInput
                    ref={nomeInputRef}
                    style={[
                      styles.input,
                      {
                        padding: 12,
                        backgroundColor: 'rgb(248, 249, 250)',
                        borderColor: erroNomeCliente ? '#E74C3C' : '#E9ECEF',
                        borderWidth: 2,
                        borderRadius: 8,
                      },
                    ]}
                    placeholder="Digite o nome do cliente"
                    placeholderTextColor="#95a5a6"
                    value={nomeCliente}
                    onChangeText={(text) => {
                      setNomeCliente(text);
                      if (text.trim() !== '') {
                        setErroNomeCliente(false);
                      }
                    }}
                  />
                  {erroNomeCliente && (
                    <Text style={styles.errorText}>
                      ⚠️ O nome do cliente é obrigatório.
                    </Text>
                  )}
              </View>
                
              <View style={styles.radioGroup}>
                  <Text style={styles.radioGroupTitle}>Forma de Pagamento</Text>
                  <Radio 
                      options={
                          boletoDisponivel 
                          ? optionsPagamento 
                          : optionsPagamento.filter(opt => opt.value !== 'Boleto')
                      }
                      checkedValue={pagamento} 
                      onChange={setPagamento}
                      containerStyle={styles.radioContainer}
                  />
              </View>

              <View style={styles.radioGroup}>
                <Text style={styles.radioGroupTitle}>Localização</Text>
                <Radio 
                  options={optionsLocalizacao} 
                  checkedValue={localizacao} 
                  onChange={setLocalizacao}
                  containerStyle={styles.radioContainer}
                />
              </View>

              <View style={styles.radioGroup}>
                <Text style={styles.radioGroupTitle}>Faturamento</Text>
                <Radio 
                  options={optionsFaturamento} 
                  checkedValue={faturamento} 
                  onChange={setFaturamento}
                  containerStyle={styles.radioContainer}
                />
                {faturamento === "CNPJ" ? 
                    <View style={styles.inputGroup} id='nomeCNPJInput'>
                      <Text style={styles.radioGroupTitle}>CNPJ do cliente *</Text>
                      <TextInput
                        keyboardType="numeric"
                        ref={nomeInputRef}
                        style={[
                          styles.input,
                          {
                            padding: 12,
                            backgroundColor: 'rgb(248, 249, 250)',
                            borderColor: erroNomeCNPJ ? '#E74C3C' : '#E9ECEF',
                            borderWidth: 2,
                            borderRadius: 8,
                          },
                        ]}
                        placeholder="Digite o CNPJ do cliente"
                        placeholderTextColor="#95a5a6"
                        value={nomeCNPJ}
                        onChangeText={(text) => {
                          const formatted = formatCNPJ(text);
                          setNomeCNPJ(formatted);
                          if (formatted.trim() !== '') {
                            setErroNomeCNPJ(false);
                          }
                        }}
                      />
                      {erroNomeCNPJ && (
                        <Text style={styles.errorText}>
                          ⚠️ O CNPJ do CNPJ é obrigatório.
                        </Text>
                      )}
                  </View>
                  :''}
              </View>
            </View>
              
            {/* Seção de Equipamentos */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Equipamentos</Text>
                <TouchableOpacity 
                  style={[
                    styles.addButton,
                    equipamentosSelecionados.length >= equipamentos.length && styles.disabledButton
                  ]}
                  onPress={adicionarEquipamento}
                  disabled={equipamentosSelecionados.length >= equipamentos.length}
                >
                  <Text style={styles.buttonText}>＋</Text>
                </TouchableOpacity>
              </View>

              {equipamentosSelecionados.map((equipamento, index) => (
                <View key={`equip-${index}`} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Equipamento #{index + 1}</Text>
                    {equipamentosSelecionados.length > 1 && (
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => {
                          console.log(equipamento.nome)
                          removerEquipamento(index)
                          handleDetalhesOrcamento(index=index, detalhe='excluir', equipamento=equipamento)
                        }}
                      >
                        <Text style={styles.buttonTextRemove}>X</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {
                  localizacao === "SP" ?
                    <EquipamentoSelector
                      equipamentos={equipamentos}
                      marcas={marcas}
                      selectedEquipamento={equipamento}
                      onSelect={(equip) => {
                        handleSelectEquipamento(index, equip)
                        handleDetalhesOrcamento(index, equip.detalhes_sp_html, equip)

                      }}
                      disabledEquipamentos={equipamentosSelecionados.filter(e => e)}
                    />
                  :
                    <EquipamentoSelector
                      equipamentos={equipamentos}
                      marcas={marcas}
                      selectedEquipamento={equipamento}
                      onSelect={(equip) => {
                        handleSelectEquipamento(index, equip)
                        handleDetalhesOrcamento(index, equip.detalhes_html, equip)

                      }}
                      disabledEquipamentos={equipamentosSelecionados.filter(e => e)}
                    />
                  }

                  {equipamento && (
                    <View style={styles.cardBody}>
                      <View style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Quantidade:</Text>
                        <NumericInput
                          value={quantidades[index]}
                          onValueChange={(value) => {
                            handleQuantidadeChange(index, value);
                            handleValoresCalculados(index, value);
                          }}
                          style={styles.input}
                        />
                      </View>
                      <View style={styles.valueRow}>
                        <Text style={styles.valueLabel}>Valor Unitário:</Text>
                        <Text style={styles.valueText}>
                          {localizacao === 'SP' ? 
                            formatarMoeda(equipamento.custo_geral) :
                            faturamento === 'CPF' ? 
                              formatarMoeda(equipamento.custo_cpf) : 
                              formatarMoeda(equipamento.custo_cnpj)
                          }
                        </Text>
                      </View>
                      <View style={styles.valueRow}>
                        <Text style={styles.valueLabel}>Valor Total:</Text>
                        <Text style={[styles.valueText, styles.boldText]}>
                          {formatarMoeda(valoresCalculados[index] || 0)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              ))}

              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Valor Total dos Equipamentos</Text>
                <Text style={styles.summaryValue}>{formatarMoeda(somaValores)}</Text>
              </View>
            </View>

            {/* Seção de Parâmetros Financeiros */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Parâmetros Financeiros</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Entrada</Text>
                <FinanceiroInput
                  value={entrada}
                  onValueChange={setEntrada}
                  style={styles.input}
                  tipoValor={'numero'}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Parcelas</Text>
                <NumericInput
                    value={parcelas}
                    onValueChange={setParcelas}
                    style={styles.input}
                    min={1}
                    max={21}
                    disabled={parcelasDesabilitadas} // Use a nova variável de estado
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Desconto</Text>
                <FinanceiroInput
                  value={desconto}
                  onValueChange={setDesconto}
                  style={styles.input}
                  valorTotal={somaValores}
                />
              </View>
            </View>

            {/* Seção de Resultados */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resultados</Text>

              <View style={styles.resultCard}>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>{parcelas}x Valor da Parcela:</Text>
                  <Text style={styles.resultValue}>{formatarMoeda(valorParcela)}</Text>
                </View>

                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Base NF:</Text>
                  <Text style={styles.resultValue}>{formatarMoeda(baseNF)}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, styles.boldText]}>À Vista:</Text>
                  <Text style={[styles.resultValue, styles.boldText]}>{formatarMoeda(valorTotal)}</Text>
                </View>

                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, styles.boldText]}>Total {parcelas}x:</Text>
                  <Text style={[styles.resultValue, styles.boldText, styles.primaryText]}>{formatarMoeda(valorParcelado)}</Text>
                </View>
              </View>
            </View>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Observações:
                </Text>
              </View>
              <View style={styles.card}>
                <TextInput
                  placeholder="Adicione observações para o cliente..."
                  placeholderTextColor="#95a5a6"
                  autoCapitalize="none"
                  multiline={true}
                  onChangeText={setObservacao}
                  value={observacao}
                />
              </View>
          </View>
          </>
        )}
        {equipamentosValidos.length > 0 && (
          <>
            <PDFSimulacao
              entrada={entrada}
              equipamentos={equipamentosValidos}
              parcelas={parcelas}
              localizacao={localizacao}
              faturamento={faturamento}
              valorTotal={valorTotal}
              quantidades={quantidades}
              valorParcela={valorParcela}
              baseNF={baseNF}
              produtoNF={produtoNF}
              servicoNF={servicoNF}
              descFiscal={descFiscal}
              valorParcelado={valorParcelado}
              desconto={desconto}
              observacao={observacao}
              descricao={observacaoOrcamento}
              tipoPagamento={pagamento}
              nomeVendedor={nomeVendedor}
              nomeCliente={nomeCliente}
              validarNomeVendedor={validarNomeVendedor}
              nomeCNPJ={nomeCNPJ}
              validarNomeCNPJ={validarNomeCNPJ}
              validarNomeCliente={validarNomeCliente}
            />
          </>
          )}
      </ScrollView>
    </KeyboardAvoidingView>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
  },
  addButton: {
    backgroundColor: '#3498DB',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
  },
  card: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  removeButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    marginTop: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#495057',
    marginRight: 12,
    width: 100,
  },
  valueLabel: {
    fontSize: 14,
    color: '#6C757D',
  },
  valueText: {
    fontSize: 14,
    color: '#495057',
  },
  boldText: {
    fontWeight: '600',
  },
  input: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  radioGroup: {
    marginBottom: 16,
  },
  radioGroupTitle: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
    fontWeight: '500',
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  summaryCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    color: '#0D47A1',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    color: '#0D47A1',
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 14,
    color: '#6C757D',
  },
  resultValue: {
    fontSize: 14,
    color: '#495057',
  },
  primaryText: {
    color: '#3498DB',
  },
  divider: {
    height: 1,
    backgroundColor: '#DEE2E6',
    marginVertical: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonTextRemove: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

