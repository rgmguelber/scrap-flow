/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExecutionEnvironment } from "@/types/executor";
import { PageToHtml } from "../task/PageToHtml";
import { waitFor } from "@/lib/helpers/waitFor";

export async function PageToHtmlExecutor(
  environment: ExecutionEnvironment<typeof PageToHtml>
): Promise<boolean> {
  try {
    const html = await environment.getPage()!.content();

    environment.setOutputs("Html", html);

    await waitFor(5000);

    return true;
  } catch (error: any) {
    environment.log.error(error.message);

    return false;
  }
}
