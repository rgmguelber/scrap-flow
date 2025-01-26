/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExecutionEnvironment } from "@/types/executor";
import { ExtractTextFromElement } from "../task/ExtractTextFromElement";
import * as cheerio from "cheerio";

export async function ExtractTextFromElementsExecutor(
  environment: ExecutionEnvironment<typeof ExtractTextFromElement>
): Promise<boolean> {
  try {
    const selector = environment.getInput("Selector");
    if (!selector) {
      environment.log.error("Seletor não foi definido.");
      return false;
    }

    const html = environment.getInput("Html");
    if (!html) {
      environment.log.error("HTML não foi definido.");
      return false;
    }

    const $ = cheerio.load(html);
    const element = $(selector);

    if (!element) {
      environment.log.error("Elemento não encontrado.");
      return false;
    }

    const extractedText = $.text(element);
    if (!extractedText) {
      environment.log.error("O elemento não possui nenhum texto.");
      return false;
    }

    environment.setOutputs("Extracted text", extractedText);

    return true;
  } catch (error: any) {
    environment.log.error(error.message);

    return false;
  }
}
