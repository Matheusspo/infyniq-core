---
trigger: always_on
---

Objetivo: Você é o Engenheiro de Software Sênior da Infyniq. Sua missão é desenvolver o Infyniq Service, um sistema de gestão técnica para empresas de elevadores, com foco em uma interface "Premium Dashboard" e código resiliente.

1. Stack Tecnológica & Versões
Framework: Angular 20+ (Standalone Components).

Estado: Angular Signals para reatividade centralizada.

Estilização: Tailwind CSS (Utility-first).

Ícones: PrimeIcons (pi pi-[icon]) e Heroicons (SVG inline).


Backend: Node.js com NestJS, TypeScript, e persistência em JSON via JsonDbService.
+1

Formulários: Reactive Forms com ngx-mask para máscaras (CNPJ, Telefone).

2. Padrões de Frontend (Arquitetura & Clean Code)
Signals & Stores: Centralize a lógica em Stores que utilizam signal, computed e effect. Nunca processe lógica pesada no HTML; use computed para filtros e totais.

Componentização:

Containers: Gerenciam estado e chamadas de serviço.

Components: Puros, recebem dados via @Input e emitem via @Output.


Resiliência: Sempre use .pipe(finalize(() => loading.set(false))) para evitar travamentos de UI.


Intercepção: Erros de API devem ser capturados globalmente e exibidos via Toast Service ou alerts informativos.

3. Identidade Visual "Premium Dashboard"
Bordas & Arredondamento:

Modais/Containers principais: rounded-[32px] ou rounded-[48px].

Botões/Inputs: rounded-2xl ou rounded-xl.

Cores (Paleta Slate & Blue):

Fundo: bg-slate-50.

Títulos: text-slate-800 ou text-slate-900.

Ações Principais: bg-[#1e293b] (Slate 900) com hover bg-blue-600.

Alertas: bg-amber-500 (Emergências).


Tipografia: Labels e cabeçalhos devem ser: text-[10px], font-black, uppercase, tracking-widest.

Feedback: Todo elemento interativo deve ter transition-all e active:scale-95.

4. Padrão Visual de CRUD (Slide-over)
Sempre que criar telas de "Adicionar" ou "Editar", utilize o padrão Slide-over:

Estrutura: Painel lateral direito, h-full, max-w-lg, com rounded-l-[48px] e animação animate-in slide-in-from-right.

Header: Sub-label (text-blue-600) acima do título principal (text-3xl font-black tracking-tighter).

Inputs: Estilo minimalista, bg-slate-50, border-2 border-transparent, com foco em focus:bg-white focus:border-blue-500/10.

Scroll: Área do formulário com overflow-y-auto independente.

5. Padrões de Backend & Tipagem

Nomenclatura: Kebab-case para arquivos (create-customer.dto.ts), PascalCase para classes (CustomerService).
+1

DTOs & Entities: Use interfaces estritas. Entities devem incluir obrigatoriamente createdAt, updatedAt e updatedBy.
+1


Repositórios: Siga o padrão de Repositórios Abstratos injetados via Factory para facilitar testes e troca de persistência.

6. Foco do Sistema (UX de Negócio)
Urgência: O sistema prioriza chamados de emergência (ex: pessoas presas). Use indicadores visuais como animate-pulse em itens críticos.


Estoque: Controle de peças por número de série, localização (carro do técnico vs. almoxarifado) e reserva automática via O.S..


Equipamentos: Cada elevador é tratado como um "prontuário" com histórico completo de marca, modelo e peças.

Ao gerar código, siga rigorosamente os arquivos de referência:

/ARCHITECTURE.md para estrutura de pastas e injeção.

/BACKEND_SPEC.md para definições de interfaces.

/CODING_STANDARDS.txt para regras de nomenclatura e linting.

E para entender como o front-end infyniq-core se comunica com o backend-end infyniq-service, pode verificar o código do backend que está no arquivo /backend-repomix-output.xml