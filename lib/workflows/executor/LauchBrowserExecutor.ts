import { ExecutionEnvironment } from "@/types/executor";
import puppeteer from "puppeteer";
import { LaunchBrowserTask } from "../task/LaunchBrowser";

export async function LaunchBrowserExecutor(
  environment: ExecutionEnvironment<typeof LaunchBrowserTask>
): Promise<boolean> {
  try {
    const websiteURL = environment.getInput("Website url");

    const browser = await puppeteer.launch({
      headless: false,
    });

    environment.setBrowser(browser);

    const page = await browser.newPage();
    await page.goto(websiteURL);

    environment.setPage(page);

    return true;
  } catch (error: any) {
    environment.log.error(error.message);

    return false;
  }
}
