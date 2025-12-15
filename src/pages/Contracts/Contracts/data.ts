import { DeleteData, GetDataSimple, PostDataTokenJson } from "@/services/data";
import { toast } from "sonner";

export interface Contract {
    contract_id: number;
    contract_number: string;
    student_full_name: string;
    passport_series: string;
    floor_number: number;
    room_number: number;
    bed_number: number;
    contract_start_date: string;
    contract_end_date: string;
    contract_monthly_payment: number;
    contract_total_price: number;
    contract_status: number;
    contract_status_text: string;
    payment_status: number;
    payment_status_text: string;
    created_at: string;
    is_terminated: number;
    is_terminated_text?: string;
}

export interface ContractsApiResponse {
    page: number;
    limit: number;
    count: number;
    pages: number;
    result: Contract[];
}

export const fetchContracts = async (
    page: number = 1,
    limit: number = 10,
    isTerminated?: number
): Promise<{
    contracts: Contract[];
    totalPages: number;
    totalCount: number;
}> => {
    try {
        const terminatedParam =
            typeof isTerminated === "number"
                ? `&is_terminated=${isTerminated}`
                : "";
        const data: ContractsApiResponse = await GetDataSimple(
            `api/contract/list?page=${page}&limit=${limit}${terminatedParam}`
        );

        return {
            contracts: data.result,
            totalPages: data.pages,
            totalCount: data.count,
        };
    } catch (error) {
        console.error("Error fetching contracts:", error);
        toast.error("Ошибка загрузки контрактов");
        throw error;
    }
};

export const searchContracts = async (keyword: string): Promise<Contract[]> => {
    if (!keyword) return [];

    try {
        const data = await GetDataSimple(
            `api/contract/search?keyword=${encodeURIComponent(keyword)}`
        );
        return data?.result || [];
    } catch (error) {
        console.error("Error searching contracts:", error);
        toast.error("Ошибка поиска контрактов");
        return [];
    }
};

export const deleteContract = async (contractId: number): Promise<void> => {
    try {
        await DeleteData(`api/contract/delete/${contractId}`);
        toast.success("Контракт удалён", {
            description: "Контракт успешно удалён.",
            duration: 2500,
        });
    } catch (error: any) {
        console.error("Error deleting contract:", error);
        toast.error(
            error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Ошибка удаления контракта"
        );
        throw error;
    }
};

export const terminateContract = async (
    contractId: number,
    reason: string
): Promise<void> => {
    try {
        await PostDataTokenJson(`api/contract/terminate/${contractId}`, {
            termination_reason: reason,
        });
        toast.success("Контракт расторгнут", {
            description: "Контракт успешно расторгнут.",
            duration: 2500,
        });
    } catch (error: any) {
        console.error("Error terminating contract:", error);
        toast.error(
            error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Ошибка расторжения контракта"
        );
        throw error;
    }
};
