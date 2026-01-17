import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { DepartmentFee, ExtendedDepartmentFee } from "../types";

const apiKey = process.env.API_KEY || ''; // In a real app, ensure this is set safely
const ai = new GoogleGenAI({ apiKey });

export const generateFeeAnalysisReport = async (data: DepartmentFee[] | ExtendedDepartmentFee[]): Promise<string> => {
  if (!apiKey) return "未配置 API Key，请检查环境设置。";

  const prompt = `
    你是一名高校资产管理数据分析师。
    请分析以下大学公用房收费数据：
    ${JSON.stringify(data)}
    
    1. 识别超出定额面积严重的学院。
    2. 为超额费用最高的学院提出潜在的成本节约或空间优化建议。
    3. 请使用中文（简体）以Markdown格式输出一份简明的行政摘要报告。
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "未能生成分析报告。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "生成报告失败，请稍后再试。";
  }
};

export const suggestRepairAction = async (issueDescription: string): Promise<string> => {
    if (!apiKey) return "API Key 缺失。";

    const prompt = `
      作为一名高校设施维护专家，请对以下报修问题进行快速分诊： "${issueDescription}"。
      1. 优先级 (低/中/高/紧急)。
      2. 建议派单工种 (如：暖通、木工、电工等)。
      3. 预计维修耗时。
      请使用中文（简体）回答，保持简练。
    `;
  
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || "暂无建议。";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "无法进行智能分诊。";
    }
  };
