import { json, type RequestHandler } from "@sveltejs/kit";
import { Ollama } from "ollama";

export const POST: RequestHandler = async ({ request }) => {
  const ollama = new Ollama({ host: "http://localhost:11434/" }); // Ensure Ollama host is correct

  const dataOfUser = {
    name: "Sherwin",
    course: "BSCS",
    Birthday: "October 29, 1999",
    hobbies: ["Listening to music", "Watching Anime", "Reading Manhwa"],
    favoriteFoods: ["Sinigang", "Adobo", "Kare-Kare"],
    favoriteDrinks: ["Coffee", "Tea", "C2", "Coke", "Royal", "Mountain Dew"],
    Age: "25",
    gender: "Male",
    height: "5'8",
    weight: "57kg",
    religion: "Catholic",
    Status: "Single",
    occupation: "Student",
    nationality: "Filipino",
    city: "Olongapo City",
    Address: "107 Fendler St East Tapinac",
    contactNumber: "0926-123-4567",
    email: "cH2yH@example.com",
    website: "https://github.com/Sherwin-Abdul",
    facebook: "https://www.facebook.com/sherwin.abdul",
    instagram: "https://www.instagram.com/sherwin_abdul",
    twitter: "https://twitter.com/sherwin_abdul",
    favoriteColor: ["Black", "Green"],
    favoriteAnimal: ["Cat", "Dog"],
    favoriteBook: ["The Lord of the Rings", "Harry Potter"],
    favoriteMovie: ["The Lord of the Rings", "Harry Potter"],
    userType: "Master User",
  };

  try {
    const { message } = await request.json();
    if (!message) {
      return json({ error: "No message provided" }, { status: 400 });
    }

    const chat = await ollama.chat({
      model: "deepseek-r1:7b",
      messages: [
        {
          role: "system",
          content: `Hi, I'm Sherwin. Here is my data: ${JSON.stringify(dataOfUser)} 
                    Respond only based on the data of the master user.
                    Respond to Hi from the master user as "Hi, Sherwin. How can I help you today?"
                    Respond to Hello from the master user as "Hello,  Sherwin. How can I help you today?"`,
        },
        { role: "user", content: message },
      ],
    });

    return json({ response: chat.message.content });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Ollama API Error:", error);
      return json({ error: `Failed to fetch response from Ollama: ${error.message}` }, { status: 500 });
    } else {
      console.error("Unknown error:", error);
      return json({ error: "An unknown error occurred" }, { status: 500 });
    }
  }
};