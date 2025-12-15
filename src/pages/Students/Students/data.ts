import {
    GetDataSimple,
    DeleteData,
    PostDataTokenJson,
    PostSimple,
} from "@/services/data";
import { toast } from "sonner";

export interface Student {
    student_id: number;
    user_id: number;
    student_name: string;
    student_surname: string;
    student_fathername: string;
    student_image_url: string;
    passport_series: string;
    date_of_birth: string;
    region_id: number;
    region_name: string;
    district_id: number;
    district_name: string;
    phone_number: string;
    owner_additional_phone_number: string | null;
    additional_phone_number: string | null;
    university_name: string;
    course_level: number;
    university_group_name: string | null;
    document_full_path: string;
    available_in_terminal: number;
    available_in_terminal_text: string;
    is_blocked: number;
    is_blocked_text: string;
    is_active: number;
    created_at: string;
    updated_at: string | null;
}

export interface ApiResponse {
    page: number;
    limit: number;
    count: number;
    pages: number;
    result: Student[];
}

export interface Counts {
    all: number;
    active: number;
    blocked: number;
}

export const fetchStudents = async (
    page: number = 1,
    limit: number = 10,
    isBlocked?: number
): Promise<{ students: Student[]; totalPages: number }> => {
    try {
        const blockedParam =
            isBlocked !== undefined ? `&is_blocked=${isBlocked}` : "";
        const data: ApiResponse = await GetDataSimple(
            `api/student/list?page=${page}&limit=${limit}${blockedParam}`
        );

        return {
            students: data.result,
            totalPages: data.pages,
        };
    } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Ошибка загрузки студентов");
        throw error;
    }
};

export const fetchCounts = async (): Promise<Counts> => {
    try {
        const allRes = await GetDataSimple(`api/student/list?page=1&limit=1`);
        const activeRes = await GetDataSimple(
            `api/student/list?page=1&limit=1&is_blocked=0`
        );
        const blockedRes = await GetDataSimple(
            `api/student/list?page=1&limit=1&is_blocked=1`
        );

        return {
            all: allRes?.count || 0,
            active: activeRes?.count || 0,
            blocked: blockedRes?.count || 0,
        };
    } catch (error) {
        console.error("Error fetching counts:", error);
        return { all: 0, active: 0, blocked: 0 };
    }
};

export const searchStudents = async (
    keyword: string,
    activeTab: string
): Promise<Student[]> => {
    try {
        if (keyword.length < 3) {
            return [];
        }

        const encodedKeyword = encodeURIComponent(keyword);
        const response = await PostSimple(
            `api/student/search?keyword=${encodedKeyword}`
        );

        let filteredResults = (response as any)?.result || [];
        if (activeTab === "active") {
            filteredResults = filteredResults.filter(
                (student: Student) => student.is_blocked === 0
            );
        } else if (activeTab === "blocked") {
            filteredResults = filteredResults.filter(
                (student: Student) => student.is_blocked === 1
            );
        }

        return filteredResults;
    } catch (error) {
        console.error("Error searching students:", error);
        toast.error("Ошибка поиска студентов");
        return [];
    }
};

export const deleteStudent = async (studentId: number): Promise<void> => {
    try {
        await DeleteData(`api/student/delete/${studentId}`);
        toast.success("Студент удалён", {
            description: "Студент успешно удалён.",
            duration: 2500,
        });
    } catch (error: any) {
        console.error("Error deleting student:", error);
        toast.error(
            error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Ошибка удаления студента"
        );
        throw error;
    }
};

export const uploadStudentToTerminal = async (
    studentId: number
): Promise<void> => {
    try {
        await PostDataTokenJson(`api/student/${studentId}/upload-faceid`, {});
        toast.success("Студент загружен в терминал", {
            description: "Студент успешно загружен.",
            duration: 2500,
        });
    } catch (error: any) {
        console.error("Error uploading student:", error);
        toast.error(
            error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Ошибка загрузки студента в терминал"
        );
        throw error;
    }
};
