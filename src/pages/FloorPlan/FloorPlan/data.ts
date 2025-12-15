import { GetDataSimple } from "@/services/data";
import { toast } from "sonner";

export interface Bed {
    bed_id: number;
    room_id: number;
    room_number: number;
    floor_id: number;
    floor_number: number;
    bed_number: number;
    bed_type: number;
    bed_type_text: string;
    bed_status: number;
    bed_status_text: string;
    is_active: number;
    is_active_text: string;
}

export interface Room {
    room_id: number;
    floor_id: number;
    floor_number: number;
    room_number: number;
    room_type: number;
    room_type_text: string;
    is_active: number;
    is_active_text: string;
    beds_count: number;
    beds: Bed[];
}

export interface Floor {
    floor_id: number;
    floor_number: number;
    is_active: number;
    is_active_text: string;
    rooms_count: number;
    rooms: Room[];
}

export const fetchFloorPlan = async (): Promise<Floor[]> => {
    try {
        const data = await GetDataSimple("api/object/view");
        return data;
    } catch (error) {
        console.error("Error fetching floor plan:", error);
        toast.error("Ошибка загрузки планировки");
        return [];
    }
};

// Contract detail by bed
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

export interface ContractByBed {
    contract_id: number;
    student_id: number;
    bed_id: number;
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

export const fetchContractByBed = async (
    bedId: number
): Promise<ContractByBed | null> => {
    try {
        const data = await GetDataSimple(`api/contract/bed/${bedId}`);
        return data;
    } catch (error) {
        console.error("Error fetching contract by bed:", error);
        toast.error("Ошибка загрузки договора по койке");
        return null;
    }
};
