// Array para armazenar os clientes
var vetClientes = [];

// Aplicar máscaras nos campos
document.getElementById('telefone').addEventListener('input', function(e) {
    var valor = e.target.value.replace(/\D/g, '');
    if (valor.length <= 11) {
        valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2');
        valor = valor.replace(/(\d)(\d{4})$/, '$1-$2');
    }
    e.target.value = valor;
});

document.getElementById('cpf').addEventListener('input', function(e) {
    var valor = e.target.value.replace(/\D/g, '');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    e.target.value = valor;
});

document.getElementById('cep').addEventListener('input', function(e) {
    var valor = e.target.value.replace(/\D/g, '');
    valor = valor.replace(/(\d{5})(\d)/, '$1-$2');
    e.target.value = valor;
});

// Função para mostrar alerta
function mostrarAlerta(mensagem, tipo) {
    var divAlertas = document.getElementById('alertContainer');
    var novoAlerta = document.createElement('div');
    novoAlerta.className = 'alert alert-' + tipo + ' alert-dismissible fade show';
    novoAlerta.innerHTML = mensagem + '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';
    divAlertas.appendChild(novoAlerta);
    
    setTimeout(function() {
        novoAlerta.remove();
    }, 5000);
}

// Função para montar a tabela
function montarTabela(dados) {
    var tbody = document.getElementById('tabelaClientes');
    var htmlTabela = '';
    
    for (var i = 0; i < dados.length; i++) {
        var cliente = dados[i];
        
        htmlTabela += '<tr>';
        htmlTabela += '<td><input type="checkbox" data-id="' + cliente.id + '"></td>';
        htmlTabela += '<td>' + cliente.id + '</td>';
        htmlTabela += '<td>' + cliente.nome + '</td>';
        htmlTabela += '<td>' + cliente.email + '</td>';
        htmlTabela += '<td>' + cliente.telefone + '</td>';
        htmlTabela += '<td>' + cliente.cpf + '</td>';
        htmlTabela += '<td>' + cliente.cep + '</td>';
        htmlTabela += '<td>' + cliente.status + '</td>';
        htmlTabela += '<td><button class="btn-delete" onclick="excluirCliente(' + cliente.id + ')"><i class="bi bi-trash"></i> Excluir</button></td>';
        htmlTabela += '</tr>';
    }
    
    tbody.innerHTML = htmlTabela;
}

// Função para adicionar cliente
function adicionarCliente() {
    var campoNome = document.getElementById('nome');
    var campoEmail = document.getElementById('email');
    var campoTelefone = document.getElementById('telefone');
    var campoCpf = document.getElementById('cpf');
    var campoCep = document.getElementById('cep');
    var campoStatus = document.getElementById('status');

    // Remover caracteres especiais
    var telefoneLimpo = campoTelefone.value.replace(/\D/g, '');
    var cpfLimpo = campoCpf.value.replace(/\D/g, '');
    var cepLimpo = campoCep.value.replace(/\D/g, '');

    // Campos vazios
    if (
        campoNome.value == '' ||
        campoEmail.value == '' ||
        campoTelefone.value == '' ||
        campoCpf.value == '' ||
        campoCep.value == '' ||
        campoStatus.value == ''
    ) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }

    //Valida Nome Completo (ao menos 1)
    var nomeCompleto = campoNome.value.trim();

    // Verifica se tem pelo menos nome e sobrenome
    if (nomeCompleto.indexOf(' ') == -1) {
        alert('Digite nome e sobrenome!');
        return;
    }

    //Valida E-mail
    var emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValido.test(campoEmail.value)) {
        alert('E-mail inválido!');
        return;
    }

    // Validar telefone
    if (telefoneLimpo.length != 11) {
        alert('Telefone inválido!');
        return;
    }

    // Validar CEP
    if (cepLimpo.length != 8) {
        alert('CEP inválido!');
        return;
    }

    // Validar CPF
    if (!validarCPF(cpfLimpo)) {
        alert('CPF inválido!');
        return;
    }

    // Criar cliente
    var novoCliente = {
        id: new Date().getTime(),
        nome: campoNome.value,
        email: campoEmail.value,
        telefone: campoTelefone.value,
        cpf: campoCpf.value,
        cep: campoCep.value,
        status: campoStatus.value
    };

    vetClientes.push(novoCliente);

    montarTabela(vetClientes);

    atualizarEstatisticas();

    limparFormulario();

    mostrarAlerta(
        '<i class="bi bi-check-circle-fill"></i> Cliente cadastrado com sucesso!',
        'success'
    );
}

function validarCPF(cpf) {

    if (cpf.length != 11) {
        return false;
    }

    // Impede CPFs iguais
    if (
        cpf == "00000000000" ||
        cpf == "11111111111" ||
        cpf == "22222222222" ||
        cpf == "33333333333" ||
        cpf == "44444444444" ||
        cpf == "55555555555" ||
        cpf == "66666666666" ||
        cpf == "77777777777" ||
        cpf == "88888888888" ||
        cpf == "99999999999"
    ) {
        return false;
    }

    var soma = 0;
    var resto;

    for (var i = 1; i <= 9; i++) {
        soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    resto = (soma * 10) % 11;

    if (resto == 10 || resto == 11) {
        resto = 0;
    }

    if (resto != parseInt(cpf.substring(9, 10))) {
        return false;
    }

    soma = 0;

    for (var i = 1; i <= 10; i++) {
        soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    resto = (soma * 10) % 11;

    if (resto == 10 || resto == 11) {
        resto = 0;
    }

    if (resto != parseInt(cpf.substring(10, 11))) {
        return false;
    }

    return true;
}

// Função para excluir cliente individual
function excluirCliente(idParaExcluir) {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
        var vetAuxiliar = [];
        
        for (var i = 0; i < vetClientes.length; i++) {
            if (vetClientes[i].id != idParaExcluir) {
                vetAuxiliar.push(vetClientes[i]);
            }
        }
        
        vetClientes = vetAuxiliar;
        montarTabela(vetClientes);
        atualizarEstatisticas();
        mostrarAlerta('<i class="bi bi-trash-fill"></i> Cliente excluído com sucesso!', 'danger');
    }
}

// Função para excluir clientes selecionados
function excluirSelecionados() {
    var todosCheckbox = document.querySelectorAll('[data-id]');
    
    if (todosCheckbox.length > 0) {
        var temSelecionado = false;
        
        for (var i = 0; i < todosCheckbox.length; i++) {
            if (todosCheckbox[i].checked == true) {
                temSelecionado = true;
                break;
            }
        }
        
        if (temSelecionado) {
            if (confirm('Tem certeza que deseja excluir os clientes selecionados?')) {
                for (var i = 0; i < todosCheckbox.length; i++) {
                    if (todosCheckbox[i].checked == true) {
                        excluirClienteSemConfirmacao(todosCheckbox[i].dataset.id);
                    }
                }
                mostrarAlerta('<i class="bi bi-trash-fill"></i> Clientes selecionados excluídos com sucesso!', 'danger');
            }
        } else {
            alert('Selecione pelo menos um cliente para excluir!');
        }
    } else {
        alert('Não há clientes para serem excluídos!');
    }
}

// Função auxiliar para excluir sem confirmação (usada na exclusão em lote)
function excluirClienteSemConfirmacao(idParaExcluir) {
    var vetAuxiliar = [];
    
    for (var i = 0; i < vetClientes.length; i++) {
        if (vetClientes[i].id != idParaExcluir) {
            vetAuxiliar.push(vetClientes[i]);
        }
    }
    
    vetClientes = vetAuxiliar;
    montarTabela(vetClientes);
    atualizarEstatisticas();
}

// Função para selecionar todos os checkboxes
function selecionarTodos() {
    var todosCheckbox = document.querySelectorAll('[data-id]');
    var checkboxPai = document.getElementById('ckTodos');
    
    for (var i = 0; i < todosCheckbox.length; i++) {
        todosCheckbox[i].checked = checkboxPai.checked;
    }
}

// Função para limpar o formulário
function limparFormulario() {
    document.getElementById('formCliente').reset();
}

// Função para atualizar as estatísticas
function atualizarEstatisticas() {
    var totalClientes = vetClientes.length;
    var totalAtivos = 0;
    var totalInativos = 0;

    for (var i = 0; i < vetClientes.length; i++) {
        if (vetClientes[i].status == 'Ativo') {
            totalAtivos++;
        } else {
            totalInativos++;
        }
    }

    document.getElementById('totalClientes').textContent = totalClientes;
    document.getElementById('clientesAtivos').textContent = totalAtivos;
    document.getElementById('clientesInativos').textContent = totalInativos;
}

// Associar eventos quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    montarTabela(vetClientes);
    
    var botaoSalvar = document.getElementById('btnSalvar');
    botaoSalvar.addEventListener('click', adicionarCliente, false);
    
    var botaoLimpar = document.getElementById('btnLimpar');
    botaoLimpar.addEventListener('click', limparFormulario, false);
    
    var botaoExcluirSelecionados = document.getElementById('btnExcluirSelecionados');
    botaoExcluirSelecionados.addEventListener('click', excluirSelecionados, false);
    
    var checkboxPai = document.getElementById('ckTodos');
    checkboxPai.addEventListener('click', selecionarTodos, false);
}, false);