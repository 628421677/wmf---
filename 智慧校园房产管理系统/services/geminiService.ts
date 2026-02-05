import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

const API_KEY = process.env.API_KEY || ''; // In a real scenario, handle missing key gracefully

// Check if window.aistudio exists for Veo functionality, though we are doing text chat here.
// We strictly follow the provided guidance:
const ai = new GoogleGenAI({ apiKey: API_KEY });

const SYSTEM_INSTRUCTION = `
你是 NOAH（Network Operations Artificial Helper），校园地下管网运维系统的核心 AI 决策辅助专家。
你的角色不仅仅是聊天机器人，你连接着后台的知识图谱和实时数据库。

核心能力：
1. **数据问答**：可以查询特定管网（如 P-101）的材质、流速、连接的楼宇（如 B-LIB）。
2. **决策推理**：基于当前报警（如 P-103 堵塞），结合知识图谱，给出故障处置方案（如：建议启动反冲洗，或生成维修工单）。
3. **运维支持**：协助生成报表，解释运维规范。

语气风格：
专业、冷静、具有预测性。回答问题时，请模拟你在“查询数据库”或“分析知识图谱”。
使用中文（简体）回答。

当前系统上下文数据：
- 供水管网：98% 正常，P-101 压力稳定。
- 排水管网：P-103 (连接理科楼) 发生严重堵塞报警，已生成工单 WO-20231201-01。
- 楼宇状态：北区宿舍用水量激增（+15%）。
`;

export const streamChatResponse = async (
  history: ChatMessage[],
  onChunk: (text: string) => void
) => {
  if (!API_KEY) {
    onChunk("错误：系统配置丢失（未找到 API_KEY）。通信离线。");
    return;
  }

  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    // Convert history to compatible format if needed, but for simple demo, we just send the last message
    // In a real app, we'd sync history.
    const lastUserMsg = history[history.length - 1];
    if (lastUserMsg.role !== 'user') return;

    const result = await chat.sendMessageStream({ message: lastUserMsg.text });

    for await (const chunk of result) {
       // Correct property access as per guidance
       const text = chunk.text; 
       if (text) {
         onChunk(text);
       }
    }

  } catch (error) {
    console.error("Communication uplink failed:", error);
    onChunk("\n[!] 网络错误：与中央 AI 核心的连接中断。");
  }
};
