const API_URL = "http://localhost:3000/api/jobs";

const form = document.getElementById("job-form");
const titleInput = document.getElementById("title");
const companyInput = document.getElementById("company");
const locationInput = document.getElementById("location");
const saveButton = document.getElementById("save");
const statusText = document.getElementById("status");

let posting = null;

function setStatus(message, kind = "") {
  statusText.textContent = message;
  statusText.className = kind;
}

async function loadPosting() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !/^https?:/.test(tab.url ?? "")) {
    setStatus("Open a job posting to save it.", "error");
    return;
  }

  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractJobPosting,
    });
    posting = result;
  } catch {
    setStatus("Couldn't read this page.", "error");
    return;
  }

  titleInput.value = posting.title;
  companyInput.value = posting.company;
  locationInput.value = posting.location;
  saveButton.disabled = false;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  saveButton.disabled = true;
  setStatus("Saving…");

  let response;
  try {
    response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...posting,
        title: titleInput.value,
        company: companyInput.value,
        location: locationInput.value,
      }),
    });
  } catch {
    setStatus("Couldn't reach JobTrail. Is the app running on localhost:3000?", "error");
    saveButton.disabled = false;
    return;
  }

  if (response.status === 201) {
    setStatus("Saved.", "success");
  } else if (response.ok) {
    setStatus("You've already saved this job.", "success");
  } else {
    const data = await response.json().catch(() => ({}));
    const fields = Object.keys(data.fields ?? {});
    setStatus(
      fields.length ? `Check these fields: ${fields.join(", ")}` : "Something went wrong saving this job.",
      "error",
    );
    saveButton.disabled = false;
  }
});

loadPosting();
