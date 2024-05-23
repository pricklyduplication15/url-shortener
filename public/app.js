document
  .getElementById("url-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const input = document.getElementById("input").value;

    fetch("/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: input }),
    })
      .then((response) => response.json())
      .then((data) => {
        const resultElement = document.getElementById("result");
        resultElement.innerHTML = `Short URL: <a href="${data.shortUrl}" target="_blank">${data.shortUrl}</a>`;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
