import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "@/types/user";
import { useApi } from "@/hooks/useApi";

const Authenticator = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const apiService = useApi();
    const [isLoading, setIsLoading] = useState(true);
    // const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
      const token = localStorage.getItem("token");  
      const authentication = async () => {
        try {
          const response: User = await apiService.post<User>(`/auth`, { token: token });
          if (response) {
            console.log("Authentication Success!");
          }
        } catch (error) {
          if (error instanceof Error) {
              alert(`Something went wrong while authenticating:\n${error.message}`);

            } else {
              console.error("An unknown error occurred while authenticating.");
            }
            router.push("/login");
            localStorage.removeItem("token");
          }
        };

        if (!token) {
            console.warn("Authentication Failed");
            router.replace("/login");
        } else {
            authentication();
            setIsLoading(false); // render children only if token exists
        }
    }, [router]);

    if (isLoading) return null; // no flash

    return <>{children}</>;
};

export default Authenticator;