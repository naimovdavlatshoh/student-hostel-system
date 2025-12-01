import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import Students from "../pages/Students/Students";

import CreateStudent from "@/pages/Students/CreateStudent";
import Login from "../pages/Auth/Login";
import Account from "@/pages/Students/Account";
import ProtectedRoute from "@/components/ProtectedRoute";
import EditStudent from "@/pages/Students/EditStudent";

const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <DashboardLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <Students />,
            },

            {
                path: "users/create",
                element: <CreateStudent />,
            },
            {
                path: "user/:id",
                element: <EditStudent />,
            },

            {
                path: "details/:id",
                element: <Account />,
            },
        ],
    },
]);

const AppRouter = () => {
    return <RouterProvider router={router} />;
};

export default AppRouter;
