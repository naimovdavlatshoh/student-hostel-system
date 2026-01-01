import { GetDataSimple, DeleteData, PostDataToken } from "@/services/data";
import { toast } from "sonner";

export interface Student {
    id: number;
    user_id: number;
    student_name: string;
    student_surname: string;
    student_fathername: string;
    passport_series: string;
    date_of_birth: string;
    region_id: number;
    district_id: number;
    phone_number: string;
    owner_additional_phone_number: string | null;
    additional_phone_number: string | null;
    university_name: string;
    course_level: number;
    university_group_name: string | null;
    is_blocked: number;
    available_in_terminal: number;
    is_active: number;
    created_at: string;
    updated_at: string | null;
    region_name: string;
    district_name: string;
    document_short_path: string;
    documents: Document[];
}

export interface Document {
    document_id: number;
    student_id: number;
    document_full_path: string;
    document_short_path: string;
    document_format: string;
    document_type: number;
    document_type_text: string;
    is_active: number;
    created_at: string;
    updated_at: string | null;
}

export interface UploadFiles {
    passport_copy: File | null;
    student_photo: File | null;
    other_document: File | null;
}

export const fetchStudentData = async (id: string): Promise<Student | null> => {
    try {
        const studentRes = await GetDataSimple(`api/student/${id}`);
        return studentRes;
    } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Ошибка загрузки данных студента");
        return null;
    }
};

export const fetchRegions = async (): Promise<any[]> => {
    try {
        const regionsRes = await GetDataSimple("api/location/regions");
        return regionsRes?.result || regionsRes || [];
    } catch (error) {
        console.error("Error fetching regions:", error);
        return [];
    }
};

export const fetchDistricts = async (regionId: number): Promise<any[]> => {
    try {
        const districtsRes = await GetDataSimple(
            `api/location/districts/${regionId}`
        );
        return districtsRes?.result || districtsRes || [];
    } catch (error) {
        console.error("Error fetching districts:", error);
        return [];
    }
};

export const getAvatarFromDocuments = (
    documents: Document[]
): string | null => {
    const photoDoc = documents.find((doc) => doc.document_type === 2);
    if (photoDoc?.document_full_path) {
        const baseUrl =
            // import.meta.env.VITE_BASE_URL || "https://hostelapi.argon.uz";
            import.meta.env.VITE_BASE_URL || "https://api.akbarshoxhouse.uz/";
        return baseUrl + photoDoc.document_full_path;
    }
    return null;
};

export const formatDate = (dateString: string): string => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
};

export const deleteDocument = async (documentId: number): Promise<void> => {
    try {
        await DeleteData(`api/student/document/${documentId}`);
        toast.success("Документ удалён", {
            description: "Документ успешно удалён.",
            duration: 2500,
        });
    } catch (error: any) {
        console.error("Error deleting document:", error);
        toast.error(
            error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Ошибка удаления документа"
        );
        throw error;
    }
};

export const uploadDocuments = async (
    studentId: string,
    uploadFiles: UploadFiles
): Promise<void> => {
    try {
        const formData = new FormData();

        if (uploadFiles.passport_copy) {
            formData.append("passport_copy", uploadFiles.passport_copy);
        }
        if (uploadFiles.student_photo) {
            formData.append("student_photo", uploadFiles.student_photo);
        }
        if (uploadFiles.other_document) {
            formData.append("other_document", uploadFiles.other_document);
        }

        await PostDataToken(
            `api/student/${studentId}/upload-document`,
            formData
        );
        toast.success("Документы успешно загружены");
    } catch (error: any) {
        console.error("Error uploading documents:", error);
        toast.error(
            error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Ошибка загрузки документов"
        );
        throw error;
    }
};

export const isUploadDisabled = (uploadFiles: UploadFiles): boolean => {
    return (
        !uploadFiles.passport_copy &&
        !uploadFiles.student_photo &&
        !uploadFiles.other_document
    );
};
