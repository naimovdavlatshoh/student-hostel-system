import { GetDataSimple, DeleteData } from "@/services/data";
import { toast } from "sonner";

export interface Bed {
    bed_id: number;
    room_id: number;
    room_number: number;
    floor_id: number;
    floor_number: number;
    bed_number: number;
    bed_type: number;
    bed_type_text: string;
    is_active: number;
    is_active_text: string;
    created_at: string;
    updated_at: string | null;
}

export interface BedsApiResponse {
    page: number;
    limit: number;
    count: number;
    pages: number;
    result: Bed[];
}

export interface Room {
    room_id: number;
    room_number: number;
    floor_id: number;
    floor_number: number;
}

export const fetchRooms = async (): Promise<Room[]> => {
    try {
        const data = await GetDataSimple("api/room/list?page=1&limit=100");
        return data?.result || [];
    } catch (error) {
        console.error("Error fetching rooms:", error);
        toast.error("Ошибка загрузки комнат");
        return [];
    }
};

export const fetchBeds = async (
    page: number = 1,
    limit: number = 10,
    roomId?: number
): Promise<{ beds: Bed[]; totalPages: number; totalCount: number }> => {
    try {
        const roomParam = roomId ? `&room_id=${roomId}` : "";
        const data: BedsApiResponse = await GetDataSimple(
            `api/bed/list?page=${page}&limit=${limit}${roomParam}`
        );

        return {
            beds: data.result,
            totalPages: data.pages,
            totalCount: data.count,
        };
    } catch (error) {
        console.error("Error fetching beds:", error);
        toast.error("Ошибка загрузки коек");
        throw error;
    }
};

export const deleteBed = async (bedId: number): Promise<void> => {
    try {
        await DeleteData(`api/bed/delete/${bedId}`);
        toast.success("Койка удалена", {
            description: "Койка успешно удалена.",
            duration: 2500,
        });
    } catch (error: any) {
        console.error("Error deleting bed:", error);
        toast.error(
            error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Ошибка удаления койки"
        );
        throw error;
    }
};
