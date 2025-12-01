import { GetDataSimple, PostDataTokenJson } from "@/services/data";
import { toast } from "sonner";

export interface EditBedFormData {
    room_id: string;
    bed_number: string;
    bed_type: string;
    is_active: string;
}

export interface BedData {
    bed_id: number;
    room_id: number;
    room_number: number;
    floor_id: number;
    floor_number: number;
    bed_number: number;
    bed_type: number;
    bed_type_text: string;
    is_active: number;
    created_at: string;
    updated_at: string | null;
}

export interface Room {
    room_id: number;
    room_number: number;
    floor_id: number;
    floor_number: number;
}

export const fetchBedData = async (id: string): Promise<BedData | null> => {
    try {
        const bedRes = await GetDataSimple(`api/bed/${id}`);
        return bedRes;
    } catch (error) {
        console.error("Error fetching bed data:", error);
        toast.error("Ошибка загрузки данных койки");
        return null;
    }
};

export const fetchRooms = async (): Promise<Room[]> => {
    try {
        const data = await GetDataSimple("api/room/list?page=1&limit=100");
        return data?.result || [];
    } catch (error) {
        console.error("Error fetching rooms:", error);
        return [];
    }
};

export const validateForm = (formData: EditBedFormData): boolean => {
    const bedNum = Number(formData.bed_number);
    return !!(
        formData.room_id &&
        formData.bed_number &&
        !Number.isNaN(bedNum) &&
        bedNum > 0 &&
        formData.bed_type &&
        formData.is_active !== ""
    );
};

export const updateBed = async (
    id: string,
    formData: EditBedFormData
): Promise<void> => {
    try {
        const updateData = {
            room_id: Number(formData.room_id),
            bed_number: Number(formData.bed_number),
            bed_type: Number(formData.bed_type),
            is_active: Number(formData.is_active),
        };

        await PostDataTokenJson(`api/bed/update/${id}`, updateData);
        toast.success("Койка успешно обновлена");
    } catch (error: any) {
        console.error("Error updating bed:", error);
        toast.error(
            error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Ошибка обновления койки"
        );
        throw error;
    }
};
