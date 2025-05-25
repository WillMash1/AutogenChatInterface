"use client";

import { useRef, useState } from "react";
import Spinner from "./Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function Home() {
  const [userQuestions, setUserQuestion] = useState<string>("");
  const [answers, setAnswers] = useState<{ message: string; source: string }[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const url = process.env.NEXT_PUBLIC_API_URL!
  const ws = new WebSocket(url);

  ws.onmessage = function (event) {
    setIsLoading(true);

    const message = JSON.parse(event.data);

    if (message.type === "error") {
      console.error(message.content);
    } else {
      console.log(message);
      if (message.content) {
        setAnswers((prevAnswers) => [
          ...prevAnswers,
          { message: message.content, source: message.source },
        ]);
      }
      console.log('source', message.source);
      if(message.source === "yoda" || !message.content) {
        
        setIsLoading(false);
      }
      
    }
  };

  const postWithWebsocket = () => {
    setIsLoading(true);

    ws.send(JSON.stringify({ content: userQuestions, source: "user" }));
  };

  return (
    <>
      <div className="flex flex-row justify-center items-center w-screen h-screen">
        <Card className="flex flex-col w-2/5 gap-2 p-8 h-fit">
          <h1 className="font-bold text-xl">What would you like to research?</h1>
          
          
          <div>
          {answers.map((answer, index) => (
            <div className="flex flex-row mt-2" key={index + answer.message}>
              <p className="w-1/5 font-bold mr-2">{answer.source}: </p>
               {" "}
              <p className="w-4/5">{answer.message}</p>
            </div>
          ))}
          </div>
          {isLoading && (
                        <Spinner />
                    )}
          <Input
            value={userQuestions}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder="What's the weather in New York City?"
            // className="border border-blac"
          />
          <Button onClick={postWithWebsocket} type="button">
            Send
          </Button>
        </Card>
      </div>
    </>
  );
}
