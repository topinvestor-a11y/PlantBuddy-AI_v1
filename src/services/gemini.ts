import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });

/**
 * Retries a function with exponential backoff and model fallback.
 */
async function withRobustRetry<T>(fn: (model: string) => Promise<T>, models: string[], retries = 3, delay = 1500): Promise<T> {
  let currentModelIndex = 0;
  
  async function attempt(retryCount: number, currentDelay: number): Promise<T> {
    const model = models[currentModelIndex];
    try {
      return await fn(model);
    } catch (error: any) {
      const errorMsg = error.message || "";
      const isRetryable = errorMsg.includes("503") || 
                        errorMsg.includes("high demand") || 
                        errorMsg.includes("429") || 
                        errorMsg.includes("deadline exceeded") ||
                        errorMsg.includes("bandwidth");

      if (retryCount > 0 && isRetryable) {
        console.warn(`Gemini API error on ${model}. Retrying in ${currentDelay}ms... (${retryCount} left)`);
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        return attempt(retryCount - 1, currentDelay * 1.5);
      }
      
      // If we have other models to try, move to the next one
      if (currentModelIndex < models.length - 1) {
        console.warn(`Switching from ${model} to ${models[currentModelIndex + 1]} due to error.`);
        currentModelIndex++;
        return attempt(3, 1000); // Reset retries for the next model
      }
      
      throw error;
    }
  }
  
  return attempt(retries, delay);
}

export async function getPlantRecommendation(userInput: {
  mbti: string;
  goal: string;
  environment: string;
}) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  console.log("Checking API Key availability...");
  
  if (!apiKey || apiKey === "MISSING_KEY" || apiKey === "MY_GEMINI_API_KEY" || apiKey === "PLACEHOLDER_KEY_CHANGE_ME" || apiKey === "undefined" || apiKey === "") {
    console.error("API Key is missing or invalid. Found value:", apiKey);
    throw new Error("API 키가 브라우저에 전달되지 않았습니다. Secrets 패널에서 GEMINI_API_KEY를 추가한 후, '새 프로젝트'로 다시 시작하거나 브라우저를 완전히 새로고침(F5) 해주세요.");
  }

  const modelsToTry = ["gemini-3-flash-preview", "gemini-3.1-flash-lite-preview", "gemini-flash-latest"];

  try {
    const response = await withRobustRetry((modelName) => ai.models.generateContent({
      model: modelName,
      contents: `대한민국 MZ세대 '식집사'를 위한 MBTI 기반 반려식물 추천 서비스입니다.
      사용자 정보:
      - MBTI: ${userInput.mbti}
      - 키우는 목적: ${userInput.goal}
      - 재배 환경: ${userInput.environment}
      
      위 정보를 바탕으로 다음 구조에 맞춰 Markdown 형식으로 작성해주세요:

      # [식물 이름]
      (여기에 식물 이름을 적어주세요)

      ## 🌿 MBTI 궁합 분석
      (해당 MBTI 성향과 왜 이 식물이 잘 어울리는지 2-3문장으로 설명)

      ## ✨ 식물 상세 프로필
      - **꽃말**: (꽃말)
      - **관리 난이도**: (초보/중급/고급)
      - **특징**: (식물의 주요 특징 1-2가지)

      ## 🧘 테라피 가이드
      (심리적 치유를 위한 '식물과 교감하는 팁'을 구체적으로 제안)

      응답은 한국어로, 따뜻하고 감성적인 어조로 작성해주세요.`,
      config: {
        systemInstruction: "당신은 식물 테라피스트이자 전문 가드너입니다. MZ세대의 감성에 맞춰 따뜻하고 전문적인 조언을 제공합니다.",
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ]
      }
    }), modelsToTry);
    
    if (!response.text) {
      throw new Error("AI가 응답을 생성했지만 내용이 비어 있습니다. 다시 시도해 주세요.");
    }
    
    return response.text;
  } catch (error: any) {
    console.error("Critical Error in getPlantRecommendation:", error);
    if (error.message?.includes("503") || error.message?.includes("high demand")) {
      throw new Error("현재 모든 AI 채널이 매우 붐비고 있습니다. 1~2분 후에 다시 시도해 주시면 감사하겠습니다.");
    }
    throw new Error(error.message || "식물 추천을 가져오는 중 예상치 못한 오류가 발생했습니다.");
  }
}
