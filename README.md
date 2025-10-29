# Documentação Detalhada do Repositório `EAATA-Brasil/appSimuladorJurosVendas`

## 1. Introdução

Este documento fornece uma visão geral e detalhada do repositório `EAATA-Brasil/appSimuladorJurosVendas`. O projeto é uma aplicação móvel desenvolvida com Expo, focada na simulação de juros de vendas. Ele utiliza o roteamento baseado em arquivos do Expo Router e inclui componentes para entrada de dados financeiros, seleção de equipamentos e geração de PDFs.

## 2. Estrutura do Projeto

A estrutura do diretório do projeto é organizada da seguinte forma:

```
appSimuladorJurosVendas/
├── README.md
├── app.json
├── eas.json
├── package.json
├── tsconfig.json
├── components/
│   ├── Collapsible.tsx
│   ├── EquipamentoSelector.js
│   ├── ExternalLink.tsx
│   ├── GenePDF.js
│   ├── HapticTab.tsx
│   ├── HelloWave.tsx
│   ├── Inputs/
│   │   ├── Financeiro.js
│   │   ├── Num.js
│   │   ├── Radio.js
│   │   └── index.js
│   ├── ParallaxScrollView.tsx
│   ├── ThemedText.tsx
│   ├── ThemedView.tsx
│   └── ui/
│       ├── IconSymbol.ios.tsx
│       ├── IconSymbol.tsx
│       ├── TabBarBackground.ios.tsx
│       └── TabBarBackground.tsx
├── app/
│   ├── +not-found.tsx
│   ├── _layout.tsx
│   ├── index.js
│   └── simulador/
│       └── index.js
├── assets/
│   ├── fonts/
│   │   └── SpaceMono-Regular.ttf
│   └── images/
│       ├── icon.png
│       ├── logo.jpg
│       └── splash.png
├── constants/
│   └── Colors.ts
├── hooks/
│   ├── useColorScheme.ts
│   ├── useColorScheme.web.ts
│   └── useThemeColor.ts
├── network_security_config.xml
└── scripts/
    └── reset-project.js
```

## 3. Tecnologias Utilizadas

O projeto é construído com as seguintes tecnologias principais:

*   **Expo**: Um framework para construir aplicações universais React nativas.
*   **React Native**: Para o desenvolvimento de interfaces de usuário móveis.
*   **Expo Router**: Para roteamento baseado em arquivos.
*   **React Navigation**: Para navegação entre telas.
*   **@react-pdf/renderer**: Para geração de documentos PDF.

## 4. Como Começar

Para configurar e executar o projeto localmente, siga os passos abaixo:

1.  **Instalar Dependências**:

    ```bash
    npm install
    ```

2.  **Iniciar a Aplicação**:

    ```bash
    npx expo start
    ```

    Após iniciar, você terá opções para abrir o aplicativo em um ambiente de desenvolvimento, emulador Android, simulador iOS ou Expo Go.

## 5. Scripts Disponíveis

Os seguintes scripts estão definidos no `package.json`:

*   `start`: `expo start` - Inicia o servidor de desenvolvimento do Expo.
*   `reset-project`: `node ./scripts/reset-project.js` - Move o código inicial para `app-example` e cria um diretório `app` em branco.
*   `android`: `expo run:android` - Executa o aplicativo em um emulador ou dispositivo Android.
*   `ios`: `expo run:ios` - Executa o aplicativo em um simulador ou dispositivo iOS.
*   `web`: `expo start --web` - Inicia o aplicativo na web.
*   `lint`: `expo lint` - Executa o linter para verificar problemas de código.
*   `build:web`: `npx expo export -p web` - Constrói a versão web do aplicativo.

## 6. Dependências Principais

As dependências do projeto, conforme listado no `package.json`, incluem:

| Categoria         | Pacote                                | Descrição                                                              |
| :---------------- | :------------------------------------ | :--------------------------------------------------------------------- |
| **Core**          | `expo`                                | Framework principal do Expo.                                           |
|                   | `react`                               | Biblioteca JavaScript para construir interfaces de usuário.            |
|                   | `react-native`                        | Framework para construir aplicativos móveis nativos.                   |
|                   | `expo-router`                         | Sistema de roteamento baseado em arquivos para Expo.                   |
| **Navegação**     | `@react-navigation/bottom-tabs`       | Navegação por abas na parte inferior.                                  |
|                   | `@react-navigation/elements`          | Elementos de UI para React Navigation.                                 |
|                   | `@react-navigation/native`            | Core do React Navigation.                                              |
| **UI/UX**         | `@expo/vector-icons`                  | Conjunto de ícones vetoriais.                                          |
|                   | `@react-native-picker/picker`         | Componente de seleção (picker) nativo.                                 |
|                   | `react-native-gesture-handler`        | API unificada para sistemas de gestos.                                 |
|                   | `react-native-reanimated`             | Biblioteca de animação para React Native.                              |
|                   | `react-native-safe-area-context`      | Lida com áreas seguras em dispositivos móveis.                        |
|                   | `react-native-screens`                | Otimiza a navegação em telas.                                          |
|                   | `react-native-svg`                    | Suporte a SVG para React Native.                                       |
|                   | `expo-blur`                           | Efeitos de desfoque.                                                   |
|                   | `expo-font`                           | Carregamento de fontes personalizadas.                                 |
|                   | `expo-haptics`                        | Feedback tátil.                                                        |
|                   | `expo-image`                          | Componente de imagem otimizado.                                        |
|                   | `expo-linking`                        | Lida com links profundos.                                              |
|                   | `expo-splash-screen`                  | Gerencia a tela de splash.                                             |
|                   | `expo-status-bar`                     | Gerencia a barra de status.                                            |
|                   | `expo-symbols`                        | Símbolos para UI.                                                      |
|                   | `expo-system-ui`                      | Gerencia a UI do sistema.
| **Geração de PDF**| `@react-pdf/renderer`                 | Renderiza componentes React em PDFs.                                   |
|                   | `expo-print`                          | Funcionalidades de impressão.                                          |
|                   | `expo-sharing`                        | Compartilhamento de arquivos.                                          |
|                   | `expo-document-picker`                | Seleção de documentos.
| **Outros**        | `expo-constants`                      | Acesso a constantes do ambiente Expo.                                  |
|                   | `expo-web-browser`                    | Abre links no navegador web.                                           |
|                   | `expo-build-properties`               | Propriedades de construção para Expo.

## 7. Conclusão

O `appSimuladorJurosVendas` é um projeto Expo bem estruturado, com foco em simulação financeira e geração de relatórios em PDF. A utilização do Expo Router simplifica a navegação, e a modularidade dos componentes facilita a manutenção e expansão. As dependências indicam um desenvolvimento robusto com foco em uma experiência de usuário rica e funcionalidades completas para a plataforma móvel e web.


## 8. Para Gerar App Web e Integrar com o Django

Para gerar a versão web do aplicativo e integrá-la ao projeto Django [FormSuporte](https://github.com/EAATA-Brasil/FormSuporte), siga as etapas abaixo:

1. **Gerar a versão web do app:**

   ```bash
   npm run build:web
   ```

   Esse comando criará os arquivos HTML, CSS e JavaScript da versão web dentro da pasta `dist`.

2. **Copiar os HTMLs para o Django:**

   - Copie os arquivos `.html` gerados em `dist` para dentro da pasta de **templates** do app `simulador` no projeto Django:
     ```
     FormSuporte/FormSuporte/simulador/templates/simulador/
     ```

   - **Importante:**  
     Antes de salvar os arquivos HTML no Django, ajuste o código para que o carregamento dos arquivos estáticos seja feito corretamente.  
     Adicione no **início** do arquivo:

     ```django
     {% load static %}
     ```

     E no **final**, substitua os carregamentos diretos de JavaScript (como `<script src="..."></script>`) por:

     ```django
     <script src="{% static 'simulador/seu-arquivo.js' %}"></script>
     ```

     Isso garante que o Django carregue corretamente os arquivos estáticos.

3. **Copiar os arquivos JavaScript:**

   - Copie o(s) arquivo(s) `.js` gerado(s) também dentro da pasta `dist` para:
     ```
     FormSuporte/FormSuporte/static/simulador/
     ```
   - Edite o conteúdo do único arquivo JavaScript (se houver um principal) conforme necessário para ajustar caminhos ou variáveis de ambiente do Django.

4. **Verificação final:**

   - Certifique-se de que o `settings.py` do Django está configurado corretamente para servir arquivos estáticos.
   - Teste a renderização acessando a rota do simulador dentro do projeto `FormSuporte`.