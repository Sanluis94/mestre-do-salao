# 📖 Manual de Hospedagem — Mestre do Salão no GitHub Pages

## Pré-requisitos

- Uma conta no GitHub (seu username: **Sanluis94**)
- Git instalado no computador (baixe em https://git-scm.com se não tiver)

---

## Passo 1: Criar o Repositório no GitHub

1. Acesse https://github.com/new
2. Em **Repository name**, digite: `mestre-do-salao`
3. Deixe como **Public** (obrigatório para GitHub Pages gratuito)
4. **NÃO** marque "Add a README file"
5. Clique em **Create repository**

---

## Passo 2: Fazer Upload dos Arquivos

### Opção A: Pelo navegador (mais fácil)

1. No repositório recém-criado, clique em **"uploading an existing file"**
2. Arraste TODA a pasta `mestre-do-salao` para a área de upload:
   - `index.html`
   - `style.css`
   - Pasta `js/` com todos os arquivos (`main.js`, `scene.js`, `gameplay.js`, `ui.js`)
3. Escreva uma mensagem de commit: "Jogo Mestre do Salão"
4. Clique em **Commit changes**

> ⚠️ **IMPORTANTE:** Os arquivos devem estar na RAIZ do repositório, não dentro de uma subpasta. O `index.html` deve estar visível diretamente ao abrir o repositório.

### Opção B: Pelo Git (linha de comando)

Abra o terminal na pasta `C:\Users\Asus\Desktop\Atividade\mestre-do-salao` e execute:

```bash
git init
git add .
git commit -m "Jogo Mestre do Salão - Simulador de Gestão e Atendimento"
git branch -M main
git remote add origin https://github.com/Sanluis94/mestre-do-salao.git
git push -u origin main
```

---

## Passo 3: Ativar o GitHub Pages

1. No repositório, vá em **Settings** (ícone de engrenagem)
2. No menu lateral esquerdo, clique em **Pages**
3. Em **Source**, selecione **Deploy from a branch**
4. Em **Branch**, selecione `main` e a pasta `/ (root)`
5. Clique em **Save**

---

## Passo 4: Acessar o Jogo

Após 1-2 minutos, o jogo estará disponível em:

```
https://sanluis94.github.io/mestre-do-salao/
```

> 💡 Você pode verificar o status do deploy na aba **Actions** do repositório.

---

## Estrutura dos Arquivos

```
mestre-do-salao/
├── index.html          ← Página principal
├── style.css           ← Estilos visuais
└── js/
    ├── main.js         ← Entry point do jogo
    ├── scene.js        ← Cena 3D e modelos
    ├── gameplay.js     ← Lógica do jogo
    └── ui.js           ← Interface do usuário
```

---

## Tecnologias Utilizadas

| Tecnologia | Uso |
|---|---|
| **Three.js** (CDN) | Motor 3D para renderização do restaurante |
| **JavaScript ES Modules** | Lógica do jogo modularizada |
| **HTML5 / CSS3** | Interface, HUD e menus |
| **GitHub Pages** | Hospedagem estática gratuita |

---

## Solução de Problemas

### O jogo não carrega?
- Verifique se o `index.html` está na raiz do repositório (não em subpasta)
- Aguarde 2-3 minutos após ativar o Pages
- Limpe o cache do navegador (Ctrl+Shift+R)

### Tela preta ao clicar "Jogar"?
- O Three.js é carregado via CDN — precisa de conexão com internet
- Teste em outro navegador (Chrome/Edge recomendado)

### GitHub Pages não aparece nas Settings?
- O repositório precisa ser **Public** para o Pages gratuito
