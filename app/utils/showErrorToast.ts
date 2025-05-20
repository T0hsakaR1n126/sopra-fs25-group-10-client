import { Slide, toast } from "react-toastify";

export const showErrorToast = (message: string) => {
  toast.error(message, {
    position: "top-center",
    autoClose: 2500,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    transition: Slide,
    style: {
      width: "320px",
      padding: "20px 25px",
      fontSize: "16px",
      fontWeight: "bold",
      color: "#fff",
      background: "rgba(255, 45, 85, 0.25)", 
      border: "1px solid rgba(255, 45, 85, 0.5)",
      backdropFilter: "blur(8px)", 
      borderRadius: "12px",
      boxShadow: "0 6px 20px rgba(255, 45, 85, 0.4)",
      textAlign: "center",
    },
  });
};
