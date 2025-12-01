import { GetDataSimple, DeleteData } from "@/services/data";
import { toast } from "sonner";

export interface Floor {
    floor_id: number;
    floor_number: number;
    is_active: number;
    is_active_text: string;
    rooms_count: number;
    created_at: string;
    updated_at: string | null;
}

export interface FloorsApiResponse {
    page: number;
    limit: number;
    count: number;
    pages: number;
    result: Floor[];
}

export const fetchFloors = async (
    page: number = 1,
    limit: number = 10
): Promise<{ floors: Floor[]; totalPages: number; totalCount: number }> => {
    try {
        const data: FloorsApiResponse = await GetDataSimple(
            `api/floor/list?page=${page}&limit=${limit}`
        );

        return {
            floors: data.result,
            totalPages: data.pages,
            totalCount: data.count,
        };
    } catch (error) {
        console.error("Error fetching floors:", error);
        toast.error("Ошибка загрузки этажей");
        throw error;
    }
};

export const deleteFloor = async (floorId: number): Promise<void> => {
    try {
        await DeleteData(`api/floor/delete/${floorId}`);
        toast.success("Этаж удалён", {
            description: "Этаж успешно удалён.",
            duration: 2500,
        });
    } catch (error: any) {
        console.error("Error deleting floor:", error);
        toast.error(
            error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Ошибка удаления этажа"
        );
        throw error;
    }
};
