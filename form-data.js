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
