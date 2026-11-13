
const USUARIO_ADMIN = "admin";
const SENHA_ADMIN = "123456";
const CHAVE_AVISOS = "muralDigitalEscolar_avisos";

// FUNÇÕES GERAIS

function carregarAvisos() {
    try {
        const dados = JSON.parse(localStorage.getItem(CHAVE_AVISOS));
        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

function formatarData(data) {
    const d = new Date(data);
    return isNaN(d.getTime()) ? "Data não disponível" : d.toLocaleDateString("pt-BR");
}

function criar(tag, texto, estilos, pai) {
    const elemento = document.createElement(tag);
    if (texto !== undefined) elemento.textContent = texto;
    Object.assign(elemento.style, estilos);
    if (pai) pai.appendChild(elemento);
    return elemento;
}

// ÁREA ADMINISTRATIVA

const areaLogin = document.getElementById("areaLogin");
const painelADM = document.getElementById("painelADM");
const formularioLogin = document.getElementById("formLogin");
const botaoEntrar = document.getElementById("botaoEntrar");

if (areaLogin && painelADM) {
    areaLogin.style.display = "block";
    painelADM.style.display = "none";

    function entrarADM() {
        const usuario = document.getElementById("usuario").value.trim();
        const senha = document.getElementById("senha").value;

        if (!usuario || !senha) return alert("Preencha o usuário e a senha.");

        if (usuario === USUARIO_ADMIN && senha === SENHA_ADMIN) {
            areaLogin.style.display = "none";
            painelADM.style.display = "block";
            alert("Acesso autorizado!");
        } else {
            alert("Usuário ou senha incorretos.");
            document.getElementById("senha").value = "";
        }
    }

    if (botaoEntrar) botaoEntrar.addEventListener("click", entrarADM);

    if (formularioLogin) {
        formularioLogin.addEventListener("submit", e => {
            e.preventDefault();
            entrarADM();
        });
    }
}

// FORMULÁRIO DE AVISOS

const formularioAviso = document.getElementById("formAvisoPreparacao");
const botaoEnviarAviso = document.getElementById("botaoEnviarAviso");

if (formularioAviso && botaoEnviarAviso) {
    botaoEnviarAviso.addEventListener("click", function() {
        const categoria = document.getElementById("categoria").value;
        const endereco = document.getElementById("enderecoAviso").value.trim();

        if (!formularioAviso.checkValidity()) {
            formularioAviso.reportValidity();
            return;
        }

        if (!["Eventos", "Comunicados"].includes(categoria)) {
            alert("Selecione uma categoria válida.");
            return;
        }

        if (endereco) {
            try {
                const url = new URL(endereco);
                if (!["http:", "https:"].includes(url.protocol)) throw new Error();
            } catch {
                alert("Digite um endereço válido.");
                return;
            }
        }

        alert("Aviso preenchido com sucesso!\n\nA função de cadastro e publicação será implementada posteriormente com JSON.");
    });
}

// PÁGINA INICIAL

const areaCards = document.querySelector(".cards");

if (areaCards) {
    const campoPesquisa = document.querySelector(".pesquisa input");

    const botoes = {
        Todos: document.getElementById("todos"),
        Eventos: document.getElementById("eventos"),
        Comunicados: document.getElementById("comunicados")
    };

    let categoriaSelecionada = "Todos";

    function atualizarBotoes() {
        Object.entries(botoes).forEach(([categoria, botao]) => {
            if (!botao) return;

            const selecionado = categoria === categoriaSelecionada;
            botao.style.backgroundColor = selecionado ? "#1768c4" : "white";
            botao.style.color = selecionado ? "white" : "#1558a0";
        });
    }

    function mostrarMensagem(tituloTexto, descricaoTexto) {
        const mensagem = criar("div", undefined, {}, areaCards);
        mensagem.className = "sem-avisos";

        criar("h3", tituloTexto, {}, mensagem);
        criar("p", descricaoTexto, {}, mensagem);
    }

    function abrirDetalhes(aviso) {
        const fundo = criar("div", undefined, {
            position: "fixed", top: "0", left: "0",
            width: "100%", height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex", justifyContent: "center",
            alignItems: "center", padding: "20px", zIndex: "9999"
        });

        const caixa = criar("div", undefined, {
            backgroundColor: "white", padding: "30px",
            borderRadius: "12px", width: "100%",
            maxWidth: "550px", maxHeight: "85vh",
            overflowY: "auto"
        }, fundo);

        criar("p", aviso.categoria, {
            color: "#2169b5", fontWeight: "bold", marginBottom: "12px"
        }, caixa);

        criar("h2", aviso.titulo, {
            color: "#124477", marginBottom: "15px"
        }, caixa);

        criar("p", aviso.descricao, {
            color: "#103c70", lineHeight: "1.7",
            whiteSpace: "pre-wrap", marginBottom: "20px"
        }, caixa);

        if (aviso.endereco) {
            const link = criar("a", "Acessar endereço do aviso", {
                display: "block", marginBottom: "20px", color: "#1768c4"
            }, caixa);

            link.href = aviso.endereco;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
        }

        criar("small", "Publicado em: " + formatarData(aviso.data), {
            color: "#6682a6"
        }, caixa);

        function fecharModal() {
            fundo.remove();
            document.removeEventListener("keydown", fecharComEsc);
        }

        function fecharComEsc(e) {
            if (e.key === "Escape") fecharModal();
        }

        const botaoFechar = criar("button", "Fechar", {
            display: "block", backgroundColor: "#124477",
            color: "white", padding: "12px 25px",
            border: "none", borderRadius: "7px",
            cursor: "pointer", marginTop: "25px"
        }, caixa);

        botaoFechar.addEventListener("click", fecharModal);

        fundo.addEventListener("click", e => {
            if (e.target === fundo) fecharModal();
        });

        document.addEventListener("keydown", fecharComEsc);
        document.body.appendChild(fundo);
        botaoFechar.focus();
    }

    function mostrarAvisos() {
        const avisos = carregarAvisos();
        const pesquisa = campoPesquisa ? campoPesquisa.value.trim().toLowerCase() : "";

        areaCards.innerHTML = "";

        const filtrados = avisos.filter(aviso =>
            (categoriaSelecionada === "Todos" || aviso.categoria === categoriaSelecionada) &&
            [aviso.titulo, aviso.descricao, aviso.categoria]
                .some(item => (item || "").toLowerCase().includes(pesquisa))
        );

        if (!avisos.length) {
            mostrarMensagem(
                "Nenhum aviso publicado ainda",
                "Os avisos e comunicados da escola aparecerão aqui quando forem publicados."
            );
            return;
        }

        if (!filtrados.length) {
            mostrarMensagem(
                "Nenhum aviso encontrado",
                "Não encontramos avisos com essa pesquisa ou categoria."
            );
            return;
        }

        filtrados.forEach(aviso => {
            const card = criar("div", undefined, {
                backgroundColor: "white", border: "1px solid #d4e4f7",
                borderRadius: "10px", padding: "22px",
                width: "100%", maxWidth: "430px", marginBottom: "5px"
            }, areaCards);

            criar("span", aviso.categoria, {
                backgroundColor: "#e4eef8", color: "#1768c4",
                padding: "6px 12px", borderRadius: "20px",
                fontSize: "12px", fontWeight: "bold"
            }, card);

            criar("h3", aviso.titulo, {
                color: "#124477", fontSize: "20px",
                marginTop: "18px", marginBottom: "12px"
            }, card);

            criar("p",
                aviso.descricao.length > 120
                    ? aviso.descricao.substring(0, 120) + "..."
                    : aviso.descricao,
                {
                    color: "#587ca8", fontSize: "14px",
                    lineHeight: "1.6", marginBottom: "15px"
                }, card);

            criar("small", "Publicado em: " + formatarData(aviso.data), {
                color: "#6682a6"
            }, card);

            const botao = criar("button", "Ler aviso completo", {
                display: "block", backgroundColor: "#1768c4",
                color: "white", padding: "11px 16px",
                border: "none", borderRadius: "7px",
                cursor: "pointer", marginTop: "16px",
                fontWeight: "bold"
            }, card);

            botao.addEventListener("click", () => abrirDetalhes(aviso));
        });
    }

    Object.entries(botoes).forEach(([categoria, botao]) => {
        if (botao) botao.addEventListener("click", () => {
            categoriaSelecionada = categoria;
            atualizarBotoes();
            mostrarAvisos();
        });
    });

    if (campoPesquisa) campoPesquisa.addEventListener("input", mostrarAvisos);

    window.addEventListener("storage", e => {
        if (e.key === CHAVE_AVISOS) mostrarAvisos();
    });

    atualizarBotoes();
    mostrarAvisos();
}
