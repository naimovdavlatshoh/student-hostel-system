import { GetDataSimple, PostDataTokenJson } from "@/services/data";
import { toast } from "sonner";

export interface CreateContractFormData {
    student_id: string;
    contract_start_date: string;
    number_of_months: string;
    contract_monthly_payment: number | null;
    bed_id: string;
    contract_number: string;
}

export interface ContractPlanScheduleItem {
    month_number: number;
    payment_date: string;
    payment_date_formatted: string;
    monthly_fee: number;
    month_name: string;
    year: string;
}

export interface ContractPlanSummary {
    start_date: string;
    start_date_formatted: string;
    number_of_months: number;
    monthly_payment: number;
    total_amount: number;
    payment_day: number;
}

export interface ContractPlanResponse {
    schedule: ContractPlanScheduleItem[];
    summary: ContractPlanSummary;
}

export const isContractFormValid = (form: CreateContractFormData): boolean => {
    return (
        !!form.student_id.trim() &&
        !!form.contract_start_date &&
        !!form.number_of_months &&
        !!form.contract_number.trim() &&
        !!form.bed_id &&
        form.contract_monthly_payment !== null
    );
};

export const fetchContractPlan = async (
    startDate: string,
    numberOfMonths: number,
    monthlyPayment: number
): Promise<ContractPlanResponse | null> => {
    try {
        const data = await GetDataSimple(
            `api/contract/plan?startDate=${startDate}&numberOfMonths=${numberOfMonths}&monthlyPayment=${monthlyPayment}`
        );
        return data as ContractPlanResponse;
    } catch (error) {
        console.error("Error fetching contract plan:", error);
        toast.error("Ошибка расчёта плана платежей");
        return null;
    }
};

export const createContract = async (
    form: CreateContractFormData
): Promise<void> => {
    try {
        const payload = {
            student_id: Number(form.student_id),
            contract_start_date: form.contract_start_date,
            number_of_months: Number(form.number_of_months),
            contract_monthly_payment: form.contract_monthly_payment,
            bed_id: Number(form.bed_id),
            contract_number: form.contract_number.trim(),
        };

        await PostDataTokenJson("api/contract/create", payload);
        toast.success("Контракт успешно создан");
    } catch (error: any) {
        console.error("Error creating contract:", error);
        toast.error(
            error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Ошибка создания контракта"
        );
        throw error;
    }
};
