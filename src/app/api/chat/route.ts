import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Permitir streaming de respostas por até 30 segundos
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  // Criar um prompt de sistema rico com base no contexto do nó selecionado
  const systemPrompt = `
    Você é o "Living Software Canvas Agent", um assistente de arquitetura e desenvolvimento de alta performance.
    
    ESTADO ATUAL DO NÓ SELECIONADO:
    - ID: ${context.id}
    - Nome: ${context.label}
    - Tipo: ${context.type}
    - Status: ${context.status}
    - Caminho do Arquivo: ${context.filePath || 'Não definido'}
    - Caminho da Rota (se houver): ${context.routePath || 'Não definido'}
    
    NOTAS DO ARQUITETO:
    ${context.notes || 'Nenhuma nota definida ainda.'}
    
    TASKS PENDENTES:
    ${(context.tasks || []).filter((t: any) => !t.done).map((t: any) => `- ${t.text}`).join('\n') || 'Nenhuma tarefa pendente.'}
    
    BUGS ABERTOS:
    ${(context.bugs || []).filter((b: any) => !b.resolved).map((b: any) => `-[${b.severity}] ${b.text}`).join('\n') || 'Nenhum bug reportado.'}

    REGRAS DE OURO:
    1. Seja conciso e técnico.
    2. Se o usuário pedir código, forneça implementações completas e modernas (favor Next.js 15+, React 19, Tailwind v4).
    3. Ajude a resolver os bugs listados ou a planejar as tarefas pendentes.
    4. Você tem ciência de que faz parte de um gráfico de arquitetura. Considere as relações desse nó com outros se necessário.
    5. Fale em Português do Brasil.
  `;

  const result = await streamText({
    model: google('gemini-1.5-flash'),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}
