import { GetDataSimple } from "@/services/data";
import { toast } from "sonner";

export interface Room {
    room_id: number;
    room_number: number;
    room_type: number;
    room_type_text: string;
    is_active: number;
    beds_count: number;
    created_at: string;
    updated_at: string | null;
}

export interface FloorDetails {
    id: number;
    object_id: number;
    floor_number: number;
    is_active: number;
    created_at: string;
    updated_at: string | null;
    rooms: Room[];
}

export const fetchFloorDetails = async (
    id: string
): Promise<FloorDetails | null> => {
    try {
        const floorRes = await GetDataSimple(`api/floor/${id}`);
        return floorRes;
    } catch (error) {
        console.error("Error fetching floor details:", error);
        toast.error("Ошибка загрузки данных этажа");
        return null;
    }
};
