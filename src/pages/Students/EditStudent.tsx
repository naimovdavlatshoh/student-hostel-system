import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomCombobox } from "@/components/ui/custom-form";

import { Link, useParams, useNavigate } from "react-router-dom";
import { ProgressAuto } from "@/components/ui/progress";
import { GetDataSimple, PostDataTokenJson } from "@/services/data";
import { toast } from "sonner";

const EditStudent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isUpdating, setIsUpdating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        student_name: "",
        student_surname: "",
        student_fathername: "",
        passport_series: "",
        date_of_birth: "",
        date_day: "",
        date_month: "",
        date_year: "",
        region_id: "",
        district_id: "",
        phone_number: "",
        university_name: "",
        course_level: "",
        university_group_name: "",
        is_blocked: "0",
    });

    const [regions, setRegions] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch student data
                const studentRes = await GetDataSimple(`api/student/${id}`);

                if (studentRes) {
                    // Parse date_of_birth to DD MM YYYY
                    const dateParts = studentRes.date_of_birth
                        ? studentRes.date_of_birth.split("-")
                        : ["", "", ""];
                    const year = dateParts[0] || "";
                    const month = dateParts[1] || "";
                    const day = dateParts[2] || "";

                    setFormData({
                        student_name: studentRes.student_name || "",
                        student_surname: studentRes.student_surname || "",
                        student_fathername: studentRes.student_fathername || "",
                        passport_series: studentRes.passport_series || "",
                        date_of_birth: studentRes.date_of_birth || "",
                        date_day: day,
                        date_month: month,
                        date_year: year,
                        region_id: studentRes.region_id?.toString() || "",
                        district_id: studentRes.district_id?.toString() || "",
                        phone_number: studentRes.phone_number || "",
                        university_name: studentRes.university_name || "",
                        course_level: studentRes.course_level?.toString() || "",
                        university_group_name:
                            studentRes.university_group_name || "",
                        is_blocked: studentRes.is_blocked?.toString() || "0",
                    });

                    // Fetch regions
                    const regionsRes = await GetDataSimple(
                        "api/location/regions"
                    );
                    setRegions(regionsRes?.result || regionsRes || []);

                    // Fetch districts if region_id exists
                    if (studentRes.region_id) {
                        const districtsRes = await GetDataSimple(
                            `api/location/districts/${studentRes.region_id}`
                        );
                        setDistricts(
                            districtsRes?.result || districtsRes || []
                        );
                    }
                }
            } catch (error) {
                console.error("Error fetching student data:", error);
                toast.error("Ошибка загрузки данных студента");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // If region changes, fetch districts for that region
        if (field === "region_id" && value) {
            fetchDistricts(value);
            // Reset district selection when region changes
            setFormData((prev) => ({
                ...prev,
                district_id: "",
            }));
        }
    };

    const fetchDistricts = async (regionId: string) => {
        try {
            const districtsRes = await GetDataSimple(
                `api/location/districts/${regionId}`
            );
            setDistricts(districtsRes?.result || districtsRes || []);
        } catch (error) {
            console.error("Error fetching districts:", error);
            toast.error("Ошибка загрузки районов");
        }
    };

    const handleDateChange = (
        field: "date_day" | "date_month" | "date_year",
        value: string
    ) => {
        // Only allow numbers
        const numericValue = value.replace(/\D/g, "");

        let processedValue = numericValue;

        // Limit based on field type
        if (field === "date_day") {
            // Day: max 31, max 2 digits
            if (numericValue.length > 2) return;
            const num = parseInt(numericValue);
            if (num > 31) processedValue = "31";
        } else if (field === "date_month") {
            // Month: max 12, max 2 digits
            if (numericValue.length > 2) return;
            const num = parseInt(numericValue);
            if (num > 12) processedValue = "12";
        } else if (field === "date_year") {
            // Year: max 4 digits
            if (numericValue.length > 4) return;
        }

        setFormData((prev) => {
            const newData = {
                ...prev,
                [field]: processedValue,
            };

            // Combine date parts into date_of_birth format (YYYY-MM-DD)
            const day = newData.date_day.padStart(2, "0");
            const month = newData.date_month.padStart(2, "0");
            const year = newData.date_year;

            if (day && month && year && year.length === 4) {
                newData.date_of_birth = `${year}-${month}-${day}`;
            } else {
                newData.date_of_birth = "";
            }

            return newData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (
            !formData.student_name.trim() ||
            !formData.student_surname.trim() ||
            !formData.student_fathername.trim() ||
            !formData.passport_series.trim() ||
            !formData.date_of_birth ||
            !formData.region_id ||
            !formData.district_id ||
            !formData.phone_number.trim() ||
            !formData.university_name.trim() ||
            !formData.course_level
        ) {
            toast.error("Пожалуйста, заполните все обязательные поля");
            return;
        }

        try {
            setIsUpdating(true);

            const updateData = {
                student_name: formData.student_name.trim(),
                student_surname: formData.student_surname.trim(),
                student_fathername: formData.student_fathername.trim(),
                passport_series: formData.passport_series.trim(),
                date_of_birth: formData.date_of_birth,
                region_id: parseInt(formData.region_id),
                district_id: parseInt(formData.district_id),
                phone_number: formData.phone_number.trim(),
                university_name: formData.university_name.trim(),
                course_level: parseInt(formData.course_level),
                university_group_name:
                    formData.university_group_name.trim() || null,
                is_blocked: parseInt(formData.is_blocked),
            };

            await PostDataTokenJson(`api/student/update/${id}`, updateData);

            toast.success("Студент успешно обновлён");
            navigate("/");
        } catch (error: any) {
            console.error("Error updating student:", error);
            toast.error(
                error?.response?.data?.error ||
                    error?.response?.data?.message ||
                    "Ошибка обновления студента"
            );
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[80vh] w-full flex justify-center items-center ">
                <div className="w-[400px]">
                    <ProgressAuto
                        durationMs={500}
                        startDelayMs={10}
                        className="h-1 rounded-full"
                    />
                </div>
            </div>
        );
    }

    const fullName = `${formData.student_surname} ${formData.student_name} ${formData.student_fathername}`;

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 ">
                        Редактировать -{" "}
                        <span className="text-maintx">{fullName}</span>
                    </h1>
                </div>
            </div>

            {/* Breadcrumb */}
            {/* <CustomBreadcrumb
                items={[
                    { label: "Панель управления", href: "/" },
                    { label: "Студенты", href: "/users" },
                    { label: fullName || "Редактировать", isActive: true },
                ]}
            /> */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-white  rounded-2xl shadow-lg border lg:col-span-2 border-gray-100 ">
                    <CardHeader></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="student_name"
                                            className="text-sm font-medium text-gray-700 "
                                        >
                                            Имя
                                        </Label>
                                        <Input
                                            id="student_name"
                                            type="text"
                                            placeholder="Введите имя"
                                            value={formData.student_name}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "student_name",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200 "
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="student_surname"
                                            className="text-sm font-medium text-gray-700 "
                                        >
                                            Фамилия
                                        </Label>
                                        <Input
                                            id="student_surname"
                                            type="text"
                                            placeholder="Введите фамилию"
                                            value={formData.student_surname}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "student_surname",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200 "
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="student_fathername"
                                            className="text-sm font-medium text-gray-700 "
                                        >
                                            Отчество
                                        </Label>
                                        <Input
                                            id="student_fathername"
                                            type="text"
                                            placeholder="Введите отчество"
                                            value={formData.student_fathername}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "student_fathername",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200 "
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="passport_series"
                                            className="text-sm font-medium text-gray-700 "
                                        >
                                            Серия паспорта
                                        </Label>
                                        <Input
                                            id="passport_series"
                                            type="text"
                                            placeholder="AB1234567"
                                            value={formData.passport_series}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "passport_series",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200 "
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="date_of_birth"
                                            className="text-sm font-medium text-gray-700 "
                                        >
                                            Дата рождения
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="text"
                                                placeholder="ДД"
                                                maxLength={2}
                                                value={formData.date_day}
                                                onChange={(e) =>
                                                    handleDateChange(
                                                        "date_day",
                                                        e.target.value
                                                    )
                                                }
                                                className="h-12 rounded-xl border-gray-200 text-center"
                                            />
                                            <Input
                                                type="text"
                                                placeholder="ММ"
                                                maxLength={2}
                                                value={formData.date_month}
                                                onChange={(e) =>
                                                    handleDateChange(
                                                        "date_month",
                                                        e.target.value
                                                    )
                                                }
                                                className="h-12 rounded-xl border-gray-200 text-center"
                                            />
                                            <Input
                                                type="text"
                                                placeholder="ГГГГ"
                                                maxLength={4}
                                                value={formData.date_year}
                                                onChange={(e) =>
                                                    handleDateChange(
                                                        "date_year",
                                                        e.target.value
                                                    )
                                                }
                                                className="h-12 rounded-xl border-gray-200 text-center"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <CustomCombobox
                                            label="Район"
                                            placeholder={
                                                formData.region_id
                                                    ? "Выберите район"
                                                    : "Сначала выберите регион"
                                            }
                                            value={formData.district_id}
                                            onChange={(value) =>
                                                handleInputChange(
                                                    "district_id",
                                                    value
                                                )
                                            }
                                            options={
                                                formData.region_id
                                                    ? districts
                                                          .filter(
                                                              (district: any) =>
                                                                  district &&
                                                                  district.district_id &&
                                                                  district.district_name
                                                          )
                                                          .map(
                                                              (
                                                                  district: any
                                                              ) => ({
                                                                  value: district.district_id.toString(),
                                                                  label: district.district_name,
                                                              })
                                                          )
                                                    : []
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="phone_number"
                                            className="text-sm font-medium text-gray-700 "
                                        >
                                            Номер телефона
                                        </Label>
                                        <Input
                                            id="phone_number"
                                            type="tel"
                                            placeholder="+998901234567"
                                            value={formData.phone_number}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "phone_number",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200 "
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="university_name"
                                            className="text-sm font-medium text-gray-700 "
                                        >
                                            Название университета
                                        </Label>
                                        <Input
                                            id="university_name"
                                            type="text"
                                            placeholder="ТГТУ"
                                            value={formData.university_name}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "university_name",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200 "
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="course_level"
                                            className="text-sm font-medium text-gray-700 "
                                        >
                                            Курс
                                        </Label>
                                        <Input
                                            id="course_level"
                                            type="number"
                                            placeholder="1"
                                            min="1"
                                            max="6"
                                            value={formData.course_level}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "course_level",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200 "
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="university_group_name"
                                            className="text-sm font-medium text-gray-700 "
                                        >
                                            Группа
                                        </Label>
                                        <Input
                                            id="university_group_name"
                                            type="text"
                                            placeholder="ИС-21"
                                            value={
                                                formData.university_group_name
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "university_group_name",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200 "
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <CustomCombobox
                                            label="Статус"
                                            placeholder="Выберите статус"
                                            value={formData.is_blocked}
                                            onChange={(value) =>
                                                handleInputChange(
                                                    "is_blocked",
                                                    value
                                                )
                                            }
                                            options={[
                                                {
                                                    value: "0",
                                                    label: "Активный",
                                                },
                                                {
                                                    value: "1",
                                                    label: "Заблокирован",
                                                },
                                            ]}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <CustomCombobox
                                            label="Регион"
                                            placeholder="Выберите регион"
                                            value={formData.region_id}
                                            onChange={(value) =>
                                                handleInputChange(
                                                    "region_id",
                                                    value
                                                )
                                            }
                                            options={regions
                                                .filter(
                                                    (region: any) =>
                                                        region &&
                                                        region.region_id &&
                                                        region.region_name
                                                )
                                                .map((region: any) => ({
                                                    value: region.region_id.toString(),
                                                    label: region.region_name,
                                                }))}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-4 pt-6">
                                <Link to="/users">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="px-6 py-2 h-12 rounded-xl border-gray-300  text-gray-700  hover:bg-gray-50 "
                                    >
                                        Назад
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="px-6 py-2 h-12 bg-maintx hover:bg-maintx/80 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUpdating ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Обновление...</span>
                                        </div>
                                    ) : (
                                        "Сохранить изменения"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EditStudent;
