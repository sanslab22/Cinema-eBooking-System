"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const withAuth = (WrappedComponent, allowedRoles) => {
  const AuthComponent = (props) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      const userId = localStorage.getItem("userId");
      const userType = localStorage.getItem("userType");

      if (!userId) {
        if (allowedRoles && allowedRoles.includes(0)) {
          setIsAuthenticated(false);
        } else {
          router.push("/login");
        }
      } else {
        if (allowedRoles && !allowedRoles.includes(parseInt(userType))) {
          if (userType === "2") router.push("/");
          else router.push("/admin-home");
        } else {
          setIsAuthenticated(true);
        }
      }
    }, [router]);

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
