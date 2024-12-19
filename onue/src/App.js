import React, { useState } from "react";
import backgroundImage from './images/Background.jpeg';
import "./App.css";

const characters = [
  { name: "Doppelganger", alt: "Fake Santa", group: "Doppelganger", image: "/images/Doppelganger.png", order: 1},
  { name: "Werewolf #1", alt: "Elf", group: "Werewolf", image: "/images/Werewolf_1.png", order: 2},
  { name: "Werewolf #2", alt: "Elf", group: "Werewolf", image: "/images/Werewolf_2.png", order: 2},
  { name: "Minion", alt: "Toy Soldiers", group: "Minion", image: "/images/Minion.png", order: 3},
  { name: "Mason #1", alt: "Heat Miser", group: "Mason", image: "/images/Mason_1.png", order: 4},
  { name: "Mason #2", alt: "Snow Miser", group: "Mason", image: "/images/Mason_2.png", order: 4},
  { name: "Seer", alt: "Santa", group: "Seer", image: "/images/Seer.png", order: 5},
  { name: "Robber", alt: "Grinch", group: "Robber", image: "/images/Robber.png", order: 6},
  { name: "Troublemaker", alt: "Kevin McCallister", group: "Troublemaker", image: "/images/Troublemaker.png", order: 7},
  { name: "Drunk", alt: "Cousin Eddie", group: "Drunk", image: "/images/Drunk.png", order: 8},
  { name: "Insomniac", alt: "Cindy Lou Who", group: "Insomniac", image: "/images/Insomniac.png", order: 9},
  { name: "Hunter", alt: "Ralphie", image: "/images/Hunter.png", order: null},
  { name: "Tanner", alt: "Scrooge", image: "/images/Tanner.png", order: null},
  { name: "Villager #1", alt: "Clarice", image: "/images/Villager_1.png", order: null},
  { name: "Villager #2", alt: "Linus Van Pelt", image: "/images/Villager_2.png", order: null},
  { name: "Villager #3", alt: "Tiny Tim", image: "/images/Villager_3.png", order: null}
];

const playAudio = (filePath) => {
    return new Promise((resolve) => {
        const audio = new Audio(filePath);
        audio.onended = resolve; // Resolve when the audio finishes
        audio.play();
    });
};

// Declare an Audio object for background music
let backgroundMusic;

// Function to play background music
const playBackgroundMusic = (filePath) => {
    if (!backgroundMusic) {
        backgroundMusic = new Audio(filePath);
        backgroundMusic.loop = true; // Enable looping
        backgroundMusic.volume = 0.5; // Set volume (0.0 to 1.0)
    }
    backgroundMusic.play();
};

// Function to stop background music
const stopBackgroundMusic = () => {
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0; // Reset to the beginning
    }
};

const handleGameFlow = async (characters, selectedCharacters) => {

    playBackgroundMusic("/audio/Music_Background.mp3");
    
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
        const previousCharacter = i > 0 ? orderedCharacters[i - 1].group : null;

        if (character.group === "Doppelganger" && minionSelected) {
            // Special Doppelganger + Minion dialogue
            await playAudio("/audio/Doppleganger_minion_01.mp3");
            await new Promise((resolve) => setTimeout(resolve, 10000));
            await playAudio("/audio/Doppleganger_minion_02.mp3");
            await new Promise((resolve) => setTimeout(resolve, 10000));
            await playAudio("/audio/Doppleganger_minion_03.mp3");
        } else {
            // Standard character dialogue
            if (previousCharacter) {
                // Play the audio file for previous character's name
                console.log(`/audio/Name_${previousCharacter.replace(" ", "")}.mp3`);
                console.log(previousCharacter);
                await playAudio(`/audio/Name_${previousCharacter.replace(" ", "")}.mp3`);

                await playAudio("/audio/Close_your_eyes.mp3");
            }

            // Play the audio file for current character's name
            console.log(`/audio/Name_${character.group.replace(" ", "")}.mp3`);
            await playAudio(`/audio/Name_${character.group.replace(" ", "")}.mp3`);
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
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await playAudio("/audio/Doppleganger_insomniac_02.mp3");
    }

    // End game with announcer
    await playAudio("/audio/Announcer_end.mp3");

    // Stop background music after the game ends
    stopBackgroundMusic();
};

function App() {
    const [selectedCharacters, setSelectedCharacters] = useState(["Werewolf #1"]);
    const [gameStarted, setGameStarted] = useState(false);

    const toggleCharacterSelection = (characterName) => {
        if (gameStarted) return; // Disable selection if the game has started
        if (characterName === "Werewolf #1") return; // Prevent deselecting Werewolf #1
        setSelectedCharacters((prev) =>
            prev.includes(characterName)
                ? prev.filter((item) => item !== characterName)
                : [...prev, characterName]
        );
    };

    const handleStart = () => {
        setGameStarted(true); // Disable selection once the game starts
        handleGameFlow(characters, selectedCharacters);
    };

    return (
        <div className="App">
            <div
                style={{
                    backgroundImage: `url(${backgroundImage})`,
                    top: 0,
                    left: 0,
                    position: 'fixed',
                    width: '100vw',
                    height: '100vh',
                    backgroundSize: 'cover',
                    backgroundPosition: 'bottom',
                    backgroundRepeat: 'no-repeat',
                    zIndex: '-1',
                }}
            ></div>
            <h1>One Night Ultimate Elf</h1>
            <h2>Choose Your Characters</h2>
            <div className="character-grid">
                {characters.map((character) => (
                    <div
                        key={character.name}
                        className={`character-box ${
                            selectedCharacters.includes(character.name) ? "selected" : ""
                        } ${character.name === "Werewolf #1" ? "forced-selected" : ""} ${
                            gameStarted ? "disabled" : "" // Add a disabled class when the game has started
                        }`}
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
                onClick={handleStart}
                disabled={gameStarted} // Disable the button after clicking
            >
                Start
            </button>
        </div>
    );
}

export default App;