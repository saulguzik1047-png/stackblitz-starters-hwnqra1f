// 1. CONFIGURAÇÃO SUPABASE
const SUPABASE_URL = 'https://perjhxqgcdccmfyazubi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_RI4q9ohUCr3TCzCqQ8XjBA_HsHLptHH';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. FUNÇÕES DE UTILIDADE
const formatarMoeda = (valor) =>
  Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

const calcularTotal = (itens) => {
  if (!itens || !Array.isArray(itens)) return 0;
  return itens.reduce(
    (acc, item) => acc + (item.preco || 0) * (item.qtd || 0),
    0
  );
};

const BANCO_IMAGENS_AUTOMATICAS = {
  Cervejas:
    'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=200&q=80',
  Drinks:
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200&q=80',
  Porções:
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&q=80',
  'Não Alcoólicos':
    'https://images.unsplash.com/photo-1548963363-fae5e6634a47?w=200&q=80',
};

const FRASES_ROCK = [
  '"Eu olho para o mundo e não vejo nenhuma col, quero que tudo seja pintado de preto." - Rolling Stones',
  '"É uma longa caminhada até o topo se você quer tocar Rock \'n\' Roll." - AC/DC',
  '"Não me impede agora, estou me divertindo tanto, estou tendo uma bola." - Queen',
  '"Vivendo rápido, morrendo jovem, tudo se resume a se divertun." - Motley Crue',
  '"Apenas um garoto de cidade pequena, born and raised in South Detroit." - Journey',
  '"Pode ser que eu saiba o que é o amor." - Motörhead',
];

// 3. COMPONENTE PRINCIPAL
function App() {
  const [nomeSoftware, setNomeSoftware] = React.useState(() => {
    try {
      return localStorage.getItem('bhar_nome_software') || 'BHAR DO SAUL';
    } catch (e) {
      return 'BHAR DO SAUL';
    }
  });

  const [buscaData, setBuscaData] = React.useState('');
  const [telaAtual, setTelaAtual] = React.useState('login_gerencial');
  const [modoPagamento, setModoPagamento] = React.useState(false);
  const [mostrarMultiFormas, setMostrarMultiFormas] = React.useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = React.useState('Todos');
  const [autenticado, setAutenticado] = React.useState(false);
  const [usuarioDigitado, setUsuarioDigitado] = React.useState('admin');
  const [senhaDigitada, setSenhaDigitada] = React.useState('');
  const [usuarioLogado, setUsuarioLogado] = React.useState(null);
  const [erroAutenticacao, setErroAutenticacao] = React.useState(false);
  const [proximaTelaPendente, setProximaTelaPendente] = React.useState('pdv');
  const [expandedCliente, setExpandedCliente] = React.useState(null);
  const [expandedClientePago, setExpandedClientePago] = React.useState(null);
  const [filtroDia, setFiltroDia] = React.useState('Todos');
  const [filtroMes, setFiltroMes] = React.useState(() =>
    String(new Date().getMonth() + 1).padStart(2, '0')
  );
  const [filtroAno, setFiltroAno] = React.useState(() =>
    String(new Date().getFullYear())
  );
  const [filtroPendenteInicio, setFiltroPendenteInicio] = React.useState('');
  const [filtroPendenteFim, setFiltroPendenteFim] = React.useState('');
  const [filtroPagoInicio, setFiltroPagoInicio] = React.useState('');
  const [filtroPagoFim, setFiltroPagoFim] = React.useState('');
  const [filtroRelatorioInicio, setFiltroRelatorioInicio] = React.useState('');
  const [filtroRelatorioFim, setFiltroRelatorioFim] = React.useState('');
  const [dataBaixaManual, setDataBaixaManual] = React.useState(
    () => new Date().toISOString().split('T')[0]
  );
  const [despesaEmBaixa, setDespesaEmBaixa] = React.useState(null);
  const [filtroRelatorioEstoque, setFiltroRelatorioEstoque] =
    React.useState('Todos');
  const [caixaDialogo, setCaixaDialogo] = React.useState(null);
  const [promptVal, setPromptVal] = React.useState('');
  const [promptValDivisivel, setPromptValDivisivel] = React.useState(false);
  const [modalDividir, setModalDividir] = React.useState(null);
  const [comandasSelecionadasSplit, setComandasSelecionadasSplit] =
    React.useState([]);
  const dispararMensagem = (titulo, message) => {
    setCaixaDialogo({
      titulo,
      mensagem: message,
      confirmTxt: 'OK',
      noCancel: true,
      onConfirm: () => setCaixaDialogo(null),
    });
  };

  const dispararConfirmacao = (
    titulo,
    message,
    acaoConfirmar,
    acaoCancelar
  ) => {
    setCaixaDialogo({
      titulo,
      mensagem: message,
      confirmTxt: 'Confirmar',
      cancelTxt: 'Cancelar',
      onConfirm: () => {
        acaoConfirmar();
        setCaixaDialogo(null);
      },
      onCancel: () => {
        if (acaoCancelar) acaoCancelar();
        setCaixaDialogo(null);
      },
    });
  };

  const [categoriasCustomizadas, setCategoriasCustomizadas] = React.useState([
    'Cervejas',
    'Drinks',
    'Porções',
    'Não Alcoólicos',
  ]);
  const [categoriasDivisiveis, setCategoriasDivisiveis] = React.useState([
    'Porções',
  ]);

  const [novoClienteNomeInput, setNovoClienteNomeInput] = React.useState('');
  const [novoClienteSobrenomeInput, setNovoClienteSobrenomeInput] =
    React.useState('');
  const [novoClienteTelefoneInput, setNovoClienteTelefoneInput] =
    React.useState('');
  const [pesquisaClienteBase, setPesquisaClienteBase] = React.useState('');
  const [mostrarSugestoes, setMostrarSugestoes] = React.useState(false);

  const [abaImagemAtiva, setAbaImagemAtiva] = React.useState('url');
  const [usuarioEditando, setUsuarioEditando] = React.useState(null);
  const [comandaRecemPaga, setComandaRecemPaga] = React.useState(null);
  const [logsAuditoria, setLogsAuditoria] = React.useState([]);

  const [valDinheiro, setValDinheiro] = React.useState('');
  const [valPix, setValPix] = React.useState('');
  const [valCartao, setValCartao] = React.useState('');
  const [valCrediario, setValCrediario] = React.useState('');

  const buscaContainerRef = React.useRef(null);
  const inputBuscaImgRef = React.useRef(null);
  const inputQtdAdicionarRef = React.useRef(null);

  const [usuariosSistema, setUsuariosSistema] = React.useState(() => {
    try {
      const salvosUsers = localStorage.getItem('bhar_usuarios_v1');
      return salvosUsers
        ? JSON.parse(salvosUsers)
        : [
            {
              usuario: 'admin',
              senha: '0669',
              perfil: 'admin',
              restricoes: [],
            },
            {
              usuario: 'operador',
              senha: '1234',
              perfil: 'operador',
              restricoes: ['financeiro', 'crediario', 'seguranca'],
            },
          ];
    } catch (e) {
      console.error('Erro localStorage usuarios:', e);
      return [
        { usuario: 'admin', senha: '0669', perfil: 'admin', restricoes: [] },
        {
          usuario: 'operador',
          senha: '1234',
          perfil: 'operador',
          restricoes: ['financeiro', 'crediario', 'seguranca'],
        },
      ];
    }
  });

  const [novoUserNome, setNovoUserNome] = React.useState('');
  const [novoUserSenha, setNovoUserSenha] = React.useState('');
  const [novoUserPerfil, setNovoUserPerfil] = React.useState('operador');
  const [novoUserRestricoes, setNovoUserRestricoes] = React.useState([]);

  // CORREÇÃO: Envolver o salvamento em um useEffect
  React.useEffect(() => {
    try {
      localStorage.setItem('bhar_usuarios_v1', JSON.stringify(usuariosSistema));
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
    }
  }, [usuariosSistema]);

  const [clientesCadastrados, setClientesCadastrados] = React.useState(() => {
    try {
      const salvos = localStorage.getItem('bhar_clientes_v2');
      return salvos
        ? JSON.parse(salvos)
        : [
            {
              nome: 'Roberto Silva',
              foto: '',
              sobrenome: 'Silva',
              telefone: '31999998888',
            },
            {
              nome: 'Cláudia Souza',
              foto: '',
              sobrenome: 'Souza',
              telefone: '31988887777',
            },
            {
              nome: 'Bruno Marques',
              foto: '',
              sobrenome: 'Marques',
              telefone: '31977776666',
            },
            {
              nome: 'Ana Paula Lima',
              foto: '',
              sobrenome: 'Lima',
              telefone: '31966665555',
            },
            {
              nome: 'Carlos Andrade',
              foto: '',
              sobrenome: 'Andrade',
              telefone: '31955554444',
            },
          ];
    } catch (e) {
      console.error('Erro localStorage clientes:', e);
      return [];
    }
  });

  React.useEffect(() => {
    localStorage.setItem(
      'bhar_clientes_v2',
      JSON.stringify(clientesCadastrados)
    );
  }, [clientesCadastrados]);

  const [produtos, setProdutos] = React.useState(() => {
    try {
      const salvosProd = localStorage.getItem('bhar_produtos_v3');
      return salvosProd
        ? JSON.parse(salvosProd)
        : [
            {
              id: 1,
              category: 'Cervejas',
              nome: 'Chopp Brahma',
              precoCusto: 8.5,
              preco: 24.0,
              estoque: 50,
              estoqueMinimo: 10,
              dataUltimaCompra: '01/07/2026',
              imagem: '',
            },
            {
              id: 2,
              category: 'Cervejas',
              nome: 'Corona Extra',
              precoCusto: 9.0,
              preco: 24.0,
              estoque: 30,
              estoqueMinimo: 5,
              dataUltimaCompra: '01/07/2026',
              imagem: '',
            },
            {
              id: 3,
              category: 'Cervejas',
              nome: 'Heineken',
              precoCusto: 6.2,
              preco: 14.0,
              estoque: 100,
              estoqueMinimo: 15,
              dataUltimaCompra: '02/07/2026',
              imagem: '',
            },
            {
              id: 4,
              category: 'Drinks',
              nome: 'Caipirinha',
              precoCusto: 12.0,
              preco: 66.0,
              estoque: 999,
              estoqueMinimo: 0,
              dataUltimaCompra: '02/07/2026',
              imagem: '',
            },
            {
              id: 5,
              category: 'Porções',
              nome: 'Porção de Batata Frita',
              precoCusto: 12.0,
              preco: 29.9,
              estoque: 45,
              estoqueMinimo: 10,
              dataUltimaCompra: '22/05/2024 às 14:32',
              imagem: '',
            },
            {
              id: 6,
              category: 'Não Alcoólicos',
              nome: 'Agua Mineral',
              precoCusto: 1.8,
              preco: 8.0,
              estoque: 45,
              estoqueMinimo: 10,
              dataUltimaCompra: '25/06/2026',
              imagem: '',
            },
          ];
    } catch (e) {
      console.error('Erro localStorage produtos:', e);
      return [];
    }
  });

  React.useEffect(() => {
    localStorage.setItem('bhar_produtos_v3', JSON.stringify(produtos));
  }, [produtos]);

  const [comandas, setComandas] = React.useState(() => {
    try {
      const salvas = localStorage.getItem('bhar_comandas_v1');
      return salvas
        ? JSON.parse(salvas)
        : [
            { id: 10, nome: 'Roberto Silva', status: 'Aberto', itens: [] },
            {
              id: 22,
              nome: 'Cláudia Souza',
              status: 'Aberto',
              itens: [
                {
                  idProd: 1,
                  nome: 'Chopp Brahma',
                  precoCusto: 8.5,
                  preco: 24.0,
                  qtd: 2,
                },
              ],
            },
          ];
    } catch (e) {
      return [];
    }
  });

  React.useEffect(() => {
    localStorage.setItem('bhar_comandas_v1', JSON.stringify(comandas));
  }, [comandas]);

  const [comandaAtivaId, setComandaAtivaId] = React.useState(22);
  const [busca, setBusca] = React.useState('');

  const [vendas, setVendas] = React.useState(() => {
    try {
      const salvas = localStorage.getItem('bhar_vendas_v1');
      return salvas
        ? JSON.parse(salvas)
        : [
            {
              idVenda: 1001,
              data: '01/07/2026, 11:00:00',
              cliente: 'Bruno Marques',
              total: 42.0,
              pagamento: 'PIX',
              itensConsumidos: [
                { nome: 'Chopp Brahma', qtd: 1, preco: 24.0 },
                { nome: 'Agua Mineral', qtd: 2, preco: 8.0 },
              ],
            },
          ];
    } catch (e) {
      return [];
    }
  });

  React.useEffect(() => {
    localStorage.setItem('bhar_vendas_v1', JSON.stringify(vendas));
  }, [vendas]);

  const [relatorioProdutos, setRelatorioProdutos] = React.useState([
    { idProd: 1, nome: 'Chopp Brahma', qtd: 15, total: 360.0, custo: 127.5 },
    {
      idProd: 5,
      nome: 'Porção de Batata Frita',
      qtd: 8,
      total: 239.2,
      custo: 96.0,
    },
  ]);

  const [despesas, setDespesas] = React.useState(() => {
    try {
      const salvas = localStorage.getItem('bhar_despesas_v1');
      return salvas
        ? JSON.parse(salvas) // CORREÇÃO AQUI
        : [
            {
              id: 1,
              descricao: 'Fornecedor de Gelo',
              valor: 35.0,
              vencimento: '2026-07-01',
              status: 'Paga',
              formaPagamento: 'Dinheiro',
              dataPagamento: '2026-07-01',
            },
            {
              id: 2,
              descricao: 'Aluguel do Salão',
              valor: 1200.0,
              vencimento: '2026-07-10',
              status: 'Pendente',
              formaPagamento: '-',
            },
            {
              id: 3,
              descricao: 'Luz / Energia',
              valor: 310.0,
              vencimento: '2026-07-05',
              status: 'Pendente',
              formaPagamento: '-',
            },
          ];
    } catch (e) {
      return [];
    }
  });

  React.useEffect(() => {
    localStorage.setItem('bhar_despesas_v1', JSON.stringify(despesas));
  }, [despesas]);

  const [crediarios, setCrediarios] = React.useState(() => {
    try {
      const salvos = localStorage.getItem('bhar_crediarios_v1');
      return salvos
        ? JSON.parse(salvos)
        : [
            {
              idCred: 501,
              data: '28/06/2026, 23:40:12',
              cliente: 'Carlos Andrade',
              total: 110.0,
              status: 'Pendente',
              itensConsumidos: [
                { nome: 'Caipirinha', qtd: 1, preco: 66.0 },
                { nome: 'Porção de Batata Frita', qtd: 1, preco: 29.9 },
              ],
            },
            {
              idCred: 503,
              data: '29/06/2026, 22:10:00',
              cliente: 'Roberto Silva',
              total: 85.0,
              status: 'Pendente',
              itensConsumidos: [{ nome: 'Chopp Brahma', qtd: 3, preco: 24.0 }],
            },
          ];
    } catch (e) {
      return [];
    }
  });

  React.useEffect(() => {
    localStorage.setItem('bhar_crediarios_v1', JSON.stringify(crediarios));
  }, [crediarios]);

  const [novaDespesaDesc, setNovaDespesaDesc] = React.useState('');
  const [novaDespesaValor, setNovaDespesaValor] = React.useState('');
  const [novaDespesaVenc, setNovaDespesaVenc] = React.useState(
    new Date().toISOString().split('T')[0]
  );
  const [buscaCrediario, setBuscaCrediario] = React.useState('');

  const [idProdutoSelecionadoEdicao, setIdProdutoSelecionadoEdicao] =
    React.useState(5);

  // ☁️ ENXERTO CIRÚRGICO: Sincroniza e puxa todos os dados da nuvem ao abrir o sistema
  React.useEffect(() => {
    async function carregarDadosDaNuvem() {
      try {
        // 1. Puxa os clientes
        const { data: clis } = await supabaseClient
          .from('clientes')
          .select('*');
        if (clis && clis.length > 0) setClientesCadastrados(clis);

        // 2. Puxa os produtos
        const { data: prods } = await supabaseClient
          .from('produtos')
          .select('*');
        if (prods && prods.length > 0) {
          setProdutos(
            prods.map((p) => ({
              id: p.id,
              category: p.category,
              nome: p.nome,
              precoCusto: p.preco_custo,
              preco: p.preco,
              estoque: p.estoque,
              estoqueMinimo: p.estoque_minimo,
              dataUltimaCompra: p.data_ultima_compra,
              imagem: p.imagem,
            }))
          );
        }

        // 3. Puxa as vendas
        const { data: vnds } = await supabaseClient.from('vendas').select('*');
        if (vnds && vnds.length > 0) {
          setVendas(
            vnds.map((v) => ({
              idVenda: v.id,
              data: v.data,
              cliente: v.cliente,
              total: v.total,
              pagamento: v.pagamento,
              itensConsumidos: v.itens_consumidos || [],
            }))
          );
        }

        // 4. Puxa a Auditoria (Nova parte)
        const { data: logs } = await supabaseClient
          .from('auditoria_cancelamentos')
          .select('*')
          .order('data', { ascending: false });
        if (logs) setLogsAuditoria(logs);
      } catch (err) {
        console.error(
          'Erro ao carregar dados da nuvem, rodando local offline:',
          err
        );
      }
    }
    carregarDadosDaNuvem();
  }, []);
  const comandaAtual = comandas.find((c) => c.id === comandaAtivaId) || null;

  function validarENormalizarNome(nomeBruto, ignorarDuplicadoBanco = false) {
    if (!nomeBruto)
      return { valido: false, erro: 'O nome não pode ficar em branco.' };
    const nomeFormatado = nomeBruto.trim().replace(/\s+/g, ' ');
    const partes = nomeFormatado.split(' ');

    if (partes.length < 2 || partes[1].length < 2) {
      return {
        valido: false,
        erro: 'É obrigatório inserir Nome e Sobrenome (Ex: João Silva).',
      };
    }

    const jaTemComandaAberta = comandas.some(
      (c) => c.nome.trim().toLowerCase() === nomeFormatado.toLowerCase()
    );
    if (jaTemComandaAberta) {
      return {
        valido: false,
        erro: `O cliente "${nomeFormatado}" já possui uma comanda ativa aberta!`,
      };
    }

    if (!ignorarDuplicadoBanco) {
      const jaExisteNoBanco = clientesCadastrados.some(
        (cli) => cli.nome.toLowerCase() === nomeFormatado.toLowerCase()
      );
      if (jaExisteNoBanco) {
        return { valido: true, nome: nomeFormatado, cadastrado: true };
      }
    }

    return { valido: true, nome: nomeFormatado, cadastrado: false };
  }

  async function registrarNovoClienteNaBase(nomePronto) {
    if (
      nomePronto &&
      !clientesCadastrados.some(
        (c) => c.nome.toLowerCase() === nomePronto.toLowerCase()
      )
    ) {
      const partes = nomePronto.split(' ');
      const sobrenome = partes.slice(1).join(' ');
      const novoCli = {
        nome: nomePronto,
        sobrenome: sobrenome,
        telefone: '',
        foto: '',
      };

      // Continua salvando no computador como você queria[cite: 1]
      setClientesCadastrados((prev) => [...prev, novoCli]);

      // Envia uma cópia idêntica para o cofre do Supabase
      await supabaseClient.from('clientes').insert([novoCli]);
    }
  }

  function navegarPara(novaTela) {
    if (autenticado) {
      if (
        usuarioLogado &&
        usuarioLogado.perfil !== 'admin' &&
        usuarioLogado.restricoes &&
        usuarioLogado.restricoes.includes(novaTela)
      ) {
        dispararMensagem(
          'Acesso Restrito',
          `🚫 Seu usuário não possui permissão para acessar a tela [${novaTela.toUpperCase()}].`
        );
        return;
      }
      setTelaAtual(novaTela);
    } else {
      setSenhaDigitada('');
      setErroAutenticacao(false);
      setProximaTelaPendente(novaTela);
      setTelaAtual('login_gerencial');
    }
  }

  function validarAcessoGerencial(e) {
    e.preventDefault();
    const usuarioEncontrado = usuariosSistema.find(
      (u) => u.usuario === usuarioDigitado && u.senha === senhaDigitada
    );

    if (usuarioEncontrado) {
      if (
        usuarioEncontrado.perfil !== 'admin' &&
        usuarioEncontrado.restricoes &&
        usuarioEncontrado.restricoes.includes(proximaTelaPendente)
      ) {
        dispararMensagem(
          'Permissão Denegada',
          `🚫 Seu usuário não possui permissão para acessar a tela [${proximaTelaPendente.toUpperCase()}].`
        );
        setSenhaDigitada('');
        return;
      }
      setAutenticado(true);
      setUsuarioLogado(usuarioEncontrado);
      setErroAutenticacao(false);
      setTelaAtual(proximaTelaPendente || 'pdv');
    } else {
      setErroAutenticacao(true);
      setSenhaDigitada('');
    }
  }

  function logoutSistema() {
    setAutenticado(false);
    setUsuarioLogado(null);
    setSenhaDigitada('');
    setTelaAtual('login_gerencial');
    setProximaTelaPendente('pdv');
  }

  function cadastrarNovoOperador(e) {
    e.preventDefault();
    if (!novoUserNome.trim() || !novoUserSenha.trim()) {
      dispararMensagem(
        'Campos Vazios',
        'Preencha o usuário e a senha para efetuar o cadastro!'
      );
      return;
    }
    if (
      usuariosSistema.some(
        (u) => u.usuario.toLowerCase() === novoUserNome.trim().toLowerCase()
      )
    ) {
      dispararMensagem(
        'Usuário Duplicado',
        'Este usuário já existe no sistema!'
      );
      return;
    }

    const novoU = {
      usuario: novoUserNome.trim(),
      senha: novoUserSenha.trim(),
      perfil: novoUserPerfil,
      restricoes: novoUserRestricoes,
    };

    setUsuariosSistema([...usuariosSistema, novoU]);
    dispararMensagem(
      'Cadastro Sucesso',
      `Usuário "${novoU.usuario}" cadastrado com sucesso!`
    );
    setNovoUserNome('');
    setNovoUserSenha('');
    setNovoUserRestricoes([]);
  }

  function excluirUsuario(user) {
    if (user.usuario === 'admin' || user.perfil === 'admin') {
      dispararMensagem(
        'Erro de Acesso',
        'Não é permitido excluir o usuário Administrador principal.'
      );
      return;
    }
    dispararConfirmacao(
      'Excluir Usuário',
      `Deseja realmente excluir permanentemente o operador "${user.usuario}"?`,
      () => {
        setUsuariosSistema((prev) =>
          prev.filter((u) => u.usuario !== user.usuario)
        );
        dispararMensagem('Sucesso', 'Usuário removido do sistema.');
      }
    );
  }

  function salvarEdicaoUsuario() {
    setUsuariosSistema((prev) =>
      prev.map((u) =>
        u.usuario === usuarioEditando.usuario ? usuarioEditando : u
      )
    );
    dispararMensagem(
      'Usuário Updated',
      `As restrições e o perfil de "${usuarioEditando.usuario}" foram updated com sucesso.`
    );
    setUsuarioEditando(null);
  }

  function toggleRestricaoEdicao(tela) {
    setUsuarioEditando((prev) => {
      const r = prev.restricoes || [];
      return {
        ...prev,
        restricoes: r.includes(tela)
          ? r.filter((t) => t !== tela)
          : [...r, tela],
      };
    });
  }

  function gerenciarCheckboxRestricao(tela) {
    if (novoUserRestricoes.includes(tela)) {
      setNovoUserRestricoes(novoUserRestricoes.filter((t) => t !== tela));
    } else {
      setNovoUserRestricoes([...novoUserRestricoes, tela]);
    }
  }

  function excluirProdutoDoEstoque(id, nome) {
    dispararConfirmacao(
      'Excluir Produto',
      `Deseja realmente EXCLUIR permanentemente o produto "${nome}"?`,
      () => {
        setProdutos((prev) => prev.filter((p) => p.id !== id));
        dispararMensagem(
          'Estoque',
          `Produto "${nome}" foi removido do estoque.`
        );
        const restantes = produtos.filter((p) => p.id !== id);
        if (restantes.length > 0)
          setIdProdutoSelecionadoEdicao(restantes[0].id);
      }
    );
  }

  function addItemNaComanda(produto) {
    if (!comandaAtual) {
      dispararMensagem('Aviso', 'Selecione uma comanda primeiro!');
      return;
    }
    if (produto.estoque <= 0) {
      dispararMensagem(
        'Falta de Estoque',
        `O produto "${produto.nome}" está esgotado!`
      );
      return;
    }

    setProdutos((prev) =>
      prev.map((p) =>
        p.id === produto.id ? { ...p, estoque: p.estoque - 1 } : p
      )
    );
    setComandas((prev) =>
      prev.map((c) => {
        if (c.id !== comandaAtivaId) return c;
        const itensAlterados = [...c.itens];
        const idx = itensAlterados.findIndex((i) => i.idProd === produto.id);
        if (idx >= 0) itensAlterados[idx].qtd += 1;
        else
          itensAlterados.push({
            idProd: produto.id,
            nome: produto.nome,
            precoCusto: produto.precoCusto,
            preco: produto.preco,
            qtd: 1,
          });
        return { ...c, itens: itensAlterados };
      })
    );

    if (
      produto.category === 'Porções' ||
      categoriasDivisiveis.includes(produto.category)
    ) {
      dispararMensagem(
        '⚠️ IMPRESSÃO COZINHA ⚠️',
        `Mesa/Comanda: ${comandaAtual.nome}\nItem: 1x ${produto.nome}\nEnviado direto para o atendente levar até a cozinha!`
      );
    }
  }

  function removerItemNaComanda(idProd) {
    const itemNoConsumo = comandaAtual?.itens.find((i) => i.idProd === idProd);
    if (!itemNoConsumo) return;

    // Abre direto os botões, economizando um clique de confirmação
    setCaixaDialogo({
      titulo: 'Remover Item do Consumo',
      mensagem: `Selecione o motivo para remover "${itemNoConsumo.nome}":`,
      tipo: 'motivos_botoes',
      botoes: ['Erro Operador', 'Pedido Errado', 'Desistência'],
      cancelTxt: 'Cancelar',
      onSelect: async (motivo) => {
        const qtdDevolver = itemNoConsumo.qtd;

        try {
          await supabaseClient.from('auditoria_cancelamentos').insert([
            {
              operador: usuarioLogado ? usuarioLogado.usuario : 'Admin',
              tipo: 'Remoção de Item',
              motivo: motivo,
              data: new Date().toISOString(),
              detalhes: {
                id_comanda: comandaAtual.id,
                nome_cliente: comandaAtual.nome,
                produto: itemNoConsumo.nome,
                quantidade: qtdDevolver,
              },
            },
          ]);

          setLogsAuditoria((prev) => [
            {
              id: Date.now(),
              data: new Date().toISOString(),
              tipo: 'Remoção de Item',
              operador: usuarioLogado ? usuarioLogado.usuario : 'Admin',
              motivo: motivo,
              detalhes: {
                id_comanda: comandaAtual.id,
                nome_cliente: comandaAtual.nome,
                produto: itemNoConsumo.nome,
                quantidade: qtdDevolver,
              },
            },
            ...prev,
          ]);
        } catch (err) {
          console.error('Erro ao registrar remoção na auditoria:', err);
        }

        setProdutos((prev) =>
          prev.map((p) =>
            p.id === idProd ? { ...p, estoque: p.estoque + qtdDevolver } : p
          )
        );

        setComandas((prev) =>
          prev.map((c) => {
            if (c.id !== comandaAtivaId) return c;
            return {
              ...c,
              itens: c.itens.filter((i) => i.idProd !== idProd),
            };
          })
        );
      },
    });
  }

  function tratarRemoverSplit(item, comandaDono) {
    setCaixaDialogo({
      titulo: 'Estorno de Item Dividido',
      mensagem: `O item "${item.nome}" foi compartilhado entre comandas.\n\nEscolha como deseja prosseguir com a exclusão:`,
      confirmTxt: 'Excluir de todas as comandas',
      cancelTxt: 'Desfazer divisão (Tornar inteiro aqui)',
      onConfirm: () => {
        removerSplitDeTodas(item.splitGroupId, item.idProd);
      },
      onCancel: () => {
        reverterSplitParaInteiro(
          item.splitGroupId,
          item.idProd,
          comandaDono.id
        );
      },
    });
  }

  function removerSplitDeTodas(splitGroupId, idProd) {
    let totalQtd = 0;
    comandas.forEach((c) => {
      const found = c.itens.find(
        (it) => it.splitGroupId === splitGroupId && it.idProd === idProd
      );
      if (found) totalQtd += found.qtd;
    });

    setComandas((prev) =>
      prev.map((c) => ({
        ...c,
        itens: c.itens.filter(
          (it) => !(it.idProd === idProd && it.splitGroupId === splitGroupId)
        ),
      }))
    );

    dispararMensagem(
      'Item Removido',
      'O item dividido foi removido com sucesso de todas as comandas envolvidas.'
    );
  }

  function reverterSplitParaInteiro(splitGroupId, idProd, comandaDonoId) {
    let totalQtd = 0;
    comandas.forEach((c) => {
      const found = c.itens.find(
        (it) => it.splitGroupId === splitGroupId && it.idProd === idProd
      );
      if (found) totalQtd += found.qtd;
    });

    setComandas((prev) =>
      prev.map((c) => {
        if (c.id === comandaDonoId) {
          return {
            ...c,
            itens: c.itens.map((it) => {
              if (it.idProd === idProd && it.splitGroupId === splitGroupId) {
                const prodOriginal = produtos.find((p) => p.id === idProd);
                return {
                  idProd: idProd,
                  nome: prodOriginal
                    ? prodOriginal.nome
                    : it.nome.split(' (Dividido')[0],
                  precoCusto: it.precoCusto,
                  preco: it.preco,
                  qtd: parseFloat(totalQtd.toFixed(4)),
                };
              }
              return it;
            }),
          };
        } else {
          return {
            ...c,
            itens: c.itens.filter(
              (it) =>
                !(it.idProd === idProd && it.splitGroupId === splitGroupId)
            ),
          };
        }
      })
    );

    dispararMensagem(
      'Divisão Desfeita',
      'O item voltou a ser inteiro nesta comanda e foi removido das demais.'
    );
  }

  async function cancelarComanda(comanda) {
    // Abre a caixa com os botões de motivo pré-definidos
    setCaixaDialogo({
      titulo: 'Motivo do Cancelamento',
      mensagem: `Selecione o motivo para cancelar a comanda de ${comanda.nome}:`,
      tipo: 'motivos_botoes',
      botoes: ['Erro Operador', 'Sem Consumo', 'Nome Errado'],
      cancelTxt: 'Voltar',
      onSelect: async (motivo) => {
        // 1. Atualiza primeiro localmente (Garante o funcionamento offline)
        setLogsAuditoria((prev) => [
          {
            id: Date.now(),
            data: new Date().toISOString(),
            tipo: 'Cancelamento de Comanda',
            operador: usuarioLogado ? usuarioLogado.usuario : 'Admin',
            motivo: motivo,
            detalhes: { id_comanda: comanda.id, nome_cliente: comanda.nome },
          },
          ...prev,
        ]);

        setComandas((prev) => prev.filter((c) => c.id !== comanda.id));

        if (comandaAtivaId === comanda.id) {
          setComandaAtivaId(null);
          setModoPagamento(false);
        }

        dispararMensagem(
          'Sucesso',
          `Comanda #${comanda.id} cancelada com sucesso.`
        );

        // 2. ☁️ Tenta enviar para a nuvem em background. Se falhar, não trava o sistema.
        try {
          await supabaseClient.from('auditoria_cancelamentos').insert([
            {
              operador: usuarioLogado ? usuarioLogado.usuario : 'Admin',
              tipo: 'Cancelamento de Comanda',
              motivo: motivo,
              data: new Date().toISOString(),
              detalhes: {
                id_comanda: comanda.id,
                nome_cliente: comanda.nome,
              },
            },
          ]);
        } catch (err) {
          console.warn(
            'Nuvem offline. Registro mantido localmente no computador:',
            err
          );
        }

        if (comandaAtivaId === comanda.id) {
          setComandaAtivaId(null);
          setModoPagamento(false);
        }

        dispararMensagem(
          'Sucesso',
          `Comanda #${comanda.id} cancelada e registrada na auditoria.`
        );
      },
    });
  }
  function abrirComandaPorNomePronto(nomeBruto) {
    const validacao = validarENormalizarNome(nomeBruto, true);
    if (!validacao.valido) {
      dispararMensagem('Validação', validacao.erro);
      return;
    }

    const novoId = Math.floor(Math.random() * 90) + 10;
    registrarNovoClienteNaBase(validacao.nome);

    setComandas([
      ...comandas,
      { id: novoId, nome: validacao.nome, status: 'Aberto', itens: [] },
    ]);
    setComandaAtivaId(novoId);
    setBusca('');
    setMostrarSugestoes(false);
  }

  function registrarProdutosVendidos(itens) {
    setRelatorioProdutos((prev) => {
      const copia = [...prev];
      itens.forEach((item) => {
        const existente = copia.find((p) => p.idProd === item.idProd);
        if (existente) {
          existente.qtd += item.qtd;
          existente.total += item.preco * item.qtd;
          existente.custo += item.precoCusto * item.qtd;
        } else {
          copia.push({
            idProd: item.idProd,
            nome: item.nome,
            qtd: item.qtd,
            total: item.preco * item.qtd,
            custo: item.precoCusto * item.qtd,
          });
        }
      });
      return copia;
    });
  }

  function imagemAutomaticaProduto(nome, category) {
    const termo = encodeURIComponent(nome);
    return `https://loremflickr.com/400/300/${termo}`;
  }

  function iniciarDivisaoItem(item) {
    setComandasSelecionadasSplit([]);
    setModalDividir({ item });
  }

  function realizarDivisao(item, comandasSelecionadas) {
    const splitGroupId = 'split_' + Date.now();
    const todasEnvolvidas = [comandaAtivaId, ...comandasSelecionadas];
    const totalPessoas = todasEnvolvidas.length;

    const novaQtd = parseFloat((item.qtd / totalPessoas).toFixed(4));

    const nomesTexto = comandas
      .filter((c) => todasEnvolvidas.includes(c.id))
      .map((c) => c.nome)
      .join(', ');

    setComandas((prev) =>
      prev.map((c) => {
        if (!todasEnvolvidas.includes(c.id)) return c;

        const splitItem = {
          idProd: item.idProd,
          nome: `${
            item.nome.split(' (Dividido')[0]
          } (Dividido entre: ${nomesTexto})`,
          precoCusto: item.precoCusto,
          preco: item.preco,
          qtd: novaQtd,
          splitGroupId: splitGroupId,
        };

        const itensCopia = [...c.itens];
        if (c.id === comandaAtivaId) {
          const idx = itensCopia.findIndex(
            (it) => it.idProd === item.idProd && !it.splitGroupId
          );
          if (idx >= 0) itensCopia[idx] = splitItem;
        } else {
          itensCopia.push(splitItem);
        }

        return { ...c, itens: itensCopia };
      })
    );

    setModalDividir(null);
    dispararMensagem(
      'Divisão Concluída',
      `O item "${
        item.nome.split(' (Dividido')[0]
      }" foi rateado com sucesso em ${totalPessoas} partes!`
    );
  }

  /* PROCESSAMENTO DO FORMULÁRIO DE PAGAMENTO MULTIPLO */
  function confirmarPagamentoComposto() {
    if (!comandaAtual || comandaAtual.itens.length === 0) return;
    const totalCobranca = calcularTotal(comandaAtual.itens);

    const d = parseFloat(valDinheiro) || 0;
    const p = parseFloat(valPix) || 0;
    const c = parseFloat(valCartao) || 0;
    const cr = parseFloat(valCrediario) || 0;

    const somaPaga = d + p + c + cr;

    if (Math.abs(somaPaga - totalCobranca) > 0.01) {
      dispararMensagem(
        'Erro de Valor',
        `A soma das formas de pagamento (${formatarMoeda(
          somaPaga
        )}) precisa ser exatamente igual ao total da conta (${formatarMoeda(
          totalCobranca
        )}).`
      );
      return;
    }

    dispararConfirmacao(
      'Confirmar Recebimento',
      `Deseja finalizar a comanda de ${comandaAtual.nome} com os valores informados?`,
      async () => {
        registrarProdutosVendidos(comandaAtual.itens);

        const formasTexto = [];
        if (d > 0) formasTexto.push(`Dinheiro: ${formatarMoeda(d)}`);
        if (p > 0) formasTexto.push(`Pix: ${formatarMoeda(p)}`);
        if (c > 0) formasTexto.push(`Cartão: ${formatarMoeda(c)}`);

        let msgWppStatus = '';
        if (cr > 0) {
          const idCredGerado = Date.now();
          const itensParaSalvar = comandaAtual.itens.map((i) => ({
            nome: i.nome,
            qtd: i.qtd,
            preco: i.preco,
          }));

          formasTexto.push(`Crediário: ${formatarMoeda(cr)}`);

          // 1. Salva no computador
          setCrediarios([
            ...crediarios,
            {
              idCred: idCredGerado,
              data: new Date().toLocaleString('pt-BR'),
              cliente: comandaAtual.nome,
              total: cr,
              status: 'Pendente',
              itensConsumidos: itensParaSalvar,
            },
          ]);

          // 2. ☁️ ENXERTO CIRÚRGICO: SALVA DIRETO NA NUVEM!
          supabaseClient
            .from('crediarios')
            .insert([
              {
                id_cred: idCredGerado,
                data: new Date().toLocaleString('pt-BR'),
                cliente: comandaAtual.nome,
                total: cr,
                status: 'Pendente',
                itens_consumidos: itensParaSalvar,
              },
            ])
            .then(() => console.log('Fiado composto salvo na nuvem!'));

          // Disparo do WhatsApp
          const dadosDoCliente = clientesCadastrados.find(
            (cli) => cli.nome.toLowerCase() === comandaAtual.nome.toLowerCase()
          );
          if (
            dadosDoCliente &&
            dadosDoCliente.telefone &&
            dadosDoCliente.telefone.trim() !== ''
          ) {
            const foneLimpo = dadosDoCliente.telefone.replace(/\D/g, '');
            const mensagemTexto =
              `Olá, *${comandaAtual.nome}*! 🍻\nPassando para avisar que uma parte do seu consumo no *${nomeSoftware}* foi lançada no seu Fiado:\n\n` +
              `📙 *Valor no Fiado:* ${formatarMoeda(cr)}\n` +
              `💰 *Total Geral da Conta:* ${formatarMoeda(totalCobranca)}\n\n` +
              `_Obrigado e até o próximo rock!_ 🎸`;
            const linkWpp = `https://api.whatsapp.com/send?phone=55${foneLimpo}&text=${encodeURIComponent(
              mensagemTexto
            )}`;
            window.open(linkWpp, '_blank');
            msgWppStatus =
              '\n\n📲 Uma aba do WhatsApp foi aberta para enviar o recibo do fiado!';
          }
        }

        // Preparando a lista de itens consumidos para a nuvem
        const itensFormatados = comandaAtual.itens.map((i) => ({
          nome: i.nome,
          qtd: i.qtd,
          preco: i.preco,
        }));

        // Salva na memória local do computador
        setVendas([
          ...vendas,
          {
            idVenda: Date.now(),
            data: new Date().toLocaleString('pt-BR'),
            cliente: comandaAtual.nome,
            total: totalCobranca,
            pagamento: formasTexto.join(' | '),
            itensConsumidos: itensFormatados,
          },
        ]);

        // ☁️ ENXERTO CIRÚRGICO: Salva a venda composta no Supabase em tempo real
        try {
          await supabaseClient.from('vendas').insert([
            {
              data: new Date().toLocaleString('pt-BR'),
              cliente: comandaAtual.nome,
              total: totalCobranca,
              pagamento: formasTexto.join(' | '),
              itens_consumidos: itensFormatados,
            },
          ]);
        } catch (error) {
          console.error('Erro ao sincronizar com a nuvem:', error);
        }

        setComandaRecemPaga({ ...comandaAtual });

        setComandas((prev) => prev.filter((x) => x.id !== comandaAtivaId));
        setComandaAtivaId(null);
        setModoPagamento(false);
        setMostrarMultiFormas(false);
        setValDinheiro('');
        setValPix('');
        setValCartao('');
        setValCrediario('');
        dispararMensagem(
          'Sucesso',
          `Pagamento processado com sucesso! A mesa foi liberada.${msgWppStatus}`
        );
      }
    );
  }

  function finalizarPagamentoDireto(tipo) {
    if (!comandaAtual || comandaAtual.itens.length === 0) return;
    const totalCobranca = calcularTotal(comandaAtual.itens);

    dispararConfirmacao(
      'Confirmar Pagamento',
      `Deseja fechar a conta de ${
        comandaAtual.nome
      } no valor total de ${formatarMoeda(
        totalCobranca
      )} via [${tipo.toUpperCase()}]?`,
      async () => {
        registrarProdutosVendidos(comandaAtual.itens);

        let msgWppStatus = '';
        if (tipo === 'fiado') {
          setCrediarios([
            ...crediarios,
            {
              idCred: Date.now(),
              data: new Date().toLocaleString('pt-BR'),
              cliente: comandaAtual.nome,
              total: totalCobranca,
              status: 'Pendente',
              itensConsumidos: comandaAtual.itens.map((i) => ({
                nome: i.nome,
                qtd: i.qtd,
                preco: i.preco,
              })),
            },
          ]);

          const dadosDoCliente = clientesCadastrados.find(
            (c) => c.nome.toLowerCase() === comandaAtual.nome.toLowerCase()
          );
          if (
            dadosDoCliente &&
            dadosDoCliente.telefone &&
            dadosDoCliente.telefone.trim() !== ''
          ) {
            const foneLimpo = dadosDoCliente.telefone.replace(/\D/g, '');
            const mensagemTexto =
              `Olá, *${comandaAtual.nome}*! 🍻\nPassando para avisar que o seu consumo no *${nomeSoftware}* foi fechado e enviado para o seu Fiado:\n\n` +
              `📙 *Valor Adicionado:* ${formatarMoeda(totalCobranca)}\n\n` +
              `_Qualquer dúvida estamos à disposição! Valeu!_ 🎸`;
            const linkWpp = `https://api.whatsapp.com/send?phone=55${foneLimpo}&text=${encodeURIComponent(
              mensagemTexto
            )}`;
            window.open(linkWpp, '_blank');
            msgWppStatus =
              '\n\n📲 Uma aba do WhatsApp foi aberta para notificar o cliente!';
          }
        }

        // Formatando a lista de itens para que o banco de dados na nuvem salve perfeitamente[cite: 1]
        const itensFormatados = comandaAtual.itens.map((i) => ({
          nome: i.nome,
          qtd: i.qtd,
          preco: i.preco,
        }));

        // 1. Salva imediatamente no computador (Independe de internet)
        setVendas([
          ...vendas,
          {
            idVenda: Date.now(),
            data: new Date().toLocaleString('pt-BR'),
            cliente: comandaAtual.nome,
            total: totalCobranca,
            pagamento: tipo.toUpperCase(),
            itensConsumidos: itensFormatados,
          },
        ]);

        setComandaRecemPaga({ ...comandaAtual });
        setComandas((prev) => prev.filter((x) => x.id !== comandaAtivaId));
        setComandaAtivaId(null);
        setModoPagamento(false);
        setMostrarMultiFormas(false);
        setValDinheiro('');
        setValPix('');
        setValCartao('');
        setValCrediario('');

        dispararMensagem(
          'Sucesso',
          `Conta finalizada com sucesso via ${tipo.toUpperCase()}!${msgWppStatus}`
        );

        // 2. ☁️ Tenta sincronizar com o Supabase de forma isolada
        try {
          await supabaseClient.from('vendas').insert([
            {
              data: new Date().toLocaleString('pt-BR'),
              cliente: comandaAtual.nome,
              total: totalCobranca,
              pagamento: tipo.toUpperCase(),
              itens_consumidos: itensFormatados,
            },
          ]);
        } catch (err) {
          console.warn(
            'Venda registrada apenas localmente (Sem internet no momento):',
            err
          );
        }

        setComandaRecemPaga({ ...comandaAtual });
        setComandas((prev) => prev.filter((x) => x.id !== comandaAtivaId));
        setComandaAtivaId(null);
        setModoPagamento(false);
        setMostrarMultiFormas(false);
        setValDinheiro('');
        setValPix('');
        setValCartao('');
        setValCrediario('');
        dispararMensagem(
          'Sucesso',
          `Conta finalizada com sucesso via ${tipo.toUpperCase()}!${msgWppStatus}`
        );
      }
    );
  }

  function lancarDespesa(e) {
    e.preventDefault();
    const v = parseFloat(novaDespesaValor);
    if (!novaDespesaDesc.trim() || isNaN(v) || v <= 0) {
      dispararMensagem(
        'Erro',
        'Preencha corretamente todos os dados da despesa!'
      );
      return;
    }
    setDespesas([
      ...despesas,
      {
        id: Date.now(),
        descricao: novaDespesaDesc.trim(),
        valor: v,
        vencimento: novaDespesaVenc,
        status: 'Pendente',
        formaPagamento: '-',
      },
    ]);
    setNovaDespesaDesc('');
    setNovaDespesaValor('');
  }

  function baixarDespesaManual(id, forma, dataForcada) {
    const dataFinal = dataForcada
      ? dataForcada
      : new Date().toISOString().split('T')[0];
    setDespesas((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'Paga',
              formaPagamento: forma,
              dataPagamento: dataFinal,
            }
          : d
      )
    );
    dispararMensagem(
      'Despesa',
      `Despesa baixada manualmente como Paga via [${forma}] na data ${dataFinal
        .split('-')
        .reverse()
        .join('/')}!`
    );
    setDespesaEmBaixa(null);
  }

  async function atualizarPropriedadeProduto(id, propriedade, valor) {
    // Mantém a inteligência original de checar se é texto ou número
    const valorFormatado =
      propriedade === 'nome' ||
      propriedade === 'imagem' ||
      propriedade === 'dataUltimaCompra'
        ? valor
        : parseFloat(valor) || 0;

    // Atualiza na tela do seu computador em tempo real
    setProdutos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, [propriedade]: valorFormatado } : p
      )
    );

    // Traduz o nome da coluna para o formato que está na tabela do Supabase
    let dbProp = propriedade;
    if (propriedade === 'precoCusto') dbProp = 'preco_custo';
    if (propriedade === 'estoqueMinimo') dbProp = 'estoque_minimo';
    if (propriedade === 'dataUltimaCompra') dbProp = 'data_ultima_compra';

    // ☁️ ENXERTO CIRÚRGICO: Salva a alteração do estoque direto na nuvem do Supabase
    try {
      await supabaseClient
        .from('produtos')
        .update({ [dbProp]: valorFormatado })
        .eq('id', id);
    } catch (error) {
      console.error('Erro ao sincronizar o produto na nuvem:', error);
    }
  }

  function handleChangeMoeda(id, prop, val) {
    let numero = val.replace(/\D/g, '');
    if (numero === '') numero = '0';
    let floatVal = parseFloat(numero) / 100;
    atualizarPropriedadeProduto(id, prop, floatVal);
  }

  function imprimirComandaConferencia() {
    if (!comandaAtual || comandaAtual.itens.length === 0) return;
    const fraseAleatoria =
      FRASES_ROCK[Math.floor(Math.random() * FRASES_ROCK.length)];
    const itensTexto = comandaAtual.itens
      .map((i) => `${i.qtd}x ${i.nome} - ${formatarMoeda(i.preco * i.qtd)}`)
      .join('\n');
    const total = calcularTotal(comandaAtual.itens);

    dispararMensagem(
      'CONFERÊNCIA DE CONSUMO (MESA)',
      `Estabelecimento: ${nomeSoftware}\nCliente: ${
        comandaAtual.nome
      }\nData: ${new Date().toLocaleString(
        'pt-BR'
      )}\n----------------------------------------\n${itensTexto}\n----------------------------------------\nTOTAL: ${formatarMoeda(
        total
      )}\n\n${fraseAleatoria}\n* DOCUMENTO NÃO FISCAL *`
    );
  }

  function emitirNotaFiscalSilenciosa(comanda) {
    const totalNota = calcularTotal(comanda.itens);
    const dadosPayloadFiscal = {
      nome_modulo: nomeSoftware,
      data_emissao: new Date().toISOString(),
      cliente_nome: comanda.nome,
      valor_total: totalNota,
      itens: comanda.itens.map((item) => ({
        codigo_produto: item.idProd,
        descricao: item.nome,
        quantidade: item.qtd,
        valor_unitario: item.preco,
        valor_total_item: item.preco * item.qtd,
        ncm: '22030000',
        cfop: '5102',
        icms_situacao_tributaria: '102',
      })),
    };

    dispararMensagem(
      'TRANSMISSÃO FISCAL SEFAZ',
      `Iniciando comunicação com o integrador fiscal...\n\n` +
        `Empresa/Software: ${nomeSoftware}\n` +
        `Cliente: ${dadosPayloadFiscal.cliente_nome}\n` +
        `Total a Transmitir: ${formatarMoeda(totalNota)}\n` +
        `Qtd de Itens: ${dadosPayloadFiscal.itens.length}\n\n` +
        `⏳ Conectando ao WebService SEFAZ...`
    );

    setTimeout(() => {
      const chaveAcessoSimulada = Array.from({ length: 44 }, () =>
        Math.floor(Math.random() * 10)
      ).join('');
      dispararMensagem(
        '🔥 NOTA FISCAL AUTORIZADA 🔥',
        `${nomeSoftware} - EMISSÃO EXPRESSA\n` +
          `Status: 100 - Autorizado o uso da NF-e/NFC-e\n` +
          `Ambiente: Homologação (Sem valor fiscal)\n` +
          `----------------------------------------\n` +
          `Chave de Acesso:\n${chaveAcessoSimulada.replace(
            /(.{4})/g,
            '$1 '
          )}\n` +
          `----------------------------------------\n` +
          `Protocolo: ${
            Math.floor(Math.random() * 900000000) + 100000000
          }\n\n` +
          `🖨️ DANFE enviado para a bobina térmica!`
      );
      setComandaRecemPaga(null);
    }, 2500);
  }

  function liquidarVáriasComandasCrediario(comandasArray, cliente, metodo) {
    let totalDivida = comandasArray.reduce((acc, c) => acc + c.total, 0);

    if (metodo === 'Parcial') {
      setPromptVal('');
      setCaixaDialogo({
        titulo: `Abatimento Parcial - ${cliente}`,
        mensagem: `Dívida total: ${formatarMoeda(
          totalDivida
        )}\nDigite o valor que o cliente está pagando (Ex: 50,00):`,
        tipo: 'prompt',
        confirmTxt: 'Abater',
        cancelTxt: 'Cancelar',
        onConfirm: async (valorDigitado) => {
          if (!valorDigitado) return;

          // 💰 TRATAMENTO DA MOEDA: Limpa símbolos, espaços e pontos, convertendo a vírgula para ponto decimal válido
          let limpo = valorDigitado
            .toString()
            .replace('R$', '')
            .replace(/\s/g, '')
            .replace(/\./g, '')
            .replace(',', '.');

          const valor = parseFloat(limpo);
          if (!valor || valor <= 0) {
            dispararMensagem('Erro', 'Valor inválido informado!');
            return;
          }
          if (valor > totalDivida) {
            dispararMensagem(
              'Erro',
              `O valor informado (${formatarMoeda(
                valor
              )}) é maior que a dívida total (${formatarMoeda(totalDivida)})!`
            );
            return;
          }

          let sobraPagamento = valor;
          const alteradosParaBanco = [];

          const novasComandas = crediarios.map((c) => {
            const pertenceAoGrupo = comandasArray.some(
              (x) => x.idCred === c.idCred
            );
            if (!pertenceAoGrupo) return c;
            if (sobraPagamento <= 0) return c;

            let atualizado = { ...c };

            if (sobraPagamento >= c.total) {
              sobraPagamento -= c.total;
              atualizado = {
                ...c,
                total: 0,
                status: 'Pago',
                pagamentos: [
                  ...(c.pagamentos || []),
                  {
                    valor: c.total,
                    metodo: 'Parcial',
                    data: new Date().toLocaleString('pt-BR'),
                  },
                ],
              };
            } else {
              const novoTotal = c.total - sobraPagamento;
              const pagoNesta = sobraPagamento;
              sobraPagamento = 0;
              atualizado = {
                ...c,
                total: novoTotal,
                status: 'Pendente',
                pagamentos: [
                  ...(c.pagamentos || []),
                  {
                    valor: pagoNesta,
                    metodo: 'Parcial',
                    data: new Date().toLocaleString('pt-BR'),
                  },
                ],
              };
            }
            alteradosParaBanco.push(atualizado);
            return atualizado;
          });

          const novoSaldoRestante = totalDivida - valor;
          const dadosDoCliente = clientesCadastrados.find(
            (c) => c.nome.toLowerCase() === cliente.toLowerCase()
          );
          let msgWppStatus = '';

          if (
            dadosDoCliente &&
            dadosDoCliente.telefone &&
            dadosDoCliente.telefone.trim() !== ''
          ) {
            const foneLimpo = dadosDoCliente.telefone.replace(/\D/g, '');
            const mensagemTexto =
              `Olá, *${cliente}*! 🍻\nPassando para confirmar o recebimento do seu pagamento no *${nomeSoftware}*:\n\n` +
              `💰 *Valor Abatido:* ${formatarMoeda(valor)}\n` +
              `📊 *SITUAÇÃO DA CONTA ATUALIZADA:*\n` +
              `• Dívida Total Anterior: ${formatarMoeda(totalDivida)}\n` +
              `• *SALDO DEVEDOR RESTANTE:* *${formatarMoeda(
                novoSaldoRestante
              )}*\n\n` +
              `_Qualquer dúvida, estamos à disposição! Valeu!_ 🎸`;

            // Corrigido: de fomneLimpo para foneLimpo
            const linkWpp = `https://api.whatsapp.com/send?phone=55${foneLimpo}&text=${encodeURIComponent(
              mensagemTexto
            )}`;
            window.open(linkWpp, '_blank');
            msgWppStatus =
              '\n\n📲 Uma aba do WhatsApp Web foi aberta para enviar o recibo parcial!';
          }

          setCrediarios(novasComandas);

          // Mantém o registro no fluxo histórico de caixa local
          setVendas([
            ...vendas,
            {
              idVenda: Date.now(),
              data: new Date().toLocaleString('pt-BR'),
              cliente: `Abatimento Parcial Crediário - ${cliente}`,
              total: valor,
              pagamento: 'PIX/Dinheiro/Cartão',
              itensConsumidos: [
                { nome: 'Abatimento Parcial Fiado', qtd: 1, preco: valor },
              ],
            },
          ]);

          // ☁️ ENXERTO CIRÚRGICO: Sincroniza o abatimento parcial no Supabase
          try {
            for (const item of alteradosParaBanco) {
              await supabaseClient
                .from('crediarios')
                .update({
                  total: item.total,
                  status: item.status,
                  pagamentos: item.pagamentos,
                })
                .eq('id_cred', item.idCred);
            }

            // Envia o dinheiro que entrou no caixa para o histórico de vendas geral na nuvem
            await supabaseClient.from('vendas').insert([
              {
                data: new Date().toLocaleString('pt-BR'),
                cliente: `Abatimento Parcial - ${cliente}`,
                total: valor,
                pagamento: 'PIX/Dinheiro/Cartão',
                itens_consumidos: [
                  { nome: 'Abatimento Parcial Fiado', qtd: 1, preco: valor },
                ],
              },
            ]);
          } catch (error) {
            console.error(
              'Erro ao salvar abatimento do fiado na nuvem:',
              error
            );
          }

          dispararMensagem(
            'Sucesso',
            `Abatimento de ${formatarMoeda(
              valor
            )} registrado com sucesso!${msgWppStatus}`
          );
        },
      });
      return;
    }

    // 🟢 CASO SEJA LIQUIDAÇÃO TOTAL DAS COMANDAS DO CLIENTE
    dispararConfirmacao(
      'Liquidar Crediário',
      `Confirmar recebimento TOTAL de ${formatarMoeda(
        totalDivida
      )} em [${metodo}] para quitar todas as contas de ${cliente}?`,
      async () => {
        setCrediarios((prev) =>
          prev.map((c) => {
            const pertence = comandasArray.some((x) => x.idCred === c.idCred);
            return pertence
              ? {
                  ...c,
                  status: 'Pago',
                  total: 0,
                  pagamentos: [
                    ...(c.pagamentos || []),
                    {
                      valor: c.total,
                      metodo: metodo,
                      data: new Date().toLocaleString('pt-BR'),
                    },
                  ],
                }
              : c;
          })
        );

        comandasArray.forEach((credItem) => {
          if (credItem.itensConsumidos) {
            const formatados = credItem.itensConsumidos.map((it) => ({
              idProd: Math.random(),
              nome: it.nome,
              qtd: it.qtd,
              preco: it.preco,
              precoCusto: it.preco * 0.4,
            }));
            registrarProdutosVendidos(formatados);
          }
        });

        const dadosDoCliente = clientesCadastrados.find(
          (c) => c.nome.toLowerCase() === cliente.toLowerCase()
        );
        let msgWppStatus = '';

        if (
          dadosDoCliente &&
          dadosDoCliente.telefone &&
          dadosDoCliente.telefone.trim() !== ''
        ) {
          const foneLimpo = dadosDoCliente.telefone.replace(/\D/g, '');
          const mensagemTexto =
            `Olá, *${cliente}*! 🍻\nPassando para confirmar o recebimento do seu pagamento no *${nomeSoftware}*:\n\n` +
            `✅ *Valor Pago:* ${formatarMoeda(totalDivida)} (via ${metodo})\n` +
            `🎉 *SITUAÇÃO DA CONTA:* *TOTALMENTE QUITADA!*\n\n` +
            `_Seu saldo devedor atual é: R$ 0,00._\n` +
            `_Obrigado pela preferência, nos vemos no próximo rock!_ 🎸`;

          const linkWpp = `https://api.whatsapp.com/send?phone=55${foneLimpo}&text=${encodeURIComponent(
            mensagemTexto
          )}`;
          window.open(linkWpp, '_blank');
          msgWppStatus =
            '\n\n📲 Uma aba do WhatsApp Web foi aberta para notificar a quitação da conta!';
        }

        setVendas([
          ...vendas,
          {
            idVenda: Date.now(),
            data: new Date().toLocaleString('pt-BR'),
            cliente: `Quitação Total Crediário - ${cliente}`,
            total: totalDivida,
            pagamento: metodo,
            itensConsumidos: [
              { nome: 'Quitação Total Fiado', qtd: 1, preco: totalDivida },
            ],
          },
        ]);

        // ☁️ ENXERTO CIRÚRGICO: Sincroniza a quitação total no Supabase
        try {
          for (const credItem of comandasArray) {
            await supabaseClient
              .from('crediarios')
              .update({
                total: 0,
                status: 'Pago',
              })
              .eq('id_cred', credItem.idCred);
          }

          // Adiciona a entrada total da quitação no histórico de vendas da nuvem
          await supabaseClient.from('vendas').insert([
            {
              data: new Date().toLocaleString('pt-BR'),
              cliente: `Quitação Total - ${cliente}`,
              total: totalDivida,
              pagamento: metodo,
              itens_consumidos: [
                { nome: 'Quitação Total Fiado', qtd: 1, preco: totalDivida },
              ],
            },
          ]);
        } catch (error) {
          console.error('Erro ao liquidar crediário na nuvem:', error);
        }

        dispararMensagem(
          'Sucesso',
          `Todas as comandas deste cliente foram totalmente baixadas e inseridas no caixa!${msgWppStatus}`
        );
      }
    );
  }

  function verificarFiltroData(dataString) {
    if (!dataString) return false;
    let d = '',
      m = '',
      a = '';
    if (dataString.includes(',')) {
      const partes = dataString.split(',')[0].split('/');
      d = partes[0];
      m = partes[1];
      a = partes[2];
    } else if (dataString.includes('-')) {
      const partes = dataString.split('-');
      d = partes[2];
      m = partes[1];
      a = partes[0];
    }

    if (filtroAno !== 'Todos' && a !== filtroAno) return false;
    if (filtroMes !== 'Todos' && m !== filtroMes) return false;
    if (filtroDia !== 'Todos' && parseInt(d) !== parseInt(filtroDia))
      return false;

    return true;
  }

  function imprimirPainelRelatorio(produtosProcessados, escopo) {
    const dataRef = new Date().toLocaleDateString('pt-BR');
    const linhasTexto = produtosProcessados
      .map((p) => {
        const lucro = p.preco - p.precoCusto;
        const vendasQtd =
          relatorioProdutos.find((rp) => rp.nome === p.nome)?.qtd || 0;
        return `• ${p.nome} (${p.category})\n  Estoque: ${
          p.estoque
        } un | Saídas: ${vendasQtd} un | Lucro un: ${formatarMoeda(lucro)}`;
      })
      .join('\n----------------------------------------\n');

    const custoT = produtosProcessados.reduce(
      (acc, p) => acc + p.estoque * p.precoCusto,
      0
    );
    const vendaT = produtosProcessados.reduce(
      (acc, p) => acc + p.estoque * p.preco,
      0
    );

    dispararMensagem(
      `RELATÓRIO DE ESTOQUE - [${escopo.toUpperCase()}]`,
      `Software/Módulo: ${nomeSoftware}\nData de Emissão: ${dataRef}\n----------------------------------------\n${linhasTexto}\n----------------------------------------\nCusto Total Avaliado: ${formatarMoeda(
        custoT
      )}\nRetorno Estimado: ${formatarMoeda(
        vendaT
      )}\nLucro Líquido Projetado: ${formatarMoeda(
        vendaT - custoT
      )}\n\n* DOCUMENTO GERENCIAL INTERNO *`
    );
  }

  const renderLoginGerencial = () => (
    <div className="login-container">
      <form className="login-card" onSubmit={validarAcessoGerencial}>
        <i className="fas fa-lock cadeado"></i>
        <h3>Autenticação Requerida</h3>
        <p>Selecione seu usuário e digite a senha.</p>
        <select
          value={usuarioDigitado}
          onChange={(e) => setUsuarioDigitado(e.target.value)}
        >
          {usuariosSistema.map((u) => (
            <option key={u.usuario} value={u.usuario}>
              {u.usuario.toUpperCase()} ({u.perfil})
            </option>
          ))}
        </select>
        <input
          type="password"
          placeholder="••••"
          maxLength="8"
          value={senhaDigitada}
          onChange={(e) => setSenhaDigitada(e.target.value)}
          autoFocus
        />
        <button type="submit" className="btn-acessar">
          Entrar no Sistema
        </button>
        {erroAutenticacao && (
          <div className="erro-senha">❌ Senha incorreta!</div>
        )}
      </form>
    </div>
  );

  const renderSeguranca = () => (
    <div className="single-container">
      <h2>Controle de Acessos & Operadores do Sistema</h2>
      <div className="grid-financeiro-tabelas">
        <div className="col">
          <div className="card-panel">
            <h3>+ Cadastrar Novo Operador</h3>
            <form onSubmit={cadastrarNovoOperador} className="form-fin-bloco">
              <input
                type="text"
                placeholder="Nome do Usuário/Operador"
                value={novoUserNome}
                onChange={(e) => setNovoUserNome(e.target.value)}
              />
              <input
                type="password"
                placeholder="Definir Senha"
                value={novoUserSenha}
                onChange={(e) => setNovoUserSenha(e.target.value)}
              />
              <select
                value={novoUserPerfil}
                onChange={(e) => setNovoUserPerfil(e.target.value)}
              >
                <option value="operador">Operador (Perfil Padrão)</option>
                <option value="admin">Administrador (Acesso Total)</option>
              </select>

              {novoUserPerfil === 'operador' && (
                <div>
                  <strong
                    style={{ fontSize: '12px', color: 'var(--text-light)' }}
                  >
                    Telas Bloqueadas para este Operador:
                  </strong>
                  <div className="checkbox-group">
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={novoUserRestricoes.includes('estoque')}
                        onChange={() => gerenciarCheckboxRestricao('estoque')}
                      />{' '}
                      Estoque
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={novoUserRestricoes.includes('financeiro')}
                        onChange={() =>
                          gerenciarCheckboxRestricao('financeiro')
                        }
                      />{' '}
                      Painel Financeiro
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={novoUserRestricoes.includes('crediario')}
                        onChange={() => gerenciarCheckboxRestricao('crediario')}
                      />{' '}
                      Penduras/Crediário
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={novoUserRestricoes.includes('seguranca')}
                        onChange={() => gerenciarCheckboxRestricao('seguranca')}
                      />{' '}
                      Segurança (Acessos)
                    </label>
                  </div>
                </div>
              )}
              <button
                type="submit"
                className="btn-add-fin"
                style={{ background: 'var(--blue)' }}
              >
                <i className="fas fa-user-plus"></i> Salvar Operador
              </button>
            </form>
          </div>

          <div className="card-panel">
            <h3>
              <i className="fas fa-edit"></i> Personalização da Marca
              (White-Label)
            </h3>
            <div className="form-fin-bloco">
              <label
                style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: 'var(--text-dark)',
                }}
              >
                Nome do Estabelecimento ou Software:
              </label>
              <input
                type="text"
                placeholder="Ex: BAR DO SAUL, MEU PDV..."
                value={nomeSoftware}
                onChange={(e) => setNomeSoftware(e.target.value)}
                style={{
                  textAlign: 'left',
                  padding: '10px',
                  border: '1px solid var(--border)',
                }}
              />
              <p
                style={{
                  fontSize: '11px',
                  color: 'var(--text-light)',
                  margin: '4px 0 0 0',
                }}
              >
                Muda o Topbar, comandos, relatórios, notas fiscais e mensagens
                automatizadas globalmente.
              </p>
            </div>
          </div>
        </div>

        <div className="card-panel">
          <h3>Lista de Usuários Cadastrados</h3>
          <div className="wrapper-tabela-scroll">
            <table>
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Perfil</th>
                  <th>Telas Restritas</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuariosSistema.map((u) => (
                  <tr key={u.usuario}>
                    <td>
                      <strong>{u.usuario}</strong>
                    </td>
                    <td>
                      <span
                        className={
                          u.perfil === 'admin'
                            ? 'status-pago'
                            : 'status-pendente'
                        }
                      >
                        {u.perfil.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <small style={{ color: '#e74c3c' }}>
                        {u.restricoes && u.restricoes.length > 0
                          ? u.restricoes.join(', ').toUpperCase()
                          : 'NENHUMA'}
                      </small>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => setUsuarioEditando(u)}
                        className="btn-add-fin"
                        style={{
                          background: 'var(--orange)',
                          padding: '5px 10px',
                          fontSize: '11px',
                          margin: '0 4px',
                        }}
                      >
                        Editar
                      </button>
                      {u.usuario !== 'admin' && (
                        <button
                          onClick={() => excluirUsuario(u)}
                          className="btn-add-fin"
                          style={{
                            background: '#e74c3c',
                            padding: '5px 10px',
                            fontSize: '11px',
                            margin: '0 4px',
                          }}
                        >
                          Excluir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderClientesScreen = () => {
    const handleSalvarCliente = (e) => {
      e.preventDefault();
      if (!novoClienteNomeInput.trim() || !novoClienteSobrenomeInput.trim()) {
        dispararMensagem('Erro', 'Nome e Sobrenome são obrigatórios.');
        return;
      }
      const nomeCompleto = `${novoClienteNomeInput.trim()} ${novoClienteSobrenomeInput.trim()}`;
      if (
        clientesCadastrados.some(
          (c) => c.nome.toLowerCase() === nomeCompleto.toLowerCase()
        )
      ) {
        dispararMensagem('Aviso', 'Este cliente já está cadastrado.');
        return;
      }
      setClientesCadastrados([
        ...clientesCadastrados,
        {
          nome: nomeCompleto,
          sobrenome: novoClienteSobrenomeInput.trim(),
          telefone: novoClienteTelefoneInput.trim(),
          foto: '',
        },
      ]);
      setNovoClienteNomeInput('');
      setNovoClienteSobrenomeInput('');
      setNovoClienteTelefoneInput('');
      dispararMensagem('Sucesso', 'Cliente cadastrado com sucesso!');
    };

    const clientesFiltradosPesquisa = clientesCadastrados.filter(
      (cli) =>
        cli.nome.toLowerCase().includes(pesquisaClienteBase.toLowerCase()) ||
        (cli.sobrenome &&
          cli.sobrenome
            .toLowerCase()
            .includes(pesquisaClienteBase.toLowerCase())) ||
        (cli.telefone && cli.telefone.includes(pesquisaClienteBase))
    );

    return (
      <div className="estoque-dark-container">
        <div className="estoque-dark-header">
          <div className="estoque-dark-title-box">
            <div
              className="estoque-dark-icon-badge"
              style={{ borderColor: '#ef4444', color: '#ef4444' }}
            >
              <i className="fas fa-users"></i>
            </div>
            <div>
              <h2 style={{ margin: 0, color: 'white', fontSize: '20px' }}>
                Gerenciamento de Clientes
              </h2>
              <p
                style={{
                  margin: '4px 0 0 0',
                  color: '#64748b',
                  fontSize: '13px',
                }}
              >
                Cadastre e pesquise rapidamente seus clientes.
              </p>
            </div>
          </div>
        </div>

        <div
          className="estoque-dark-layout"
          style={{ gridTemplateColumns: '1fr 1fr' }}
        >
          <div className="estoque-dark-panel-left">
            <div className="estoque-dark-section-title">
              Novo cadastro de cliente
            </div>
            <form
              onSubmit={handleSalvarCliente}
              style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
            >
              <div className="dark-form-row">
                <div className="dark-input-group">
                  <label>Nome *</label>
                  <input
                    type="text"
                    className="dark-input-field"
                    value={novoClienteNomeInput}
                    onChange={(e) => setNovoClienteNomeInput(e.target.value)}
                    placeholder="Ex: João"
                  />
                </div>
                <div className="dark-input-group">
                  <label>Sobrenome *</label>
                  <input
                    type="text"
                    className="dark-input-field"
                    value={novoClienteSobrenomeInput}
                    onChange={(e) =>
                      setNovoClienteSobrenomeInput(e.target.value)
                    }
                    placeholder="Ex: Silva"
                  />
                </div>
              </div>
              <div className="dark-input-group">
                <label>Telefone / WhatsApp</label>
                <input
                  type="text"
                  className="dark-input-field"
                  value={novoClienteTelefoneInput}
                  onChange={(e) => setNovoClienteTelefoneInput(e.target.value)}
                  placeholder="Ex: 31999999999"
                />
              </div>
              <button
                type="submit"
                className="btn-dark-save"
                style={{
                  alignSelf: 'flex-start',
                  width: 'auto',
                  marginTop: '10px',
                }}
              >
                <i className="fas fa-user-plus"></i> Cadastrar Cliente
              </button>
            </form>
          </div>

          <div className="estoque-dark-panel-right">
            <div
              className="dark-quick-info"
              style={{ background: '#0f172a', height: '100%' }}
            >
              <div className="dark-quick-info-title">
                <i className="fas fa-search"></i> Pesquisa Geral de Contas e
                Comandas
              </div>

              <div
                className="dark-search-bar-auto"
                style={{ marginTop: '0px', marginBottom: '15px' }}
              >
                <i className="fas fa-search" style={{ color: '#475569' }}></i>
                <input
                  type="text"
                  placeholder="Buscar por nome, sobrenome ou telefone..."
                  value={pesquisaClienteBase}
                  onChange={(e) => setPesquisaClienteBase(e.target.value)}
                />
              </div>

              <div
                style={{ maxHeight: '340px', overflowY: 'auto' }}
                className="wrapper-tabela-scroll"
              >
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          color: '#94a3b8',
                          fontSize: '11px',
                          padding: '10px',
                        }}
                      >
                        Nome Completo
                      </th>
                      <th
                        style={{
                          color: '#94a3b8',
                          fontSize: '11px',
                          padding: '10px',
                        }}
                      >
                        Telefone
                      </th>
                      <th
                        style={{
                          color: '#94a3b8',
                          fontSize: '11px',
                          padding: '10px',
                          textAlign: 'center',
                        }}
                      >
                        Abertas
                      </th>
                      <th
                        style={{
                          color: '#94a3b8',
                          fontSize: '11px',
                          padding: '10px',
                          textAlign: 'center',
                        }}
                      >
                        Pendentes
                      </th>
                      <th
                        style={{
                          color: '#94a3b8',
                          fontSize: '11px',
                          padding: '10px',
                          textAlign: 'center',
                        }}
                      >
                        Pagas
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesFiltradosPesquisa.map((cli, index) => {
                      const abertasQtd = comandas.filter(
                        (com) =>
                          com.nome.toLowerCase() === cli.nome.toLowerCase()
                      ).length;
                      const pendentesQtd = crediarios.filter(
                        (cred) =>
                          cred.cliente.toLowerCase() ===
                            cli.nome.toLowerCase() && cred.status === 'Pendente'
                      ).length;

                      const vendasCliente = vendas.filter(
                        (v) =>
                          v.cliente.toLowerCase() === cli.nome.toLowerCase() &&
                          !v.cliente.includes('Crediário')
                      );
                      const pagasQtd =
                        crediarios.filter(
                          (cred) =>
                            cred.cliente.toLowerCase() ===
                              cli.nome.toLowerCase() && cred.status === 'Pago'
                        ).length + vendasCliente.length;

                      return (
                        <React.Fragment key={index}>
                          <tr
                            style={{
                              borderBottom: '1px solid #1e293b',
                              cursor: 'pointer',
                            }}
                            onClick={() =>
                              setExpandedCliente(
                                expandedCliente === cli.nome ? null : cli.nome
                              )
                            }
                          >
                            <td
                              style={{
                                padding: '10px',
                                fontSize: '13px',
                                color: '#fff',
                              }}
                            >
                              <strong>{cli.nome}</strong>
                            </td>
                            <td
                              style={{
                                padding: '10px',
                                fontSize: '13px',
                                color: '#cbd5e1',
                              }}
                            >
                              {cli.telefone || 'Não informado'}
                            </td>
                            <td
                              style={{
                                padding: '10px',
                                fontSize: '13px',
                                color: abertasQtd > 0 ? '#4ade80' : '#475569',
                                textAlign: 'center',
                                fontWeight: 'bold',
                              }}
                            >
                              {abertasQtd}
                            </td>
                            <td
                              style={{
                                padding: '10px',
                                fontSize: '13px',
                                color: pendentesQtd > 0 ? '#fb923c' : '#475569',
                                textAlign: 'center',
                                fontWeight: 'bold',
                              }}
                            >
                              {pendentesQtd}
                            </td>
                            <td
                              style={{
                                padding: '10px',
                                fontSize: '13px',
                                color: pagasQtd > 0 ? '#a3e635' : '#475569',
                                textAlign: 'center',
                                fontWeight: 'bold',
                              }}
                            >
                              {pagasQtd}
                            </td>
                          </tr>
                          {expandedCliente === cli.nome && (
                            <tr style={{ backgroundColor: '#0b131e' }}>
                              <td
                                colSpan="5"
                                style={{
                                  padding: '15px',
                                  borderBottom: '1px solid #1e293b',
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: '12px',
                                    color: '#94a3b8',
                                    marginBottom: '10px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  <i className="fas fa-list-ul"></i>{' '}
                                  Detalhamento do Consumo:
                                </div>

                                {comandas
                                  .filter(
                                    (com) =>
                                      com.nome.toLowerCase() ===
                                      cli.nome.toLowerCase()
                                  )
                                  .map((c) => (
                                    <div
                                      key={'aberta' + c.id}
                                      style={{
                                        marginBottom: '10px',
                                        padding: '8px',
                                        borderLeft: '3px solid #4ade80',
                                        background: '#090f17',
                                        borderRadius: '4px',
                                      }}
                                    >
                                      <div
                                        style={{
                                          fontSize: '12px',
                                          color: '#4ade80',
                                          fontWeight: 'bold',
                                          marginBottom: '5px',
                                        }}
                                      >
                                        Mesa Ativa #{c.id} - Total:{' '}
                                        {formatarMoeda(calcularTotal(c.itens))}
                                      </div>
                                      <ul
                                        style={{
                                          listStyle: 'none',
                                          padding: 0,
                                          margin: 0,
                                        }}
                                      >
                                        {c.itens.map((i, idx) => (
                                          <li
                                            key={idx}
                                            style={{
                                              fontSize: '11px',
                                              color: '#cbd5e1',
                                              marginBottom: '2px',
                                            }}
                                          >
                                            • {i.qtd}x {i.nome} —{' '}
                                            <span style={{ color: '#94a3b8' }}>
                                              {formatarMoeda(i.preco * i.qtd)}
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}

                                {crediarios
                                  .filter(
                                    (cred) =>
                                      cred.cliente.toLowerCase() ===
                                        cli.nome.toLowerCase() &&
                                      cred.status === 'Pendente'
                                  )
                                  .map((c) => (
                                    <div
                                      key={'cred' + c.idCred}
                                      style={{
                                        marginBottom: '10px',
                                        padding: '8px',
                                        borderLeft: `3px solid #fb923c`,
                                        background: '#090f17',
                                        borderRadius: '4px',
                                      }}
                                    >
                                      <div
                                        style={{
                                          fontSize: '12px',
                                          color: '#fb923c',
                                          fontWeight: 'bold',
                                          marginBottom: '5px',
                                        }}
                                      >
                                        Fiado Pendente ({c.data.split(',')[0]})
                                        - Total: {formatarMoeda(c.total)}
                                      </div>
                                      <ul
                                        style={{
                                          listStyle: 'none',
                                          padding: 0,
                                          margin: 0,
                                        }}
                                      >
                                        {c.itensConsumidos &&
                                          c.itensConsumidos.map((i, idx) => (
                                            <li
                                              key={idx}
                                              style={{
                                                fontSize: '11px',
                                                color: '#cbd5e1',
                                                marginBottom: '2px',
                                              }}
                                            >
                                              • {i.qtd}x {i.nome} —{' '}
                                              <span
                                                style={{ color: '#94a3b8' }}
                                              >
                                                {formatarMoeda(i.preco * i.qtd)}
                                              </span>
                                            </li>
                                          ))}
                                      </ul>
                                    </div>
                                  ))}

                                {[
                                  ...crediarios.filter(
                                    (cred) =>
                                      cred.cliente.toLowerCase() ===
                                        cli.nome.toLowerCase() &&
                                      cred.status === 'Pago'
                                  ),
                                  ...vendasCliente,
                                ].map((v, idx) => {
                                  const isCred = v.hasOwnProperty('idCred');
                                  const valor = isCred
                                    ? v.pagamentos
                                      ? v.pagamentos.reduce(
                                          (acc, p) => acc + p.valor,
                                          0
                                        )
                                      : 0
                                    : v.total;
                                  const itens = isCred
                                    ? v.itensConsumidos
                                    : v.itensConsumidos;
                                  const metodoExibicao = isCred
                                    ? v.pagamentos && v.pagamentos.length > 0
                                      ? v.pagamentos
                                          .map((p) => p.metodo)
                                          .join(', ')
                                      : 'Não informado'
                                    : v.pagamento;

                                  return (
                                    <div
                                      key={'hist' + idx}
                                      style={{
                                        marginBottom: '10px',
                                        padding: '8px',
                                        borderLeft: `3px solid #a3e635`,
                                        background: '#090f17',
                                        borderRadius: '4px',
                                      }}
                                    >
                                      <div
                                        style={{
                                          fontSize: '12px',
                                          color: '#a3e635',
                                          fontWeight: 'bold',
                                          marginBottom: '5px',
                                        }}
                                      >
                                        {isCred ? 'Fiado Pago' : 'Venda Direta'}{' '}
                                        ({v.data.split(',')[0]}) - Valor:{' '}
                                        {formatarMoeda(valor)}
                                        <span
                                          style={{
                                            color: '#94a3b8',
                                            marginLeft: '5px',
                                          }}
                                        >
                                          ({metodoExibicao})
                                        </span>
                                      </div>
                                      <ul
                                        style={{
                                          listStyle: 'none',
                                          padding: 0,
                                          margin: 0,
                                        }}
                                      >
                                        {itens &&
                                          itens.map((i, iidx) => (
                                            <li
                                              key={iidx}
                                              style={{
                                                fontSize: '11px',
                                                color: '#cbd5e1',
                                                marginBottom: '2px',
                                              }}
                                            >
                                              • {i.qtd}x {i.nome} —{' '}
                                              <span
                                                style={{ color: '#94a3b8' }}
                                              >
                                                {formatarMoeda(i.preco * i.qtd)}
                                              </span>
                                            </li>
                                          ))}
                                      </ul>
                                    </div>
                                  );
                                })}

                                {abertasQtd === 0 &&
                                  pendentesQtd === 0 &&
                                  pagasQtd === 0 && (
                                    <div
                                      style={{
                                        fontSize: '11px',
                                        color: '#475569',
                                        fontStyle: 'italic',
                                      }}
                                    >
                                      Nenhum consumption registrado.
                                    </div>
                                  )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                    {clientesFiltradosPesquisa.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          style={{
                            padding: '20px',
                            color: '#475569',
                            textAlign: 'center',
                            fontSize: '13px',
                            fontStyle: 'italic',
                          }}
                        >
                          Nenhum cliente correspondente encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPDV = () => {
    let subtotal = comandaAtual ? calcularTotal(comandaAtual.itens) : 0;
    const listaCategorias = [
      'Todos',
      ...new Set([
        ...categoriasCustomizadas,
        ...produtos.map((p) => p.category),
      ]),
    ];

    let produtosFiltrados =
      categoriaAtiva === 'Todos'
        ? produtos
        : produtos.filter((p) => p.category === categoriaAtiva);

    if (categoriaAtiva === 'Todos') {
      produtosFiltrados = [...produtosFiltrados].sort((a, b) => {
        const totalA =
          relatorioProdutos.find((rp) => rp.nome === a.nome)?.qtd || 0;
        const totalB =
          relatorioProdutos.find((rp) => rp.nome === b.nome)?.qtd || 0;
        return totalB - totalA;
      });
    }

    const sugestoesClientes =
      busca.trim() === ''
        ? clientesCadastrados
        : clientesCadastrados.filter((c) =>
            c.nome.toLowerCase().includes(busca.toLowerCase())
          );

    const sugestoesClientesOrdenadas = [...sugestoesClientes].sort((a, b) => {
      const abertasA = comandas.filter(
        (com) => com.nome.toLowerCase() === a.nome.toLowerCase()
      ).length;
      const abertasB = comandas.filter(
        (com) => com.nome.toLowerCase() === b.nome.toLowerCase()
      ).length;
      return abertasB - abertasA;
    });

    const ehNomeInedito =
      busca.trim().split(' ').length >= 2 &&
      busca.trim().split(' ')[1].length >= 2 &&
      !clientesCadastrados.some(
        (c) => c.nome.toLowerCase() === busca.trim().toLowerCase()
      );

    /* CALCULO DO SALDO MULTI-PAGAMENTO */
    const totalPagoAtualmente =
      (parseFloat(valDinheiro) || 0) +
      (parseFloat(valPix) || 0) +
      (parseFloat(valCartao) || 0) +
      (parseFloat(valCrediario) || 0);
    const saldoRestantePagamento = subtotal - totalPagoAtualmente;

    return (
      <div className="main-container">
        <div className="col">
          <h2>Mesas e Comandas</h2>

          <div className="busca-container" ref={buscaContainerRef}>
            <input
              type="text"
              className="search-box"
              placeholder="🔍 Clique para ver comandas ou digite..."
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setMostrarSugestoes(true);
              }}
              onFocus={() => setMostrarSugestoes(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setMostrarSugestoes(false);
              }}
            />
            {mostrarSugestoes && (
              <div
                className="sugestoes-box"
                style={{
                  position: 'absolute',
                  background: '#1e293b',
                  border: '2px solid #475569',
                  borderRadius: '12px',
                  width: '100%',
                  zIndex: 9999,
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6)',
                  padding: '10px',
                  maxHeight: '380px',
                  overflowY: 'auto',
                }}
              >
                {/* 📊 INDICADOR DINÂMICO DE CABEÇALHO */}
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--orange)',
                    fontWeight: 'bold',
                    padding: '4px 6px 10px 6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {busca.trim() === ''
                    ? '⭐ Comandas Mais Frequentes (Top 10):'
                    : '🔍 Resultados da Busca:'}
                </div>

                {/* 🟧 1. MAPA DE COMANDAS ABERTAS / FREQUENTES */}
                {busca.trim() === '' &&
                  [...comandas]
                    .sort((a, b) => {
                      const totalA = comandas.filter(
                        (com) => com.nome.toLowerCase() === a.nome.toLowerCase()
                      ).length;
                      const totalB = comandas.filter(
                        (com) => com.nome.toLowerCase() === b.nome.toLowerCase()
                      ).length;
                      return totalB - totalA;
                    })
                    .slice(0, 10) // Restringe rigorosamente aos 10 clientes mais assíduos
                    .map((c, i) => (
                      <div
                        key={i}
                        className="sugestao-item"
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '14px 18px', // Botão largo para o dedo acertar fácil
                          marginBottom: '8px',
                          background: '#0f172a',
                          border: '2px solid #f97316', // 🎨 CONTORNO LARANJA MARCANTE PARA APARECER BEM!
                          borderRadius: '10px',
                          color: '#f8fafc',
                          fontSize: '18px', // 📐 Letras maiores para tela touch
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
                        }}
                        onClick={() => {
                          setComandaAtivaId(c.id);
                          setModoPagamento(false);
                          setComandaRecemPaga(null);
                          setMostrarSugestoes(false);
                        }}
                      >
                        <span>
                          👤 {c.nome} (Mesa #{c.id})
                        </span>
                        <span
                          className="sugestao-ativa"
                          style={{
                            fontSize: '11px',
                            background: '#b91c1c',
                            color: 'white',
                            padding: '3px 8px',
                            borderRadius: '6px',
                          }}
                        >
                          Aberta
                        </span>
                      </div>
                    ))}

                {/* 🟦 2. MAPA DE SUGESTÕES DE CLIENTES CADASTRADOS */}
                {sugestoesClientesOrdenadas.map((c, i) => (
                  <div
                    key={i}
                    className="sugestao-item"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '14px 18px',
                      marginBottom: '8px',
                      background: '#0f172a',
                      border: '2px solid #3b82f6', // 🎨 CONTORNO AZUL PARA CLIENTES CADASTRADOS
                      borderRadius: '10px',
                      color: '#f8fafc',
                      fontSize: '18px', // 📐 Letras maiores
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
                    }}
                    onClick={() => {
                      abrirComandaPorNomePronto(c.nome);
                      setComandaRecemPaga(null);
                      setMostrarSugestoes(false);
                    }}
                  >
                    <span>👤 {c.nome}</span>
                    <span
                      className="sugestao-tag"
                      style={{
                        fontSize: '11px',
                        background: '#1e3a8a',
                        color: '#93c5fd',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      Cadastrado
                    </span>
                  </div>
                ))}

                {/* 🟩 3. OPÇÃO PARA CRIAR COMANDA COM NOME INÉDITO */}
                {ehNomeInedito && busca.trim() !== '' && (
                  <div
                    className="sugestao-item"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '14px 18px',
                      marginBottom: '8px',
                      background: '#14532d',
                      border: '2px solid #22c55e', // 🎨 CONTORNO VERDE PARA CRIAR COMANDA NOVA
                      borderRadius: '10px',
                      color: '#f8fafc',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
                    }}
                    onClick={() => {
                      abrirComandaPorNomePronto(busca);
                      setComandaRecemPaga(null);
                      setMostrarSugestoes(false);
                    }}
                  >
                    <span>
                      ➕ Criar comanda: <strong>{busca}</strong>
                    </span>
                    <span
                      className="sugestao-nova"
                      style={{
                        fontSize: '11px',
                        background: '#22c55e',
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      + Nova
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ flexGrow: 1, overflowY: 'auto' }}>
            {comandas.map((c) => {
              const totalComanda = calcularTotal(c.itens);
              return (
                <div
                  key={c.id}
                  className={`comanda-card ${
                    comandaAtivaId === c.id ? 'active' : ''
                  }`}
                  onClick={() => {
                    setComandaAtivaId(c.id);
                    setModoPagamento(false);
                    setMostrarMultiFormas(false);
                    setComandaRecemPaga(null);
                  }}
                >
                  <div className="comanda-header">
                    <span>{c.nome}</span>
                    <span>#{c.id}</span>
                  </div>
                  <div className="comanda-footer">
                    <span className="badge-aberto">Mesa Ativa</span>
                    <span className="comanda-total">
                      {formatarMoeda(totalComanda)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* INÍCIO DA COLUNA 2: CONSUMO */}
        <div className="col">
          <div
            className="consumo-box"
            style={{
              justifyContent:
                !comandaAtual && comandaRecemPaga ? 'center' : 'flex-start',
            }}
          >
            {comandaAtual ? (
              <>
                <div className="consumo-header">
                  <h3>Consumo de: {comandaAtual.nome}</h3>
                  <small>Comanda ID: #{comandaAtual.id}</small>
                </div>

                <div className="consumo-items">
                  {comandaAtual.itens.length === 0 ? (
                    <p
                      style={{
                        color: '#888',
                        textAlign: 'center',
                        marginTop: '40px',
                      }}
                    >
                      Nenhum item lançado.
                    </p>
                  ) : (
                    comandaAtual.itens.map((item, index) => {
                      const prodOriginal = produtos.find(
                        (p) => p.id === item.idProd
                      );
                      const podeDividir =
                        prodOriginal &&
                        (prodOriginal.category === 'Porções' ||
                          categoriasDivisiveis.includes(prodOriginal.category));

                      return (
                        <div key={index} className="item-linha">
                          <div className="item-qtd-nome">
                            <span className="item-qtd">{item.qtd}x</span>
                            <span>{item.nome}</span>
                          </div>
                          <div
                            style={{ display: 'flex', alignItems: 'center' }}
                          >
                            <span style={{ marginRight: '10px' }}>
                              {formatarMoeda(item.preco * item.qtd)}
                            </span>

                            {podeDividir && !item.splitGroupId && (
                              <button
                                className="btn-remove-item"
                                style={{
                                  color: 'var(--blue)',
                                  marginRight: '8px',
                                }}
                                onClick={() => iniciarDivisaoItem(item)}
                                title="Dividir Porção"
                              >
                                <i className="fas fa-divide"></i>
                              </button>
                            )}

                            <button
                              className="btn-remove-item"
                              onClick={() => {
                                if (item.splitGroupId) {
                                  tratarRemoverSplit(item, comandaAtual);
                                } else {
                                  removerItemNaComanda(item.idProd);
                                }
                              }}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="consumo-resumo">
                  <div className="linha-total">
                    <span>Total:</span>
                    <span>{formatarMoeda(subtotal)}</span>
                  </div>

                  {comandaAtual.itens.length > 0 && (
                    <button
                      className="btn-imprimir"
                      style={{
                        padding: '16px 20px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        width: '100%',
                        marginBottom: '15px',
                      }}
                      onClick={imprimirComandaConferencia}
                    >
                      <i className="fas fa-print"></i> Imprimir Conferência
                    </button>
                  )}

                  {/* LÓGICA DE PAGAMENTO CORRIGIDA */}
                  {!modoPagamento ? (
                    comandaAtual.itens.length === 0 ? (
                      <button
                        className="btn-finalizar"
                        style={{
                          background: '#e74c3c',
                          width: '160px',
                          margin: '0 auto',
                          padding: '10px',
                          fontSize: '14px',
                        }}
                        onClick={() => cancelarComanda(comandaAtual)}
                      >
                        <i className="fas fa-trash-alt"></i> Excluir Comanda
                      </button>
                    ) : (
                      <button
                        className="btn-finalizar"
                        onClick={() => {
                          setModoPagamento(true);
                          setBusca('');
                        }}
                      >
                        <i className="fas fa-cash-register"></i> Fechar Comanda
                      </button>
                    )
                  ) : (
                    <div
                      className="botoes-pagamento"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      {!mostrarMultiFormas ? (
                        <>
                          <button
                            className="btn-pag btn-cartao"
                            onClick={() => finalizarPagamentoDireto('cartão')}
                          >
                            💳 Cartão (Total)
                          </button>
                          <button
                            className="btn-pag btn-pix"
                            onClick={() => finalizarPagamentoDireto('pix')}
                          >
                            ⚡ Pix (Total)
                          </button>
                          <button
                            className="btn-pag btn-dinheiro"
                            onClick={() => finalizarPagamentoDireto('dinheiro')}
                          >
                            💵 Dinheiro (Total)
                          </button>
                          <button
                            className="btn-pag btn-creadiario"
                            onClick={() => finalizarPagamentoDireto('fiado')}
                          >
                            📙 Fiado (Total)
                          </button>
                          <button
                            className="btn-pag btn-mais-pgto"
                            onClick={() => setMostrarMultiFormas(true)}
                            style={{ background: '#64748b' }}
                          >
                            ➕ Multi-Formas
                          </button>
                          <button
                            className="btn-cancelar-pag"
                            onClick={() => setModoPagamento(false)}
                            style={{
                              padding: '12px',
                              fontSize: '14px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              marginTop: '10px',
                            }}
                          >
                            <i className="fas fa-arrow-left"></i> Voltar ao
                            Consumo
                          </button>
                        </>
                      ) : (
                        <React.Fragment>
                          <div className="grid-multi-pagamento">
                            <div className="linha-multi-pagamento">
                              <label>💵 Dinheiro:</label>
                              <input
                                type="number"
                                placeholder="0.00"
                                value={valDinheiro}
                                onChange={(e) => setValDinheiro(e.target.value)}
                              />
                            </div>
                            <div className="linha-multi-pagamento">
                              <label>💎 Pix:</label>
                              <input
                                type="number"
                                placeholder="0.00"
                                value={valPix}
                                onChange={(e) => setValPix(e.target.value)}
                              />
                            </div>
                            <div className="linha-multi-pagamento">
                              <label>💳 Cartão:</label>
                              <input
                                type="number"
                                placeholder="0.00"
                                value={valCartao}
                                onChange={(e) => setValCartao(e.target.value)}
                              />
                            </div>
                            <div className="linha-multi-pagamento">
                              <label>📙 Fiado:</label>
                              <input
                                type="number"
                                placeholder="0.00"
                                value={valCrediario}
                                onChange={(e) =>
                                  setValCrediario(e.target.value)
                                }
                              />
                            </div>
                            <div
                              className="info-composto-valores"
                              style={{
                                fontSize: '11px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px',
                                borderTop: '1px solid #ddd',
                                paddingTop: '8px',
                                marginTop: '4px',
                                color: '#555',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <span>Total Pago:</span>
                                <strong>
                                  {formatarMoeda(totalPagoAtualmente)}
                                </strong>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  color:
                                    saldoRestantePagamento < 0
                                      ? 'red'
                                      : saldoRestantePagamento === 0
                                      ? 'green'
                                      : '#555',
                                }}
                              >
                                <span>Falta Receber:</span>
                                <strong>
                                  {formatarMoeda(saldoRestantePagamento)}
                                </strong>
                              </div>
                            </div>
                          </div>
                          <div className="botoes-pagamento">
                            <button
                              className="btn-pag btn-dinheiro"
                              onClick={confirmarPagamentoComposto}
                              disabled={Math.abs(saldoRestantePagamento) > 0.02}
                            >
                              <i className="fas fa-check-circle"></i> Confirmar
                              e Fechar Conta
                            </button>
                            <button
                              className="btn-cancelar-pag"
                              onClick={() => setMostrarMultiFormas(false)}
                            >
                              Voltar às formas principais
                            </button>
                          </div>
                        </React.Fragment>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div
                style={{
                  margin: comandaRecemPaga ? '0' : 'auto',
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                {comandaRecemPaga ? (
                  <div
                    style={{
                      padding: '25px',
                      background: '#e8f5e9',
                      border: '2px solid #27ae60',
                      borderRadius: '12px',
                      maxWidth: '320px',
                      margin: '0 auto',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                    }}
                  >
                    <i
                      className="fas fa-check-circle"
                      style={{
                        fontSize: '42px',
                        color: '#27ae60',
                        marginBottom: '12px',
                      }}
                    ></i>
                    <h4
                      style={{
                        margin: '0 0 6px 0',
                        color: '#2e7d32',
                        fontSize: '18px',
                      }}
                    >
                      Conta Quitada!
                    </h4>
                    <p
                      style={{
                        fontSize: '13px',
                        color: '#555',
                        margin: '0 0 15px 0',
                      }}
                    >
                      Comanda de <strong>{comandaRecemPaga.nome}</strong>{' '}
                      processada.
                    </p>
                    <div
                      style={{
                        borderTop: '1px solid #c8e6c9',
                        paddingTop: '12px',
                        marginBottom: '15px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 'bold',
                          display: 'block',
                          marginBottom: '10px',
                          color: '#2c3e50',
                        }}
                      >
                        Deseja emitir Nota Fiscal (NFC-e)?
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn-imprimir"
                          style={{
                            background: '#27ae60',
                            margin: 0,
                            flex: 1,
                            padding: '10px',
                          }}
                          onClick={() =>
                            emitirNotaFiscalSilenciosa(comandaRecemPaga)
                          }
                        >
                          <i className="fas fa-file-invoice"></i> Sim, Emitir
                        </button>
                        <button
                          className="btn-imprimir"
                          style={{
                            background: '#e74c3c',
                            margin: 0,
                            flex: 1,
                            padding: '10px',
                          }}
                          onClick={() => setComandaRecemPaga(null)}
                        >
                          <i className="fas fa-times-circle"></i> Não, Concluir
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#888' }}>
                    Selecione ou crie uma comanda ao lado.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        {/* FIM DA COLUNA 2 */}

        <div className="col" style={{ overflowY: 'auto' }}>
          <h2>
            Cardápio Express{' '}
            {categoriaAtiva === 'Todos' && (
              <span style={{ fontSize: '12px', color: 'var(--orange)' }}>
                (Mais Consumidos Primeiro)
              </span>
            )}
          </h2>
          <div className="categorias-container">
            {listaCategorias.map((cat) => (
              <button
                key={cat}
                className={`btn-categoria ${
                  categoriaAtiva === cat ? 'active' : ''
                }`}
                onClick={() => setCategoriaAtiva(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid-produtos">
            {produtosFiltrados.map((p) => (
              <div
                key={p.id}
                className="card-prod"
                onClick={() => addItemNaComanda(p)}
              >
                <img
                  src={p.imagem || imagemAutomaticaProduto(p.nome, p.category)}
                  alt={p.nome}
                />
                <span className="prod-nome">{p.nome}</span>
                <span className="prod-preco">{formatarMoeda(p.preco)}</span>
                <span
                  style={{
                    fontSize: '11px',
                    color: p.estoque <= p.estoqueMinimo ? 'red' : 'green',
                    marginTop: '4px',
                    fontWeight:
                      p.estoque <= p.estoqueMinimo ? 'bold' : 'normal',
                  }}
                >
                  Qtd: {p.estoque} {p.estoque <= p.estoqueMinimo && '(MÍNIMO)'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  // --- INICIO DO ESTOQUE ---
  const renderEstoque = () => {
    const prodSelecionado = produtos.find(
      (p) => p.id === idProdutoSelecionadoEdicao
    ) ||
      produtos[0] || {
        id: Date.now(),
        category: 'Porções',
        nome: 'Novo Produto',
        precoCusto: 0,
        preco: 0,
        estoque: 0,
        estoqueMinimo: 0,
        imagem: '',
      };

    const porcetagemLucro =
      prodSelecionado.precoCusto > 0
        ? (
            ((prodSelecionado.preco - prodSelecionado.precoCusto) /
              prodSelecionado.precoCusto) *
            100
          ).toFixed(2)
        : '0.00';

    // Filtro de relatório por data
    const produtosFiltradosRelatorio = produtos.filter((p) => {
      if (!buscaData) return true;
      const dataFormatada = buscaData.split('-').reverse().join('/');
      return p.dataUltimaCompra && p.dataUltimaCompra.includes(dataFormatada);
    });

    const styleBtn = {
      height: '45px',
      padding: '0 20px',
      borderRadius: '8px',
      border: 'none',
      color: 'white',
      fontWeight: 'bold',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    };

    // Estilo padrão para as etiquetas (nomes) acima das células
    const labelStyle = {
      fontSize: '11px',
      color: '#94a3b8',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      marginBottom: '5px',
      display: 'block',
      letterSpacing: '0.5px',
    };

    return (
      <div
        className="estoque-dark-container"
        style={{ padding: '20px', color: 'white' }}
      >
        {/* BOTÕES DE AÇÃO */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            marginBottom: '25px',
          }}
        >
          <button
            onClick={() => {
              const id = Date.now();
              setProdutos([
                ...produtos,
                {
                  id,
                  nome: 'Novo Produto',
                  category: 'Geral',
                  preco: 0,
                  precoCusto: 0,
                  estoque: 0,
                  imagem: '',
                },
              ]);
              setIdProdutoSelecionadoEdicao(id);
            }}
            style={{ ...styleBtn, background: '#3b82f6' }}
          >
            Novo Produto
          </button>
          <button
            onClick={() => {
              setCaixaDialogo({
                titulo: 'Nova Categoria',
                tipo: 'prompt_categoria',
                onConfirm: (n) => {
                  setCategoriasCustomizadas([...categoriasCustomizadas, n]);
                  dispararMensagem('Sucesso', 'Categoria salva!');
                },
              });
            }}
            style={{ ...styleBtn, background: '#a855f7' }}
          >
            Criar Categoria
          </button>
          <button
            onClick={() =>
              excluirProdutoDoEstoque(prodSelecionado.id, prodSelecionado.nome)
            }
            style={{ ...styleBtn, background: '#e74c3c' }}
          >
            Excluir
          </button>
          <button
            onClick={() => dispararMensagem('Sucesso', 'Alterações salvas!')}
            style={{ ...styleBtn, background: '#22c55e' }}
          >
            Salvar
          </button>
        </div>

        {/* CADASTRO E EDIÇÃO DE PRODUTO */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            background: '#1e293b',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #334155',
          }}
        >
          <div style={{ flex: 2 }}>
            <h3 style={{ color: '#f97316', margin: '0 0 20px 0' }}>
              Edição de Produto
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
              }}
            >
              {/* 1. PESQUISA */}
              <div style={{ width: '100%' }}>
                <label style={labelStyle}>Procurar Produto</label>
                <input
                  type="text"
                  placeholder="🔍 Procurar produto para editar..."
                  list="banco-produtos-cadastrados"
                  onChange={(e) => {
                    const produtoEncontrado = produtos.find(
                      (p) => p.nome === e.target.value
                    );
                    if (produtoEncontrado)
                      setIdProdutoSelecionadoEdicao(produtoEncontrado.id);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#1e293b',
                    border: '1px solid #3b82f6',
                    color: 'white',
                    borderRadius: '6px',
                    outline: 'none',
                  }}
                />
                <datalist id="banco-produtos-cadastrados">
                  {produtos.map((p) => (
                    <option key={p.id} value={p.nome} />
                  ))}
                </datalist>
              </div>

              {/* 2. NOME */}
              <div style={{ width: '100%' }}>
                <label style={labelStyle}>Nome do Produto</label>
                <input
                  value={prodSelecionado.nome}
                  onChange={(e) =>
                    atualizarPropriedadeProduto(
                      prodSelecionado.id,
                      'nome',
                      e.target.value
                    )
                  }
                  placeholder="Nome"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0f172a',
                    border: '1px solid #475569',
                    color: 'white',
                    borderRadius: '6px',
                  }}
                />
              </div>

              {/* 3. CATEGORIA */}
              <div style={{ width: '100%' }}>
                <label style={labelStyle}>Categoria</label>
                <select
                  value={prodSelecionado.category}
                  onChange={(e) => {
                    const novaCat = e.target.value;
                    setProdutos(
                      produtos.map((p) =>
                        p.id === prodSelecionado.id
                          ? { ...p, category: novaCat }
                          : p
                      )
                    );
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0f172a',
                    border: '1px solid #475569',
                    color: 'white',
                    borderRadius: '6px',
                  }}
                >
                  {Array.from(
                    new Set([
                      ...categoriasCustomizadas,
                      ...produtos.map((p) => p.category),
                    ])
                  ).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. PREÇO CUSTO */}
              <div style={{ width: '100%' }}>
                <label style={labelStyle}>Preço de Custo</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={`R$ ${prodSelecionado.precoCusto
                    .toFixed(2)
                    .replace('.', ',')}`}
                  onChange={(e) =>
                    handleChangeMoeda(
                      prodSelecionado.id,
                      'precoCusto',
                      e.target.value
                    )
                  }
                  placeholder="Custo R$"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0f172a',
                    border: '1px solid #475569',
                    color: 'white',
                    borderRadius: '6px',
                  }}
                />
              </div>

              {/* 5. PREÇO VENDA */}
              <div style={{ width: '100%' }}>
                <label style={labelStyle}>Preço de Venda</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={`R$ ${prodSelecionado.preco
                    .toFixed(2)
                    .replace('.', ',')}`}
                  onChange={(e) =>
                    handleChangeMoeda(
                      prodSelecionado.id,
                      'preco',
                      e.target.value
                    )
                  }
                  placeholder="Venda R$"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0f172a',
                    border: '1px solid #475569',
                    color: 'white',
                    borderRadius: '6px',
                  }}
                />
              </div>

              {/* 6. LUCRO */}
              <div style={{ width: '100%' }}>
                <label style={labelStyle}>Margem de Lucro</label>
                <div
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0f172a',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    color: '#10b981',
                    fontWeight: 'bold',
                  }}
                >
                  % Lucro: {porcetagemLucro}%
                </div>
              </div>

              {/* 7. QTD MÍNIMA */}
              <div style={{ width: '100%' }}>
                <label style={labelStyle}>Quantidade Mínima (Alerta)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={prodSelecionado.estoqueMinimo}
                  onChange={(e) =>
                    atualizarPropriedadeProduto(
                      prodSelecionado.id,
                      'estoqueMinimo',
                      parseInt(e.target.value) || 0
                    )
                  }
                  placeholder="Qtd. Mínima"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0f172a',
                    border: '1px solid #475569',
                    color: 'white',
                    borderRadius: '6px',
                  }}
                />
              </div>

              {/* 8. ADICIONAR ESTOQUE */}
              <div style={{ width: '100%' }}>
                <label style={labelStyle}>Entrada de Mercadoria</label>
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <input
                    type="number"
                    inputMode="numeric"
                    ref={inputQtdAdicionarRef}
                    placeholder="Add estoque..."
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: '#0f172a',
                      border: '1px solid #475569',
                      color: 'white',
                      borderRadius: '6px',
                    }}
                  />
                  <button
                    onClick={() => {
                      const v =
                        parseInt(inputQtdAdicionarRef.current?.value) || 0;
                      if (v > 0) {
                        setProdutos(
                          produtos.map((p) =>
                            p.id === prodSelecionado.id
                              ? { ...p, estoque: p.estoque + v }
                              : p
                          )
                        );
                        inputQtdAdicionarRef.current.value = '';
                      }
                    }}
                    style={{
                      padding: '0 15px',
                      background: '#f97316',
                      border: 'none',
                      color: 'white',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* 9. QUANTIDADE ATUAL REAL (EDIÇÃO DIRETA) */}
              <div style={{ width: '100%' }}>
                <label style={labelStyle}>Quantidade Atual em Estoque</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={prodSelecionado.estoque}
                  onChange={(e) =>
                    atualizarPropriedadeProduto(
                      prodSelecionado.id,
                      'estoque',
                      parseInt(e.target.value) || 0
                    )
                  }
                  placeholder="Ex: 50"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0f172a',
                    border: '1px solid #475569',
                    color: 'white',
                    borderRadius: '6px',
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ flex: 0.8, textAlign: 'center' }}>
            <label style={labelStyle}>Preview da Imagem</label>
            <img
              src={
                prodSelecionado.imagem ||
                BANCO_IMAGENS_AUTOMATICAS[prodSelecionado.category] ||
                ''
              }
              style={{
                width: '100%',
                height: '140px',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '2px solid #475569',
              }}
            />
            <input
              value={prodSelecionado.imagem}
              onChange={(e) =>
                atualizarPropriedadeProduto(
                  prodSelecionado.id,
                  'imagem',
                  e.target.value
                )
              }
              placeholder="URL Imagem"
              style={{
                marginTop: '10px',
                padding: '10px',
                background: '#0f172a',
                border: '1px solid #475569',
                color: 'white',
                borderRadius: '6px',
                width: '100%',
              }}
            />
          </div>
        </div>

        {/* RELATÓRIO COM FILTRO */}
        <div
          style={{
            background: '#1e293b',
            padding: '20px',
            borderRadius: '12px',
            marginTop: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3 style={{ color: '#f97316' }}>Relatório de Estoque</h3>
            {/* Botão de data aumentado com padding e fonte expandidos */}
            <input
              type="date"
              onChange={(e) => setBuscaData(e.target.value)}
              style={{
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: 'bold',
                background: '#0f172a',
                color: 'white',
                border: '2px solid #475569',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            />
          </div>

          {/* Container com limite de altura e rolagem (função de correr) para a tabela */}
          <div
            style={{
              maxHeight: '280px',
              overflowY: 'auto',
              marginTop: '15px',
              border: '1px solid #334155',
              borderRadius: '8px',
            }}
          >
            <table
              style={{
                width: '100%',
                color: 'white',
                borderCollapse: 'collapse',
              }}
            >
              <thead
                style={{
                  position: 'sticky',
                  top: 0,
                  background: '#1e293b',
                  zIndex: 1,
                }}
              >
                <tr
                  style={{
                    borderBottom: '2px solid #475569',
                    textAlign: 'left',
                  }}
                >
                  <th style={{ padding: '12px' }}>Produto</th>
                  <th style={{ padding: '12px' }}>Estoque</th>
                  <th style={{ padding: '12px' }}>Custo</th>
                  <th style={{ padding: '12px' }}>Venda</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltradosRelatorio.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setIdProdutoSelecionadoEdicao(p.id)}
                    style={{
                      borderBottom: '1px solid #334155',
                      cursor: 'pointer',
                    }}
                  >
                    <td style={{ padding: '12px' }}>{p.nome}</td>
                    <td style={{ padding: '12px' }}>{p.estoque} un</td>
                    <td style={{ padding: '12px' }}>
                      {formatarMoeda(p.precoCusto)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {formatarMoeda(p.preco)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  // --- FIM DO ESTOQUE ---
  const renderFinanceiro = () => {
    const parseDataDMBY = (dataStr) => {
      if (!dataStr) return new Date(0);
      const partes = dataStr.split(',')[0].split('/');
      return new Date(`${partes[2]}-${partes[1]}-${partes[0]}T12:00:00`);
    };

    const inicioDate = filtroRelatorioInicio
      ? new Date(`${filtroRelatorioInicio}T00:00:00`)
      : null;
    const fimDate = filtroRelatorioFim
      ? new Date(`${filtroRelatorioFim}T23:59:59`)
      : null;

    const vendasFiltradas = vendas.filter((v) => {
      const vDate = parseDataDMBY(v.data);
      if (inicioDate && vDate < inicioDate) return false;
      if (fimDate && vDate > fimDate) return false;
      return true;
    });

    let totalVendidoRelatorio = 0;
    let totalCustoRelatorio = 0;

    vendasFiltradas.forEach((v) => {
      totalVendidoRelatorio += v.total;
      if (v.itensConsumidos) {
        v.itensConsumidos.forEach((item) => {
          const prodOriginal = produtos.find((p) => p.nome === item.nome);
          const custo = prodOriginal ? prodOriginal.precoCusto : 0;
          totalCustoRelatorio += custo * item.qtd;
        });
      }
    });

    const totalLucroRelatorio = totalVendidoRelatorio - totalCustoRelatorio;

    const imprimirRelatorioFinanceiro = () => {
      const periodo =
        filtroRelatorioInicio || filtroRelatorioFim
          ? `De ${
              filtroRelatorioInicio
                ? filtroRelatorioInicio.split('-').reverse().join('/')
                : 'Início'
            } até ${
              filtroRelatorioFim
                ? filtroRelatorioFim.split('-').reverse().join('/')
                : 'Hoje'
            }`
          : 'Todo o Período';

      dispararMensagem(
        `RELATÓRIO DE DESEMPENHO`,
        `Módulo Financeiro: ${nomeSoftware}\nPeríodo: ${periodo}\n----------------------------------------\nTotal de Vendas: ${
          vendasFiltradas.length
        }\nFaturamento Bruto: ${formatarMoeda(
          totalVendidoRelatorio
        )}\nCusto Total Estimado: ${formatarMoeda(
          totalCustoRelatorio
        )}\nLucro Líquido: ${formatarMoeda(
          totalLucroRelatorio
        )}\n----------------------------------------\n* DOCUMENTO GERENCIAL INTERNO *`
      );
    };

    const filtrarPendente = (d) => {
      if (!d.vencimento) return true;
      if (filtroPendenteInicio && d.vencimento < filtroPendenteInicio)
        return false;
      if (filtroPendenteFim && d.vencimento > filtroPendenteFim) return false;
      return true;
    };

    const filtrarPago = (d) => {
      if (!d.vencimento) return true;
      if (filtroPagoInicio && d.vencimento < filtroPagoInicio) return false;
      if (filtroPagoFim && d.vencimento > filtroPagoFim) return false;
      return true;
    };

    const despesasPendentes = [...despesas]
      .filter((d) => d.status === 'Pendente' && filtrarPendente(d))
      .sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento));
    const despesasPagas = [...despesas]
      .filter((d) => d.status === 'Paga' && filtrarPago(d))
      .sort((a, b) => new Date(b.vencimento) - new Date(a.vencimento));

    return (
      <div className="single-container">
        <h2>Fluxo de Caixa & Indicadores Financeiros</h2>

        <div className="financeiro-top-row">
          <div className="card-panel">
            <h3>+ Lançar Saída de Caixa (Contas a Vencer)</h3>
            <form onSubmit={lancarDespesa} className="form-fin-bloco">
              <input
                type="text"
                placeholder="Descrição da Conta / Boleto / Despesa"
                value={novaDespesaDesc}
                onChange={(e) => setNovaDespesaDesc(e.target.value)}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Valor R$"
                value={novaDespesaValor}
                onChange={(e) => setNovaDespesaValor(e.target.value)}
              />
              <input
                type="date"
                value={novaDespesaVenc}
                onChange={(e) => setNovaDespesaVenc(e.target.value)}
              />
              <button
                type="submit"
                className="btn-add-fin"
                style={{ background: '#e74c3c' }}
              >
                Lançar Despesa (Pendente)
              </button>
            </form>
          </div>

          <div
            className="img-dashboard-container"
            style={{ flex: 1, minWidth: '300px' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px',
                flexWrap: 'wrap',
                gap: '10px',
              }}
              className="layout-financeiro-header"
            >
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#94a3b8',
                  }}
                >
                  Filtrar:
                </span>
                <input
                  type="date"
                  value={filtroRelatorioInicio}
                  onChange={(e) => setFiltroRelatorioInicio(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    background: '#111c2a',
                    border: '1px solid #1a293a',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <input
                  type="date"
                  value={filtroRelatorioFim}
                  onChange={(e) => setFiltroRelatorioFim(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    background: '#111c2a',
                    border: '1px solid #1a293a',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
              <button
                onClick={imprimirRelatorioFinanceiro}
                style={{
                  background: 'var(--blue)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 15px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: '600',
                }}
              >
                <i className="fas fa-print"></i> Imprimir
              </button>
            </div>

            <div
              className="img-dash-row-top"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '10px',
              }}
            >
              <div
                className="img-dash-card"
                style={{ minHeight: '110px', padding: '10px' }}
              >
                <div className="img-dash-header" style={{ gap: '6px' }}>
                  <div
                    className="img-dash-icon totalv"
                    style={{ width: '32px', height: '32px', fontSize: '14px' }}
                  >
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div className="img-dash-title" style={{ fontSize: '10px' }}>
                    Vendido
                  </div>
                </div>
                <div
                  className="img-dash-value totalv"
                  style={{ fontSize: '16px' }}
                >
                  {formatarMoeda(totalVendidoRelatorio)}
                </div>
              </div>

              <div
                className="img-dash-card"
                style={{ minHeight: '110px', padding: '10px' }}
              >
                <div className="img-dash-header" style={{ gap: '6px' }}>
                  <div
                    className="img-dash-icon"
                    style={{
                      background: '#7f1d1d',
                      color: '#f87171',
                      width: '32px',
                      height: '32px',
                      fontSize: '14px',
                    }}
                  >
                    <i className="fas fa-boxes"></i>
                  </div>
                  <div className="img-dash-title" style={{ fontSize: '10px' }}>
                    Custo
                  </div>
                </div>
                <div
                  className="img-dash-value"
                  style={{ color: '#f87171', fontSize: '16px' }}
                >
                  {formatarMoeda(totalCustoRelatorio)}
                </div>
              </div>

              <div
                className="img-dash-card"
                style={{ minHeight: '110px', padding: '10px' }}
              >
                <div className="img-dash-header" style={{ gap: '6px' }}>
                  <div
                    className="img-dash-icon"
                    style={{
                      background: '#1e3a8a',
                      color: '#60a5fa',
                      width: '32px',
                      height: '32px',
                      fontSize: '14px',
                    }}
                  >
                    <i className="fas fa-hand-holding-usd"></i>
                  </div>
                  <div className="img-dash-title" style={{ fontSize: '10px' }}>
                    Lucro
                  </div>
                </div>
                <div
                  className="img-dash-value"
                  style={{ color: '#60a5fa', fontSize: '16px' }}
                >
                  {formatarMoeda(totalLucroRelatorio)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid-financeiro-tabelas">
          <div className="card-panel">
            <h3>📕 Contas a Pagar (Pendentes)</h3>

            <div
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                background: '#f8fafc',
                padding: '10px',
                borderRadius: '6px',
                marginBottom: '15px',
                border: '1px solid var(--border)',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'var(--text-dark)',
                }}
              >
                Vencimento:
              </span>
              <input
                type="date"
                value={filtroPendenteInicio}
                onChange={(e) => setFiltroPendenteInicio(e.target.value)}
                style={{
                  padding: '4px 8px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '11px' }}>até</span>
              <input
                type="date"
                value={filtroPendenteFim}
                onChange={(e) => setFiltroPendenteFim(e.target.value)}
                style={{
                  padding: '4px 8px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
              {(filtroPendenteInicio || filtroPendenteFim) && (
                <button
                  onClick={() => {
                    setFiltroPendenteInicio('');
                    setFiltroPendenteFim('');
                  }}
                  style={{
                    background: '#718096',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="wrapper-tabela-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Vencimento</th>
                    <th>Valor</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {despesasPendentes.map((d) => (
                    <tr key={d.id}>
                      <td>{d.descricao}</td>
                      <td>{d.vencimento.split('-').reverse().join('/')}</td>
                      <td style={{ color: 'red', fontWeight: 'bold' }}>
                        {formatarMoeda(d.valor)}
                      </td>
                      <td>
                        {despesaEmBaixa && despesaEmBaixa.id === d.id ? (
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                            }}
                          >
                            <input
                              type="date"
                              value={dataBaixaManual}
                              onChange={(e) =>
                                setDataBaixaManual(e.target.value)
                              }
                              style={{
                                padding: '4px',
                                border: '1px solid var(--orange)',
                                borderRadius: '4px',
                                fontSize: '12px',
                              }}
                            />
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                onClick={() =>
                                  baixarDespesaManual(
                                    d.id,
                                    despesaEmBaixa.forma,
                                    dataBaixaManual
                                  )
                                }
                                style={{
                                  background: 'var(--green)',
                                  color: 'white',
                                  border: 'none',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  fontWeight: '600',
                                }}
                              >
                                Confirmar
                              </button>
                              <button
                                onClick={() => setDespesaEmBaixa(null)}
                                style={{
                                  background: '#718096',
                                  color: 'white',
                                  border: 'none',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                }}
                              >
                                Voltar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <select
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) {
                                setDataBaixaManual(
                                  new Date().toISOString().split('T')[0]
                                );
                                setDespesaEmBaixa({
                                  id: d.id,
                                  forma: e.target.value,
                                });
                              }
                            }}
                            className="input-tabela"
                            style={{ width: 'auto', padding: '4px' }}
                          >
                            <option value="" disabled>
                              Dar Baixa...
                            </option>
                            <option value="Dinheiro">Dinheiro</option>
                            <option value="Cartão">Cartão</option>
                            <option value="Boleto">Boleto</option>
                            <option value="PIX">PIX</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                  {despesasPendentes.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        style={{
                          textAlign: 'center',
                          color: '#888',
                          fontStyle: 'italic',
                        }}
                      >
                        Nenhuma conta pendente no período.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card-panel">
            <h3>✅ Histórico de Contas Pagas</h3>

            <div
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                background: '#f8fafc',
                padding: '10px',
                borderRadius: '6px',
                marginBottom: '15px',
                border: '1px solid var(--border)',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'var(--text-dark)',
                }}
              >
                Vencimento:
              </span>
              <input
                type="date"
                value={filtroPagoInicio}
                onChange={(e) => setFiltroPagoInicio(e.target.value)}
                style={{
                  padding: '4px 8px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '11px' }}>até</span>
              <input
                type="date"
                value={filtroPagoFim}
                onChange={(e) => setFiltroPagoFim(e.target.value)}
                style={{
                  padding: '4px 8px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
              {(filtroPagoInicio || filtroPagoFim) && (
                <button
                  onClick={() => {
                    setFiltroPagoInicio('');
                    setFiltroPagoFim('');
                  }}
                  style={{
                    background: '#718096',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="wrapper-tabela-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Vencimento</th>
                    <th>Pago em</th>
                    <th>Valor</th>
                    <th>Forma</th>
                  </tr>
                </thead>
                <tbody>
                  {despesasPagas.map((d) => (
                    <tr key={d.id}>
                      <td>{d.descricao}</td>
                      <td>{d.vencimento.split('-').reverse().join('/')}</td>
                      <td>
                        <span
                          style={{ color: 'var(--blue)', fontWeight: '500' }}
                        >
                          {d.dataPagamento
                            ? d.dataPagamento.split('-').reverse().join('/')
                            : 'N/A'}
                        </span>
                      </td>
                      <td style={{ color: 'green', fontWeight: 'bold' }}>
                        {formatarMoeda(d.valor)}
                      </td>
                      <td>
                        <span className="status-pago">{d.formaPagamento}</span>
                      </td>
                    </tr>
                  ))}
                  {despesasPagas.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          textAlign: 'center',
                          color: '#888',
                          fontStyle: 'italic',
                        }}
                      >
                        Nenhuma conta paga no período.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCrediario = () => {
    const pendentes = crediarios.filter((c) => c.status === 'Pendente');
    const pagas = crediarios.filter((c) => c.status === 'Pago');

    const pendentesAgrupados = [];
    pendentes.forEach((c) => {
      const existente = pendentesAgrupados.find(
        (g) => g.cliente.toLowerCase() === c.cliente.toLowerCase()
      );
      if (existente) {
        existente.total += c.total;
        existente.comandas.push(c);
      } else {
        pendentesAgrupados.push({
          cliente: c.cliente,
          total: c.total,
          comandas: [c],
        });
      }
    });

    const pagasAgrupadas = [];
    pagas.forEach((c) => {
      const valorPago = c.pagamentos
        ? c.pagamentos.reduce((acc, p) => acc + p.valor, 0)
        : 0;

      const existente = pagasAgrupadas.find(
        (g) => g.cliente.toLowerCase() === c.cliente.toLowerCase()
      );
      if (existente) {
        existente.total += valorPago;
        existente.comandas.push({ ...c, valorPagoTotal: valorPago });
      } else {
        pagasAgrupadas.push({
          cliente: c.cliente,
          total: valorPago,
          comandas: [{ ...c, valorPagoTotal: valorPago }],
        });
      }
    });

    return (
      <div className="single-container">
        <h2>Livro Negro de Penduras (Controle de Crediário)</h2>

        <input
          type="text"
          className="search-box"
          placeholder="🔍 Buscar cliente no crediário..."
          value={buscaCrediario}
          onChange={(e) => setBuscaCrediario(e.target.value)}
        />

        <div className="grid-financeiro-tabelas">
          <div className="card-panel">
            <h3>📕 Penduras Devidas (Agrupadas por Cliente)</h3>
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Total Acumulado Devido</th>
                  <th>Liquidar Acumulado (Baixa na Soma)</th>
                </tr>
              </thead>
              <tbody>
                {pendentesAgrupados
                  .filter((g) =>
                    g.cliente
                      .toLowerCase()
                      .includes(buscaCrediario.toLowerCase())
                  )
                  .map((g) => (
                    <tr key={g.cliente} className="linha-clicavel">
                      <td
                        onClick={() =>
                          setExpandedCliente(
                            expandedCliente === g.cliente ? null : g.cliente
                          )
                        }
                      >
                        <strong>
                          <i
                            className="fas fa-user"
                            style={{ marginRight: '6px', color: '#d35400' }}
                          ></i>
                          {g.cliente}
                        </strong>
                        <small style={{ display: 'block', color: '#7f8c8d' }}>
                          (Contem {g.comandas.length} comanda(s) pendente(s) -
                          Clique para ver)
                        </small>

                        {expandedCliente === g.cliente && (
                          <div
                            className="detalhe-comandas-bloco"
                            style={{ marginTop: '10px' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <strong
                              style={{
                                fontSize: '12px',
                                display: 'block',
                                marginBottom: '8px',
                                color: '#2c3e50',
                              }}
                            >
                              Comandas Desmembradas:
                            </strong>
                            {g.comandas.map((c) => (
                              <div
                                key={c.idCred}
                                style={{
                                  borderBottom: '1px solid #e2e8f0',
                                  paddingBottom: '10px',
                                  marginBottom: '10px',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontWeight: '600',
                                    fontSize: '13px',
                                    color: '#555',
                                  }}
                                >
                                  <span>📅 {c.data}</span>
                                  <span
                                    style={{
                                      color: '#d35400',
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    {formatarMoeda(c.total)}
                                  </span>
                                </div>
                                <div className="caixa-produtos-consumidos">
                                  {c.itensConsumidos &&
                                    c.itensConsumidos.map((it, idx) => (
                                      <div
                                        key={idx}
                                        style={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                        }}
                                      >
                                        <span>
                                          {it.qtd}x {it.nome}
                                        </span>
                                        <span>
                                          {formatarMoeda(it.preco * it.qtd)}
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td
                        style={{
                          fontWeight: 'bold',
                          color: '#d35400',
                          fontSize: '15px',
                        }}
                        onClick={() =>
                          setExpandedCliente(
                            expandedCliente === g.cliente ? null : g.cliente
                          )
                        }
                      >
                        {formatarMoeda(g.total)}
                      </td>
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            gap: '4px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              gap: '8px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <button
                              className="btn-add-fin"
                              style={{
                                background: '#27ae60',
                                padding: '12px 20px', // Aumentei o padding
                                fontSize: '14px', // Aumentei a fonte
                                fontWeight: 'bold',
                                margin: '4px',
                                borderRadius: '8px',
                              }}
                              onClick={() =>
                                liquidarVáriasComandasCrediario(
                                  g.comandas,
                                  g.cliente,
                                  'Dinheiro'
                                )
                              }
                            >
                              💵 Dinheiro
                            </button>
                            <button
                              className="btn-add-fin"
                              style={{
                                background: '#00b894',
                                padding: '12px 20px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                margin: '4px',
                                borderRadius: '8px',
                              }}
                              onClick={() =>
                                liquidarVáriasComandasCrediario(
                                  g.comandas,
                                  g.cliente,
                                  'Pix'
                                )
                              }
                            >
                              ⚡ Pix
                            </button>
                            <button
                              className="btn-add-fin"
                              style={{
                                background: '#2980b9',
                                padding: '12px 20px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                margin: '4px',
                                borderRadius: '8px',
                              }}
                              onClick={() =>
                                liquidarVáriasComandasCrediario(
                                  g.comandas,
                                  g.cliente,
                                  'Cartão'
                                )
                              }
                            >
                              💳 Cartão
                            </button>
                            <button
                              className="btn-add-fin"
                              style={{
                                background: '#e67e22',
                                padding: '12px 20px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                margin: '4px',
                                borderRadius: '8px',
                              }}
                              onClick={() =>
                                liquidarVáriasComandasCrediario(
                                  g.comandas,
                                  g.cliente,
                                  'Parcial'
                                )
                              }
                            >
                              🌓 Parcial
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="card-panel">
            <h3>✅ Penduras Pagas (Agrupadas por Cliente)</h3>
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Total Histórico Pago</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pagasAgrupadas
                  .filter((g) =>
                    g.cliente
                      .toLowerCase()
                      .includes(buscaCrediario.toLowerCase())
                  )
                  .map((g) => {
                    const metodosUsados = Array.from(
                      new Set(
                        g.comandas.flatMap(
                          (c) => c.pagamentos?.map((p) => p.metodo) || []
                        )
                      )
                    )
                      .filter(Boolean)
                      .join(', ');

                    return (
                      <tr key={g.cliente} className="linha-clicavel">
                        <td
                          onClick={() =>
                            setExpandedClientePago(
                              expandedClientePago === g.cliente
                                ? null
                                : g.cliente
                            )
                          }
                        >
                          <strong>
                            <i
                              className="fas fa-user"
                              style={{ marginRight: '6px', color: '#2ecc71' }}
                            ></i>
                            {g.cliente}
                          </strong>

                          {expandedClientePago === g.cliente && (
                            <div
                              className="detalhe-comandas-bloco"
                              style={{ marginTop: '10px' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {g.comandas.map((c) => (
                                <div
                                  key={c.idCred}
                                  style={{
                                    borderBottom: '1px solid #cbd5e1',
                                    paddingBottom: '6px',
                                    marginBottom: '6px',
                                  }}
                                >
                                  <div
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      fontSize: '12px',
                                      fontWeight: '600',
                                    }}
                                  >
                                    <span>📅 {c.data}</span>
                                    <span style={{ color: 'green' }}>
                                      {formatarMoeda(c.valorPagoTotal)}
                                    </span>
                                  </div>
                                  <div className="caixa-produtos-consumidos">
                                    {c.itensConsumidos &&
                                      c.itensConsumidos.map((it, idx) => (
                                        <div
                                          key={idx}
                                          style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                          }}
                                        >
                                          <span>
                                            {it.qtd}x {it.nome}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                  {c.pagamentos?.map((p, i) => (
                                    <div
                                      key={i}
                                      style={{
                                        fontSize: '11px',
                                        color: '#666',
                                      }}
                                    >
                                      Pago via: {p.metodo} (
                                      {formatarMoeda(p.valor)}) -{' '}
                                      {p.data?.split(',')[0]}
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td style={{ fontWeight: 'bold', color: 'green' }}>
                          {formatarMoeda(g.total)}
                          {metodosUsados && (
                            <div
                              style={{
                                fontSize: '11px',
                                color: '#666',
                                marginTop: '4px',
                              }}
                            >
                              <i className="fas fa-money-check-alt"></i>{' '}
                              Forma(s): {metodosUsados}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="status-pago">TOTALMENTE PAGO</span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div
        className="topbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 'auto',
          padding: '10px 15px',
          gap: '20px',
          flexWrap: 'wrap',
        }}
      >
        {/* 🏷️ LOGO ALINHADO NA ESQUERDA: Posicionado antes dos botões para nunca mais ser coberto */}
        <div
          className="bar-logo"
          style={{
            position: 'static',
            transform: 'none',
            fontSize: '24px',
            fontWeight: '900',
            color: '#f97316',
            letterSpacing: '1px',
            whiteSpace: 'nowrap',
          }}
        >
          {nomeSoftware}
        </div>

        <div
          className="topbar-menu"
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {/* 📱 BOTÃO PDV */}
          <button
            className={telaAtual === 'pdv' ? 'active' : ''}
            onClick={() => navegarPara('pdv')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '70px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 'bold',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border:
                telaAtual === 'pdv' ? '2px solid #f97316' : '2px solid #334155',
              background: telaAtual === 'pdv' ? '#f97316' : '#1e293b',
              color: '#ffffff',
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
            }}
          >
            <i className="fas fa-calculator" style={{ fontSize: '18px' }}></i>{' '}
            PDV
          </button>

          {/* 📦 BOTÃO ESTOQUE */}
          <button
            className={
              telaAtual === 'estoque' ||
              (telaAtual === 'login_gerencial' &&
                proximaTelaPendente === 'estoque')
                ? 'active'
                : ''
            }
            onClick={() => navegarPara('estoque')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '70px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 'bold',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border:
                telaAtual === 'estoque' ||
                (telaAtual === 'login_gerencial' &&
                  proximaTelaPendente === 'estoque')
                  ? '2px solid #f97316'
                  : '2px solid #334155',
              background:
                telaAtual === 'estoque' ||
                (telaAtual === 'login_gerencial' &&
                  proximaTelaPendente === 'estoque')
                  ? '#f97316'
                  : '#1e293b',
              color: '#ffffff',
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
            }}
          >
            <i className="fas fa-boxes" style={{ fontSize: '18px' }}></i>{' '}
            Estoque
          </button>

          <button
            className={telaAtual === 'auditoria' ? 'active' : ''}
            onClick={() => navegarPara('auditoria')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '70px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 'bold',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border:
                telaAtual === 'auditoria'
                  ? '2px solid #f97316'
                  : '2px solid #334155',
              background: telaAtual === 'auditoria' ? '#f97316' : '#1e293b',
              color: '#ffffff',
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
            }}
          >
            <i
              className="fas fa-clipboard-list"
              style={{ fontSize: '18px' }}
            ></i>{' '}
            Auditoria
          </button>

          {/* 👤 BOTÃO CLIENTES */}
          <button
            className={
              telaAtual === 'clientes' ||
              (telaAtual === 'login_gerencial' &&
                proximaTelaPendente === 'clientes')
                ? 'active'
                : ''
            }
            onClick={() => navegarPara('clientes')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '70px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 'bold',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border:
                telaAtual === 'clientes' ||
                (telaAtual === 'login_gerencial' &&
                  proximaTelaPendente === 'clientes')
                  ? '2px solid #f97316'
                  : '2px solid #334155',
              background:
                telaAtual === 'clientes' ||
                (telaAtual === 'login_gerencial' &&
                  proximaTelaPendente === 'clientes')
                  ? '#f97316'
                  : '#1e293b',
              color: '#ffffff',
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
            }}
          >
            <i className="fas fa-users" style={{ fontSize: '18px' }}></i>{' '}
            Clientes
          </button>

          {/* 📊 BOTÃO FINANCEIRO */}
          <button
            className={
              telaAtual === 'financeiro' ||
              (telaAtual === 'login_gerencial' &&
                proximaTelaPendente === 'financeiro')
                ? 'active'
                : ''
            }
            onClick={() => navegarPara('financeiro')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '70px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 'bold',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border:
                telaAtual === 'financeiro' ||
                (telaAtual === 'login_gerencial' &&
                  proximaTelaPendente === 'financeiro')
                  ? '2px solid #f97316'
                  : '2px solid #334155',
              background:
                telaAtual === 'financeiro' ||
                (telaAtual === 'login_gerencial' &&
                  proximaTelaPendente === 'financeiro')
                  ? '#f97316'
                  : '#1e293b',
              color: '#ffffff',
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
            }}
          >
            <i className="fas fa-chart-line" style={{ fontSize: '18px' }}></i>{' '}
            Financeiro
          </button>

          {/* 📕 BOTÃO CREDIÁRIO */}
          <button
            className={
              telaAtual === 'crediario' ||
              (telaAtual === 'login_gerencial' &&
                proximaTelaPendente === 'crediario')
                ? 'active'
                : ''
            }
            onClick={() => navegarPara('crediario')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '70px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 'bold',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border:
                telaAtual === 'crediario' ||
                (telaAtual === 'login_gerencial' &&
                  proximaTelaPendente === 'crediario')
                  ? '2px solid #f97316'
                  : '2px solid #334155',
              background:
                telaAtual === 'crediario' ||
                (telaAtual === 'login_gerencial' &&
                  proximaTelaPendente === 'crediario')
                  ? '#f97316'
                  : '#1e293b',
              color: '#ffffff',
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
            }}
          >
            <i className="fas fa-book-dead" style={{ fontSize: '18px' }}></i>{' '}
            Crediário
          </button>

          {/* 🛡️ BOTÃO ACESSOS */}
          {autenticado && usuarioLogado && usuarioLogado.perfil === 'admin' && (
            <button
              className={telaAtual === 'seguranca' ? 'active' : ''}
              onClick={() => navegarPara('seguranca')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '80px',
                height: '70px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 'bold',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border:
                  telaAtual === 'seguranca'
                    ? '2px solid #f97316'
                    : '2px solid #475569',
                background: telaAtual === 'seguranca' ? '#f97316' : '#4a5568',
                color: '#ffffff',
                boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
              }}
            >
              <i
                className="fas fa-user-shield"
                style={{ fontSize: '18px' }}
              ></i>{' '}
              Acessos
            </button>
          )}
        </div>

        <div className="user-info">
          <span>
            <i
              className="fas fa-circle"
              style={{
                color: autenticado ? 'green' : '#cbd5e1',
                fontSize: '10px',
              }}
            ></i>{' '}
            {autenticado && usuarioLogado
              ? `Logado: ${usuarioLogado.usuario.toUpperCase()} (${
                  usuarioLogado.perfil
                })`
              : 'Sistema Bloqueado'}
          </span>
          {autenticado && (
            <button
              onClick={logoutSistema}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#e74c3c',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Sair <i className="fas fa-sign-out-alt"></i>
            </button>
          )}
        </div>
      </div>

      {telaAtual === 'pdv' && autenticado && renderPDV()}
      {telaAtual === 'login_gerencial' && renderLoginGerencial()}
      {telaAtual === 'estoque' && autenticado && renderEstoque()}
      {telaAtual === 'clientes' && autenticado && renderClientesScreen()}
      {telaAtual === 'financeiro' && autenticado && renderFinanceiro()}
      {telaAtual === 'crediario' && autenticado && renderCrediario()}
      {telaAtual === 'seguranca' &&
        autenticado &&
        usuarioLogado &&
        usuarioLogado.perfil === 'admin' &&
        renderSeguranca()}

      {/* 📋 TELA DE AUDITORIA */}
      {telaAtual === 'auditoria' && autenticado && (
        <div className="single-container">
          <h2>📋 Auditoria de Movimentações</h2>
          <div className="wrapper-tabela-scroll">
            <table className="tabela-padrao">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Operador</th>
                  <th>Motivo</th>
                  <th>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {logsAuditoria.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.data).toLocaleString()}</td>
                    <td>{log.tipo}</td>
                    <td>{log.operador}</td>
                    <td>{log.motivo}</td>
                    <td>{JSON.stringify(log.detalhes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO DE USUÁRIO */}
      {usuarioEditando && (
        <div className="custom-dialog-overlay">
          <div className="custom-dialog-box">
            <div className="custom-dialog-title" style={{ color: '#3498db' }}>
              <i className="fas fa-user-edit"></i>
              <span>Editar Usuário: {usuarioEditando.usuario}</span>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  color: '#94a3b8',
                  marginBottom: '5px',
                }}
              >
                Perfil de Acesso:
              </label>
              <select
                className="dark-input-field"
                value={usuarioEditando.perfil}
                onChange={(e) =>
                  setUsuarioEditando({
                    ...usuarioEditando,
                    perfil: e.target.value,
                  })
                }
              >
                <option value="operador">Operador (Acesso Restrito)</option>
                <option value="admin">Administrador (Acesso Total)</option>
              </select>
            </div>

            {usuarioEditando.perfil === 'operador' && (
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#94a3b8',
                    marginBottom: '5px',
                  }}
                >
                  Selecione as telas que serão BLOQUEADAS para ele:
                </label>
                <div
                  className="checkbox-group"
                  style={{
                    color: 'white',
                    background: '#0f172a',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #1e293b',
                  }}
                >
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={(usuarioEditando.restricoes || []).includes(
                        'estoque'
                      )}
                      onChange={() => toggleRestricaoEdicao('estoque')}
                    />{' '}
                    Estoque
                  </label>
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={(usuarioEditando.restricoes || []).includes(
                        'financeiro'
                      )}
                      onChange={() => toggleRestricaoEdicao('financeiro')}
                    />{' '}
                    Painel Financeiro
                  </label>
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={(usuarioEditando.restricoes || []).includes(
                        'crediario'
                      )}
                      onChange={() => toggleRestricaoEdicao('crediario')}
                    />{' '}
                    Penduras/Crediário
                  </label>
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={(usuarioEditando.restricoes || []).includes(
                        'seguranca'
                      )}
                      onChange={() => toggleRestricaoEdicao('seguranca')}
                    />{' '}
                    Segurança (Acessos)
                  </label>
                </div>
              </div>
            )}

            <div className="custom-dialog-buttons">
              <button
                type="button"
                className="btn-dialog-cancel"
                onClick={() => setUsuarioEditando(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-dialog-confirm"
                style={{ background: '#3498db' }}
                onClick={salvarEdicaoUsuario}
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEMAIS MODAIS DO SISTEMA */}
      {caixaDialogo && (
        <div className="custom-dialog-overlay">
          <div className="custom-dialog-box">
            <div className="custom-dialog-title">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{caixaDialogo.titulo}</span>
            </div>
            <div className="custom-dialog-message">{caixaDialogo.mensagem}</div>

            {caixaDialogo.tipo === 'prompt' && (
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="text"
                  className="dark-input-field"
                  placeholder="Digite o valor..."
                  style={{
                    textAlign: 'left',
                    background: '#090f17',
                    border: '1px solid #ef4444',
                  }}
                  value={promptVal}
                  onChange={(e) => setPromptVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      caixaDialogo.onConfirm(promptVal);
                      setCaixaDialogo(null);
                    }
                  }}
                  autoFocus
                />
              </div>
            )}

            {caixaDialogo.tipo === 'prompt_categoria' && (
              // ... mantém o código original da categoria aqui ...
              <div
                style={{
                  marginBottom: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px',
                }}
              >
                <input
                  type="text"
                  className="dark-input-field"
                  placeholder="Nome da Categoria..."
                  style={{
                    textAlign: 'left',
                    background: '#090f17',
                    border: '1px solid #ef4444',
                  }}
                  value={promptVal}
                  onChange={(e) => setPromptVal(e.target.value)}
                  autoFocus
                />
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    color: '#cbd5e1',
                  }}
                >
                  <input
                    type="checkbox"
                    style={{ width: 'auto', margin: 0 }}
                    checked={promptValDivisivel}
                    onChange={(e) => setPromptValDivisivel(e.target.checked)}
                  />
                  <span>
                    Permitir dividir produtos desta categoria nas mesas?
                  </span>
                </label>
              </div>
            )}

            {/* 👇 NOVO: RENDERIZADOR DOS SEUS BOTÕES DE MOTIVO RÁPIDO 👇 */}
            {caixaDialogo.tipo === 'motivos_botoes' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  marginBottom: '20px',
                }}
              >
                {caixaDialogo.botoes.map((motivo) => (
                  <button
                    key={motivo}
                    type="button"
                    style={{
                      background: '#f97316',
                      color: 'white',
                      padding: '14px',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
                    }}
                    onClick={() => {
                      caixaDialogo.onSelect(motivo);
                      setCaixaDialogo(null);
                    }}
                  >
                    {motivo}
                  </button>
                ))}
              </div>
            )}

            <div
              className="custom-dialog-buttons"
              style={{ gap: '10px', flexWrap: 'wrap' }}
            >
              {caixaDialogo.tipo !== 'alert' && !caixaDialogo.noCancel && (
                <button
                  type="button"
                  className="btn-dialog-cancel"
                  onClick={() => {
                    if (caixaDialogo.onCancel) caixaDialogo.onCancel();
                    setCaixaDialogo(null);
                  }}
                >
                  {caixaDialogo.cancelTxt || 'Cancelar'}
                </button>
              )}

              {/* Oculta o botão de confirmação padrão se for o menu de botões de motivo */}
              {caixaDialogo.tipo !== 'motivos_botoes' && (
                <button
                  type="button"
                  className="btn-dialog-confirm"
                  onClick={() => {
                    if (caixaDialogo.tipo === 'prompt') {
                      caixaDialogo.onConfirm(promptVal);
                    } else if (caixaDialogo.tipo === 'prompt_categoria') {
                      caixaDialogo.onConfirm(promptVal, promptValDivisivel);
                    } else {
                      caixaDialogo.onConfirm();
                    }
                    if (
                      caixaDialogo.tipo !== 'prompt' &&
                      caixaDialogo.tipo !== 'prompt_categoria'
                    ) {
                      setCaixaDialogo(null);
                    }
                  }}
                >
                  {caixaDialogo.confirmTxt || 'Confirmar'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DIVISÃO */}
      {modalDividir && (
        <div className="custom-dialog-overlay">
          <div className="custom-dialog-box" style={{ maxWidth: '460px' }}>
            <div className="custom-dialog-title" style={{ color: '#38bdf8' }}>
              <i className="fas fa-divide"></i>
              <span>Dividir Item: {modalDividir.item.nome}</span>
            </div>
            <div
              className="custom-dialog-message"
              style={{ marginBottom: '15px' }}
            >
              Selecione quais comandas ativas abertas irão rachar este item com
              a comanda de <strong>{comandaAtual.nome}</strong>:
            </div>

            <div
              style={{
                maxHeight: '180px',
                overflowY: 'auto',
                background: '#090f17',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #1e293b',
              }}
            >
              {comandas.filter((c) => c.id !== comandaAtual.id).length === 0 ? (
                <span
                  style={{
                    color: '#64748b',
                    fontSize: '13px',
                    display: 'block',
                    textAlign: 'center',
                    padding: '15px',
                  }}
                >
                  Nenhuma outra comanda ativa aberta para realizar a divisão.
                </span>
              ) : (
                comandas
                  .filter((c) => c.id !== comandaAtual.id)
                  .map((c) => (
                    <label
                      key={c.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 0',
                        cursor: 'pointer',
                        color: '#cbd5e1',
                        fontSize: '14px',
                        borderBottom: '1px dashed #1e293b',
                      }}
                    >
                      <input
                        type="checkbox"
                        value={c.id}
                        style={{ width: 'auto', margin: 0 }}
                        checked={comandasSelecionadasSplit.includes(c.id)}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setComandasSelecionadasSplit((prev) =>
                            e.target.checked
                              ? [...prev, val]
                              : prev.filter((id) => id !== val)
                          );
                        }}
                      />
                      <span>
                        {c.nome} (Mesa #{c.id})
                      </span>
                    </label>
                  ))
              )}
            </div>

            <div className="custom-dialog-buttons">
              <button
                type="button"
                className="btn-dialog-cancel"
                onClick={() => setModalDividir(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-dialog-confirm"
                style={{ background: '#0284c7' }}
                disabled={comandasSelecionadasSplit.length === 0}
                onClick={() =>
                  realizarDivisao(modalDividir.item, comandasSelecionadasSplit)
                }
              >
                Confirmar Rateio ({comandasSelecionadasSplit.length + 1} partes)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
