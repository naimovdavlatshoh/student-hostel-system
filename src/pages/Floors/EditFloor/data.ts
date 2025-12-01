import { GetDataSimple, PostDataTokenJson } from "@/services/data";
import { toast } from "sonner";

export interface EditFloorFormData {
    floor_number: string;
    is_active: string;
}

export interface FloorData {
    floor_id: number;
    floor_number: number;
    is_active: number;
    is_active_text: string;
    rooms_count: number;
    created_at: string;
    updated_at: string | null;
}

export const fetchFloorData = async (id: string): Promise<FloorData | null> => {
    try {
        const floorRes = await GetDataSimple(`api/floor/${id}`);
        return floorRes;
    } catch (error) {
        console.error("Error fetching floor data:", error);
        toast.error("Ошибка загрузки данных этажа");
        return null;
    }
};

export const validateForm = (formData: EditFloorFormData): boolean => {
    return !!(formData.floor_number.trim() && formData.is_active !== "");
};

export const updateFloor = async (
    id: string,
    formData: EditFloorFormData
): Promise<void> => {
    try {
        const updateData = {
            floor_number: parseInt(formData.floor_number),
            is_active: parseInt(formData.is_active),
        };

        await PostDataTokenJson(`api/floor/update/${id}`, updateData);
        toast.success("Этаж успешно обновлён");
    } catch (error: any) {
        console.error("Error updating floor:", error);
        toast.error(
            error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Ошибка обновления этажа"
        );
        throw error;
    }
};
