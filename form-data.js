async function populateDropdown(selectId, type, placeholder) {
  const select = document.getElementById(selectId);
  select.innerHTML = `<option value="">${placeholder}</option>`;

  try {
    const response = await fetch(`/api/referenceData?type=${type}`);
    const data = await response.json();

    data.forEach(value => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  } catch (error) {
    console.error(`Failed to load ${type}`, error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const countrySelect = document.getElementById("country");
  const industrySelect = document.getElementById("industry");
  const categorySelect = document.getElementById("category");

  // Initial load
  populateDropdown("country", "country", "Select Country");

  // When Country changes → reload Industries
  countrySelect.addEventListener("change", () => {
    const countryValue = countrySelect.value;

    industrySelect.innerHTML = '<option value="">Select Industry</option>';
    categorySelect.innerHTML = '<option value="">Select Category</option>';

    if (countryValue) {
      populateDropdown(
        "industry",
        `industry&country=${encodeURIComponent(countryValue)}`,
        "Select Industry"
      );
    }
  });

  // When Industry changes → reload Categories
  industrySelect.addEventListener("change", () => {
    const industryValue = industrySelect.value;

    categorySelect.innerHTML = '<option value="">Select Category</option>';

    if (industryValue) {
      populateDropdown(
        "category",
        `category&industry=${encodeURIComponent(industryValue)}`,
        "Select Category"
      );
    }
  });
});
async function getLoggedInUser() {
  const res = await fetch("/.auth/me");
  const data = await res.json();
  return data.clientPrincipal;
}


document
  .getElementById("tradeInterviewForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const user = await getLoggedInUser();
    const payload = {
      ...Object.fromEntries(formData.entries()),
      submittedBy: user?.userDetails,
      userId: user?.userId,
      identityProvider: user?.identityProvider
    };


    try {
      const response = await fetch("/api/submitInterview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(error);
        alert("Submission failed. Please contact support.");
        return;
      }


      alert("Interview request submitted successfully!");
      e.target.reset();
    } catch (err) {
      console.error(err);
      alert("Error submitting form");
    }
  });
