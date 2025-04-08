// Armazena temporariamente o perfil atual exibido
let currentProfile = {};

// Função para buscar um novo perfil da API randomuser.me
function loadProfile() {
  fetch("https://randomuser.me/api/?nat=br") // Busca perfil com nacionalidade brasileira
    .then(response => response.json())
    .then(data => {
      const user = data.results[0];
      // Preenche o objeto currentProfile com os dados do usuário
      currentProfile = {
        picture: user.picture.large,
        firstname: user.name.first,
        lastname: user.name.last,
        age: parseInt(user.dob.age),
        gender: user.gender,
        state: user.location.state,
        like: "" // Inicialmente vazio
      };

      // Atualiza o HTML com os dados do novo perfil
      document.getElementById("picture").src = currentProfile.picture;
      document.getElementById("name").innerText = `${currentProfile.firstname} ${currentProfile.lastname}`;
      document.getElementById("age").innerText = currentProfile.age;
      document.getElementById("gender").innerText = currentProfile.gender;
      document.getElementById("state").innerText = currentProfile.state;
    })
    .catch(error => console.error("Erro ao carregar perfil:", error));
}

// Função executada ao clicar em like/dislike
function handleChoice(choice) {
  if (!currentProfile.firstname) {
    console.error("Perfil ainda não carregado!");
    return;
  }

  // Define se foi curtido ou não
  currentProfile.like = choice === "Yes" ? "Yes" : "No";
  sendProfileToAPI(currentProfile); // Envia para o backend
  loadProfile(); // Carrega novo perfil
}

// Envia os dados do perfil curtido ou não para o backend
function sendProfileToAPI(profile) {
  const formData = new FormData();
  for (const key in profile) {
    formData.append(key, profile[key]);
  }

  fetch("http://localhost:5000/addhistorico", {
    method: "POST",
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      console.log("Enviado para API:", data);
      adicionarLinhaAoHistorico(data); // Adiciona na tabela
    })
    .catch(error => console.error("Erro na chamada da API:", error));
}

// Função para deletar um registro do histórico baseado no firstname
function deletarHistorico(firstname) {
  fetch(`http://localhost:5000/delhistorico?firstname=${firstname}`, {
    method: "DELETE"
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Erro ao deletar histórico");
      }
      return response.json();
    })
    .then(data => {
      console.log("Histórico deletado:", data);
      carregarTabelaHistorico(); // Recarrega tabela
    })
    .catch(error => console.error("Erro ao deletar:", error));
}

// Carrega perfil e histórico ao iniciar a página
document.addEventListener("DOMContentLoaded", () => {
  loadProfile();
  carregarTabelaHistorico();
});

// Busca todos os históricos do backend e renderiza na tabela
function carregarTabelaHistorico() {
  fetch("http://localhost:5000/listhistoricos")
    .then(response => response.json())
    .then(data => {
      const tabela = document.getElementById("tabela-historico-body");
      tabela.innerHTML = ""; // Limpa tabela

      data.historicos.forEach(h => {
        adicionarLinhaAoHistorico(h); // Adiciona linha para cada registro
      });
    })
    .catch(error => console.error("Erro ao carregar histórico:", error));
}

// Adiciona uma linha na tabela do histórico com dados e ações
function adicionarLinhaAoHistorico(historico) {
  const tabela = document.getElementById("tabela-historico-body");
  const isLike = historico.like.toLowerCase() === "yes";
  const likeIcon = isLike ? "👍" : "👎";
  const likeColor = isLike ? "#28a745" : "#dc3545"; // Verde ou vermelho
  const textColor = isLike ? "#155724" : "#721c24";
  const novoLike = isLike ? "No" : "Yes"; // Alterna o like para edição

  const row = tabela.insertRow(0); // Insere no topo da tabela

  // Monta a linha com os dados e botões de ação
  row.innerHTML = `
    <td><img src="${historico.picture}" width="40" style="border-radius: 50%;" /></td>
    <td>${historico.firstname} ${historico.lastname}</td>
    <td>${historico.age}</td>
    <td>${historico.gender}</td>
    <td>${historico.state}</td>
    <td onclick="atualizarLike('${historico.firstname}', '${novoLike}')" 
        style="text-align: center; background-color: ${likeColor}; color: ${textColor}; font-size: 18px; cursor: pointer;">
      ${likeIcon}
    </td>
    <td><button onclick="deletarHistorico('${encodeURIComponent(historico.firstname)}')">❌</button></td>
  `;
}

// Envia atualização do campo 'like' para o backend
function atualizarLike(firstname, novoLike) {
  fetch("http://localhost:5000/edithistorico", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ firstname, like: novoLike }) // Apenas firstname e novo like
  })
    .then(response => {
      if (!response.ok) throw new Error("Erro ao atualizar like");
      return response.json();
    })
    .then(data => {
      console.log("Like atualizado com sucesso:", data);
      carregarTabelaHistorico(); // Atualiza a tabela após edição
    })
    .catch(error => console.error("Erro ao atualizar like:", error));
}

















