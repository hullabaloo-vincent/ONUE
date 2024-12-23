import React, { useState } from "react";
import backgroundImage from './images/Background.jpeg';
import "./App.css";

const characters = [
  { name: "Doppelganger", alt: "Fake Santa", group: "Doppelganger", image: "./images/Doppelganger.png", order: 1},
  { name: "Werewolf #1", alt: "Elf", group: "Werewolf", image: "./images/Werewolf_1.png", order: 2},
  { name: "Werewolf #2", alt: "Elf", group: "Werewolf", image: "./images/Werewolf_2.png", order: 2},
  { name: "Minion", alt: "Toy Soldiers", group: "Minion", image: "./images/Minion.png", order: 3},
  { name: "Mason #1", alt: "Heat Miser", group: "Mason", image: "./images/Mason_1.png", order: 4},
  { name: "Mason #2", alt: "Snow Miser", group: "Mason", image: "./images/Mason_2.png", order: 4},
  { name: "Seer", alt: "Santa", group: "Seer", image: "./images/Seer.png", order: 5},
  { name: "Robber", alt: "Grinch", group: "Robber", image: "./images/Robber.png", order: 6},
  { name: "Troublemaker", alt: "Kevin McCallister", group: "Troublemaker", image: "./images/Troublemaker.png", order: 7},
  { name: "Drunk", alt: "Cousin Eddie", group: "Drunk", image: "./images/Drunk.png", order: 8},
  { name: "Insomniac", alt: "Cindy Lou Who", group: "Insomniac", image: "./images/Insomniac.png", order: 9},
  { name: "Hunter", alt: "Ralphie", image: "./images/Hunter.png", order: null},
  { name: "Tanner", alt: "Scrooge", image: "./images/Tanner.png", order: null},
  { name: "Villager #1", alt: "Clarice", image: "./images/Villager_1.png", order: null},
  { name: "Villager #2", alt: "Linus Van Pelt", image: "./images/Villager_2.png", order: null},
  { name: "Villager #3", alt: "Tiny Tim", image: "./images/Villager_3.png", order: null}
];

let audioContext;

const playAudio = async (filePath) => {
    if (!audioContext) {
        console.error("AudioContext not initialized. Ensure user clicked Start.");
        return;
    }

    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
    return new Promise((resolve) => {
        source.onended = resolve; // Resolve when the audio ends
    });
};

const initializeAudioContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
};

let backgroundMusic;

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

const startCountdown = (setIsModalVisible, setTimeLeft, setIsTimeUp) => {
    setIsModalVisible(true);
    setTimeLeft(300);

    let timer = 300; // 5 minutes in seconds

    const interval = setInterval(() => {
        timer -= 1;
        setTimeLeft(timer);

        // Play "One Minute Left" audio at the 1-minute mark
        if (timer === 60) {
            playAudio("./audio/One_Minute_Left.mp3");
        }
        
        if (timer <= 0) {
            clearInterval(interval); // Stop the interval
            setIsModalVisible(false); // Hide the countdown modal
            setIsTimeUp(true); // Show "TIME IS UP!" modal
            playAudio("./audio/Time_Is_Up.mp3"); // Play "Time Is Up" audio
            stopBackgroundMusic();
        }
    }, 1000);
};

const handleGameFlow = async (characters, selectedCharacters, setIsModalVisible, setTimeLeft, setIsTimeUp) => {

    playBackgroundMusic("./audio/Music_Background.mp3");
    
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
    let lastCharacter = null;

    // Start game with announcer
    await playAudio("./audio/Announcer_start.mp3");

    for (let i = 0; i < orderedCharacters.length; i++) {
        const character = orderedCharacters[i];
        const previousCharacter = i > 0 ? orderedCharacters[i - 1].group : null;
        lastCharacter = character.group;

        if (character.group === "Doppelganger" && minionSelected) {
            // Special Doppelganger + Minion dialogue
            await playAudio("./audio/Doppleganger_minion_01.mp3");
            await new Promise((resolve) => setTimeout(resolve, 10000));
            await playAudio("./audio/Doppleganger_minion_02.mp3");
            await new Promise((resolve) => setTimeout(resolve, 10000));
            await playAudio("./audio/Doppleganger_minion_03.mp3");
        } else {
            // Standard character dialogue
            if (previousCharacter) {
                // Play the audio file for previous character's name
                await playAudio(`./audio/Name_${previousCharacter.replace(" ", "")}.mp3`);

                await playAudio("./audio/Close_your_eyes.mp3");
            }

            // Play the audio file for current character's name
            await playAudio(`./audio/Name_${character.group.replace(" ", "")}.mp3`);
            await playAudio("./audio/Wake_Up.mp3");
            await playAudio(`./audio/Dialogue_${character.group}.mp3`);
        }

        // 10-second pause after each character
        await new Promise((resolve) => setTimeout(resolve, 10000));
    }

    // Insomniac + Doppelganger special case
    if (insomniacSelected && dopplegangerSelected) {
        await playAudio(`./audio/Name_Insomniac.mp3`);
        await playAudio("./audio/Close_your_eyes.mp3");
        await playAudio("./audio/Doppleganger_insomniac_01.mp3");
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await playAudio("./audio/Doppleganger_insomniac_02.mp3");
    }
    else
    {
        await playAudio(`./audio/Name_${lastCharacter.replace(" ", "")}.mp3`);
        await playAudio("./audio/Close_your_eyes.mp3");
    }

    // End game with announcer
    await playAudio("./audio/Keep_Eyes_Closed.mp3");
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await playAudio("./audio/Announcer_end.mp3");
    startCountdown(setIsModalVisible, setTimeLeft, setIsTimeUp);
};

function App() {
    const [selectedCharacters, setSelectedCharacters] = useState(["Werewolf #1"]);
    const [gameStarted, setGameStarted] = useState(false);

    const [isModalVisible, setIsModalVisible] = useState(false); // Controls countdown modal visibility
    const [timeLeft, setTimeLeft] = useState(300); // Stores the countdown timer value in seconds
    const [isTimeUp, setIsTimeUp] = useState(false); // Controls visibility of the "TIME IS UP!" modal

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
        handleGameFlow(characters, selectedCharacters, setIsModalVisible, setTimeLeft, setIsTimeUp);
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
                onClick={async () => {
                    initializeAudioContext(); // Activate AudioContext
                    await handleStart(); // Start the game flow
                }}
                disabled={gameStarted}
            >
                Start
            </button>
            {isModalVisible && (
                <div className="modal">
                    <div className="modal-content">
                        <h2 style={{ color: 'black' }}>Time Remaining</h2>
                        <p>{`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`}</p>
                    </div>
                </div>
            )}

            {isTimeUp && (
                <div className="modal">
                    <div className="modal-content">
                        <h2 style={{ color: 'black' }}>TIME IS UP!</h2>
                        <p>Vote!</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;