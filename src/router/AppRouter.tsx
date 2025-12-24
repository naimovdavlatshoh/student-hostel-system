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
import FloorPlanPage from "@/pages/FloorPlan/FloorPlan";
import CreateContractPage from "@/pages/Contracts/CreateContract";
import ContractsPage from "@/pages/Contracts/Contracts";
import ContractDetailsPage from "@/pages/Contracts/ContractDetails";
import UpdateContractPage from "@/pages/Contracts/UpdateContract";
import PaymentsPage from "@/pages/Payments/Payments";

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
            {
                path: "contracts",
                element: <ContractsPage />,
            },
            {
                path: "contracts/:id",
                element: <ContractDetailsPage />,
            },
            {
                path: "contracts/create",
                element: <CreateContractPage />,
            },
            {
                path: "contracts/:id/edit",
                element: <UpdateContractPage />,
            },
            {
                path: "payments",
                element: <PaymentsPage />,
            },
        ],
    },
    {
        path: "/floor-plan",
        element: (
            <ProtectedRoute>
                <FloorPlanPage />
            </ProtectedRoute>
        ),
    },
]);

const AppRouter = () => {
    return <RouterProvider router={router} />;
};

export default AppRouter;
