import { GetDataSimple, DeleteData, PostDataTokenJson } from "@/services/data";
import { toast } from "sonner";

export interface Payment {
    payment_id: number;
    contract_id: number;
    contract_number: string;
    student_id: number;
    student_full_name: string;
    student_image_url: string | null;
    phone_number: string;
    passport_series: string;
    floor_number: number;
    room_number: number;
    bed_number: number;
    payment_date: string;
    amount: number;
    payment_method: number;
    payment_method_text: string;
    comments: string | null;
    is_refund: number;
    is_refund_text: string;
    refund_amount: number | null;
    refund_comments: string | null;
    refund_datetime: string | null;
    created_at: string;
    contract_total_price: number;
    payment_status: number;
    contract_payment_status_text: string;
}

export interface PaymentsApiResponse {
    page: number;
    limit: number;
    count: number;
    pages: number;
    result: Payment[];
}

export const fetchPayments = async (
    page: number = 1,
    limit: number = 10
): Promise<{
    payments: Payment[];
    totalPages: number;
    totalCount: number;
}> => {
    try {
        const data: PaymentsApiResponse = await GetDataSimple(
            `api/payment/list?page=${page}&limit=${limit}`
        );

        return {
            payments: data.result,
            totalPages: data.pages,
            totalCount: data.count,
        };
    } catch (error) {
        console.error("Error fetching payments:", error);
        toast.error("Ошибка загрузки платежей");
        throw error;
    }
};

export const searchPayments = async (keyword: string): Promise<Payment[]> => {
    if (!keyword) return [];

    try {
        const data = await GetDataSimple(
            `api/payments/search?keyword=${encodeURIComponent(keyword)}`
        );
        return data?.result || [];
    } catch (error) {
        console.error("Error searching payments:", error);
        toast.error("Ошибка поиска платежей");
        return [];
    }
};

export const deletePayment = async (paymentId: number): Promise<void> => {
    try {
        await DeleteData(`api/payments/delete/${paymentId}`);
        toast.success("Платеж удалён", {
            description: "Платеж успешно удалён.",
            duration: 2500,
        });
    } catch (error: any) {
        console.error("Error deleting payment:", error);
        toast.error(
            error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Ошибка удаления платежа"
        );
        throw error;
    }
};

export interface CreatePaymentData {
    contract_id: number;
    payment_date: string;
    amount: number;
    payment_method: number; // 1-наличные, 2-перевод на карту, 3-перечисление
    comments?: string;
}

export interface ContractInfo {
    contract_id: number;
    contract_number: string;
    contract_total_price: number;
    total_paid: number;
    remaining_amount: number;
    payment_status: number;
    payments: any[];
}

export interface ContractPlanPayment {
    id: number;
    contract_id: number;
    monthly_payment_date: string;
    monthly_fee: number;
    payment_amount: number;
    payment_status: number;
    created_at: string;
    updated_at: string | null;
}

export interface ContractStatistics {
    total_months: number;
    paid_months: number;
    unpaid_months: number;
    total_fee: number;
    total_paid: number;
    remaining_amount: number;
    completion_percentage: number;
}

export interface ContractPlan {
    payments: ContractPlanPayment[];
    statistics: ContractStatistics;
}

export interface ContractPaymentDetail {
    contract_id: number;
    contract_number: string;
    contract_monthly_payment: number;
    contract_total_price: number;
    plan: ContractPlan;
}

export const fetchContractInfo = async (
    contractId: number
): Promise<ContractInfo> => {
    try {
        const data: ContractInfo = await GetDataSimple(
            `api/payment/contract/info/${contractId}`
        );
        return data;
    } catch (error) {
        console.error("Error fetching contract info:", error);
        toast.error("Ошибка загрузки информации о контракте");
        throw error;
    }
};

export const createPayment = async (
    paymentData: CreatePaymentData
): Promise<void> => {
    try {
        await PostDataTokenJson("api/payment/create", paymentData);
        toast.success("Платеж создан", {
            description: "Платеж успешно создан.",
            duration: 2500,
        });
    } catch (error: any) {
        console.error("Error creating payment:", error);
        toast.error(
            error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Ошибка создания платежа"
        );
        throw error;
    }
};

export const fetchContractPaymentDetail = async (
    contractId: number
): Promise<ContractPaymentDetail | null> => {
    try {
        const data: ContractPaymentDetail = await GetDataSimple(
            `api/contract/${contractId}`
        );
        return data;
    } catch (error) {
        console.error("Error fetching contract payment detail:", error);
        toast.error("Ошибка загрузки данных контракта");
        return null;
    }
};
