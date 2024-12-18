import React, { useState } from "react";
import "./App.css";

const characters = [
  { name: "Doppelgänger", alt: "Fake Santa", group: "Doppelgänger", image: "/images/doppelganger.png", order: 1, dialogue: "Look at another player's card. You are now that role. If your new role has a night action, do it now." },
  { name: "Werewolf #1", alt: "Elf", group: "Werewolf", image: "/images/doppelganger.png", order: 2, dialogue: "Look for other elves." },
  { name: "Werewolf #2", alt: "Elf", group: "Werewolf", image: "/images/doppelganger.png", order: 2, dialogue: "Look for other elves." },
  { name: "Minion", alt: "Toy Soldiers", group: "Minion", image: "/images/minion.png", order: 3, dialogue: "Elves, stick out your thumb so the Toy Soldier can see who you are." },
  { name: "Mason #1", alt: "Heat Miser", group: "Mason", image: "/images/mason_1.png", order: 4, dialogue: "Look for other Masons" },
  { name: "Mason #2", alt: "Snow Miser", group: "Mason", image: "/images/mason_2.png", order: 4, dialogue: "Look for other Masons" },
  { name: "Seer", alt: "Santa", group: "Seer", image: "/images/seer.png", order: 5, dialogue: "You may look at another player's card or two of the center cards." },
  { name: "Robber", alt: "Grinch", group: "Robber", image: "/images/robber.png", order: 6, dialogue: "You may exchange your card with another player’s card, and then view your new card" },
  { name: "Troublemaker", alt: "Kevin McCallister", group: "Troublemaker", image: "/images/troublemaker.png", order: 7, dialogue: "You may exchange cards between two other players.”" },
  { name: "Drunk", alt: "Cousin Eddie", group: "Drunk", image: "/images/drunk.png", order: 8, dialogue: "Exchange your card with another card from the center." },
  { name: "Insomniac", alt: "Cindy Lou Who", group: "Insomniac", image: "/images/insomniac.png", order: 9, dialogue: "Look at your card" },
  { name: "Hunter", alt: "Ralphie", image: "/images/hunter.png", order: null, dialogue: "" },
  { name: "Tanner", alt: "Scrooge", image: "/images/tanner.png", order: null, dialogue: "" },
  { name: "Villager #1", alt: "Clarice", image: "/images/villager_1.png", order: null, dialogue: "" },
  { name: "Villager #2", alt: "Linus Van Pelt", image: "/images/villager_2.png", order: null, dialogue: "" },
  { name: "Villager #3", alt: "Tiny Tim", image: "/images/villager_3.png", order: null, dialogue: "" }
];

function App() {
  const [selectedCharacters, setSelectedCharacters] = useState(["Werewolf #1"]);
  const speech = window.speechSynthesis;

  // Toggle character selection, prevent deselection of "Werewolf #1"
  const toggleCharacterSelection = (characterName) => {
    if (characterName === "Werewolf #1") return; // Prevent deselecting Werewolf #1
    setSelectedCharacters((prev) =>
        prev.includes(characterName)
            ? prev.filter((item) => item !== characterName)
            : [...prev, characterName]
    );
  };

  // Speak text using Web Speech API
  const speak = (text) => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = resolve; // Resolve the promise when speech ends
      speech.speak(utterance);
    });
  };

  // Filter and deduplicate roles based on their group
  const getUniqueRoles = () => {
    const uniqueGroups = new Set();
    return characters
        .filter((char) => selectedCharacters.includes(char.name)) // Only include selected characters
        .filter((char) => char.order !== null) // Exclude characters with order: null
        .filter((char) => {
          if (uniqueGroups.has(char.group)) return false; // Skip duplicates
          uniqueGroups.add(char.group);
          return true;
        })
        .sort((a, b) => a.order - b.order); // Sort by order
  };

  // Handle game flow with announcer text
  const handleGameFlow = async () => {
    const orderedCharacters = getUniqueRoles();
    const insomniacSelected = selectedCharacters.includes("Insomniac");
    const minionSelected = selectedCharacters.includes("Minion");
    const dopplegangerSelected = selectedCharacters.includes("Doppelgänger");

    // Start game with announcer
    await speak("Everyone, close your eyes.");
    await new Promise((resolve) => setTimeout(resolve, 5000)); // 5-second pause
    let lastCharacter = null;
    for (let i = 0; i < orderedCharacters.length; i++) {
      const character = orderedCharacters[i];
      const previousCharacter = i > 0 ? orderedCharacters[i - 1].alt : null;
      lastCharacter = character.alt;
      if (character.group === "Doppelgänger" && minionSelected) {
        // Doppelgänger + Minion special logic
        await speak("Fake Santa, wake up and look at another player's card. You are now that role. If your new role has a night action, do it now.");
        await new Promise((resolve) => setTimeout(resolve, 10000)); // 10-second pause
        await speak("If you are now a Toy Soldier, keep your eyes open. Otherwise, close them. Elves, stick out your thumb so the Fake Santa can see who you are.");
        await new Promise((resolve) => setTimeout(resolve, 10000)); // 10-second pause
        await speak("Elves, put your thumbs away.");
      } else {
        // Standard turn logic
        if (previousCharacter) {
          await speak(`${previousCharacter}, close your eyes. ${character.alt}, wake up. ${character.dialogue}`);
        } else {
          await speak(`${character.alt}, wake up. ${character.dialogue}`);
        }
      }
      // Add a 10-second pause after each character's turn
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
    await speak(`${lastCharacter}, close your eyes.`);
    
    // Handle Insomniac-specific logic before "open your eyes"
    if (insomniacSelected && dopplegangerSelected) {
      await speak("Fake Santa, if you viewed the Cindy Lou Who card, wake up and look at your card.");
      await new Promise((resolve) => setTimeout(resolve, 5000)); // 5-second pause
      await speak("Fake Santa, close your eyes.");
      await new Promise((resolve) => setTimeout(resolve, 5000)); // 5-second pause
    }

    // End game with announcer
    await speak("Everyone, open your eyes.");
  };

  return (
      <div className="App">
        <h1>One Night Ultimate Elf</h1>
        <h2>Choose Your Characters</h2>
        <div className="character-grid">
          {characters.map((character) => (
              <div
                  key={character.name}
                  className={`character-box ${
                      selectedCharacters.includes(character.name) ? "selected" : ""
                  } ${character.name === "Werewolf #1" ? "forced-selected" : ""}`}
                  onClick={() => toggleCharacterSelection(character.name)}
              >
                <img
                    src={character.image}
                    alt={`${character.name} (${character.alt})`}
                    className="character-image"
                />
                <p>{character.alt}</p>
                <p>({character.name})</p>
              </div>
          ))}
        </div>
        <button className="start-button" onClick={handleGameFlow}>
          Start
        </button>
      </div>
  );
}

export default App;