/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExecutionEnvironment } from "@/types/executor";
import puppeteer from "puppeteer";
import { LaunchBrowserTask } from "../task/LaunchBrowser";

export async function LaunchBrowserExecutor(
  environment: ExecutionEnvironment<typeof LaunchBrowserTask>
): Promise<boolean> {
  try {
    const websiteURL = environment.getInput("Website url");

    const browser = await puppeteer.launch({
      headless: true,
    });

    environment.log.info("Browser iniciado com sucesso");
    environment.setBrowser(browser);

    const page = await browser.newPage();
    await page.goto(websiteURL);

    environment.setPage(page);
    environment.log.info(`Página ${websiteURL} carregada com sucesso`);

    return true;
  } catch (error: any) {
    environment.log.error(error.message);

    return false;
  }
}
