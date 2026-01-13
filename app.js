// app.js - Com Funcionalidade de Favoritos (Repertório)
const listaContainer = document.getElementById('listaLouvores');
const inputBusca = document.getElementById('inputBusca');
const contadorFav = document.getElementById('contadorFav');
const btnFiltrarFav = document.getElementById('btnFiltrarFav');

// --- 1. CARREGAMENTO DOS FAVORITOS (LOCALSTORAGE) ---
let listaFavoritos = JSON.parse(localStorage.getItem('meusFavoritos')) || [];
let modoFavoritosAtivo = false;

// Atualiza o número no botão
function atualizarContador() {
    if(contadorFav) contadorFav.innerText = listaFavoritos.length;
}
atualizarContador();

// Função auxiliar para organizar A-Z
function ordenarLista(lista) {
    const listaValida = lista.filter(item => item && item.titulo);
    return listaValida.sort((a, b) => a.titulo.localeCompare(b.titulo));
}

// --- 2. FUNÇÕES DE RENDERIZAÇÃO (Com Estrelinha) ---

// Função auxiliar para criar o HTML do card (Evita repetir código)
function criarCardHTML(item) {
    const div = document.createElement('div');
    div.className = 'card';
    
    // Verifica se é favorito para pintar a estrela
    const ehFavorito = listaFavoritos.includes(item.num);
    const classeEstrela = ehFavorito ? 'fa-solid fa-star star-icon active' : 'fa-regular fa-star star-icon';

    div.innerHTML = `
        <i class="${classeEstrela}" onclick="toggleFavorito(event, '${item.num}')"></i>
        <div class="title">${item.titulo}</div>
    `;

    // Clique no card abre a cifra (exceto se clicar na estrela)
    div.onclick = (e) => {
        if (e.target.classList.contains('star-icon')) return;
        window.location.href = `cifra.html?hino=${encodeURIComponent(item.num)}`;
    };

    return div;
}

function renderizarLista(categorias) {
    if (!listaContainer) return;
    listaContainer.innerHTML = '';
    
    let todosOsLouvores = [];
    Object.keys(categorias).forEach(chave => {
        if (Array.isArray(categorias[chave])) {
            todosOsLouvores = todosOsLouvores.concat(categorias[chave]);
        }
    });

    const listaOrdenada = ordenarLista(todosOsLouvores);

    listaOrdenada.forEach(item => {
        const card = criarCardHTML(item);
        listaContainer.appendChild(card);
    });
}

function renderizarFiltrados(itens) {
    listaContainer.innerHTML = '';
    const itensOrdenados = ordenarLista(itens);
    
    if(itensOrdenados.length === 0) {
        listaContainer.innerHTML = '<div style="text-align:center; padding:20px; color:#666;">Nenhum louvor encontrado.</div>';
        return;
    }

    itensOrdenados.forEach(item => {
        const card = criarCardHTML(item);
        listaContainer.appendChild(card);
    });
}

// --- 3. LÓGICA DOS FAVORITOS ---

// Adicionar ou Remover (Click na Estrela)
window.toggleFavorito = function(event, idHino) {
    event.stopPropagation(); // Não abre a cifra
    
    const index = listaFavoritos.indexOf(idHino);
    const estrela = event.target;

    if (index === -1) {
        // Adiciona
        listaFavoritos.push(idHino);
        estrela.classList.remove('fa-regular');
        estrela.classList.add('fa-solid', 'active');
    } else {
        // Remove
        listaFavoritos.splice(index, 1);
        estrela.classList.remove('fa-solid', 'active');
        estrela.classList.add('fa-regular');
        
        // Se estiver no modo repertório, remove o card da tela na hora
        if(modoFavoritosAtivo) {
            estrela.closest('.card').remove();
            atualizarContador(); // Atualiza contador antes de verificar se está vazio
            if(listaFavoritos.length === 0) {
                listaContainer.innerHTML = '<div style="text-align:center; padding:20px; color:#666;">Seu repertório está vazio.</div>';
            }
            return; 
        }
    }

    localStorage.setItem('meusFavoritos', JSON.stringify(listaFavoritos));
    atualizarContador();
}

// Alternar Botão "Ver Repertório"
window.alternarModoFavoritos = function() {
    modoFavoritosAtivo = !modoFavoritosAtivo;
    
    if (modoFavoritosAtivo) {
        btnFiltrarFav.classList.add('ativo');
        btnFiltrarFav.innerHTML = `<i class="fa fa-list"></i> Ver Todos`;
        inputBusca.value = ''; 
        inputBusca.placeholder = "Pesquisar no repertório...";
    } else {
        btnFiltrarFav.classList.remove('ativo');
        btnFiltrarFav.innerHTML = `<i class="fa fa-star"></i> Ver Repertório (<span id="contadorFav">${listaFavoritos.length}</span>)`;
        inputBusca.placeholder = "Pesquisar por número ou título...";
    }
    
    filtrarEExibir();
}

// Limpar Tudo
window.limparFavoritos = function() {
    if(listaFavoritos.length === 0) return;
    
    if(confirm("Deseja limpar toda a lista de repertório?")) {
        listaFavoritos = [];
        localStorage.removeItem('meusFavoritos');
        atualizarContador();
        
        // Se estiver no modo favoritos, volta para o normal
        if(modoFavoritosAtivo) {
            alternarModoFavoritos();
        } else {
            // Se estiver no modo normal, apenas atualiza as estrelas visíveis
            filtrarEExibir(); 
        }
    }
}

// --- 4. FILTROS E BUSCA UNIFICADA ---
let categoriaAtual = "TODOS";

function filtrarEExibir() {
    if (!inputBusca) return;
    const termo = inputBusca.value.toLowerCase().trim();
    let resultados = [];

    // PASSO A: Seleciona a base de dados (Todos ou Categoria)
    if (categoriaAtual === "TODOS") {
        Object.keys(coletanea).forEach(chave => {
            if(Array.isArray(coletanea[chave])) {
                resultados = resultados.concat(coletanea[chave]);
            }
        });
    } else {
        resultados = coletanea[categoriaAtual] || [];
    }

    // PASSO B: Se modo Favoritos estiver ativo, filtra só os favoritos da base atual
    if (modoFavoritosAtivo) {
        resultados = resultados.filter(item => listaFavoritos.includes(item.num));
    }

    // PASSO C: Aplica a busca por texto
    const filtradosFinal = resultados.filter(l => 
        (l.titulo && l.titulo.toLowerCase().includes(termo)) || 
        (l.num && l.num.toLowerCase().includes(termo))
    );

    renderizarFiltrados(filtradosFinal);
}

// --- 5. INICIALIZAÇÃO ---
window.addEventListener('DOMContentLoaded', () => {
    if (typeof coletanea !== 'undefined') {
        renderizarLista(coletanea);
    } else {
        console.error("A variável 'coletanea' não foi encontrada.");
    }

    document.querySelectorAll('.filter-btn').forEach(botao => {
        botao.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Se mudar de categoria, mantemos o modo favoritos ativo se o usuário quiser,
            // ou podemos resetar. Aqui optei por manter a lógica simples:
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            categoriaAtual = this.getAttribute('data-cat');
            filtrarEExibir();
        });
    });

    if (inputBusca) {
        inputBusca.addEventListener('input', filtrarEExibir);
    }
});
