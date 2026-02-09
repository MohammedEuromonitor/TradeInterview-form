async function getLoggedInUser() {
  const res = await fetch("/.auth/me");
  const data = await res.json();
  return data.clientPrincipal;
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded");

  const form = document.getElementById("tradeInterviewForm");

  if (!form) {
    console.error("Form not found");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Submit intercepted");

    const formData = new FormData(form);
    const user = await getLoggedInUser();

    if (!user) {
      alert("You must be signed in");
      return;
    }

    const payload = {
      ...Object.fromEntries(formData.entries()),
      submittedBy: user.userDetails,
      userId: user.userId,
      identityProvider: user.identityProvider
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
        console.error(await response.text());
        alert("Submission failed");
        return;
      }

      alert("Interview request submitted successfully!");
      form.reset();
    } catch (err) {
      console.error(err);
      alert("Error submitting form");
    }
  });
});
