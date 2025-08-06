document.querySelectorAll(".flash-message").forEach((message) => {
  let timer;

  // Start a timer to remove the message after 3 seconds
  const startTimer = () => {
    timer = setTimeout(() => {
      message.remove();
    }, 3000);
  };

  // Clear the timer (to prevent auto-remove)
  const clearTimer = () => {
    clearTimeout(timer);
  };

  // Start countdown when message appears
  startTimer();

  // Pause the countdown on hover
  message.addEventListener("mouseenter", clearTimer);

  // Resume countdown when mouse leaves
  message.addEventListener("mouseleave", startTimer);
});

// Loader overlay functionality
window.addEventListener("load", () => {
  const loader = document.getElementById("loader-overlay");
  loader.style.opacity = "0";
  setTimeout(() => {
    loader.style.display = "none";
  }, 500);
});
