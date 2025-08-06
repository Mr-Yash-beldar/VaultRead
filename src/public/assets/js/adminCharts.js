async function renderadminStatsChart() {
  if (document.querySelector("#chart-line")) {
    try {
      const res = await fetch(`/getadminstats`);
      const data = await res.json();
      console.log("Admin Stats Data:", data);

      // === Update Card Values ===
      document.querySelector("#totalRequests").innerText =
        data.totalbookRequests;
      document.querySelector("#totalMembers").innerText = data.membersCount;
      document.querySelector("#totalBooks").innerText = data.totalbooks;
      document.querySelector("#totalReviews").innerText = data.totalReviews;

      var ctx1 = document.getElementById("chart-line").getContext("2d");

      var gradientStroke1 = ctx1.createLinearGradient(0, 230, 0, 50);

      gradientStroke1.addColorStop(1, "rgba(94, 114, 228, 0.2)");
      gradientStroke1.addColorStop(0.2, "rgba(94, 114, 228, 0.0)");
      gradientStroke1.addColorStop(0, "rgba(94, 114, 228, 0)");
      new Chart(ctx1, {
        type: "line",
        data: {
          labels: [
            "Books Requests",
            "Total Members",
            "Total Books",
            "Total Categories",
            "Total Reviews",
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
                data.totalbookRequests,
                data.membersCount,
                data.totalbooks,
                data.totalCategories,
                data.totalReviews,
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
      console.error("Error fetching Admin stats:", error);
    }
  }
}

document.addEventListener("DOMContentLoaded", renderadminStatsChart);
