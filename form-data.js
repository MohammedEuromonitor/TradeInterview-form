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

// Load all dropdowns
document.addEventListener("DOMContentLoaded", () => {
  populateDropdown("country", "country", "Select Country");
  populateDropdown("industry", "industry", "Select Industry");
  populateDropdown("category", "category", "Select Category");
});
