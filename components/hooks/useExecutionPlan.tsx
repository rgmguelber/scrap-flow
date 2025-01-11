import {
  FlowToExecutionPlan,
  FlowToExecutionPlanValidationError,
} from "@/lib/workflows/executionPlan";
import { AppNode } from "@/types/appnodes";
import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import useFlowValidation from "./useFlowValidation";
import { toast } from "sonner";

const useExecutionPlan = () => {
  const { toObject } = useReactFlow();
  const { setInvalidInputs, clearErrors } = useFlowValidation();

  const handleError = useCallback(
    (error: any) => {
      switch (error.type) {
        case FlowToExecutionPlanValidationError.NO_ENTRY_POINT:
          toast.error("Não foi localizo um EntryPoint no fluxo.");
          break;
        case FlowToExecutionPlanValidationError.INVALID_INPUTS:
          toast.error("Algum campo requerido não foi preenchido.");
          setInvalidInputs(error.invalidElements);
          break;
        default:
          toast.error("Algum erro aconteceu na execução do plano.");
          break;
      }
    },
    [setInvalidInputs]
  );

  const generateExecutionPlan = useCallback(() => {
    const { nodes, edges } = toObject();

    const { executionPlan, error } = FlowToExecutionPlan(
      nodes as AppNode[],
      edges
    );

    if (error) {
      handleError(error);

      return null;
    }

    clearErrors();
    return executionPlan;
  }, [toObject, handleError, clearErrors]);

  return generateExecutionPlan;
};

export default useExecutionPlan;
