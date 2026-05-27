let regex;

// CPF, CNPJ
// data futur/passada
// CEP (API)

function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, ""); // pegando apenas os numeros para validar

  if (cpf.length !== 11) {
    return false;
  }

  regex = /^(\d)\1{10}$/; // regex verificando cpf igual (para facilitar)

  // Impede CPFs iguais
  if (regex.test(cpf)) {
    return false;
  }

  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) {
    soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }

  resto = (soma * 10) % 11;

  if (resto === 10 || resto === 11) {
    resto = 0;
  }

  if (resto !== parseInt(cpf.substring(9, 10))) {
    return false;
  }

  soma = 0;

  for (let i = 1; i <= 10; i++) {
    soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }

  resto = (soma * 10) % 11;

  if (resto === 10 || resto === 11) {
    resto = 0;
  }

  if (resto !== parseInt(cpf.substring(10, 11))) {
    return false;
  }

  return true;
}

function validarCNPJ(cnpj) {
  let sum = 0;
  let rest;
  let i;
  let d1;
  let d2;

  cnpj = cnpj.replace(/\D/g, ""); // pegando apenas os numeros

  regex = /^(\d)\1{13}$/;

  if (cnpj.length !== 14 || regex.test(cnpj)) {
    return false;
  }

  let pesosPri = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]; // pesos oficiais para o primeiro digito

  for (i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * pesosPri[i];
  }

  rest = sum % 11;

  if (rest < 2) {
    d1 = 0;
  } else {
    d1 = 11 - rest;
  }

  if (d1 !== parseInt(cnpj.charAt(12))) {
    return false;
  }

  sum = 0;

  let pesosSeg = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  for (i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * pesosSeg[i];
  }

  rest = sum % 11;

  if (rest < 2) {
    d2 = 0;
  } else {
    d2 = 11 - rest;
  }

  if (d2 !== parseInt(cnpj.charAt(13))) {
    return false;
  }

  return true; // cnpj matematicamente validado
}

async function validarCEP(cep) {
  cep = cep.replace(/\D/g, ""); // pegando apenas os numeros

  regex = /^[0-9]{8}$/;

  if (!regex.test(cep)) {
    return false;
  }

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`); // chamada assincrona para api
    const dados = await res.json(); // transforma em json

    if (!res.ok) {
      return false; // verifica se a req falhou
    }

    if (dados.erro === true) {
      return false; // retorna erro true se não existir
    }

    return {
      // se o cep for real,
      logradouro: dados.logradouro || "",
      cidade: dados.localidade || "",
      bairro: dados.bairro || "",
      estado: dados.uf || "",
    };
  } catch (error) {
    console.log(error);
    return false;
  }
}

function validarData(data) {
  regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;

  const format = data.match(regex);

  if (!format) {
    return false;
  }

  const dia = parseInt(format[1], 10); // os parenteses do regex guardam os dados em array, posicao 0 é o texto inteiro
  const mes = parseInt(format[2], 10) - 1; // o 10 e garantia que a data n vai ser lida como octal
  const ano = parseInt(format[3], 10);

  const dataForm = new Date(ano, mes, dia); // pegando data do form
  const dataAtual = new Date();

  dataAtual.setHours(0, 0, 0, 0);
  dataForm.setHours(0, 0, 0, 0);

  // verifica se a data realmente existe
  // exemplo: 31/02/2000 não pode ser aceito
  if (
    dataForm.getDate() !== dia ||
    dataForm.getMonth() !== mes ||
    dataForm.getFullYear() !== ano
  ) {
    return false;
  }

  if (dataForm > dataAtual) {
    return false; // verificando data futura
  }

  return true;
}

// integrando ao html
const formCadastro = document.getElementById("formCad");

if (formCadastro) {
  const cpfInput = document.getElementById("cpf");
  const cnpjInput = document.getElementById("cnpj");
  const cepInput = document.getElementById("cep");

  // campos que serão preenchidos automaticamente
  const enderecoInput = document.getElementById("endereco");
  const bairroInput = document.getElementById("bairro");
  const cidadeInput = document.getElementById("cidade");
  const ufInput = document.getElementById("uf");

  const diaInput = document.getElementById("dia_nasc");
  const mesInput = document.getElementById("mes_nasc");
  const anoInput = document.getElementById("ano_nasc");

  function mensagemErro(input) {
    input.classList.remove("is-valid");
    input.classList.add("is-invalid");
  }

  function mensagemValida(input) {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
  }

  cepInput.addEventListener("blur", async () => {
    const info = await validarCEP(cepInput.value);

    if (info) {
      enderecoInput.value = info.logradouro;
      bairroInput.value = info.bairro;
      cidadeInput.value = info.cidade;
      ufInput.value = info.estado;

      mensagemValida(cepInput);

      // como a API preencheu esses campos, ja marca como validos tambem
      mensagemValida(enderecoInput);
      mensagemValida(bairroInput);
      mensagemValida(cidadeInput);
      mensagemValida(ufInput);
    } else {
      mensagemErro(cepInput);

      enderecoInput.value = "";
      bairroInput.value = "";
      cidadeInput.value = "";
      ufInput.value = "";
    }
  });

  formCadastro.addEventListener("submit", (e) => {
    e.preventDefault();

    let cpfValido = false;
    let cnpjValido = false;
    let cepValido = false;
    let dataNascimentoValida = false;

    // validação do CPF
    if (cpfInput.value.trim() !== "") {
      cpfValido = validarCPF(cpfInput.value);

      if (!cpfValido) {
        mensagemErro(cpfInput);
      } else {
        mensagemValida(cpfInput);
      }
    } else {
      mensagemErro(cpfInput);
    }

    // validação do CNPJ
    // CNPJ não é obrigatório, então só valida se o usuário preencher
    if (cnpjInput.value.trim() !== "") {
      cnpjValido = validarCNPJ(cnpjInput.value);

      if (!cnpjValido) {
        mensagemErro(cnpjInput);
      } else {
        mensagemValida(cnpjInput);
      }
    } else {
      cnpjValido = true;
      // remove qualquer marcação visual se o campo estiver vazio
      cnpjInput.classList.remove("is-invalid");
      cnpjInput.classList.remove("is-valid");
    }

    // validação do CEP
    if (cepInput.value.trim() !== "") {
      const cepLimpo = cepInput.value.replace(/\D/g, "");

      if (cepLimpo.length === 8 && cepInput.classList.contains("is-valid")) {
        cepValido = true;
        mensagemValida(cepInput);
      } else {
        mensagemErro(cepInput);
      }
    } else {
      mensagemErro(cepInput);
    }

    // validação da data de nascimento
    const dia = diaInput.value;
    const mes = mesInput.value;
    const ano = anoInput.value.trim();

    if (dia !== "" && mes !== "" && ano !== "") {
      const dataString = `${dia}/${mes}/${ano}`;

      dataNascimentoValida = validarData(dataString);

      if (dataNascimentoValida) {
        mensagemValida(diaInput);
        mensagemValida(mesInput);
        mensagemValida(anoInput);
      } else {
        mensagemErro(diaInput);
        mensagemErro(mesInput);
        mensagemErro(anoInput);
      }
    } else {
      mensagemErro(diaInput);
      mensagemErro(mesInput);
      mensagemErro(anoInput);
    }

    // se tudo estiver certo, envia o formulário
    if (dataNascimentoValida && cepValido && cnpjValido && cpfValido) {
      formCadastro.submit();
    }
  });
}

// mascaras

function mascaraCPF(valor) {
  return valor
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14); // slice serve pra garantir que o js vai pegar essa qtd de caracter do valor
}

function mascaraCNPJ(valor) {
  return valor
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18);
}

function mascaraTelefone(valor) {
  return valor
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2")
    .slice(0, 10);
}

function mascaraCEP(valor) {
  return valor
    .replace(/\D/g, "")
    .replace(/^(\d{5})(\d)/, "$1-$2")
    .slice(0, 9);
}
