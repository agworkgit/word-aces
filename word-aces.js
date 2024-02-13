// Test if the user is entering letters
function isLetter(guessLetter) {
    return /^[a-zA-Z]$/.test(guessLetter) // regular expression - research
};
// 'a' will return true, '?' will return false

// Getting all the DOM elements
const guessLetters = document.querySelectorAll('.guess-letter');
const loadingSpinner = document.querySelector('.loading');
const winnerMessage = document.querySelector('.winner-alert');
const winnerBanner = document.querySelector('.brand');
const alertText = document.querySelector('.alert-text');
const alertDismiss = document.querySelector('.dismiss');
const alertModal = document.querySelector('.alerts');
const rounds = 6;
let gameOver = false;
const answerLength = 5;

// Typing
async function init() {
    let currentGuess = ''; // Buffer
    let currentRow = 0; // Current letter row
    let isLoading = true;

    // Request word of the day

    const response = await fetch("https://words.dev-apis.com/word-of-the-day"); // Random on refresh ?random=1
    const responseObject = await response.json();
    const word = responseObject.word.toLocaleUpperCase();
    const wordParts = word.split('');
    setLoading(false); // Word loaded, function setLoading will add class hidden
    isLoading = false;

    console.log(word);

    function addLetter(guessLetter) {
        if (currentGuess.length < answerLength) {
            // Add letter to the end
            currentGuess += guessLetter;
        } else {
            // Replace the last letter
            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + guessLetter;
        }

        guessLetters[answerLength * currentRow + currentGuess.length - 1].innerText = guessLetter; // Move to next row
    }

    // If user hits Enter
    async function commit() {
        if (currentGuess.length !== answerLength) {
            // Do nothing
            return;
        }

        // TODO: Validate word

        isLoading = true;
        setLoading(true);
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({ word: currentGuess })
        });

        const resObj = await res.json();
        const validWord = resObj.validWord;
        // Same as const { validWord } = resObj; - We already know that validWord variable exists in the API

        isLoading = false;
        setLoading(false);

        if(!validWord) {
            // If not a valid word
            markInvalidWord();
            return;
        }

        // TODO: Marking as 'correct', 'close' or 'wrong'

        const guessParts = currentGuess.split(''); // Splitting the letters in a new array of individual characters
        const mapWord = makeMap(wordParts);
        console.log(mapWord);

        for (let i = 0; i < answerLength; i++) {
            //Mark as correct
            if (guessParts[i] === wordParts[i]) {
                guessLetters[currentRow * answerLength + i].classList.add('correct');
                mapWord[guessParts[i]]--; 
                // After I guess a letter correctly it will decrement the reocurrance of an identical letter
            }

            for (let i = 0; i < answerLength; i++) {
                if (guessParts[i] === wordParts[i]) {
                    // Do nothing, we already did it
                } else if (wordParts.includes(guessParts[i]) && makeMap[guessParts[i]] > 0) {
                    // Mark as close
                    guessLetters[currentRow * answerLength + i].classList.add('close');
                    mapWord[guessParts[i]]--; 
                } else {
                    guessLetters[currentRow * answerLength + i].classList.add('wrong');
                }
            }
        }

        currentRow++; // Move to next row

        // TODO: Did they win or lose?
        if(currentRow === rounds && currentGuess !== word) {
            winnerMessage.classList.toggle('hidden', currentRow !== rounds); // Add hidden class if no winner
            alertText.innerText = `You lose, the word was ${word}.`;
            gameOver = true;
        } else if(currentGuess === word) {
            winnerMessage.classList.toggle('hidden', currentGuess !== word); // Add hidden class if no winner
            alertText.innerText = 'Congradualtions you win!';
            // Brand animation for winner
            winnerBanner.classList.add('winner');
            gameOver = true;
            return;
        }

        currentGuess = ''; // Current guess empty
    }

    function backspace() {
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        guessLetters[answerLength * currentRow + currentGuess.length].innerText = ''; // Wipe the last letter
    }

    function markInvalidWord() {
        /* winnerMessage.classList.toggle('hidden'); // Add hidden class if no winner
            alertText.innerText = 'Not a valid word!';
            return; */
        
        // Re-paint animation
        for(let i = 0; i < answerLength; i++) {
            guessLetters[currentRow * answerLength + i].classList.remove('invalid');

            setTimeout(function() {
                guessLetters[currentRow * answerLength + i].classList.add('invalid');
            }, 20);
        }
    }

    document.addEventListener('keydown', function handleKeyPress(event) {
        event.preventDefault(); // Prevent browser refresh on key stroke

        if(gameOver || isLoading) {
            // Do nothing
            return;
        }

        const action = event.key;

        console.log(action);

        if (action === 'Enter') {
            commit(); // Guess try
        } else if (action === 'Backspace') {
            backspace(); // Erase
        } else if (isLetter) {
            addLetter(action.toLocaleUpperCase()); // Add letter
        } else {
            // Do nothing, ignore other key presses
        }

        // The return is implicit here
    });
}

function setLoading(isLoading) {
    loadingSpinner.classList.toggle('hidden', !isLoading); // Add hidden class if it's not loading
}

function makeMap(arr) {
    // Takes in an array, and makes an object, there's one p in here, two i, etc.
    const mapObj = {};
    for(let i = 0; i < arr.length; i++) {
        const mapLetter = arr[i];
        if(mapObj[mapLetter]) { // if letter exists will return true
            // and if it does exist increment
            mapObj[mapLetter]++;
        } else {
            mapObj[mapLetter] = 1;
        }
    }
    return mapObj;
}


alertDismiss.addEventListener('click', function closeModal() {
    alertModal.classList.toggle('hidden');
})

init();