import { PostDataTokenJson } from "@/services/data";
import { toast } from "sonner";

export interface BedFormData {
    room_id: string;
    bed_number: string;
    bed_type: string;
}

export const isBedFormValid = (formData: BedFormData): boolean => {
    const bedNum = Number(formData.bed_number);
    return !!(
        formData.room_id &&
        formData.bed_number &&
        !Number.isNaN(bedNum) &&
        bedNum > 0 &&
        formData.bed_type
    );
};

export const createBed = async (formData: BedFormData): Promise<void> => {
    try {
        const payload = {
            room_id: Number(formData.room_id),
            bed_number: Number(formData.bed_number),
            bed_type: Number(formData.bed_type),
        };

        await PostDataTokenJson("api/bed/create", payload);

        toast.success("Койка успешно создана");
    } catch (error: any) {
        console.error("Error creating bed:", error);
        toast.error(
            error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Ошибка создания койки"
        );
        throw error;
    }
};
