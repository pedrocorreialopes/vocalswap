# 🎙️ VocalSwap — Substituição de Vocal com IA

> MVP Frontend completo para substituição de vocal em músicas usando Inteligência Artificial.
> Arquitetura pronta para integrar backends de separação de stems (Demucs/HTDemucs) e conversão de voz (RVC v2, SoftVC, Diff-SVC).

---

## ✅ Funcionalidades Implementadas

### 🎛️ Estúdio (Aba Principal)
- **Upload de música** por clique ou drag & drop (MP3, WAV, FLAC, AAC, OGG — até 100 MB)
- **Visualização de waveform** em tempo real com WaveSurfer.js
- **Player de áudio** com controle de play/pause, progresso e volume
- **Upload de vocal de referência** diretamente no estúdio (até 50 MB)
- **Salvar vocal na biblioteca** com nome, descrição e tags categorização
- **Selecionar vocal da biblioteca** com busca inline
- **Parâmetros de separação de stems**: modelo (HTDemucs, MDX Extra, Demucs v3), qualidade de saída
- **Parâmetros de conversão de voz**:
  - Transposição de tom (–12 a +12 semitones)
  - Índice de proteção de vogais
  - Mistura Original / Convertida (%)
  - Reverberação da sala (%)
  - Algoritmo: RVC v2, SoftVC+VITS, Diff-SVC, DDSP-SVC
  - Filtro de frequência
  - Opções: Remover ruído, Auto-tune suave
- **Barra de processamento** com status em tempo real (4 etapas animadas)
- **Seção de resultado** com player dedicado e waveform verde
- **Comparação A/B** original vs. convertido
- **Metadados do resultado**: duração, formato, voz usada, algoritmo, tempo de processamento
- **Exportação simulada**: WAV, MP3 320kbps, MP3 192kbps, Stems ZIP

### 📚 Biblioteca de Vozes
- **Listagem em grade e lista** de todas as vozes enviadas
- **Busca** por nome, descrição e tags
- **Filtros por tag**: Masculino, Feminino, Tenor, Soprano, Pop, etc.
- **Cards detalhados**: avatar, nome, duração, tags, descrição
- **Modal de detalhe**: player de pré-escuta, metadados completos, excluir, usar no estúdio
- **Modal de upload**: arrastar/clicar arquivo, waveform preview, formulário de tags
- **CRUD completo** via RESTful Table API (persistência real)

### 📁 Projetos
- **Histórico** de todos os projetos de conversão criados
- **Status em tempo real**: Pendente, Separando, Convertendo, Concluído, Erro
- **Metadados**: arquivo de música, voz usada, data de criação
- **Exclusão de projetos**

### 🎨 UX / Design
- **Tema escuro por padrão** com alternância para tema claro (persistido no localStorage)
- **Design system** com tokens CSS (cores, espaçamentos, raios, tipografia)
- **Responsivo**: desktop, tablet e mobile
- **Animações** fluidas: waveform, barra de progresso shimmer, modal de processamento
- **Toast notifications** contextuais (sucesso, erro, info, aviso)
- **Acessibilidade**: ARIA labels, roles, aria-selected, aria-pressed, focus-visible
- **Fontes**: Inter + Space Grotesk (Google Fonts)
- **Ícones**: Font Awesome 6

---

## 📂 Estrutura de Arquivos

```
index.html              — HTML principal com todas as views
css/
  style.css             — Design system + todos os estilos
js/
  utils.js              — Funções auxiliares (formatadores, validação, API helpers, drag&drop)
  waveform.js           — Gerenciador de instâncias WaveSurfer + classe AudioPlayer
  library.js            — Módulo da biblioteca de vozes (CRUD + UI)
  studio.js             — Módulo do estúdio (upload, processamento, resultado)
  app.js                — Entry point (tabs, projetos, init)
README.md               — Esta documentação
```

---

## 🛣️ URIs e Rotas Funcionais

| Path | Descrição |
|------|-----------|
| `/` (index.html) | Aplicação principal — abre na aba Estúdio |
| `#tab-studio` | Aba Estúdio (padrão) |
| `#tab-library` | Aba Biblioteca de Vozes |
| `#tab-projects` | Aba Projetos |

---

## 🗄️ Modelos de Dados (RESTful Table API)

### Tabela: `voice_library`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | text | UUID único da voz |
| `name` | text | Nome dado pelo usuário |
| `filename` | text | Nome original do arquivo |
| `duration` | number | Duração em segundos |
| `size` | number | Tamanho em bytes |
| `tags` | array | Tags de categorização |
| `description` | text | Descrição opcional |
| `file_data_key` | text | Chave de referência do cache de áudio |

### Tabela: `conversion_projects`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | text | UUID do projeto |
| `project_name` | text | Nome do projeto |
| `music_filename` | text | Nome do arquivo de música |
| `selected_voice_id` | text | ID da voz selecionada |
| `status` | text | pending / separating_stems / converting_voice / mixing / completed / error |
| `progress` | number | Percentual de progresso (0–100) |
| `conversion_params` | text | JSON com parâmetros usados |

---

## 🔌 Integração com Backend (Próximos Passos)

### Arquitetura Recomendada

```
Browser (Frontend MVP) → API REST Backend → Fila de Jobs → Worker(s)
                                                              ↓
                                                    Demucs / HTDemucs  (separação)
                                                    RVC v2 / SoftVC    (conversão de voz)
                                                    FFmpeg             (mixagem final)
```

### Endpoints Backend a Implementar

```
POST /api/process
  Body: { musicFileId, voiceFileId, params }
  Response: { jobId }

GET /api/process/:jobId/status
  Response: { status, progress, step, eta }

GET /api/process/:jobId/result
  Response: { downloadUrl, stems: { vocal, instrumental } }

POST /api/upload/music    → Retorna fileId
POST /api/upload/voice    → Retorna fileId
```

### Stack de Backend Sugerida

| Componente | Tecnologia Sugerida |
|-----------|---------------------|
| Separação de stems | [Demucs / HTDemucs](https://github.com/facebookresearch/demucs) |
| Conversão de voz | [RVC (Retrieval-based Voice Conversion)](https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI) |
| API REST | FastAPI (Python) ou Express.js |
| Fila de jobs | Celery + Redis ou BullMQ |
| Storage | AWS S3 / Cloudflare R2 |
| GPU | NVIDIA A100/T4 (para RVC) |

---

## ⚠️ Limitações Atuais (MVP)

- O **processamento é simulado** — o fluxo de progresso é uma animação demonstrativa
- A **exportação** baixa o áudio original como demo (não o áudio processado)
- **Cache de áudio** pequeno (<4 MB): salvo em localStorage; maior: mantido em memória (perde ao recarregar)
- **Sem autenticação** de usuário — dados compartilhados via API pública do projeto
- O player de pré-escuta no modal de detalhes só funciona para vozes que ainda estão em memória na sessão atual

---

## 🚀 Próximas Features Recomendadas

1. **Integração real com backend** (FastAPI + Demucs + RVC)
2. **Upload de arquivos para servidor** (S3/R2) com IDs persistentes
3. **WebSocket** para progresso em tempo real do backend
4. **Preview de stems separados** (vocal isolado + instrumental)
5. **Histórico de projetos** com restauração de estado
6. **Sistema de usuários** e autenticação (JWT)
7. **Ajuste fino de modelo RVC** por voz (fine-tuning na interface)
8. **Exportação de stems individuais** (vocal, drums, bass, other)
9. **Modo colaborativo**: compartilhar projetos com link

---

## 🛠️ Tecnologias Utilizadas

| Lib | Versão | Uso |
|-----|--------|-----|
| WaveSurfer.js | 7.x | Visualização de waveform e player de áudio |
| Font Awesome | 6.5.0 | Ícones em toda a interface |
| Google Fonts | — | Inter + Space Grotesk |
| RESTful Table API | — | Persistência de vozes e projetos |

---

*VocalSwap — MVP desenvolvido com foco em UX e arquitetura escalável.*
