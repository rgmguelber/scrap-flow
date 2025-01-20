import { ExecutionEnvironment } from "@/types/executor";
import { PageToHtml } from "../task/PageToHtml";

export async function PageToHtmlExecutor(
  environment: ExecutionEnvironment<typeof PageToHtml>
): Promise<boolean> {
  try {
    const html = await environment.getPage()!.content();

    environment.setOutputs("Html", html);

    return true;
  } catch (error: any) {
    environment.log.error(error.message);

    return false;
  }
}
