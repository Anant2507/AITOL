import "dotenv/config";
import express from "express";
import { cacheMiddleware, cacheResponse } from "./middleware/cacheMiddleware";
import { requireApiKey } from "./middleware/authMiddleware";
import { callLLM } from "./services/llmService";
import { getStats, trackCost, createVectorIndex } from "./cache/redisCache";
import { calculateCost } from "./pricing";
import { CCE_SYSTEM_INSTRUCTION, cceCompressor } from "./cce/index";
import { routePrompt } from "./router/index";

const MRL_SYSTEM_INSTRUCTION = `You are receiving prompts compressed in MRL (Machine-Readable Language).
MRL token legend:
§EXPH=explain how, §IMPA=implement a, §REST=rest api, §CTS=in typescript,
§ERH=error handling, §SBS=step by step, §CUP=could you please,
§IWY=i would like you to, §PLS=please, §WR=write a, §WRT=write the,
§FNC=function, §CLS=class, §API=api, §DB=database, §AUTH=authentication,
§ENVS=environment variables, §BEST=best practices, §CRE=create a,
§SUM=summarize, §SUMT=summarize the, §LSTT=list the, §PRVA=provide a,
§CYH=can you help me, §MKSR=make sure to, §DIFF=difference between,
§CJS=in javascript, §CPY=in python, §CGO=in golang, §CRS=in rust,
§FMJ=in json format, §FMM=in markdown, §FMB=in bullet points,
§FML=as a list, §FMT=as a table, §DTL=in detail, §BRF=briefly,
§EXM=for example, §HOW=how to, §WHA=what is, §INCL=including,
§USNG=using, §BSTW=best way to, §H1=heading1, §H2=heading2,
§H3=heading3, §B>=bullet point, §N>=numbered item,
§TY=thank you, §TYVM=thank you very much.
Decode all §tokens before answering. Respond normally.`;

const FULL_SYSTEM_INSTRUCTION = `${MRL_SYSTEM_INSTRUCTION}\n${CCE_SYSTEM_INSTRUCTION}`;

const app = express();
app.use(express.json());

app.post("/api/llm", requireApiKey, cacheMiddleware(3600), async (req, res) => {
  try {
    const { prompt, model, params } = req.body;

    // ── Smart Router ─────────────────────────────────────────
    const routeResult = routePrompt(prompt, {
      quality: params?.quality,
      preferredModel: model,
    });
    const selectedModel = routeResult.model || model || "openai/gpt-3.5-turbo";

    // ── CCE — compress code blocks ───────────────────────────
    const mrlResult = (req as any).mrlResult;
    const cceResult = cceCompressor.compress(mrlResult.compressed);
    const finalPrompt = cceResult.compressedPrompt;

    const totalOriginalTokens = mrlResult.originalTokenCount;
    const totalCompressedTokens = cceResult.compressedCodeTokens;
    const totalTokensSaved = totalOriginalTokens - totalCompressedTokens;
    const totalRatio = totalOriginalTokens > 0
      ? parseFloat(((1 - totalCompressedTokens / totalOriginalTokens) * 100).toFixed(2))
      : 0;

    // ── LLM Call ─────────────────────────────────────────────
    const result = await callLLM({
      prompt: finalPrompt,
      model: selectedModel,
      params: {
        ...params,
        systemInstruction: FULL_SYSTEM_INSTRUCTION,
      },
    });

    const cost = calculateCost(selectedModel, result.tokensUsed);
    await trackCost("spent", cost);
    await cacheResponse(req, result);

    res.json({
      ...result,
      cached: false,
      cost,
      routing: {
        model:      selectedModel,
        tier:       routeResult.tier,
        score:      routeResult.complexity.score,
        task:       routeResult.complexity.taskType,
        reason:     routeResult.reason,
        autoRouted: !model,
      },
      compression: {
        originalTokens:   totalOriginalTokens,
        compressedTokens: totalCompressedTokens,
        tokensSaved:      totalTokensSaved,
        ratio:            totalRatio,
        mrl: {
          ratio:       mrlResult.compressionRatio,
          tokensSaved: mrlResult.originalTokenCount - mrlResult.compressedTokenCount,
        },
        cce: {
          codeBlocksFound: cceResult.codeBlocksFound,
          ratio:           cceResult.compressionRatio,
          tokensSaved:     cceResult.originalCodeTokens - cceResult.compressedCodeTokens,
        },
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "LLM request failed" });
  }
});

app.get("/api/stats", requireApiKey, async (req, res) => {
  const stats = await getStats();
  res.json(stats);
});

const PORT = process.env.PORT || 3000;
createVectorIndex();
app.listen(PORT, () => console.log(`🚀 AITOL server running on port ${PORT}`));