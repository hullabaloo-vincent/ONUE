import React, { useState } from "react";
import "./App.css";

const characters = [
  { name: "Doppelganger", alt: "Fake Santa", group: "Doppelganger", image: "/images/doppelganger.png", order: 1, dialogue: "Look at another player's card. You are now that role. If your new role has a night action, do it now." },
  { name: "Werewolf #1", alt: "Elf", group: "Werewolf", image: "/images/doppelganger.png", order: 2, dialogue: "Look for other elves." },
  { name: "Werewolf #2", alt: "Elf", group: "Werewolf", image: "/images/doppelganger.png", order: 2, dialogue: "Look for other elves." },
  { name: "Minion", alt: "Toy Soldiers", group: "Minion", image: "/images/minion.png", order: 3, dialogue: "Elves, stick out your thumb so the Toy Soldier can see who you are." },
  { name: "Mason #1", alt: "Heat Miser", group: "Mason", image: "/images/mason_1.png", order: 4, dialogue: "Look for other Masons." },
  { name: "Mason #2", alt: "Snow Miser", group: "Mason", image: "/images/mason_2.png", order: 4, dialogue: "Look for other Masons." },
  { name: "Seer", alt: "Santa", group: "Seer", image: "/images/seer.png", order: 5, dialogue: "You may look at another player's card or two of the center cards." },
  { name: "Robber", alt: "Grinch", group: "Robber", image: "/images/robber.png", order: 6, dialogue: "You may exchange your card with another player’s card, and then view your new card." },
  { name: "Troublemaker", alt: "Kevin McCallister", group: "Troublemaker", image: "/images/troublemaker.png", order: 7, dialogue: "You may exchange cards between two other players." },
  { name: "Drunk", alt: "Cousin Eddie", group: "Drunk", image: "/images/drunk.png", order: 8, dialogue: "Exchange your card with another card from the center." },
  { name: "Insomniac", alt: "Cindy Lou Who", group: "Insomniac", image: "/images/insomniac.png", order: 9, dialogue: "Look at your card." },
  { name: "Hunter", alt: "Ralphie", image: "/images/hunter.png", order: null, dialogue: "" },
  { name: "Tanner", alt: "Scrooge", image: "/images/tanner.png", order: null, dialogue: "" },
  { name: "Villager #1", alt: "Clarice", image: "/images/villager_1.png", order: null, dialogue: "" },
  { name: "Villager #2", alt: "Linus Van Pelt", image: "/images/villager_2.png", order: null, dialogue: "" },
  { name: "Villager #3", alt: "Tiny Tim", image: "/images/villager_3.png", order: null, dialogue: "" }
];

const playAudio = (filePath) => {
  return new Promise((resolve) => {
    const audio = new Audio(filePath);
    audio.onended = resolve; // Resolve when the audio finishes
    audio.play();
  });
};

const handleGameFlow = async (characters, selectedCharacters) => {
  // Deduplicate characters by group (only the first occurrence of each group goes)
  const uniqueGroups = new Set();
  const orderedCharacters = characters
      .filter((char) => selectedCharacters.includes(char.name))
      .filter((char) => char.order !== null)
      .filter((char) => {
        if (uniqueGroups.has(char.group)) return false; // Skip duplicate groups
        uniqueGroups.add(char.group);
        return true;
      })
      .sort((a, b) => a.order - b.order);

  const insomniacSelected = selectedCharacters.includes("Insomniac");
  const minionSelected = selectedCharacters.includes("Minion");
  const dopplegangerSelected = selectedCharacters.includes("Doppelganger");

  // Start game with announcer
  await playAudio("/audio/Announcer_start.mp3");

  for (let i = 0; i < orderedCharacters.length; i++) {
    const character = orderedCharacters[i];
    const previousCharacter = i > 0 ? orderedCharacters[i - 1].alt : null;

    if (character.group === "Doppelganger" && minionSelected) {
      // Special Doppelganger + Minion dialogue
      await playAudio("/audio/Doppleganger_minion_01.mp3");
      await new Promise((resolve) => setTimeout(resolve, 10000)); // 10-second pause
      await playAudio("/audio/Doppleganger_minion_02.mp3");
      await new Promise((resolve) => setTimeout(resolve, 10000)); // 10-second pause
      await playAudio("/audio/Doppleganger_minion_03.mp3");
    } else {
      // Standard character dialogue
      if (previousCharacter) {
        // Play the audio file for previous character's name
        console.log(`/audio/Name_${previousCharacter.replace(" ", "")}.mp3`);
        console.log(previousCharacter);
        if (previousCharacter === "Heat Miser" || previousCharacter === "Snow Miser") {
          console.log("Going in here")
          console.log(`/audio/Name_Miser.mp3`);
          await playAudio(`/audio/Name_Miser.mp3`);
        } else {
          await playAudio(`/audio/Name_${previousCharacter.replace(" ", "")}.mp3`);
        }
        await playAudio("/audio/Close_your_eyes.mp3");
      }

      // Play the audio file for current character's name
      if (character.group === "Mason") {
        console.log(`/audio/Name_Miser.mp3`);
        await playAudio(`/audio/Name_Miser.mp3`);
      } else {
        console.log(`/audio/Name_${character.alt.replace(" ", "")}.mp3`);
        await playAudio(`/audio/Name_${character.alt.replace(" ", "")}.mp3`);
      }
      
      await playAudio("/audio/Wake_Up.mp3");
      
      console.log(`/audio/Dialogue_${character.group}.mp3`);
      await playAudio(`/audio/Dialogue_${character.group}.mp3`);
    }

    // 10-second pause after each character
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }

  // Insomniac + Doppelganger special case
  if (insomniacSelected && dopplegangerSelected) {
    await playAudio("/audio/Doppleganger_insomniac_01.mp3");
    await new Promise((resolve) => setTimeout(resolve, 5000)); // 5-second pause
    await playAudio("/audio/Doppleganger_insomniac_02.mp3");
  }

  // End game with announcer
  await playAudio("/audio/Announcer_end.mp3");
};

function App() {
  const [selectedCharacters, setSelectedCharacters] = useState(["Werewolf #1"]);

  const toggleCharacterSelection = (characterName) => {
    if (characterName === "Werewolf #1") return; // Prevent deselecting Werewolf #1
    setSelectedCharacters((prev) =>
        prev.includes(characterName)
            ? prev.filter((item) => item !== characterName)
            : [...prev, characterName]
    );
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
        <button
            className="start-button"
            onClick={() => handleGameFlow(characters, selectedCharacters)}
        >
          Start
        </button>
      </div>
  );
}

export default App;