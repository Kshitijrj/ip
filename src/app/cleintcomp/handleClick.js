import axios from "axios";

export const handleClick = async () => {
  try {
    const recaptchaElement = document.getElementById("recaptcha-container");

    if (!recaptchaElement) {
      console.error("reCAPTCHA element not found.");
      return;
    }

    // Ensure reCAPTCHA API is available
    if (window.grecaptcha && grecaptcha.execute) {
      const captchaToken = await grecaptcha.execute("6LfX1vAqAAAAAAgrx04SCTQUUTFOu_7NS5N5eswy", { action: "submit" });

      // Send request to the API
      const response = await axios.post("/api/clicks", { captchaToken });

      console.log("Response:", response.data);

      if (response.data.requiresCaptcha) {
        alert("CAPTCHA passed! Redirecting...");
        window.location.href = "/serve/";
      }
    } else {
      console.error("reCAPTCHA API not loaded.");
    }
  } catch (error) {
    console.error("Error handling click:", error);
  }
};
