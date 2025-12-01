import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import Students from "../pages/Students/Students";

import CreateStudent from "@/pages/Students/CreateStudent";
import Login from "../pages/Auth/Login";
import Account from "@/pages/Students/Account";
import ProtectedRoute from "@/components/ProtectedRoute";
import EditStudent from "@/pages/Students/EditStudent";
import FloorsPage from "@/pages/Floors/Floors";
import RoomsPage from "@/pages/Rooms/Rooms";
import BedsPage from "@/pages/Beds/Beds";

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
            {
                path: "floors",
                element: <FloorsPage />,
            },
            {
                path: "rooms",
                element: <RoomsPage />,
            },
            {
                path: "beds",
                element: <BedsPage />,
            },
        ],
    },
]);

const AppRouter = () => {
    return <RouterProvider router={router} />;
};

export default AppRouter;
