import { GetDataSimple, PostDataToken } from "@/services/data";
import { toast } from "sonner";

export interface FormData {
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
    form_of_education: string;
    study_period: string;
    faculty: string;
    field_of_study: string;
    passport_copy: File | null;
    student_photo: File | null;
}

export const fetchRegions = async (): Promise<any[]> => {
    try {
        const regionsRes = await GetDataSimple("api/location/regions");
        return regionsRes?.result || regionsRes || [];
    } catch (error) {
        console.error("Error fetching regions:", error);
        toast.error("Ошибка загрузки регионов");
        return [];
    }
};

export const fetchDistricts = async (regionId: string): Promise<any[]> => {
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

export const validateFile = (
    file: File,
    type: "image" | "pdf"
): { valid: boolean; error?: string } => {
    if (type === "image") {
        if (file.size > 3 * 1024 * 1024) {
            return {
                valid: false,
                error: "Размер файла не должен превышать 3 МБ",
            };
        }
        if (!file.type.startsWith("image/")) {
            return {
                valid: false,
                error: "Пожалуйста, выберите изображение",
            };
        }
    } else if (type === "pdf") {
        if (!file.type.includes("pdf")) {
            return {
                valid: false,
                error: "Пожалуйста, выберите PDF файл",
            };
        }
    }
    return { valid: true };
};

export const processDateChange = (
    field: "date_day" | "date_month" | "date_year",
    value: string,
    currentFormData: FormData
): Partial<FormData> => {
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

    const newData: Partial<FormData> = {
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

export const isFormValid = (formData: FormData): boolean => {
    return (
        formData.student_name.trim() !== "" &&
        formData.student_surname.trim() !== "" &&
        formData.student_fathername.trim() !== "" &&
        formData.passport_series.trim() !== "" &&
        formData.date_of_birth !== "" &&
        formData.date_day !== "" &&
        formData.date_month !== "" &&
        formData.date_year !== "" &&
        formData.region_id !== "" &&
        formData.district_id !== "" &&
        formData.phone_number.trim() !== "" &&
        formData.university_name.trim() !== "" &&
        formData.course_level !== "" &&
        formData.university_group_name.trim() !== "" &&
        formData.form_of_education !== "" &&
        formData.study_period !== "" &&
        formData.faculty.trim() !== "" &&
        formData.field_of_study.trim() !== "" &&
        formData.passport_copy !== null &&
        formData.student_photo !== null
    );
};

export const createStudent = async (formData: FormData): Promise<void> => {
    try {
        const submitFormData = new FormData();
        submitFormData.append("student_name", formData.student_name.trim());
        submitFormData.append(
            "student_surname",
            formData.student_surname.trim()
        );
        submitFormData.append(
            "student_fathername",
            formData.student_fathername.trim()
        );
        submitFormData.append(
            "passport_series",
            formData.passport_series.trim()
        );
        submitFormData.append("date_of_birth", formData.date_of_birth);
        submitFormData.append("region_id", formData.region_id);
        submitFormData.append("district_id", formData.district_id);
        submitFormData.append("phone_number", formData.phone_number.trim());
        if (formData.owner_additional_phone_number.trim()) {
            submitFormData.append(
                "owner_additional_phone_number",
                formData.owner_additional_phone_number.trim()
            );
        }
        if (formData.additional_phone_number.trim()) {
            submitFormData.append(
                "additional_phone_number",
                formData.additional_phone_number.trim()
            );
        }
        submitFormData.append(
            "university_name",
            formData.university_name.trim()
        );
        submitFormData.append("course_level", formData.course_level);
        submitFormData.append(
            "university_group_name",
            formData.university_group_name.trim()
        );
        submitFormData.append("form_of_education", formData.form_of_education);
        submitFormData.append("study_period", formData.study_period);
        submitFormData.append("faculty", formData.faculty.trim());
        submitFormData.append("field_of_study", formData.field_of_study.trim());

        if (formData.passport_copy) {
            submitFormData.append("passport_copy", formData.passport_copy);
        }
        if (formData.student_photo) {
            submitFormData.append("student_photo", formData.student_photo);
        }

        await PostDataToken("api/student/create", submitFormData);
        toast.success("Студент успешно создан");
    } catch (error: any) {
        console.error("Error creating student:", error);
        toast.error(
            error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Ошибка создания студента"
        );
        throw error;
    }
};
