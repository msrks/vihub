"use client";

import { Button } from "@/components/ui/button";
import { Bot, Loader2, Paperclip } from "lucide-react";
import Image from "next/image";
import { useChat } from "ai/react";

const Playground = ({
  defectNames,
  defectDefinition,
}: {
  defectNames?: string;
  defectDefinition?: string;
}) => {
  const initialInput = `
  Please judge whether the product is 'OK' or 'NG'.
  
  FYI: 
  - Defect Names: ${defectNames}
  - Defect Definition: ${defectDefinition}

  Please return the result in JSON format.
  
  Json format: {
    result: 'OK' or 'NG',
    reason: '<reason>'
  }
  `;

  const { messages, handleSubmit, setMessages, setInput } = useChat({
    api: "/api/chat",
    initialInput,
  });

  const resetChat = () => {
    setInput(initialInput);
    setMessages([]);
  };

  return (
    <div className="mt-2">
      <div className="flex items-center space-x-2">
        <div className="text-sm font-medium ">Playground</div>

        <Button
          size="sm"
          type="button"
          className="bg-secondary text-secondary-foreground"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
      </div>
      <form
        className="flex items-center space-x-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(e, {
            data: {
              imageUrls: JSON.stringify("base64Images"),
              exampleImages: JSON.stringify("exampleImages"),
            },
          });
        }}
      >
        <Image src={""} alt="ref" width={100} height={100} />
        {messages.length === 0 ? (
          <Button size="sm" className="flex items-center space-x-1">
            <Bot />
            <span>Judge</span>
          </Button>
        ) : messages.length === 1 ? (
          <Loader2 className="h-8 w-8 animate-spin" />
        ) : (
          <div>{messages[messages.length - 1]?.content}</div>
        )}
      </form>
    </div>
  );
};

export default Playground;
