import { GetDataSimple, PostDataTokenJson } from "@/services/data";
import { toast } from "sonner";

export interface UpdateContractFormData {
    contract_id: number;
    student_id: string;
    contract_start_date: string;
    number_of_months: string;
    contract_monthly_payment: number | null;
    bed_id: string;
    contract_number: string;
    floor_number?: number;
    room_number?: number;
    bed_number?: number;
}

export const fetchContractForUpdate = async (
    id: number
): Promise<UpdateContractFormData | null> => {
    try {
        const data = await GetDataSimple(`api/contract/${id}`);
        return {
            contract_id: data.contract_id,
            student_id: String(data.student_id),
            contract_start_date: data.contract_start_date,
            number_of_months: String(data.number_of_months),
            contract_monthly_payment: data.contract_monthly_payment,
            bed_id: String(data.bed_id),
            contract_number: data.contract_number,
            floor_number: data.floor_number,
            room_number: data.room_number,
            bed_number: data.bed_number,
        };
    } catch (error) {
        console.error("Error fetching contract for update:", error);
        toast.error("Ошибка загрузки контракта");
        return null;
    }
};

export const updateContract = async (
    form: UpdateContractFormData
): Promise<void> => {
    try {
        const payload = {
            contract_start_date: form.contract_start_date,
            number_of_months: Number(form.number_of_months),
            contract_monthly_payment: form.contract_monthly_payment,
            bed_id: Number(form.bed_id),
            contract_number: form.contract_number.trim(),
        };

        await PostDataTokenJson(
            `api/contract/update/${form.contract_id}`,
            payload
        );
        toast.success("Контракт успешно обновлён");
    } catch (error: any) {
        console.error("Error updating contract:", error);
        toast.error(
            error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Ошибка обновления контракта"
        );
        throw error;
    }
};
