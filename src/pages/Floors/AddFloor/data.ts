import { PostDataTokenJson } from "@/services/data";
import { toast } from "sonner";

export interface FloorFormData {
    floor_number: string;
}

export const isFloorFormValid = (formData: FloorFormData): boolean => {
    const num = Number(formData.floor_number);
    return !!formData.floor_number && !Number.isNaN(num) && num > 0;
};

export const createFloor = async (formData: FloorFormData): Promise<void> => {
    try {
        const payload = {
            floor_number: Number(formData.floor_number),
        };

        await PostDataTokenJson("api/floor/create", payload);

        toast.success("Этаж успешно создан");
    } catch (error: any) {
        console.error("Error creating floor:", error);
        toast.error(
            error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Ошибка создания этажа"
        );
        throw error;
    }
};
