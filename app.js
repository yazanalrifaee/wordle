const tileDisplay = document.querySelector('.tile-container');
const keyboard = document.querySelector('.key-container');
const messageDisplay = document.querySelector('.message-container');
let wordle;
const keys = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<<',];

async function fetchRandomWord() {
    try {
        const response = await fetch("https://random-word-api.vercel.app/api?words=1&length=5");

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data[0];
    } catch (error) {
        console.error('Error fetching random word:', error);
        return null;
    }
}

fetchRandomWord()
    .then(randomWord => {
        if (randomWord) {
            wordle = randomWord.toUpperCase();
            console.log('Target wordle:', wordle);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });

async function checkWordValidity(word) {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const data = await response.json();


        if (response.ok && Array.isArray(data) && data.length > 0) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error checking word validity:', error);
        return false;
    }
}


const guessRows = [
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', '']
];
let isGameOver = false;
let currentRow = 0;
let currentTile = 0;
guessRows.forEach((guessRow, guessRowIndex) => {
    const rowElement = document.createElement('div');
    rowElement.setAttribute('id', 'guessRow-' + guessRowIndex);
    guessRow.forEach((guess, guessIndex) => {
        const tileElement = document.createElement('div');
        tileElement.setAttribute('id', 'guessRow-' + guessRowIndex + '-tile-' + guessIndex);
        tileElement.classList.add('tile');
        rowElement.append(tileElement);
    })
    tileDisplay.append(rowElement);
})

keys.forEach(key => {
    const buttonElement = document.createElement('button');
    buttonElement.textContent = key;
    buttonElement.setAttribute('id', key);
    buttonElement.addEventListener('click', () => handleClick(key));
    keyboard.append(buttonElement);
})

const handleClick = async (letter) => {
    if (!isGameOver) {
        console.log('clicked', letter);
        if (letter === '<<') {
            deleteLetter();
            return;
        }
        if (letter === 'ENTER') {
            const guess = guessRows[currentRow].join('').toLowerCase();
            const isValid = await checkWordValidity(guess);

            if (isValid) {
                console.log(`${guess} is a valid word.`);
                checkRows();
            } else {
                console.log(`${guess} is not a valid word.`);
                showMessage(`"${guess.toUpperCase()}" is not a valid word.`);
            }

            return;
        }
        addLetter(letter);
    }

}

function handleKeydown(event) {
    const key = event.key.toUpperCase();

    if (key === 'BACKSPACE') {
        deleteLetter();
    } else if (keys.includes(key)) {
        handleClick(key);
    }
}

document.addEventListener('keydown', handleKeydown);

const addLetter = (letter) => {
    if (currentTile < 5 && currentRow < 6) {
        const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile);
        tile.textContent = letter;
        guessRows[currentRow][currentTile] = letter;
        tile.setAttribute('data', letter);
        currentTile++;
    }
}

const deleteLetter = () => {
    if (!isGameOver && currentTile > 0) {
        currentTile--;
        const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile);
        tile.textContent = '';
        guessRows[currentRow][currentTile] = '';
        tile.setAttribute('data', '');
    }
}
const resetGame = () =>{
    window.location.reload();
}

const checkRows = () => {
    const guess = guessRows[currentRow].join('');
    if (currentTile > 4) {
        flipTile();
        if (wordle === guess) {
            showMessage('Magnificent');
            isGameOver = true;
            setTimeout(()=>{
                resetGame();
            },4000);
            return;
        } else {
            if (currentRow >= 5) {
                isGameOver = true;
                showMessage('Game Over The Word Was ' + wordle.toUpperCase());
                setTimeout(()=>{
                    resetGame();
                },2000);
                return;
            }
            if (currentRow < 5) {
                currentRow++;
                currentTile = 0;
            }
        }
    }
}
const showMessage = (message) => {
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageDisplay.append(messageElement);
    setTimeout(() => messageDisplay.removeChild(messageElement), 2000);
}
const addColorToKey = (keyLetter, color) => {
    const key = document.getElementById(keyLetter);
    key.classList.add(color);
}
const flipTile = () => {
    const rowTiles = document.querySelector('#guessRow-' + currentRow).childNodes;
    let checkWordle = wordle;
    const guess = []

    rowTiles.forEach(tile => {
        guess.push({letter: tile.getAttribute('data'), color: 'grey-overlay'});
    })
    guess.forEach((guess, index) => {
        if (guess.letter === wordle[index]) {
            guess.color = 'green-overlay';
            checkWordle = checkWordle.replace(guess.letter, '');
        }
    })
    guess.forEach(guess => {
        if (checkWordle.includes(guess.letter)) {
            guess.color = 'yellow-overlay';
            checkWordle = checkWordle.replace(guess.letter, '');
        }
    })
    rowTiles.forEach((tile, index) => {
        const dataLetter = tile.getAttribute('data');
        setTimeout(() => {
            tile.classList.add(guess[index].color);
            addColorToKey(guess[index].letter, guess[index].color);
            tile.classList.add('flip');
        }, 500 * index)


    })
}