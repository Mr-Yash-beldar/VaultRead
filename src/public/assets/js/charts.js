async function renderUserStatsChart() {
  if (document.querySelector("#chart-line")) {
    try {
      const res = await fetch(`/getUserStats`);
      const data = await res.json();

      // === Update Card Values ===
      document.querySelector("#booksBorrowed").innerText = data.booksBorrowed;
      document.querySelector("#reviewedBooks").innerText = data.reviewedBooks;
      document.querySelector("#booksDueSoon").innerText = data.booksDueSoon;
      document.querySelector("#overdueBooks").innerText = data.overdueBooks;

      var ctx1 = document.getElementById("chart-line").getContext("2d");

      var gradientStroke1 = ctx1.createLinearGradient(0, 230, 0, 50);

      gradientStroke1.addColorStop(1, "rgba(94, 114, 228, 0.2)");
      gradientStroke1.addColorStop(0.2, "rgba(94, 114, 228, 0.0)");
      gradientStroke1.addColorStop(0, "rgba(94, 114, 228, 0)");
      new Chart(ctx1, {
        type: "line",
        data: {
          labels: [
            "Books Borrowed",
            "Reviewed Books",
            "Requested Books",
            "Books Due Soon",
            "Overdue Books",
          ],
          datasets: [
            {
              label: "Count",
              tension: 0.4,
              borderWidth: 0,
              pointRadius: 0,
              borderColor: "#5e72e4",
              backgroundColor: gradientStroke1,
              borderWidth: 3,
              fill: true,
              data: [
                data.booksBorrowed,
                data.reviewedBooks,
                data.requestedBooks,
                data.booksDueSoon,
                data.overdueBooks,
              ],
              maxBarThickness: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          interaction: {
            intersect: false,
            mode: "index",
          },
          scales: {
            y: {
              grid: {
                drawBorder: false,
                display: true,
                drawOnChartArea: true,
                drawTicks: false,
                borderDash: [5, 5],
              },
              ticks: {
                display: true,
                padding: 10,
                color: "#fbfbfb",
                font: {
                  size: 11,
                  family: "Open Sans",
                  style: "normal",
                  lineHeight: 2,
                },
              },
            },
            x: {
              grid: {
                drawBorder: false,
                display: false,
                drawOnChartArea: false,
                drawTicks: false,
                borderDash: [5, 5],
              },
              ticks: {
                display: true,
                color: "#ccc",
                padding: 20,
                font: {
                  size: 11,
                  family: "Open Sans",
                  style: "normal",
                  lineHeight: 2,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  }
}

document.addEventListener("DOMContentLoaded", renderUserStatsChart);
