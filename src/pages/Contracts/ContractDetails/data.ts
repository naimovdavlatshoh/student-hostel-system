import {
    GetDataSimple,
    GetDataSimpleBlob,
    PostDataToken,
} from "@/services/data";
import { toast } from "sonner";

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

export interface ContractDetail {
    contract_id: number;
    student_id: number;
    student_full_name: string;
    student_image_url: string | null;
    student_pinfl: number | string;
    passport_series: string;
    date_of_birth: string;
    form_of_education: number;
    study_period: number;
    faculty: string;
    field_of_study: string;
    university_name: string;
    course_level: number;
    university_group_name: string;
    region_id: number;
    region_name: string;
    district_id: number;
    district_name: string;
    address: string;
    phone_number: string;
    owner_additional_phone_number: string | null;
    additional_phone_number: string | null;
    floor_number: number;
    room_number: number;
    bed_number: number;
    bed_type: number;
    contract_start_date: string;
    contract_end_date: string;
    number_of_months: number;
    contract_number: string;
    contract_monthly_payment: number;
    contract_total_price: number;
    contract_status: number;
    contract_status_text: string;
    payment_status: number;
    payment_status_text: string;
    is_terminated: number;
    is_terminated_text: string;
    termination_date: string | null;
    termination_reason: string | null;
    created_at: string;
    plan: ContractPlan;
    documents: unknown[];
}

export const fetchContractById = async (
    id: number
): Promise<ContractDetail | null> => {
    try {
        const data: ContractDetail = await GetDataSimple(`api/contract/${id}`);
        return data;
    } catch (error) {
        console.error("Error fetching contract detail:", error);
        toast.error("Ошибка загрузки контракта");
        return null;
    }
};

export const downloadContractWord = async (id: number): Promise<Blob> => {
    try {
        const blob = await GetDataSimpleBlob(`api/contract/word/${id}`);
        return blob;
    } catch (error) {
        console.error("Error downloading contract word:", error);
        toast.error("Ошибка загрузки документа");
        throw error;
    }
};

export const uploadSignedContract = async (
    id: number,
    pdfFile: File
): Promise<void> => {
    try {
        const formData = new FormData();
        formData.append("contract_pdf", pdfFile);

        await PostDataToken(`api/contract/${id}/upload-signed`, formData);
        toast.success("PDF контракт успешно загружен");
    } catch (error: any) {
        console.error("Error uploading signed contract:", error);
        toast.error(
            error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Ошибка загрузки PDF контракта"
        );
        throw error;
    }
};

export const downloadContractPDF = async (id: number): Promise<Blob> => {
    try {
        const blob = await GetDataSimpleBlob(`api/contract/pdf/${id}`);
        return blob;
    } catch (error) {
        console.error("Error downloading contract PDF:", error);
        toast.error("Ошибка загрузки PDF документа");
        throw error;
    }
};
