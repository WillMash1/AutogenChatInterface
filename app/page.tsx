"use client";

import { useRef, useState } from "react";
import Spinner from "./Spinner";

export default function Home() {
  const [userQuestions, setUserQuestion] = useState<string>("");
  const [answers, setAnswers] = useState<{message: string, source: string}[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const ws = new WebSocket("ws://localhost:8002/ws/chat");

  ws.onmessage = function (event) {
    setIsLoading(true);

    const message = JSON.parse(event.data);

    if (message.type === "error") {
      console.error(message.content);
    } else {
      console.log(message);
      if(message.content) {
        setAnswers(prevAnswers => [...prevAnswers, {message: message.content, source: message.source}])
      }

      setIsLoading(false);
    }
  };

  const postWithWebsocket = () => {
    setIsLoading(true);

    ws.send(JSON.stringify({ content: userQuestions, source: "user" }));
  };

  return (
    <>
      <div>
        <form className="flex flex-col">
          <label className="font-bold ">What would you like to research?</label>
          <input
            value={userQuestions}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder="What's the weather in New York City"
            className="border border-white"
          />
          <button onClick={postWithWebsocket} type="button">
            Send
          </button>
        </form>

        {isLoading && (
          <div>
            <p>Loading</p>
            <Spinner />
          </div>
        )}
           {answers.map((answer, index) => (
            <div className="flex" key={index + answer.message}>
                <p>{answer.source}: </p>
                <p>{answer.message}</p>
            </div>
           ))}
      
      </div>
    </>
  );
}
