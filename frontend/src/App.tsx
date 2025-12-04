import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

function Title(props: { title: string }) {
  return <h1 className="text-4xl font-bold text-primary">{props.title}</h1>;
}
function Content(props: { text: string }) {
  return (
    <div className="prose dark:prose-invert">
      <ReactMarkdown>{props.text}</ReactMarkdown>
    </div>
  );
}
interface Slide {
  id: number;
  title: string;
  content: string;
}
function SlideView(props: { slide: Slide }) {
  return (
    <div className="p-8  rounded-lg shadow-lg h-full w-full text-white flex flex-1 flex-col ">
      <div className="mb-8">
        <Title title={props.slide.title}></Title>
      </div>
      <div>
        <Content text={props.slide.content}></Content>
      </div>
    </div>
  );
}
function Presentation(props: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setI((current) => Math.max(0, current - 1));
      } else if (e.key === "ArrowRight") {
        setI((current) => Math.min(props.slides.length - 1, current + 1));
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [props.slides]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 w-full h-full">
      <SlideView slide={props.slides[i]}></SlideView>
    </div>
  );
}
function App() {
  const [presentation, setPresentation] = useState<Slide[]>([
    {
      id: 1,
      title: "PantryPal: Revolutionizing Food Management",
      content:
        "Welcome to **PantryPal**, an application designed to make managing your groceries and meals effortless and magical.\n\nOur core mission is to leverage **Artificial Intelligence** to transform everyday kitchen tasks:\n\n*   **Simplify inventory tracking**\n*   **Generate personalized meal ideas**\n*   **Provide proactive insights** to reduce food waste\n\nThis presentation will walk you through PantryPal's complete functionalities, highlighting the AI enhancements that power each feature.",
    },
  ]);
  useEffect(() => {
    console.log("Fetching presentation data...");
    async function fetchData() {
      const response = await fetch("http://localhost:3001/");
      const data: Slide[] = await response.json();
      setPresentation(data);
    }
    fetchData();
  }, []);
  return (
    <>
      <Presentation slides={presentation}></Presentation>
    </>
  );
}

export default App;
/*  */
