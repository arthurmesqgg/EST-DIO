// ===== FIREBASE SETUP =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, orderBy, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyATn1yWqgYFj0c_9ShfEN_QFIM0a79LG6E",
  authDomain: "estudio-da-praca.firebaseapp.com",
  projectId: "estudio-da-praca",
  storageBucket: "estudio-da-praca.firebasestorage.app",
  messagingSenderId: "169699076157",
  appId: "1:169699076157:web:0f56f081cbaad77d182254"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ===== TOGGLE MENU =====
const menuBtn  = document.getElementById('menu-btn');
const dropdown = document.getElementById('dropdown');

if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('aberto');
    });
}
document.addEventListener('click', () => {
    if (dropdown) dropdown.classList.remove('aberto');
});

// ===== CARROSSEL =====
let index = 0;
const slides = document.querySelector('.slides');
const totalSlides = document.querySelectorAll('.slides img').length;

document.querySelector('.next').onclick = () => {
    index = (index + 1) % totalSlides;
    updateSlide();
};
document.querySelector('.prev').onclick = () => {
    index = (index - 1 + totalSlides) % totalSlides;
    updateSlide();
};
function updateSlide() {
    slides.style.transform = `translateX(-${index * 100}%)`;
}
setInterval(() => {
    index = (index + 1) % totalSlides;
    updateSlide();
}, 3000);

// ===== MODO ESCURO / CLARO =====
let trilho = document.getElementById('trilho');
let body   = document.body;

if (trilho) {
    trilho.addEventListener('click', () => {
        trilho.classList.toggle('dark');
        body.classList.toggle('dark');
        localStorage.setItem('tema', body.classList.contains('dark') ? 'dark' : 'light');
    });
}

if (localStorage.getItem('tema') === 'dark') {
    document.body.classList.add('dark');
    if (trilho) trilho.classList.add('dark');
}

// ===== NAVBAR SHRINK =====
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    navbar.classList.toggle('shrink', window.scrollY > 50);
});

// ===== LIGHTBOX =====
const galerias    = document.querySelectorAll('.galeria');
const lightbox    = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const fechar      = document.querySelector('.fechar');
const nextBtn     = document.querySelector('.next-img');
const prevBtn     = document.querySelector('.prev-img');

let indexAtual     = 0;
let listaImagens   = [];
let scale          = 1;
let isDragging     = false;
let startX         = 0;
let moveX          = 0;
let scrollCooldown = false;

galerias.forEach(galeria => {
    const imgs = galeria.querySelectorAll('img');
    imgs.forEach((img, index) => {
        img.addEventListener('click', () => {
            listaImagens = Array.from(imgs).map(i => i.src);
            indexAtual   = index;
            abrirImagem();
        });
    });
});

function abrirImagem(direcao = 'direita') {
    lightboxImg.style.transition = 'none';
    lightboxImg.style.transform  = direcao === 'direita'
        ? 'translateX(20%) scale(1)'
        : 'translateX(-20%) scale(1)';

    lightbox.style.display = 'flex';
    fechar.style.display   = 'block';
    lightboxImg.src        = listaImagens[indexAtual];
    scale = 1;

    setTimeout(() => {
        lightboxImg.style.transition = 'transform 0.3s ease';
        lightboxImg.style.transform  = 'translateX(0) scale(1)';
    }, 10);
}

function fecharImagem() {
    lightbox.style.display = 'none';
    fechar.style.display   = 'none';
}

function proximaImagem() {
    indexAtual = (indexAtual + 1) % listaImagens.length;
    abrirImagem('direita');
}

function imagemAnterior() {
    indexAtual = (indexAtual - 1 + listaImagens.length) % listaImagens.length;
    abrirImagem('esquerda');
}

if (fechar)  fechar.addEventListener('click', fecharImagem);
if (nextBtn) nextBtn.addEventListener('click', proximaImagem);
if (prevBtn) prevBtn.addEventListener('click', imagemAnterior);

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) fecharImagem();
    });

    lightbox.addEventListener('wheel', (e) => {
        if (lightbox.style.display !== 'flex') return;
        const rect = lightboxImg.getBoundingClientRect();
        const dentroDaImagem =
            e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top  && e.clientY <= rect.bottom;
        if (dentroDaImagem) return;
        e.preventDefault();
        if (scrollCooldown) return;
        scrollCooldown = true;
        e.deltaY > 0 ? proximaImagem() : imagemAnterior();
        setTimeout(() => { scrollCooldown = false; }, 400);
    });

    lightbox.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX     = e.touches[0].clientX;
        lightboxImg.style.transition = 'none';
    });

    lightbox.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        moveX = e.touches[0].clientX - startX;
        lightboxImg.style.transform = `translateX(${moveX}px) scale(${scale})`;
    });

    lightbox.addEventListener('touchend', () => {
        isDragging = false;
        lightboxImg.style.transition = 'transform 0.3s ease';
        if      (moveX >  80) imagemAnterior();
        else if (moveX < -80) proximaImagem();
        else lightboxImg.style.transform = `translateX(0) scale(${scale})`;
        moveX = 0;
    });
}

if (lightboxImg) {
    lightboxImg.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect    = lightboxImg.getBoundingClientRect();
        const originX = ((e.clientX - rect.left) / rect.width)  * 100;
        const originY = ((e.clientY - rect.top)  / rect.height) * 100;
        lightboxImg.style.transformOrigin = `${originX}% ${originY}%`;
        scale += e.deltaY < 0 ? 0.2 : -0.2;
        scale  = Math.min(Math.max(1, scale), 3);
        lightboxImg.style.transform = `scale(${scale})`;
    });

    lightboxImg.addEventListener('click', () => {
        scale = 1;
        lightboxImg.style.transform = 'scale(1)';
    });
}

document.addEventListener('keydown', (e) => {
    if (lightbox && lightbox.style.display === 'flex') {
        if (e.key === 'Escape')     fecharImagem();
        if (e.key === 'ArrowRight') proximaImagem();
        if (e.key === 'ArrowLeft')  imagemAnterior();
    }
});

// ===== AVALIAÇÕES (FIREBASE) =====
let usuarioAtual       = null;
let estrelaSelecionada = 5;
let idxParaExcluir     = null;
let modoAviso          = false; // controla se o modal está em modo aviso ou exclusão

// ----- MODAL DE AVISO (reutiliza o modal de exclusão) -----
function mostrarAviso(mensagem) {
    modoAviso = true;
    document.querySelector('#modal-excluir .modal-texto').textContent = mensagem;
    document.getElementById('modal-confirmar').style.display = 'none';
    document.getElementById('modal-cancelar').textContent = 'OK';
    document.getElementById('modal-excluir').classList.add('aberto');
}

function fecharModal() {
    document.getElementById('modal-excluir').classList.remove('aberto');

    if (modoAviso) {
        // Restaura o modal para o modo exclusão
        modoAviso = false;
        document.getElementById('modal-confirmar').style.display = '';
        document.getElementById('modal-cancelar').textContent = 'Cancelar';
        document.querySelector('#modal-excluir .modal-texto').textContent = 'Excluir esta avaliação?';
        idxParaExcluir = null;
    } else {
        idxParaExcluir = null;
    }
}

// ----- BOTÕES DO MODAL -----
document.getElementById('modal-confirmar').onclick = async () => {
    if (!idxParaExcluir) return;
    try {
        await deleteDoc(doc(db, 'avaliacoes', idxParaExcluir));
    } catch (e) {
        mostrarAviso('Erro ao excluir avaliação.');
    }
    fecharModal();
    carregarAvaliacoes();
};

document.getElementById('modal-cancelar').onclick = fecharModal;

document.getElementById('modal-excluir').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-excluir')) fecharModal();
});

// ----- AUTH STATE -----
onAuthStateChanged(auth, (user) => {
    if (user) {
        usuarioAtual = { uid: user.uid, nome: user.displayName || user.email };
    } else {
        usuarioAtual = null;
    }
    renderAuth();
    carregarAvaliacoes();
});

// ----- RENDER AUTH -----
function renderAuth() {
    const loginBox     = document.getElementById('login-box');
    const cadastroBox  = document.getElementById('cadastro-box');
    const logadoBox    = document.getElementById('logado-box');
    const comentarArea = document.getElementById('comentar-area');

    if (usuarioAtual) {
        loginBox.style.display     = 'none';
        cadastroBox.style.display  = 'none';
        logadoBox.style.display    = 'block';
        comentarArea.style.display = 'block';
        document.getElementById('bem-vindo').textContent = `Olá, ${usuarioAtual.nome}! 👋`;
    } else {
        loginBox.style.display     = 'block';
        cadastroBox.style.display  = 'none';
        logadoBox.style.display    = 'none';
        comentarArea.style.display = 'none';
    }
}

document.getElementById('btn-ir-cadastro').onclick = () => {
    document.getElementById('login-box').style.display    = 'none';
    document.getElementById('cadastro-box').style.display = 'block';
};
document.getElementById('btn-ir-login').onclick = () => {
    document.getElementById('cadastro-box').style.display = 'none';
    document.getElementById('login-box').style.display    = 'block';
};

// ----- CADASTRO -----
document.getElementById('btn-cadastrar').onclick = async () => {
    const nome  = document.getElementById('cad-nome').value.trim();
    const email = document.getElementById('cad-email').value.trim();
    const senha = document.getElementById('cad-senha').value;
    const erro  = document.getElementById('cad-erro');

    if (!nome || !email || !senha) { erro.textContent = 'Preencha todos os campos.'; return; }
    if (senha.length < 6)          { erro.textContent = 'Senha deve ter ao menos 6 caracteres.'; return; }

    try {
        const cred = await createUserWithEmailAndPassword(auth, email, senha);
        await updateProfile(cred.user, { displayName: nome });
        usuarioAtual = { uid: cred.user.uid, nome };
        erro.textContent = '';
        renderAuth();
        carregarAvaliacoes();
    } catch (e) {
        if (e.code === 'auth/email-already-in-use') erro.textContent = 'E-mail já cadastrado.';
        else erro.textContent = 'Erro ao criar conta. Tente novamente.';
    }
};

// ----- LOGIN -----
document.getElementById('btn-entrar').onclick = async () => {
    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value;
    const erro  = document.getElementById('login-erro');

    try {
        await signInWithEmailAndPassword(auth, email, senha);
        erro.textContent = '';
    } catch (e) {
        erro.textContent = 'E-mail ou senha incorretos.';
    }
};

// ----- LOGOUT -----
document.getElementById('btn-sair').onclick = async () => {
    await signOut(auth);
};

// ----- ESTRELAS DO FORMULÁRIO -----
document.querySelectorAll('#estrelas-input .estrela-sel').forEach(el => {
    el.addEventListener('click', () => {
        estrelaSelecionada = parseInt(el.dataset.val);
        document.querySelectorAll('#estrelas-input .estrela-sel').forEach((e, i) => {
            e.classList.toggle('ativa', i < estrelaSelecionada);
        });
    });
});

// ----- ENVIAR AVALIAÇÃO -----
document.getElementById('btn-enviar-comentario').onclick = async () => {
    const texto = document.getElementById('novo-comentario').value.trim();
    if (!texto || !usuarioAtual) return;

    const btn = document.getElementById('btn-enviar-comentario');
    btn.disabled = true;
    btn.textContent = 'Publicando...';

    try {
        const jaExiste = await getDocs(
            query(collection(db, 'avaliacoes'), where('uid', '==', usuarioAtual.uid))
        );
        if (!jaExiste.empty) {
            mostrarAviso('Você já possui uma avaliação, edite a existente se quiser alterar');
            btn.disabled = false;
            btn.textContent = 'Publicar avaliação';
            return;
        }

        await addDoc(collection(db, 'avaliacoes'), {
            uid:      usuarioAtual.uid,
            nome:     usuarioAtual.nome,
            texto,
            estrelas: estrelaSelecionada,
            data:     new Date().toLocaleDateString('pt-BR'),
            createdAt: serverTimestamp()
        });
        document.getElementById('novo-comentario').value = '';
        estrelaSelecionada = 5;
        document.querySelectorAll('#estrelas-input .estrela-sel').forEach((e) => {
            e.classList.add('ativa');
        });
        carregarAvaliacoes();
    } catch (e) {
        mostrarAviso('Erro ao publicar avaliação. Tente novamente.');
    }

    btn.disabled = false;
    btn.textContent = 'Publicar avaliação';
};

// ----- CARREGAR AVALIAÇÕES DO FIRESTORE -----
async function carregarAvaliacoes() {
    const lista = document.getElementById('lista-avaliacoes');
    lista.innerHTML = '<p class="sem-avaliacoes">Carregando avaliações...</p>';

    try {
        const q = query(collection(db, 'avaliacoes'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            lista.innerHTML = '<p class="sem-avaliacoes">Nenhuma avaliação ainda. Seja o primeiro!</p>';
            return;
        }

        lista.innerHTML = '';

        // ----- NOTA MÉDIA -----
        let totalEstrelas = 0;
        const docs = [];
        snapshot.forEach(docSnap => {
            docs.push(docSnap);
            totalEstrelas += docSnap.data().estrelas || 0;
        });
        const media = (totalEstrelas / docs.length).toFixed(1);
        const mediaInteira = Math.round(totalEstrelas / docs.length);

        const resumo = document.getElementById('resumo-avaliacoes');
        if (resumo) {
            resumo.innerHTML = `
                <div class="nota-media">
                    <span class="nota-numero">${media}</span>
                    <div class="nota-estrelas">${'★'.repeat(mediaInteira)}${'☆'.repeat(5 - mediaInteira)}</div>
                    <span class="nota-total">baseado em ${docs.length} avaliaçõe${docs.length !== 1 ? 's' : ''}</span>
                </div>
            `;
        }

        docs.forEach(docSnap => {
            const av    = docSnap.data();
            const docId = docSnap.id;
            const ehDono = usuarioAtual && usuarioAtual.uid === av.uid;

            const item = document.createElement('div');
            item.className = 'avaliacao-item';
            item.id = `av-item-${docId}`;
            item.innerHTML = `
                <div class="av-header">
                    <span class="av-nome">${av.nome}</span>
                    <span class="av-estrelas">${'★'.repeat(av.estrelas)}${'☆'.repeat(5 - av.estrelas)}</span>
                    <span class="av-data">${av.data}</span>
                    ${ehDono ? `
                    <div class="av-opcoes-container">
                        <button class="av-opcoes-btn" data-id="${docId}">⋯</button>
                        <div class="av-menu" id="av-menu-${docId}">
                            <button data-editar="${docId}">✎ Editar</button>
                            <button data-excluir="${docId}">🗑 Excluir</button>
                        </div>
                    </div>` : ''}
                </div>
                <div id="av-texto-${docId}">
                    <p class="av-texto">${av.texto}</p>
                </div>
                <div id="av-edit-${docId}" style="display:none;">
                    <textarea class="comentario-input av-edit-input" id="av-edit-campo-${docId}">${av.texto}</textarea>
                    <div class="av-edit-estrelas" id="av-edit-estrelas-${docId}">
                        ${[1,2,3,4,5].map(n => `
                            <span class="estrela-sel ${n <= av.estrelas ? 'ativa' : ''}"
                                  data-idx="${docId}" data-val="${n}">★</span>
                        `).join('')}
                    </div>
                    <div class="auth-btns" style="margin-top:8px;">
                        <button class="btn-auth" data-salvar="${docId}">Salvar</button>
                        <button class="btn-auth btn-secondary" data-cancelar="${docId}">Cancelar</button>
                    </div>
                </div>
            `;
            lista.appendChild(item);
        });

        lista.querySelectorAll('.av-opcoes-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id   = btn.dataset.id;
                const menu = document.getElementById(`av-menu-${id}`);
                const aberto = menu.classList.contains('aberto');
                fecharTodosMenus();
                if (!aberto) menu.classList.add('aberto');
            });
        });

        lista.querySelectorAll('[data-editar]').forEach(btn => {
            btn.addEventListener('click', () => editarAvaliacao(btn.dataset.editar));
        });

        lista.querySelectorAll('[data-excluir]').forEach(btn => {
            btn.addEventListener('click', () => excluirAvaliacao(btn.dataset.excluir));
        });

        lista.querySelectorAll('[data-salvar]').forEach(btn => {
            btn.addEventListener('click', () => salvarEdicao(btn.dataset.salvar));
        });

        lista.querySelectorAll('[data-cancelar]').forEach(btn => {
            btn.addEventListener('click', () => cancelarEdicao(btn.dataset.cancelar));
        });

        lista.querySelectorAll('.av-edit-estrelas .estrela-sel').forEach(el => {
            el.addEventListener('click', () => {
                const idx = el.dataset.idx;
                const val = parseInt(el.dataset.val);
                document.querySelectorAll(`#av-edit-estrelas-${idx} .estrela-sel`).forEach((e, i) => {
                    e.classList.toggle('ativa', i < val);
                });
            });
        });

    } catch (e) {
        lista.innerHTML = '<p class="sem-avaliacoes">Erro ao carregar avaliações.</p>';
        console.error(e);
    }
}

// ----- MENU ⋯ -----
function fecharTodosMenus() {
    document.querySelectorAll('.av-menu.aberto').forEach(m => m.classList.remove('aberto'));
}
document.addEventListener('click', fecharTodosMenus);

// ----- EDITAR -----
function editarAvaliacao(docId) {
    fecharTodosMenus();
    document.getElementById(`av-texto-${docId}`).style.display = 'none';
    document.getElementById(`av-edit-${docId}`).style.display  = 'block';
}

function cancelarEdicao(docId) {
    document.getElementById(`av-texto-${docId}`).style.display = 'block';
    document.getElementById(`av-edit-${docId}`).style.display  = 'none';
}

async function salvarEdicao(docId) {
    const novoTexto = document.getElementById(`av-edit-campo-${docId}`).value.trim();
    if (!novoTexto) return;
    const estrelasAtivas = document.querySelectorAll(`#av-edit-estrelas-${docId} .estrela-sel.ativa`).length;

    try {
        await updateDoc(doc(db, 'avaliacoes', docId), {
            texto:    novoTexto,
            estrelas: estrelasAtivas || 5,
            editado:  true
        });
        carregarAvaliacoes();
    } catch (e) {
        mostrarAviso('Erro ao salvar edição.');
    }
}

// ----- EXCLUIR (modal) -----
function excluirAvaliacao(docId) {
    fecharTodosMenus();
    idxParaExcluir = docId;
    modoAviso = false;
    document.querySelector('#modal-excluir .modal-texto').textContent = 'Excluir esta avaliação?';
    document.getElementById('modal-confirmar').style.display = '';
    document.getElementById('modal-cancelar').textContent = 'Cancelar';
    document.getElementById('modal-excluir').classList.add('aberto');
}
