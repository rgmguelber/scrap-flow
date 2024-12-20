"use client";

import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Layers2Icon, Loader2Icon } from "lucide-react";

import {
  createWorkflowSchema,
  createWorkflowSchemaType,
} from "@/schemas/workflows";

import CustomDialogHeader from "@/components/CustomDialogHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { CreateWorkflow } from "@/actions/workflows/createWorkflow";
import { toast } from "sonner";
import { DialogDescription } from "@radix-ui/react-dialog";

function CreateWorkflowDialog({ triggerText }: { triggerText?: string }) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof createWorkflowSchema>>({
    resolver: zodResolver(createWorkflowSchema),
    defaultValues: { name: "", description: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: CreateWorkflow,
    onSuccess: () => {
      toast.success("Workflow criado.", { id: "create-workflow" });
    },
    onError: (error) => {
      console.log(error);
      toast.error("Falha ao criar workflow", { id: "create-workflow" });
    },
  });

  const onSubmit = useCallback(
    (values: createWorkflowSchemaType) => {
      toast.loading("Criando o workflow...", { id: "create-workflow" });
      mutate(values);
    },
    [mutate]
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        form.reset();
        setOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button>{triggerText ?? "Criar um workflow"}</Button>
      </DialogTrigger>

      <DialogDescription className="hidden" />

      <DialogContent className="px-0">
        <CustomDialogHeader
          icon={Layers2Icon}
          title="Crie um workflow"
          subTitle="Inicie a criação de um workflow"
        />

        <div className="p-6">
          <Form {...form}>
            <form
              className="space-y-8 w-full"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex gap-1 items-center">
                      Nome
                      <p className="text-xs text-primary">(requirido)</p>
                    </FormLabel>

                    <FormControl>
                      <Input {...field} />
                    </FormControl>

                    <FormDescription>
                      Escolha uma descrição. Ela deve ser única.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex gap-1 items-center">
                      Descrição
                      <p className="text-xs text-muted-foreground">
                        (opcional)
                      </p>
                    </FormLabel>

                    <FormControl>
                      <Textarea {...field} className="resize-none" />
                    </FormControl>

                    <FormDescription>
                      Forneça uma breve descrição sobre o que este workflow faz.
                      <br />
                      Isto é opcional, mas pode ajudar você a se lembrar do que
                      se trata
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                {!isPending && "Criar"}
                {isPending && <Loader2Icon className="animate-spin" />}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateWorkflowDialog;
