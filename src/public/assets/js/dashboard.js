const quotes = [
  `"A reader lives a thousand lives before he dies." - George R.R. Martin`,
  `"Today a reader, tomorrow a leader." - Margaret Fuller`,
  `"Reading is to the mind what exercise is to the body." - Joseph Addison`,
  `"Books are a uniquely portable magic." - Stephen King`,
  `"The only thing that you absolutely have to know, is the location of the library." – Albert Einstein`,
];

const quoteElement = document.getElementById("quoteText");

function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  quoteElement.textContent = quotes[randomIndex];
}

showRandomQuote();
setInterval(showRandomQuote, 30000); // Update every 30 seconds
