import { GetDataSimple, DeleteData } from "@/services/data";
import { toast } from "sonner";

export interface Room {
    room_id: number;
    room_number: number;
    room_type: number;
    room_type_text: string;
    is_active: number;
    is_active_text: string;
    beds_count: number;
    floor_id: number;
    floor_number: number;
    created_at: string;
    updated_at: string | null;
}

export interface RoomsApiResponse {
    page: number;
    limit: number;
    count: number;
    pages: number;
    result: Room[];
}

export interface Floor {
    floor_id: number;
    floor_number: number;
}

export const fetchFloors = async (): Promise<Floor[]> => {
    try {
        const data = await GetDataSimple("api/floor/list?page=1&limit=10");
        return data?.result || [];
    } catch (error) {
        console.error("Error fetching floors:", error);
        toast.error("Ошибка загрузки этажей");
        return [];
    }
};

export const fetchRooms = async (
    page: number = 1,
    limit: number = 10,
    floorId?: number
): Promise<{ rooms: Room[]; totalPages: number; totalCount: number }> => {
    try {
        const floorParam = floorId ? `&floor_id=${floorId}` : "";
        const data: RoomsApiResponse = await GetDataSimple(
            `api/room/list?page=${page}&limit=${limit}${floorParam}`
        );

        return {
            rooms: data.result,
            totalPages: data.pages,
            totalCount: data.count,
        };
    } catch (error) {
        console.error("Error fetching rooms:", error);
        toast.error("Ошибка загрузки комнат");
        throw error;
    }
};

export const deleteRoom = async (roomId: number): Promise<void> => {
    try {
        await DeleteData(`api/room/delete/${roomId}`);
        toast.success("Комната удалена", {
            description: "Комната успешно удалена.",
            duration: 2500,
        });
    } catch (error: any) {
        console.error("Error deleting room:", error);
        toast.error(
            error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Ошибка удаления комнаты"
        );
        throw error;
    }
};
