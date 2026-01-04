// components/PasswordUpdateModal.jsx
const handleUpdate = async () => {
  setError("");
  if (newPassword.length < 8) {
    setError("New password must be at least 8 characters long.");
    return;
  }
  if (newPassword !== confirmPassword) {
    setError("New passwords do not match.");
    return;
  }

  const token = localStorage.getItem("authToken");
  setLoading(true);
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/institutions/change-password`, // Updated Path
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update password.");

    toast.success("Security credentials updated!");
    onClose();
  } catch (err) {
    setError(err.message);
    toast.error(err.message);
  } finally {
    setLoading(false);
  }
};