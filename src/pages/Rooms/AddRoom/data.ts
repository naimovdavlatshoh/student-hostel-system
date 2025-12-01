import { PostDataTokenJson } from "@/services/data";
import { toast } from "sonner";

export interface RoomFormData {
    floor_id: string;
    room_number: string;
    room_type: string;
}

export const isRoomFormValid = (formData: RoomFormData): boolean => {
    const roomNum = Number(formData.room_number);
    return !!(
        formData.floor_id &&
        formData.room_number &&
        !Number.isNaN(roomNum) &&
        roomNum > 0 &&
        formData.room_type
    );
};

export const createRoom = async (formData: RoomFormData): Promise<void> => {
    try {
        const payload = {
            floor_id: Number(formData.floor_id),
            room_number: Number(formData.room_number),
            room_type: Number(formData.room_type),
        };

        await PostDataTokenJson("api/room/create", payload);

        toast.success("Комната успешно создана");
    } catch (error: any) {
        console.error("Error creating room:", error);
        toast.error(
            error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Ошибка создания комнаты"
        );
        throw error;
    }
};
