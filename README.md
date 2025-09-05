# GranaSmart

Uma aplicação web para gerenciamento de finanças pessoais, desenvolvida com HTML, CSS (Bootstrap 5) e JavaScript puro. Utiliza Firebase (Authentication e Firestore) como backend para autenticação de usuários e armazenamento de dados.

## Funcionalidades

- **Autenticação de Usuários**: Login e cadastro com Firebase Authentication
- **Dashboard Financeiro**: Visualização de saldo, receitas e despesas
- **Gráficos**: Visualização de dados financeiros com Chart.js
- **Gerenciamento de Transações**: Adicionar, editar e excluir receitas e despesas
- **Categorização**: Organização de transações por categorias
- **Filtros**: Filtragem por mês, ano, tipo e categoria
- **Exportação**: Exportação de dados em PDF, Excel e gráficos em PNG
- **Design Responsivo**: Interface adaptável para dispositivos móveis e desktop

## Tecnologias Utilizadas

- HTML5
- CSS3 com Bootstrap 5
- JavaScript (ES6+)
- Firebase Authentication
- Firebase Firestore
- Chart.js para gráficos
- jsPDF para exportação em PDF
- SheetJS para exportação em Excel

## Estrutura do Projeto

```
/
├── index.html          # Página principal da aplicação
├── css/
│   └── styles.css      # Estilos personalizados
├── js/
│   ├── app.js          # Inicialização da aplicação
│   ├── auth.js         # Gerenciamento de autenticação
│   ├── dashboard.js    # Funcionalidades do dashboard
│   ├── export.js       # Funcionalidades de exportação
│   ├── firebase-config.js # Configuração do Firebase
│   └── transactions.js # Gerenciamento de transações
└── img/               # Imagens e ícones
```

## Configuração do Firebase

Para utilizar esta aplicação, você precisa configurar um projeto no Firebase:

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Crie um novo projeto
3. Adicione um aplicativo da Web ao seu projeto
4. Copie as credenciais de configuração
5. Substitua as credenciais no arquivo `js/firebase-config.js`

```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJECT_ID.firebaseapp.com",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_PROJECT_ID.appspot.com",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
};
```

6. No console do Firebase, ative a autenticação por e-mail/senha:
   - Vá para Authentication > Sign-in method
   - Ative o provedor "E-mail/senha"

7. Configure o Firestore Database:
   - Vá para Firestore Database > Criar banco de dados
   - Comece no modo de produção ou teste
   - Escolha a localização do servidor mais próxima de você
   - Configure as regras de segurança para permitir acesso apenas a usuários autenticados

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /transactions/{transactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /settings/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## Instalação Local

1. Clone este repositório:
```
git clone https://github.com/seu-usuario/granasmart.git
```

2. Navegue até o diretório do projeto:
```
cd granasmart
```

3. Abra o arquivo `index.html` em seu navegador ou use um servidor local como o Live Server do VS Code.

## Deploy no GitHub Pages

1. Crie um repositório no GitHub

2. Inicialize o Git no diretório do projeto (se ainda não estiver inicializado):
```
git init
```

3. Adicione o repositório remoto:
```
git remote add origin https://github.com/seu-usuario/granasmart.git
```

4. Adicione todos os arquivos ao commit:
```
git add .
```

5. Faça o commit:
```
git commit -m "Versão inicial do GranaSmart"
```

6. Envie para o GitHub:
```
git push -u origin main
```

7. No GitHub, vá para Settings > Pages

8. Em "Source", selecione a branch "main" e a pasta "/ (root)" e clique em "Save"

9. Aguarde alguns minutos e seu site estará disponível em `https://seu-usuario.github.io/granasmart/`

## Considerações de Segurança

- As credenciais do Firebase estão expostas no frontend, mas as regras de segurança do Firestore garantem que os usuários só possam acessar seus próprios dados.
- Nunca armazene informações sensíveis no código-fonte ou no Firestore sem a devida proteção.
- Considere implementar autenticação de dois fatores para maior segurança.

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Autor

Seu Nome - [seu-email@exemplo.com](mailto:seu-email@exemplo.com)

---

© 2025 GranaSmart