let selectedRating = 0;
let selectedBookId = null;

function openModal(bookName = "Sample Book", bookId = "") {
  document.getElementById("reviewModal").classList.remove("hidden");
  document.getElementById("bookName").innerText = bookName;
  selectedBookId = bookId;
  resetModal();
}

function closeModal() {
  document.getElementById("reviewModal").classList.add("hidden");
}

function resetModal() {
  selectedRating = 0;
  document.querySelectorAll("#starContainer .fa-star").forEach((star) => {
    star.classList.remove("selected");
  });
  document.getElementById("reviewDesc").value = "";
  document.getElementById("successMsg").classList.add("hidden");
}

document.querySelectorAll("#starContainer .fa-star").forEach((star) => {
  star.addEventListener("click", function () {
    selectedRating = parseInt(this.getAttribute("data-value"));
    updateStars();
  });
});

function updateStars() {
  document.querySelectorAll("#starContainer .fa-star").forEach((star) => {
    if (parseInt(star.getAttribute("data-value")) <= selectedRating) {
      star.classList.add("selected");
    } else {
      star.classList.remove("selected");
    }
  });
}

async function submitReview(event) {
  event.preventDefault(); // ✅ prevent page reload

  const comment = document.getElementById("reviewDesc").value;

  if (selectedRating === 0) {
    alert("Please select a rating.");
    return;
  }

  if (!selectedBookId) {
    alert("Book ID not found.");
    return;
  }

  try {
    const res = await fetch(`/submitreview/${selectedBookId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Optional: add token if required
        // "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        rating: selectedRating,
        comment: comment,
      }),
    });

    if (res.ok) {
      document.getElementById("successMsg").classList.remove("hidden");
      //reload the page after a short delay to show success message

      setTimeout(() => {
        closeModal();
        const permanentSuccess = document.getElementById("permanentSuccess");
        if (permanentSuccess) {
          permanentSuccess.classList.remove("hidden");
        }
      }, 2000);
      location.reload();
    } else {
      const data = await res.json();
      alert("Error: " + (data.message || "Failed to submit review"));
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong submitting the review.");
  }
}
