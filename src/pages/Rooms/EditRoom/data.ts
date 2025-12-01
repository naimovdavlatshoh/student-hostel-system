import { GetDataSimple, PostDataTokenJson } from "@/services/data";
import { toast } from "sonner";

export interface EditRoomFormData {
    floor_id: string;
    room_number: string;
    room_type: string;
    is_active: string;
}

export interface RoomData {
    room_id: number;
    room_number: number;
    room_type: number;
    room_type_text: string;
    is_active: number;
    beds_count: number;
    floor_id: number;
    floor_number: number;
    created_at: string;
    updated_at: string | null;
}

export interface Floor {
    floor_id: number;
    floor_number: number;
}

export const fetchRoomData = async (id: string): Promise<RoomData | null> => {
    try {
        const roomRes = await GetDataSimple(`api/room/${id}`);
        return roomRes;
    } catch (error) {
        console.error("Error fetching room data:", error);
        toast.error("Ошибка загрузки данных комнаты");
        return null;
    }
};

export const fetchFloors = async (): Promise<Floor[]> => {
    try {
        const data = await GetDataSimple("api/floor/list?page=1&limit=10");
        return data?.result || [];
    } catch (error) {
        console.error("Error fetching floors:", error);
        return [];
    }
};

export const validateForm = (formData: EditRoomFormData): boolean => {
    const roomNum = Number(formData.room_number);
    return !!(
        formData.floor_id &&
        formData.room_number &&
        !Number.isNaN(roomNum) &&
        roomNum > 0 &&
        formData.room_type &&
        formData.is_active !== ""
    );
};

export const updateRoom = async (
    id: string,
    formData: EditRoomFormData
): Promise<void> => {
    try {
        const updateData = {
            floor_id: Number(formData.floor_id),
            room_number: Number(formData.room_number),
            room_type: Number(formData.room_type),
            is_active: Number(formData.is_active),
        };

        await PostDataTokenJson(`api/room/update/${id}`, updateData);
        toast.success("Комната успешно обновлена");
    } catch (error: any) {
        console.error("Error updating room:", error);
        toast.error(
            error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Ошибка обновления комнаты"
        );
        throw error;
    }
};
