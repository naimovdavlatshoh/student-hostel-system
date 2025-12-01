import { GetDataSimple, PostDataTokenJson } from "@/services/data";
import { toast } from "sonner";

export interface EditFormData {
    student_name: string;
    student_surname: string;
    student_fathername: string;
    passport_series: string;
    date_of_birth: string;
    date_day: string;
    date_month: string;
    date_year: string;
    region_id: string;
    district_id: string;
    phone_number: string;
    owner_additional_phone_number: string;
    additional_phone_number: string;
    university_name: string;
    course_level: string;
    university_group_name: string;
    is_blocked: string;
}

export interface StudentData {
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
}

export const fetchStudentData = async (
    id: string
): Promise<StudentData | null> => {
    try {
        const studentRes = await GetDataSimple(`api/student/${id}`);
        return studentRes;
    } catch (error) {
        console.error("Error fetching student data:", error);
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
        toast.error("Ошибка загрузки районов");
        return [];
    }
};

export const parseDateToFormData = (
    dateString: string
): { day: string; month: string; year: string } => {
    const dateParts = dateString ? dateString.split("-") : ["", "", ""];
    return {
        year: dateParts[0] || "",
        month: dateParts[1] || "",
        day: dateParts[2] || "",
    };
};

export const processDateChange = (
    field: "date_day" | "date_month" | "date_year",
    value: string,
    currentFormData: EditFormData
): Partial<EditFormData> => {
    const numericValue = value.replace(/\D/g, "");

    let processedValue = numericValue;

    if (field === "date_day") {
        if (numericValue.length > 2) return {};
        const num = parseInt(numericValue);
        if (num > 31) processedValue = "31";
    } else if (field === "date_month") {
        if (numericValue.length > 2) return {};
        const num = parseInt(numericValue);
        if (num > 12) processedValue = "12";
    } else if (field === "date_year") {
        if (numericValue.length > 4) return {};
    }

    const newData: Partial<EditFormData> = {
        [field]: processedValue,
    };

    const day = (newData.date_day || currentFormData.date_day).padStart(2, "0");
    const month = (newData.date_month || currentFormData.date_month).padStart(
        2,
        "0"
    );
    const year = newData.date_year || currentFormData.date_year;

    if (day && month && year && year.length === 4) {
        newData.date_of_birth = `${year}-${month}-${day}`;
    } else {
        newData.date_of_birth = "";
    }

    return newData;
};

export const validateForm = (formData: EditFormData): boolean => {
    return !!(
        formData.student_name.trim() &&
        formData.student_surname.trim() &&
        formData.student_fathername.trim() &&
        formData.passport_series.trim() &&
        formData.date_of_birth &&
        formData.region_id &&
        formData.district_id &&
        formData.phone_number.trim() &&
        formData.university_name.trim() &&
        formData.course_level
    );
};

export const updateStudent = async (
    id: string,
    formData: EditFormData
): Promise<void> => {
    try {
        const updateData = {
            student_name: formData.student_name.trim(),
            student_surname: formData.student_surname.trim(),
            student_fathername: formData.student_fathername.trim(),
            passport_series: formData.passport_series.trim(),
            date_of_birth: formData.date_of_birth,
            region_id: parseInt(formData.region_id),
            district_id: parseInt(formData.district_id),
            phone_number: formData.phone_number.trim(),
            owner_additional_phone_number:
                formData.owner_additional_phone_number.trim() || null,
            additional_phone_number:
                formData.additional_phone_number.trim() || null,
            university_name: formData.university_name.trim(),
            course_level: parseInt(formData.course_level),
            university_group_name:
                formData.university_group_name.trim() || null,
            is_blocked: parseInt(formData.is_blocked),
        };

        await PostDataTokenJson(`api/student/update/${id}`, updateData);
        toast.success("Студент успешно обновлён");
    } catch (error: any) {
        console.error("Error updating student:", error);
        toast.error(
            error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Ошибка обновления студента"
        );
        throw error;
    }
};
