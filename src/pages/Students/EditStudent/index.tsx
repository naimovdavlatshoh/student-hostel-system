import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomCombobox } from "@/components/ui/custom-form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ProgressAuto } from "@/components/ui/progress";
import { toast } from "sonner";
import {
    EditFormData,
    fetchStudentData,
    fetchRegions,
    fetchDistricts,
    parseDateToFormData,
    processDateChange,
    validateForm,
    updateStudent,
} from "./data";
import { RiArrowGoBackLine } from "react-icons/ri";

const EditStudent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isUpdating, setIsUpdating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<EditFormData>({
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
        owner_additional_phone_number: "",
        additional_phone_number: "",
        university_name: "",
        course_level: "",
        university_group_name: "",
        form_of_education: "",
        study_period: "",
        faculty: "",
        field_of_study: "",
        is_blocked: "0",
    });

    const [regions, setRegions] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const [studentRes, regionsRes] = await Promise.all([
                    fetchStudentData(id),
                    fetchRegions(),
                ]);

                if (studentRes) {
                    const { day, month, year } = parseDateToFormData(
                        studentRes.date_of_birth
                    );

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
                        owner_additional_phone_number:
                            studentRes.owner_additional_phone_number || "",
                        additional_phone_number:
                            studentRes.additional_phone_number || "",
                        university_name: studentRes.university_name || "",
                        course_level: studentRes.course_level?.toString() || "",
                        university_group_name:
                            studentRes.university_group_name || "",
                        form_of_education:
                            studentRes.form_of_education?.toString() || "",
                        study_period: studentRes.study_period?.toString() || "",
                        faculty: studentRes.faculty || "",
                        field_of_study: studentRes.field_of_study || "",
                        is_blocked: studentRes.is_blocked?.toString() || "0",
                    });

                    setRegions(regionsRes);

                    if (studentRes.region_id) {
                        const districtsRes = await fetchDistricts(
                            studentRes.region_id
                        );
                        setDistricts(districtsRes);
                    }
                }
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (field === "region_id" && value) {
            loadDistricts(value);
            setFormData((prev) => ({
                ...prev,
                district_id: "",
            }));
        }
    };

    const loadDistricts = async (regionId: string) => {
        const fetchedDistricts = await fetchDistricts(parseInt(regionId));
        setDistricts(fetchedDistricts);
    };

    const handleDateChange = (
        field: "date_day" | "date_month" | "date_year",
        value: string
    ) => {
        const newData = processDateChange(field, value, formData);
        setFormData((prev) => ({
            ...prev,
            ...newData,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm(formData)) {
            toast.error("Пожалуйста, заполните все обязательные поля");
            return;
        }

        if (!id) return;

        try {
            setIsUpdating(true);
            await updateStudent(id, formData);
            navigate("/");
        } catch (error) {
            // Error already handled in data.ts
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[80vh] w-full flex justify-center items-center">
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2 ">
                    <Link to="/">
                        <Button className="rounded-xl" size={"sm"}>
                            <RiArrowGoBackLine className="w-6 h-6" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Редактировать -{" "}
                        <span className="text-maintx">{fullName}</span>
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-white rounded-2xl shadow-lg border lg:col-span-2 border-gray-100">
                    <CardHeader></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="student_name"
                                            className="text-sm font-medium text-gray-700"
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
                                            className="h-12 rounded-xl border-gray-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="student_surname"
                                            className="text-sm font-medium text-gray-700"
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
                                            className="h-12 rounded-xl border-gray-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="student_fathername"
                                            className="text-sm font-medium text-gray-700"
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
                                            className="h-12 rounded-xl border-gray-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="passport_series"
                                            className="text-sm font-medium text-gray-700"
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
                                            className="h-12 rounded-xl border-gray-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="date_of_birth"
                                            className="text-sm font-medium text-gray-700"
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
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="phone_number"
                                            className="text-sm font-medium text-gray-700"
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
                                            className="h-12 rounded-xl border-gray-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="owner_additional_phone_number"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Дополнительный номер телефона
                                            владельца
                                        </Label>
                                        <Input
                                            id="owner_additional_phone_number"
                                            type="tel"
                                            placeholder="Владелец номера телефона"
                                            value={
                                                formData.owner_additional_phone_number
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "owner_additional_phone_number",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="additional_phone_number"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Дополнительный номер телефона
                                        </Label>
                                        <Input
                                            id="additional_phone_number"
                                            type="tel"
                                            placeholder="+998901234567"
                                            value={
                                                formData.additional_phone_number
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "additional_phone_number",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="university_name"
                                            className="text-sm font-medium text-gray-700"
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
                                            className="h-12 rounded-xl border-gray-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="course_level"
                                            className="text-sm font-medium text-gray-700"
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
                                            className="h-12 rounded-xl border-gray-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="university_group_name"
                                            className="text-sm font-medium text-gray-700"
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
                                            className="h-12 rounded-xl border-gray-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="form_of_education"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Форма обучения
                                        </Label>
                                        <Select
                                            value={formData.form_of_education}
                                            onValueChange={(value) =>
                                                handleInputChange(
                                                    "form_of_education",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger className="h-12 rounded-xl border-gray-200">
                                                <SelectValue placeholder="Выберите форму обучения" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">
                                                    Дневной
                                                </SelectItem>
                                                <SelectItem value="2">
                                                    Ночной
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="study_period"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Срок обучения (лет)
                                        </Label>
                                        <Input
                                            id="study_period"
                                            type="number"
                                            placeholder="4"
                                            min="1"
                                            max="10"
                                            value={formData.study_period}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "study_period",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="faculty"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Факультет
                                        </Label>
                                        <Input
                                            id="faculty"
                                            type="text"
                                            placeholder="TEST"
                                            value={formData.faculty}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "faculty",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="field_of_study"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Направление
                                        </Label>
                                        <Input
                                            id="field_of_study"
                                            type="text"
                                            placeholder="TJT"
                                            value={formData.field_of_study}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "field_of_study",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200"
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
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 pt-6">
                                <Link to="/">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="px-6 py-2 h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
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
